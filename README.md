# Finance Tracker

A personal monthly finance tracker: log income and expenses (fixed and variable), organize them by
category with monthly budgets, and see where your money goes with a dashboard and multi-month trend
charts. Spring Boot + PostgreSQL backend, React frontend, single login for personal use.

## Features

- Track income and expenses per month, with a `paid`/`received` checkbox
- Mark expenses as **fixed** (rent, subscriptions, insurance) vs **variable**
- One-click **copy last month's fixed expenses** into the current month (as unpaid, ready to tick off)
- Categories with optional **monthly budgets** and budget-usage bars on the dashboard
- Dashboard: totals for income/expenses/balance, spending-by-category pie chart, 6-month trend chart
- CSV export and import of transactions
- Simple single-user login (JWT), password changeable from the app

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose (bundled with recent Docker Desktop /
  Docker Engine)

## Quick start (Docker Compose)

```bash
cp .env.example .env
# open .env and set your own JWT_SECRET, APP_ADMIN_USERNAME/PASSWORD, and DB password

docker compose up --build -d
```

Then open **http://localhost:3000** and log in with the `APP_ADMIN_USERNAME` / `APP_ADMIN_PASSWORD`
you set in `.env` (defaults: `admin` / `changeme123` if you didn't change them — change the password
from the Settings page after your first login).

The backend API runs on `http://localhost:8080`, Postgres on port 5432 (both configurable via `.env`).
Data persists in a Docker volume (`db_data`) across restarts.

To stop everything:

```bash
docker compose down          # stop, keep data
docker compose down -v       # stop and wipe the database
```

## Everyday use

- **Dashboard**: pick a month with the arrows at the top; see totals, category breakdown, budgets, and
  the 6-month trend.
- **Transactions**: add/edit/delete entries for the selected month, filter by income/expense/unpaid,
  toggle paid status with one click, import/export CSV.
- **Categories**: create categories per type (income/expense), set a monthly budget on expense
  categories to get a progress bar on the dashboard.
- **Fixed expenses rollover**: on the Dashboard, "Copy last month's fixed expenses" duplicates every
  fixed expense from the previous month into the current one (unpaid), so you don't retype rent,
  insurance, subscriptions, etc. every month. Safe to click more than once — it skips items that
  already exist in the target month (matched by category + description).

### CSV format

Export/import use this column layout:

```
type,category,amount,description,date,fixed,paid
EXPENSE,Food,42.50,Groceries,2026-09-03,false,true
INCOME,Salary,1993.58,Paycheck,2026-09-01,false,true
```

- `type`: `INCOME` or `EXPENSE`
- `category`: matched by name + type; if it doesn't exist yet, it's created automatically
- `fixed`: only meaningful for `EXPENSE` rows
- `date`: `YYYY-MM-DD`

## Running without Docker (development)

**Backend** (needs a local Postgres, or run just the `db` service with `docker compose up db`):

```bash
cd backend
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/financetracker
export SPRING_DATASOURCE_USERNAME=financetracker
export SPRING_DATASOURCE_PASSWORD=financetracker
export JWT_SECRET=dev-secret-change-me-please-32-chars-min
mvn spring-boot:run
```

**Frontend**:

```bash
cd frontend
npm install
npm run dev
```

Vite's dev server proxies `/api` to `http://localhost:8080` (override with `VITE_API_PROXY_TARGET` if
your backend runs elsewhere). Open `http://localhost:5173`.

## Project structure

```
finance-tracker/
├── backend/     Spring Boot API (Java 21, Maven, PostgreSQL, Flyway, JWT auth)
├── frontend/    React app (Vite, React Router, recharts)
├── docker-compose.yml
└── .env.example
```

Backend package layout: `auth` (login/password), `user`, `category`, `transaction` (incl. CSV and
fixed-expense rollover), `dashboard` (summary + trend), `security` (JWT), `config`, `common` (error
handling).

## Security notes

- This is built for one person's personal use — one login, no multi-user roles.
- Change `JWT_SECRET` and the admin password in `.env` before first startup; the backend refuses to
  start with a JWT secret shorter than 32 characters.
- If you expose this beyond `localhost`, put it behind HTTPS (e.g. a reverse proxy) — the app itself
  serves plain HTTP.
