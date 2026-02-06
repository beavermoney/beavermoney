# Development

## Tutorials

Here are some **very important** tutorials to get you started with the technologies used in this project:

- [Relay](https://relay.dev/docs/tutorial/intro/)
- [Ent](https://entgo.io/docs/getting-started/)

## Setup

We use [mise](https://mise.jdx.dev/) to manage the development environment.

### Configured tools

The following tools are managed by mise (see `mise.toml`):

- **atlas** (latest) - Database schema management
- **docker-compose** (latest)
- **just** (latest) - Command runner
- **go** (1.25.5)
- **node** (24.12.0)
- **pnpm** (latest)
- **watchexec** (latest)

### Using mise

**Install all tools** (first time setup):

```bash
mise install
```

**Activate mise in your shell** (if not already configured):

```bash
# Add to your ~/.bashrc or ~/.zshrc
eval "$(mise activate bash)"  # or zsh, fish, etc.
```

**Check installed tools**:

```bash
mise list
```

**Update tools**:

```bash
mise upgrade
```

## First-Time Setup

After installing mise and activating it in your shell, follow these steps:

1. **Install web dependencies:**

   ```bash
   just install-web
   ```

2. **Create environment files:**

   ```bash
   # From project root
   cp .env.example .env
   cp web/.env.example web/.env
   ```

3. **Generate secrets** (SESSION_SECRET and JWT_SECRET in .env):

   ```bash
   # Generate SESSION_SECRET
   openssl rand -base64 32
   # Generate JWT_SECRET
   openssl rand -base64 32
   ```

   Copy these values into your `.env` file.

4. **Start the database:**

   ```bash
   just compose up
   ```

5. **Start the development server:**
   The server automatically runs database migrations on startup.

   ```bash
   just server
   ```

6. **In another terminal, start the web frontend:**
   ```bash
   just web
   ```

### URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **GraphQL Playground:** http://localhost:3000

### Note on Database Migrations

The Go server automatically:

- Drops and recreates the database schema on startup (development only)
- Applies all migrations from `ent/migrate/migrations`
- Seeds the database with test data

You don't need to run atlas migrations manually.

## Commands

### Database

```bash
just compose up
just compose down
```

### Server

```bash
just server
just codegen # Ent, GQL, etc.
```

### Web

```bash
just web
```

### GraphQL / Relay

```bash
just dev

```
