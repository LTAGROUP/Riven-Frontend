# Riven Frontend (for riven-ts)

A web UI for [riven-ts](https://github.com/rivenmedia/riven-ts), the TypeScript rewrite of the
Riven media automation server. Successor to the v1 [riven-frontend](https://github.com/rivenmedia/riven-frontend),
rebuilt against the new Apollo GraphQL API.

**Features**

- **Library** — browse media items with search, state and type filters, and bulk reset
- **Item detail** — states, seasons/episodes, streams (active + blacklisted), files, reset,
  save-stream-URL
- **Explore** — TMDB search and trending with a request flow (season picker for shows)
- **Summary** — library stats, plugin health, backend status
- **Files** — read-only browser for Riven's virtual file system
- **Settings** — full editor for riven-ts configuration that generates the `.env.riven` file
- **Logs** — upload logs for support via `shareLogs`
- Single-password login, dark UI, Docker-ready

## How it deals with the riven-ts API (important)

riven-ts is still early ("cooking in progress") and its GraphQL API doesn't yet cover everything
the v1 backend did. This frontend detects the backend's capabilities at runtime (schema
introspection) and degrades gracefully:

| Feature                 | How                                                                                                                                                                                                                                                                                                 |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Requesting media        | Sent through the **seerr plugin's webhook mutation** — requires `enabledPlugins=["seerr"]` (plus seerr `apiKey`/`url` set) in riven-ts. Buttons explain this when missing.                                                                                                                          |
| Reset item              | Native (`resetMediaItem`).                                                                                                                                                                                                                                                                          |
| Delete / pause / retry  | **Not supported by riven-ts yet** — shown disabled, they light up automatically once the backend adds the mutations.                                                                                                                                                                                |
| Edit settings           | riven-ts reads env vars at startup; the Settings page is an editor that **generates `.env.riven`** for you to apply + restart.                                                                                                                                                                      |
| Library listing         | The backend currently caps `mediaItems` at 25 with no filters; the UI filters client-side and says so.                                                                                                                                                                                              |
| Live updates            | No subscriptions upstream; transitional items are polled every 15 s.                                                                                                                                                                                                                                |
| **Broken `mediaItems`** | riven-ts `main` currently fails `mediaItems`/`mediaItemById` with "Cannot resolve type for interface MediaItem". Set `RIVEN_DATABASE_URL` (read-only Postgres access) and the frontend falls back to reading listings straight from Riven's database — GraphQL takes over automatically once fixed. |

## Quick start (Docker)

```bash
cp .env.example .env        # set FRONTEND_PASSWORD, AUTH_SECRET, TMDB token
touch .env.riven            # or generate via the Settings page later
docker compose up -d
```

Open http://localhost:3001 and log in with `FRONTEND_PASSWORD`.

> **ORIGIN matters:** `ORIGIN` must exactly match the URL you open in the browser
> (scheme + host + port), otherwise every form action fails with a 403 (SvelteKit CSRF
> protection). Behind a reverse proxy set it to the public URL.

### Environment variables

| Var                      | Required  | Description                                                  |
| ------------------------ | --------- | ------------------------------------------------------------ |
| `FRONTEND_PASSWORD`      | ✔         | Password for the web UI                                      |
| `AUTH_SECRET`            | ✔         | ≥32 chars, signs session cookies (`openssl rand -base64 32`) |
| `BACKEND_GRAPHQL_URL`    |           | riven-ts GraphQL URL (default `http://localhost:3000/`)      |
| `TMDB_READ_ACCESS_TOKEN` |           | TMDB v4 read token — enables search/trending/posters         |
| `ORIGIN`                 | ✔ in prod | Public URL of this frontend                                  |
| `PORT`                   |           | Listen port (default 3000)                                   |

The backend is **never exposed to the browser** — all GraphQL and TMDB traffic flows through the
frontend server, which holds the secrets.

## Development

```bash
pnpm install
pnpm codegen           # generate GraphQL types from schema/schema.graphql
pnpm mock              # terminal 1: mock riven-ts backend on :3999
BACKEND_GRAPHQL_URL=http://localhost:3999/ FRONTEND_PASSWORD=dev \
AUTH_SECRET=dev-secret-dev-secret-dev-secret-123 pnpm dev   # terminal 2
```

- `MOCK_PLUGINS=none pnpm mock` simulates a backend without the seerr plugin (request buttons
  disable themselves).
- `pnpm fetch-schema` refreshes `schema/schema.graphql` from a running backend
  (`BACKEND_GRAPHQL_URL`), then `pnpm codegen`.
- `pnpm check` / `pnpm lint` / `pnpm build`.

## Architecture notes

- SvelteKit 2 + Svelte 5 (runes), Tailwind 4, shadcn-svelte, adapter-node.
- Typed GraphQL via `@graphql-codegen` client-preset against a **vendored schema**
  ([schema/schema.graphql](schema/schema.graphql)) hand-assembled from the riven-ts source —
  no live backend needed at build time.
- Runtime capability detection: [src/lib/server/capabilities.ts](src/lib/server/capabilities.ts)
  introspects the backend schema (cached 60 s) and the UI gates features on the result.
- Auth: HMAC-signed cookie, no database ([src/lib/server/auth.ts](src/lib/server/auth.ts)).
- The request payload contract lives in
  [src/lib/graphql/operations/seerr.ts](src/lib/graphql/operations/seerr.ts) and is
  contract-tested by the mock backend, which validates with riven-ts's own Zod rules.
