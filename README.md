# TechFest 2026 Portal

A MERN-stack portal for TechFest 2026, where students browse events, register for them and leave feedback.

| Folder                  | What it is                                                     |
| ----------------------- | -------------------------------------------------------------- |
| `client/`               | React 18 + Vite frontend (React Router, lazy-loaded pages)     |
| `server/`               | Express 4 + Mongoose API, JWT in an httpOnly cookie            |
| `server/security-demo/` | Deliberately vulnerable copy used to demo the attacks; never deploy it |
| `docs/`                 | Experiment 5 report, architecture diagram, screenshots, Lighthouse reports |

## Run locally

You need Node.js 20 or newer. MongoDB is optional: if `MONGO_URI` is empty, the API starts an in-memory database.

```bash
# terminal 1 - API on http://localhost:5000
cd server
npm install
cp .env.example .env
npm run dev

# terminal 2 - React app on http://localhost:5173
cd client
npm install
npm run dev
```

Tests: `cd server && npm test`

## Security demo

```bash
cd server
npm run demo:vulnerable      # http://localhost:4001
```

Click "Send login request" to log in as `admin@techfest.in` without the password, and post the prefilled feedback to see `alert('hi')` run. Then repeat both against the real app on port 5173 and they fail.

## Deploy

1. MongoDB Atlas: create an M0 cluster and a database user, allow `0.0.0.0/0` under Network Access, and copy the `mongodb+srv://...` string (add `/techfest` before the `?`).
2. Render: New > Blueprint > this repo (it reads `render.yaml`). Set `MONGO_URI` to the Atlas string, and set `CLIENT_ORIGIN` to your Netlify URL once you have it. Open `https://<service>.onrender.com/api/health` to check it.
3. Netlify: in `netlify.toml`, set the `/api/*` proxy target to your Render host (currently `techfest-api-i47k.onrender.com`) and push. Then Add new site > Import from Git > this repo; the build settings come from `netlify.toml`.
4. Go back to Render and set `CLIENT_ORIGIN=https://<site>.netlify.app` (no trailing slash).