# 4dots

Real-time Connect Four–style game built as a monorepo:

| Package           | Role                                                  |
| ----------------- | ----------------------------------------------------- |
| `packages/client` | Vite + React SPA (deploy to **Vercel**)               |
| `packages/server` | NestJS + Socket.IO API (deploy to **cPanel Node.js**) |
| `packages/shared` | Shared TypeScript types                               |

Recommended production layout: **frontend on Vercel**, **backend on cPanel** (subdomain such as `api.yourdomain.com`).

---

## Prerequisites

- Node.js **18+** (see `.nvmrc`)
- Yarn 1.x (workspaces)
- A Vercel account
- cPanel hosting with **Setup Node.js App** (or equivalent) and WebSocket support on the API subdomain

---

## Environment variables

### Frontend (`packages/client`)

| Variable       | Required              | Description                                                                                                         |
| -------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_URL` | **Yes** in production | Public URL of the backend, e.g. `https://api.yourdomain.com` (no trailing slash). Baked in at build time on Vercel. |

Copy `packages/client/.env.example` to `packages/client/.env` for local development.

### Backend (`packages/server`)

| Variable            | Required              | Description                                                                                   |
| ------------------- | --------------------- | --------------------------------------------------------------------------------------------- |
| `PORT`              | Yes                   | HTTP port (cPanel often injects this automatically).                                          |
| `ENVIRONMENT`       | Yes                   | Set to `production` on cPanel.                                                                |
| `CORS_ORIGINS`      | **Yes** in production | Comma-separated frontend origins, e.g. `https://4dots.vercel.app,https://yourdomain.com`      |
| `GAME_STATS_SECRET` | **Yes** in production | Long random secret for encrypting game stats tokens. Generate with `openssl rand -base64 32`. |

Copy `packages/server/.env.example` to `packages/server/.env` for local development.

---

## Local development

```bash
yarn install
yarn start:dev
```

- Client: http://localhost:5173 (Vite)
- Server: http://localhost:3000 (Socket.IO)

The client uses `http://localhost:3000` in dev when `VITE_API_URL` is unset.

---

## Deploy frontend (Vercel)

1. Push the repository to GitHub (or GitLab/Bitbucket).
2. In [Vercel](https://vercel.com), **Add New Project** and import the repo.
3. Use these settings (also defined in root `vercel.json`):

   | Setting          | Value                                |
   | ---------------- | ------------------------------------ |
   | Framework Preset | Vite                                 |
   | Root Directory   | _(leave as repository root)_         |
   | Install Command  | `yarn install`                       |
   | Build Command    | `yarn workspace @4dots/client build` |
   | Output Directory | `packages/client/dist`               |

4. Under **Environment Variables**, add:

   | Name           | Value                        | Environments                                      |
   | -------------- | ---------------------------- | ------------------------------------------------- |
   | `VITE_API_URL` | `https://api.yourdomain.com` | Production (and Preview if you use a staging API) |

5. Deploy. Note the production URL (e.g. `https://4dots.vercel.app`).

6. If you use a custom domain on Vercel, add it in the Vercel project and include that URL in the backend `CORS_ORIGINS`.

### SPA routing

`vercel.json` rewrites all routes to `index.html` so React Router paths like `/room/:roomId` work on refresh.

---

## Deploy backend (cPanel)

### 1. DNS

Create a subdomain for the API, e.g. `api.yourdomain.com`, pointing to your cPanel server.

### 2. Upload code

Upload the **entire repository** (or clone via Git in cPanel). The Node app must resolve workspace packages (`@4dots/shared`, `@4dots/client` is not required on the server).

Typical path: `~/4dots` or `~/repositories/4dots`.

### 3. Create the Node.js application

In cPanel → **Setup Node.js App**:

| Field                    | Value                                      |
| ------------------------ | ------------------------------------------ |
| Node.js version          | 18.x or newer                              |
| Application mode         | Production                                 |
| Application root         | `4dots` (folder containing `package.json`) |
| Application URL          | `api.yourdomain.com`                       |
| Application startup file | `packages/server/dist/main.js`             |

Some hosts expect the startup file relative to the application root; if `packages/server/dist/main.js` fails, set application root to `4dots/packages/server` and startup file to `dist/main.js`.

### 4. Environment variables

In the Node.js app settings (or a `packages/server/.env` file **outside** public web roots), set:

```env
ENVIRONMENT=production
CORS_ORIGINS=https://your-app.vercel.app,https://yourdomain.com
GAME_STATS_SECRET=<your-long-random-secret>
```

Use the exact Vercel URL(s) users will open in the browser. `PORT` is often assigned by cPanel automatically—do not hardcode a conflicting port unless your host requires it.

### 5. Install and build

In the cPanel terminal (or SSH), from the **repository root**:

```bash
source /home/USER/nodevenv/4dots/18/bin/activate   # path varies by host
cd ~/4dots
yarn install --production=false
yarn build:server
```

`yarn build:server` runs `nest build` and outputs to `packages/server/dist/`.

### 6. Start / restart

Restart the Node.js app from cPanel after each deploy.

Run command (if your host asks for one instead of startup file only):

```bash
node packages/server/dist/main.js
```

Working directory should be the repo root or `packages/server`, matching how paths resolve on your host.

### 7. WebSockets (important)

Socket.IO needs the reverse proxy (Apache/LiteSpeed/nginx) to allow **WebSocket upgrades** on the API subdomain. If connections fail from Vercel:

- Confirm `https://api.yourdomain.com` is reachable.
- Ask your host to enable WebSocket proxying for the Node app.
- Ensure SSL is valid (Vercel frontend is HTTPS; the API should be HTTPS too).

### 8. Lock down dev defaults

Never use the default `GAME_STATS_SECRET` from `.env.example` in production. Always set `ENVIRONMENT=production` and explicit `CORS_ORIGINS`.

---

## Production build commands (reference)

```bash
# From repository root
yarn install
yarn build:client   # → packages/client/dist
yarn build:server    # → packages/server/dist
```

---

## License

MIT — see repository license.
