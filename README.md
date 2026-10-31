# TechFest 2026 Portal

A MERN-stack portal for TechFest 2026, where students browse events, register for them and leave feedback.

| Folder    | What it is                                               |
| --------- | -------------------------------------------------------- |
| `client/` | React 18 + Vite frontend (React Router)                  |
| `server/` | Express 4 + Mongoose API with JWT auth in a cookie       |

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
