# Movie Review API — ITRI615

A secure movie review web application built as a microservice backend with a vanilla JS frontend. The primary goal is demonstrating security best practices at every layer of the stack.

Movie data is sourced from the [TMDB API](https://www.themoviedb.org/documentation/api). The microservice itself only stores users, reviews, and personal movie lists.

## Architecture

All external traffic enters through the **API Gateway** (port 8080), which proxies requests to the **Review Service** (port 3000). The review service is never called directly from outside.

```
Client → Gateway (8080) → Review Service (3000) → PostgreSQL
                                                 → TMDB API
```

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express
- **Database**: PostgreSQL
- **External API**: TMDB (The Movie Database)
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Validation**: Joi
- **Logging**: Winston
- **Security**: Helmet, CORS, express-rate-limit

## Getting Started (for a second developer)

### Prerequisites

- Node.js 18 or later
- PostgreSQL running locally (or a remote instance)
- A free TMDB API key — sign up at [themoviedb.org](https://www.themoviedb.org/) → Settings → API → Create → Developer

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
   - `DB_USER` — your PostgreSQL username (usually `postgres`)
   - `DB_PASSWORD` — your PostgreSQL password
   - `JWT_SECRET` — a long random string. Generate one with:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - `TMDB_API_KEY` — your TMDB API Read Access Token

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
| `TMDB_API_KEY` | TMDB API Read Access Token | _(required)_ |

> **Never commit your `.env` file.** It is listed in `.gitignore`.

## Database Schema

| Table | Purpose |
|---|---|
| `users` | Accounts with hashed password and role (`user` or `admin`) |
| `reviews` | Rating + review body linked to a TMDB movie ID |
| `movie_lists` | Named lists owned by a user |
| `list_items` | TMDB movie IDs saved inside a list |

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
