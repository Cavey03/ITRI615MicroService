# Movie Review API — ITRI615

A secure movie review web application built as a microservice backend with a vanilla JS frontend. The primary goal of this project is demonstrating security best practices at every layer of the stack.

Movie data is sourced from the [TMDB API](https://www.themoviedb.org/documentation/api) — the microservice itself only stores users, reviews, and personal movie lists.

---

## Architecture

All external traffic enters through the **API Gateway** (port 8080), which proxies requests to the **Review Service** (port 3000). The review service is never called directly from outside.

```
Client → Gateway (8080) → Review Service (3000) → PostgreSQL
                                                 → TMDB API
```

---

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express
- **Database**: PostgreSQL
- **External API**: TMDB (The Movie Database)
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Validation**: Joi
- **Logging**: Winston
- **Security**: Helmet, CORS, express-rate-limit

---

# Getting Started

This guide walks you through everything you need to do to get the project running locally on your machine.

## 1. Install Required Software

### Node.js

1. Go to [nodejs.org](https://nodejs.org) and download the **LTS** version
2. Run the installer with all default options
3. Open a terminal and verify it installed correctly:
   ```bash
   node -v
   ```
   You should see a version number like `v18.x.x` or higher.

### PostgreSQL

1. Go to [postgresql.org/download/windows](https://www.postgresql.org/download/windows) and download the installer
2. Run the installer with all default options
3. **When it asks for a password for the `postgres` user — write it down.** You'll need it later.
4. Leave the port as **5432**
5. Let it install everything including pgAdmin and the command-line tools
6. Verify it works by opening a terminal and running:
   ```bash
   "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres
   ```
   It will ask for your password. Type it (you won't see the characters as you type — that's normal) and press Enter. You should see a `postgres=#` prompt. Type `\q` to exit.

> The version number `18` in the path may differ depending on what you installed. Check `C:\Program Files\PostgreSQL\` to see your version.

---

## 2. Get a TMDB API Key

The app fetches movie data from TMDB. You need a free API key.

1. Create a free account at [themoviedb.org](https://www.themoviedb.org)
2. Go to **Settings → API**
3. Click **Create → Developer**
4. Fill out the form:
   - **Application Name**: `MicroService Uni Project`
   - **Application URL**: `http://localhost:3000`
   - **Type of Use**: `Desktop Application`
   - **Summary**: `A university student project — movie review microservice for ITRI615`
   - Fill in your name and any address details
5. Once approved, copy the **API Read Access Token** (the long token starting with `eyJ...`) — this is what you'll use, NOT the short API key

---

## 3. Clone the Repository

Open a terminal and run:
```bash
git clone https://github.com/Cavey03/ITRI615MicroService.git
cd ITRI615MicroService/movie-review-api
```

---

## 4. Install Dependencies

From inside the `movie-review-api` folder, run:
```bash
npm install
```

This downloads all the packages the project needs. Wait for it to finish — you should see a `node_modules` folder appear afterwards.

---

## 5. Configure Your Environment Variables

The project needs a `.env` file with credentials. **This file is never committed to GitHub** — every developer has their own local copy.

### Create your `.env` file

```bash
copy .env.example .env
```

### Fill in the values

Open `.env` in any text editor (Notepad works fine). You'll see this:
```
PORT=3000
GATEWAY_PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_NAME=moviereview
DB_USER=
DB_PASSWORD=
JWT_SECRET=
TMDB_API_KEY=
```

Fill in:
- `DB_USER=postgres`
- `DB_PASSWORD=` your PostgreSQL password (the one you set during install)
- `JWT_SECRET=` run this command and paste the output:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- `TMDB_API_KEY=` paste the long Read Access Token you got from TMDB

Save the file.

> ⚠️ **Never commit your `.env` file.** It is listed in `.gitignore` for a reason.

---

## 6. Set Up the Database

### Create the database

Open a terminal and run:
```bash
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres
```

Enter your password. At the `postgres=#` prompt, run:
```sql
CREATE DATABASE moviereview;
```
You should see `CREATE DATABASE`. Then exit:
```sql
\q
```

### Run the schema

This creates all the tables. Run this from inside the `movie-review-api` folder:
```bash
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d moviereview -f "services/review-service/db/schema.sql"
```

You should see output like:
```
CREATE TYPE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE INDEX
```

If you see all of those, your database is ready.

---

## 7. Start the Servers

You need **two terminals open at the same time**, both inside the `movie-review-api` folder.

### Terminal 1 — Review Service
```bash
node services/review-service/index.js
```

You should see:
```
Review service running on port 3000
```

### Terminal 2 — API Gateway
```bash
node gateway/index.js
```

You should see:
```
API gateway running on port 8080 → proxying to http://localhost:3000
```

---

## 8. Verify Everything Works

Open your browser and go to:
```
http://localhost:8080/health
```

You should see:
```json
{ "status": "ok", "service": "review-service" }
```

If you see that — **you're up and running.** 🎉

---

# Reference

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Review service port | `3000` |
| `GATEWAY_PORT` | API gateway port | `8080` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `moviereview` |
| `DB_USER` | Database user | _(required)_ |
| `DB_PASSWORD` | Database password | _(required)_ |
| `JWT_SECRET` | Secret for signing JWTs | _(required)_ |
| `TMDB_API_KEY` | TMDB API Read Access Token | _(required)_ |

## Database Schema

| Table | Purpose |
|---|---|
| `users` | Accounts with hashed password and role (`user` or `admin`) |
| `reviews` | Rating + review body linked to a TMDB movie ID |
| `movie_lists` | Named lists owned by a user |
| `list_items` | TMDB movie IDs saved inside a list |

## Project Structure

```
movie-review-api/
├── .env.example              # Template — copy to .env and fill in credentials
├── .gitignore
├── package.json
├── README.md
├── gateway/
│   └── index.js              # Single entry point; proxies to review service
├── services/
│   └── review-service/
│       ├── index.js          # Express app entry point
│       ├── config/
│       │   └── logger.js     # Winston logger configuration
│       ├── routes/
│       │   ├── auth.js       # POST /auth/register, POST /auth/login
│       │   ├── movies.js     # Movie endpoints (TMDB proxy)
│       │   └── reviews.js    # Review CRUD
│       ├── middleware/
│       │   ├── auth.js       # JWT verification middleware
│       │   ├── roles.js      # Role-based access control middleware
│       │   └── requestLogger.js  # Request logging middleware
│       ├── models/
│       │   ├── user.js       # User model / DB queries
│       │   └── review.js     # Review model / DB queries
│       └── db/
│           ├── connection.js # PostgreSQL connection pool
│           └── schema.sql    # Table definitions
├── frontend/
│   └── index.html            # Vanilla JS single-page UI
└── logs/                     # Runtime log files (gitignored)
```

---

# Troubleshooting

### `psql` is not recognised
PostgreSQL's `bin` folder is not in your system PATH. Use the full path as shown in the setup steps, or add `C:\Program Files\PostgreSQL\18\bin` to your system PATH.

### `Connection failed` when starting the server
Your `.env` credentials are wrong. Double check `DB_USER`, `DB_PASSWORD`, and `DB_NAME` match exactly what you set up.

### `Missing required environment variables`
Your `.env` file is missing one or more required values. Re-check Step 5 and make sure every required variable is filled in.

### Port already in use
Something else is running on port `3000` or `8080`. Restart your terminal or change the ports in your `.env` file.

### CRLF warnings when committing on Windows
These are normal on Windows and can be safely ignored — Git is just normalizing line endings.

---

## Security Patterns

_(Will be documented in Step 10 of the project plan.)_
