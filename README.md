# Personal Expense Tracker (MERN Stack)

A complete, responsive personal finance application for tracking daily income, expenses and savings. Built with **MongoDB, Express, React and Node.js**, with JWT authentication, role-safe data access, interactive charts and a clean finance-focused dashboard.

---

## Features

- **Authentication** — registration, login, logout, bcrypt password hashing and JWT sessions.
- **Dashboard** — total income, total expenses, balance, savings, savings rate, 6-month chart, spending-by-category chart and recent transactions.
- **Income management** — add, edit and delete income with source, description and date.
- **Expense management** — add, edit and delete expenses across 8 categories (Food, Transportation, Shopping, Education, Healthcare, Entertainment, Bills, Other).
- **Transaction history** — search by text/amount, filter by type, category and date range, pagination, CSV export, edit and delete with confirmation dialogs.
- **Reports & analytics** — selectable year, monthly income/expense bar chart, savings trend line chart, interactive category pie chart, per-category breakdown and income-source analysis.
- **Profile & settings** — update name, email and display currency; change password.
- **User isolation** — every transaction query is scoped to the authenticated user.
- **Responsive UI** — sidebar navigation, collapsible mobile menu, summary cards, loading states, inline errors and confirmation modals.
- **Validation** — express-validator on the API and client-side checks in forms.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite, React Router DOM, Axios |
| Styling | CSS3 (custom properties, flexbox, CSS grid, media queries) |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`) |
| Validation | express-validator |
| Security | Helmet, CORS allow-list |

---

## Project Structure

```
personal-expense-tracker/
├── README.md
├── .gitignore
├── backend/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── transactionController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── models/
│   │   ├── Transaction.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── transactionRoutes.js
│   └── utils/
│       ├── constants.js
│       ├── generateToken.js
│       └── stats.js
└── frontend/
    ├── .env.example
    ├── .gitignore
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── styles.css
        ├── components/
        │   ├── AuthShell.jsx
        │   ├── CategoryPieChart.jsx
        │   ├── ConfirmDialog.jsx
        │   ├── Layout.jsx
        │   ├── Loader.jsx
        │   ├── MonthlyBarChart.jsx
        │   ├── PageHeader.jsx
        │   ├── SavingsLineChart.jsx
        │   ├── Sidebar.jsx
        │   ├── SummaryCard.jsx
        │   ├── Topbar.jsx
        │   └── TransactionTable.jsx
        ├── context/
        │   ├── AuthContext.jsx
        │   └── TransactionContext.jsx
        ├── pages/
        │   ├── DashboardPage.jsx
        │   ├── HistoryPage.jsx
        │   ├── LoginPage.jsx
        │   ├── ProfilePage.jsx
        │   ├── RegisterPage.jsx
        │   ├── ReportsPage.jsx
        │   └── TransactionPage.jsx
        ├── services/
        │   └── api.js
        └── utils/
            ├── constants.js
            └── format.js
```

---

## Prerequisites

- **Node.js 18+** and npm (`node -v` / `npm -v`)
- **MongoDB** — either a local MongoDB 6+ server or a free MongoDB Atlas cluster
- Git (optional, for cloning)

---

## Installation & Local Setup

### 1. Get the project

```bash
git clone <your-repository-url> personal-expense-tracker
cd personal-expense-tracker
```

If you received the folder directly, just `cd personal-expense-tracker`.

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/personal_expense_tracker
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```

Generate a strong secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

For **MongoDB Atlas**, replace `MONGO_URI` with your Atlas connection string:

```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/personal_expense_tracker
```

Start the API:

```bash
npm run dev     # auto-restart on file changes (Node 18+)
# or
npm start
```

Verify it: open <http://localhost:5000/api/health>. You should see a JSON success message.

### 3. Frontend setup

Open a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

`frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the React app:

```bash
npm run dev
```

Open <http://localhost:5173>, register an account and start adding transactions.

### 4. Production build (frontend)

```bash
cd frontend
npm run build
npm run preview
```

The backend should be started with `NODE_ENV=production` and a real `JWT_SECRET` when deployed.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | API port (default `5000`) |
| `NODE_ENV` | No | `development` or `production` |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes in production | Secret used to sign JWTs |
| `JWT_EXPIRE` | No | Token lifetime, default `30d` |
| `CLIENT_URL` | No | Comma-separated allowed frontend origins |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | No | Backend API base URL (default `http://localhost:5000/api`) |

> Secrets are only read by the backend. The frontend stores only the JWT in `localStorage` and never contains database credentials.

---

## REST API Reference

All `/api/transactions` endpoints require `Authorization: Bearer <token>`.

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/register` | Create account (`name`, `email`, `password`, `currency`) | Public |
| POST | `/login` | Log in (`email`, `password`) | Public |
| GET | `/me` | Get current user | Private |
| POST | `/logout` | Log out (client discards token) | Private |
| PUT | `/profile` | Update `name`, `email`, `currency` | Private |
| PUT | `/password` | Change password (`currentPassword`, `newPassword`) | Private |

### Transactions (`/api/transactions`)

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/` | List with `type`, `category`, `search`, `startDate`, `endDate`, `sortBy`, `order`, `page`, `limit` |
| GET | `/summary` | Dashboard totals, counts, recent items, 6-month series, category breakdown |
| GET | `/reports?year=2026` | Yearly monthly series, category breakdown, income sources, averages |
| GET | `/:id` | Get one transaction |
| POST | `/` | Create transaction |
| PUT | `/:id` | Update transaction |
| DELETE | `/:id` | Delete transaction |

Transaction payload:

```json
{
  "type": "expense",
  "amount": 42.50,
  "category": "Food",
  "source": "Local market",
  "description": "Weekly groceries",
  "date": "2026-11-26T12:00:00.000Z"
}
```

Responses follow the shape `{ success, message?, data? }` and API errors return HTTP 4xx/5xx with a `message` and optional `errors` array.

---

## Database Schema

**User** — `name`, `email` (unique, lowercase), `password` (bcrypt hash, excluded from JSON), `currency`, `createdAt`, `updatedAt`.

**Transaction** — `user` (ObjectId ref `User`, required), `type` (`income` | `expense`), `amount` (> 0), `category`, `source`, `description`, `date`, timestamps. Indexes on `{ user, date }` and `{ user, type, category }` keep user-scoped queries fast.

Savings are computed as `income − expenses` (never stored as a separate mutable value), so dashboard, history and reports always agree.

---

## Troubleshooting

- **`Network Error` on login/register** — the frontend cannot reach the API. Start the backend (`cd backend && npm run dev`), make sure `frontend/.env` points to it (`VITE_API_URL=http://localhost:5000/api`), and verify <http://localhost:5000/api/health> responds.
- **`MongoDB connection error`** — confirm MongoDB is running and `MONGO_URI` is correct. Atlas users should allow their IP in Network Access.
- **`401 / Session expired`** — the JWT expired or the secret changed; log in again.
- **CORS error in browser** — add the exact frontend origin to `CLIENT_URL` and restart the backend.
- **Empty dashboard** — register, then add an income or expense; all figures derive from your transactions.
- **API changes not reflected** — `npm run dev` restarts the backend automatically; with `npm start`, restart manually.

---

## Available Scripts

| Location | Command | Action |
| --- | --- | --- |
| `backend` | `npm run dev` | Start API with watch mode |
| `backend` | `npm start` | Start API |
| `frontend` | `npm run dev` | Start Vite dev server |
| `frontend` | `npm run build` | Create production build in `dist/` |
| `frontend` | `npm run preview` | Preview production build |

---

## Deployment

Ready-to-use deployment configs are included:

- `vercel.json` — builds the React app from the repo root and serves it as a SPA.
- `render.yaml` — Render Blueprint for the Express API.

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for GitHub, MongoDB Atlas, Render and Vercel step-by-step instructions.

> A live backend cannot use your local MongoDB. Set `MONGO_URI` to a MongoDB Atlas connection string when deploying; local development can keep using `127.0.0.1:27017`.

---

## License

MIT — use this project for learning, demonstrations or as a starting point for your own finance app.
