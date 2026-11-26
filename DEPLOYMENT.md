# Deployment Guide — Personal Expense Tracker

Target setup:

| Piece | Platform |
| --- | --- |
| Repository | GitHub |
| React frontend | Vercel |
| Express API | Render |
| Database | MongoDB Atlas (required for a live deployment) |

> **Important:** your local MongoDB at `127.0.0.1:27017` only works on your own computer. A backend hosted on Render cannot reach it, so the live API needs a cloud database. MongoDB Atlas has a free tier and takes about 5 minutes to set up.

---

## 1. Push to GitHub

The repository is already initialised with a first commit. Create an **empty** repository on GitHub (for example `personal-expense-tracker`), then run:

```bash
cd personal-expense-tracker
git remote add origin https://github.com/<your-username>/<your-repo>.git
git branch -M main
git push -u origin main
```

If you prefer to create the repo from the command line, install the [GitHub CLI](https://cli.github.com/) and run:

```bash
gh auth login
gh repo create personal-expense-tracker --public --source=. --remote=origin --push
```

`.env` files, `node_modules/` and `dist/` are gitignored — **never commit your real secrets**. Only `.env.example` files are tracked.

---

## 2. Create the MongoDB Atlas database

1. Sign up / log in at <https://www.mongodb.com/atlas>.
2. Create a **Free Shared cluster** (M0). Choose a provider/region close to your users.
3. Under **Database Access**, add a database user:
   - Authentication: **Password**
   - Password: generate a strong one and save it
   - Privileges: **Read and write to any database**
4. Under **Network Access**, add IP `0.0.0.0/0` (allows Render to connect; Atlas also supports restricting to Render's IPs).
5. Click **Connect → Drivers**, choose Node.js, and copy the connection string. It looks like:

   ```text
   mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/personal_expense_tracker?retryWrites=true&w=majority
   ```

   Replace `USERNAME` and `PASSWORD` with your database user credentials. Keep this string private.

---

## 3. Deploy the backend to Render

1. Log in to <https://dashboard.render.com> → **New + → Blueprint**.
2. Connect your GitHub repository. Render detects the root `render.yaml`.
3. Fill in the secrets when prompted:

   | Key | Value |
   | --- | --- |
   | `MONGO_URI` | The Atlas connection string from step 2 |
   | `JWT_SECRET` | A long random string, e.g. `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
   | `CLIENT_URL` | Your Vercel URL, e.g. `https://personal-expense-tracker.vercel.app` (add after step 4; you can update it later) |

   `NODE_ENV`, `PORT` and `JWT_EXPIRE` are already set in `render.yaml`.
4. Click **Apply**. Render runs `npm install` and `npm start` in the `backend` folder.
5. Wait for the status to become **Live**, then open:

   ```text
   https://<your-service>.onrender.com/api/health
   ```

   You should see `{"success":true,"message":"Personal Expense Tracker API is running."}`.

Manual setup alternative: **New + → Web Service**, Root Directory `backend`, Build `npm install`, Start `npm start`, then add the same environment variables.

---

## 4. Deploy the frontend to Vercel

1. Log in to <https://vercel.com> → **Add New → Project** → import the same GitHub repository.
2. Keep the defaults. The root `vercel.json` builds `frontend/` and serves `frontend/dist` as a single-page app.
3. Add an environment variable **before deploying**:

   | Name | Value |
   | --- | --- |
   | `VITE_API_URL` | `https://<your-service>.onrender.com/api` |

   Use the Render URL **with `/api` at the end** and no trailing slash.
4. Click **Deploy**. Vite embeds `VITE_API_URL` into the production bundle at build time, so if you change it later, redeploy.
5. Copy your Vercel URL (e.g. `https://personal-expense-tracker.vercel.app`) and go back to Render → your service → **Environment** → set `CLIENT_URL` to that exact URL → **Save** (this triggers a redeploy).

---

## 5. Verify the live app

1. Open your Vercel URL.
2. Register an account, add an income and an expense, then check the Dashboard totals.
3. Open Reports and Profile — all pages should load data from the live API.
4. Check the browser console: there should be no errors.

---

## 6. Local development still works

Your local setup is unchanged:

```bash
# backend/.env  -> MONGO_URI=mongodb://127.0.0.1:27017/personal_expense_tracker
cd backend && npm run dev

# frontend/.env -> VITE_API_URL=http://localhost:5000/api
cd frontend && npm run dev
```

The deployed apps use **Atlas**, while local development uses your local MongoDB. Both read the same code; only environment variables differ.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `Network Error` on register/login | Check `VITE_API_URL` in Vercel and redeploy; confirm the Render service is Live and `/api/health` responds. |
| CORS error in console | `CLIENT_URL` on Render must exactly match the Vercel origin (no trailing slash). |
| `MongoServerError: Authentication failed` | Recheck the Atlas username/password in `MONGO_URI`; URL-encode special characters. |
| `MongoServerError: Host not allowed` | Add `0.0.0.0/0` to Atlas Network Access. |
| `401 / Session expired` | `JWT_SECRET` changed on Render; log in again. |
| Blank page after refresh on a nested route | `vercel.json` rewrite is missing — keep the file at repo root. |
