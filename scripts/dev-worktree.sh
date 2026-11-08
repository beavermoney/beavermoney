#!/usr/bin/env bash

set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
git_common_dir="$(git rev-parse --git-common-dir)"
primary_root="$(git -C "$git_common_dir/.." rev-parse --show-toplevel)"
runtime_dir="$repo_root/.dev"
ports_file="$runtime_dir/ports.env"

mkdir -p "$runtime_dir"

port_is_available() {
  ! lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1
}

allocate_ports() {
  if [[ -f "$ports_file" ]]; then
    # shellcheck disable=SC1090
    source "$ports_file"
    if [[ -n "${DEVTOOLS_PORT:-}" ]]; then
      return
    fi
  fi

  local checksum slot attempts
  checksum="$(printf '%s' "$repo_root" | cksum | awk '{print $1}')"
  slot=$((checksum % 400))
  attempts=0

  while (( attempts < 400 )); do
    API_PORT=$((3100 + slot * 3))
    WEB_PORT=$((API_PORT + 1))
    DEVTOOLS_PORT=$((API_PORT + 2))
    if port_is_available "$API_PORT" && port_is_available "$WEB_PORT" &&
      port_is_available "$DEVTOOLS_PORT"; then
      printf 'API_PORT=%s\nWEB_PORT=%s\nDEVTOOLS_PORT=%s\n' \
        "$API_PORT" "$WEB_PORT" "$DEVTOOLS_PORT" >"$ports_file"
      return
    fi
    slot=$(((slot + 1) % 400))
    attempts=$((attempts + 1))
  done

  echo "Could not find an available worktree port pair." >&2
  exit 1
}

load_shared_env() {
  local backend_env frontend_env
  backend_env="$repo_root/.env"
  frontend_env="$repo_root/web/.env"

  [[ -f "$backend_env" ]] || backend_env="$primary_root/.env"
  [[ -f "$frontend_env" ]] || frontend_env="$primary_root/web/.env"

  if [[ ! -f "$backend_env" ]]; then
    echo "Missing .env in both this worktree and the primary checkout: $primary_root" >&2
    exit 1
  fi

  set -a
  # shellcheck disable=SC1090
  source "$backend_env"
  if [[ -f "$frontend_env" ]]; then
    # shellcheck disable=SC1090
    source "$frontend_env"
  fi
  set +a

  # Optional isolated database for review instances.
  export POSTGRES_URL="${DEV_POSTGRES_URL:-$POSTGRES_URL}"
  export PORT="$API_PORT"
  export WEB_URL="http://localhost:$WEB_PORT"
  export VITE_SERVER_URL="http://localhost:$API_PORT"
  export VITE_DEVTOOLS_PORT="$DEVTOOLS_PORT"
}

frontend_url() {
  printf 'http://localhost:%s\n' "$WEB_PORT"
}

wait_until_ready() {
  local attempts=0
  while (( attempts < ${DEV_STARTUP_TIMEOUT:-180} )); do
    if curl --silent --fail --max-time 2 "http://localhost:$API_PORT/health" >/dev/null &&
      curl --silent --fail --max-time 2 "http://localhost:$WEB_PORT" >/dev/null; then
      return
    fi
    attempts=$((attempts + 1))
    sleep 1
  done

  echo "Timed out waiting for the worktree app." >&2
  exit 1
}

start_dev() {
  load_shared_env

  docker-compose --project-name beavermoney -f "$repo_root/docker-compose.dev.yml" up -d

  # A warm pnpm install is cheap and keeps dependencies correct after branch switches.
  pnpm --dir "$repo_root" install --frozen-lockfile
  pnpm --dir "$repo_root/web" install --frozen-lockfile

  # Generate once in order before starting the two independent watchers.
  # This keeps a fresh worktree from racing Relay against a missing schema.
  (
    cd "$repo_root"
    node ./scripts/merge-graphql.js
  )
  pnpm --dir "$repo_root/web" exec relay-compiler

  echo "Frontend: http://localhost:$WEB_PORT"
  echo "Backend:  http://localhost:$API_PORT"

  (
    cd "$repo_root"
    air
  ) &
  server_pid=$!

  (
    cd "$repo_root/web"
    pnpm exec vite dev --host 127.0.0.1 --port "$WEB_PORT" --strictPort
  ) &
  web_pid=$!

  (
    cd "$repo_root"
    just dev
  ) &
  relay_pid=$!

  cleanup() {
    trap - EXIT INT TERM
    kill "$server_pid" "$web_pid" "$relay_pid" >/dev/null 2>&1 || true
    wait "$server_pid" "$web_pid" "$relay_pid" >/dev/null 2>&1 || true
  }
  trap cleanup EXIT INT TERM

  wait_until_ready
  echo "READY"

  while kill -0 "$server_pid" "$web_pid" "$relay_pid" >/dev/null 2>&1; do
    sleep 1
  done

  echo "A development process exited unexpectedly." >&2
  exit 1
}

allocate_ports

case "${1:-dev}" in
dev)
  start_dev
  ;;
ready)
  wait_until_ready
  echo "READY"
  ;;
url)
  frontend_url
  ;;
*)
  echo "Usage: $0 {dev|ready|url}" >&2
  exit 2
  ;;
esac
