# Birthday Contribution Record

A React app for tracking team birthday and baby gift contribution collections.

## Features

- Add, edit, delete, and search contributor records
- Create monthly sheets with automatic team member seeding
- Track contributions, expenses, opening balance, and pending amounts
- Import and export CSV
- Manager mode for editing (password protected)
- PostgreSQL-backed data storage with offline fallback

## Run locally

Install dependencies once:

```bash
npm install
```

Copy the environment file and set your database URL:

```bash
cp .env.example .env
```

Start the backend (port 3000):

```bash
npm run dev:backend
```

In a second terminal, start the React dev server:

```bash
npm run dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173). API requests are proxied to the backend.

You can also double-click `open-app.bat`; it installs dependencies if needed and starts the dev server.

### Run production build locally

```bash
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
```

## Deploy on Vercel

**Important:** Vercel deploys from GitHub. After changing deployment files, commit and push before expecting fixes to appear live.

1. Push this repo to GitHub.
2. Import the project in [Vercel](https://vercel.com/new).
3. Set the framework preset to **Other** (or **Vite** with output directory `dist`).
4. Vercel reads `vercel.json` automatically:
   - Frontend builds to `dist/`
   - `/api/*` routes go to `api/index.js` (Express)
5. Add one environment variable:
   - `DATABASE_URL` — your PostgreSQL connection string
6. Deploy, then verify:

```text
https://<your-project>.vercel.app/api/health
```

Expected response: `{"status":"ok"}`

Do **not** add `VITE_API_BASE` or `PORT` on Vercel.

### If the app still says "Could not connect to backend"

1. Open `/api/health` in the browser.
   - **404** → deployment files (`vercel.json`, `api/index.js`) are not pushed yet.
   - **500** → `DATABASE_URL` is missing or invalid.
2. Confirm `DATABASE_URL` is set for **Production** and **Preview**.
3. Redeploy after changing env vars or pushing code.

### Local development

Run both processes:

```bash
npm run dev:backend
npm run dev
```

Or double-click `open-app.bat`, which starts both.
