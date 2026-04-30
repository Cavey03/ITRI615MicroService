# Movie Review API — ITRI615

A secure movie review web application built as a microservice backend with a vanilla JS frontend. The primary goal is demonstrating security best practices at every layer of the stack.

## Architecture

All external traffic enters through the **API Gateway** (port 8080), which proxies requests to the **Review Service** (port 3000). The review service is never called directly from outside.

```
Client → Gateway (8080) → Review Service (3000) → PostgreSQL
```

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express
- **Database**: PostgreSQL
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Validation**: Joi
- **Logging**: Winston
- **Security**: Helmet, CORS, express-rate-limit

## Getting Started (for a second developer)

### Prerequisites

- Node.js 18 or later
- PostgreSQL running locally (or a remote instance)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd movie-review-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your own values:
   - `DB_USER` — your PostgreSQL username
   - `DB_PASSWORD` — your PostgreSQL password
   - `JWT_SECRET` — a long, random string (e.g. output of `openssl rand -hex 32`)

4. **Create the database and run the schema**
   ```bash
   psql -U <your-db-user> -c "CREATE DATABASE moviereview;"
   psql -U <your-db-user> -d moviereview -f services/review-service/db/schema.sql
   ```

5. **Start the review service**
   ```bash
   npm start
   ```

6. **In a second terminal, start the gateway**
   ```bash
   npm run gateway
   ```

The API is now reachable at `http://localhost:8080`.

### Environment Variables

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

> **Never commit your `.env` file.** It is listed in `.gitignore`.

## Security Patterns

_(To be documented in Step 10.)_

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
│       ├── routes/
│       │   ├── auth.js       # POST /auth/register, POST /auth/login
│       │   ├── movies.js     # CRUD for movies
│       │   └── reviews.js    # CRUD for reviews
│       ├── middleware/
│       │   ├── auth.js       # JWT verification middleware
│       │   └── roles.js      # Role-based access control middleware
│       ├── models/
│       │   ├── user.js       # User model / DB queries
│       │   ├── movie.js      # Movie model / DB queries
│       │   └── review.js     # Review model / DB queries
│       └── db/
│           ├── connection.js # PostgreSQL connection pool
│           └── schema.sql    # Table definitions
├── frontend/
│   └── index.html            # Vanilla JS single-page UI
└── logs/                     # Runtime log files (gitignored)
```
