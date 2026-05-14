codegen: oapi
  go generate .

oapi:
  go run -mod=mod github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen@v2.6.0 -config internal/frankfurter/oapi-codegen.yaml internal/frankfurter/openapi.json
  go run -mod=mod github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen@v2.6.0 -config internal/marketstack/oapi-codegen.yaml internal/marketstack/openapi.json

[working-directory: 'web']
web:
  pnpm dev

server:
  air

merge-graphql:
  watchexec -w ./gql -e graphql --shell=bash '(rm relay.graphql || true) && node ./scripts/merge-graphql.js'

relay-watch:
  watchexec --exts tsx,ts -w web 'just relay'

[working-directory: 'web']
relay:
  pnpm relay-compiler

compose *args:
  docker-compose -f docker-compose.dev.yml {{args}}

migrate-hash:
  atlas migrate hash --dir file://ent/migrate/migrations --dir-format=golang-migrate

migrate name:
  go run -mod=mod ent/migrate/main.go {{name}}

[parallel]
dev: merge-graphql relay-watch

[working-directory: 'web']
install-web:
  pnpm install
