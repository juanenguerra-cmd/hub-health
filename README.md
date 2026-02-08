# Hub Health

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Cloudflare Workers + D1 (optional backend)

## Cloudflare D1 setup

This repo includes a minimal Cloudflare Worker and D1 schema to support serverless APIs.

### 1) Create the D1 database

```sh
wrangler d1 create hub-health
```

Copy the `database_id` into `wrangler.toml`.

### 2) Apply migrations locally

```sh
npm run d1:migrate:local
```

### 2b) Sync remote D1 database (manual)

After verifying locally, apply migrations to the remote D1 database:

```sh
npm run d1:migrate:remote
```

This script runs `wrangler d1 migrations apply hub-health --remote` and then
executes a verification query to confirm the `__sync_probe` table exists. The
verification query is also available as a standalone command:

```sh
npm run d1:verify:remote
```

### 2c) GitHub Actions workflows

You can also trigger the `D1 Remote Migrations` workflow in GitHub Actions. It
expects `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets to be set
with access to the `hub-health` D1 database.

The workflow also runs automatically on pushes to `main`, so remote migrations
stay in sync without manual intervention.

### 2d) Verify database sync status

To confirm the remote database has applied migrations:

```sh
npm run d1:verify:remote
```

The command checks for the `__sync_probe` table and returns JSON output from
Wrangler. A successful response indicates the remote schema is in sync.

### 3) Run the D1 sync health check (local)

```sh
npm run d1:health
```

This command applies local migrations, starts a local Wrangler dev server, calls
`/api/health/d1`, and fails if the D1 hard check does not return `ok: true`.

### 4) Run the worker locally

```sh
npm run cf:dev
```

### 5) Deploy

```sh
npm run cf:deploy
```

### CI D1 health check

CI runs `npm run d1:health` in GitHub Actions. The job fails if:

- `/api/health/d1` returns a non-200 response.
- The response JSON includes `ok: false`.

If the check fails, confirm that:

- Local migrations have been applied (`npm run d1:migrate:local`).
- The `__sync_probe` table exists.
- The reported `envTag` matches the environment you expect.

### Troubleshooting D1 sync issues

- Ensure `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are set in GitHub
  Actions and locally when running remote migrations.
- Re-run `npm run d1:migrate:remote` (idempotent) if the Cloudflare dashboard
  shows no recent activity.
- Use `npm run d1:verify:remote` to confirm the `__sync_probe` table exists.
- Validate the database name and ID in `wrangler.toml` match the intended D1
  database.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
