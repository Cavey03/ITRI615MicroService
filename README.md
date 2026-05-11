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

Security is the primary goal of this project. Every layer of the stack — network edge, application logic, database, and frontend rendering — applies an intentional control. This section documents each pattern, the implementation, and **why** the control is in place. Where relevant, OWASP and NIST guidance is cited.

### 1. Defence-in-depth architecture

```
Browser → API Gateway → Review Service → PostgreSQL + TMDB
```

**Why:** A single entry point lets us concentrate security controls (rate limiting, CORS, auth headers) at the network edge while keeping internal services simple. Compromising the gateway's external surface still doesn't grant access to the service if the internal-secret check (see §3) fails.

### 2. Transport security (HTTPS + TLS)

- **External traffic**: Render serves both the gateway and the frontend over HTTPS with auto-renewed certificates.
- **Database**: Neon enforces TLS on every Postgres connection (`sslmode=require` in `DATABASE_URL`).

**Why:** Prevents passive interception and man-in-the-middle attacks on credentials, JWTs, and personal review content. OWASP Top 10 A02 (Cryptographic Failures).

### 3. Service-to-service authentication (internal secret)

The deployed review service has its own public URL on Render's free tier — there is no private networking. To prevent direct access bypassing the gateway, every proxied request carries an `X-Internal-Secret` header attached by the gateway. The review service rejects any request without a matching value (HTTP 403) — except `/health`, which Render's platform must reach for liveness probes.

**Why:** Implements the *zero-trust* principle that network reachability is not a substitute for authentication. Even if the review service URL is leaked, it is unusable without the secret.

### 4. CORS allowlist (both layers)

Both the gateway and the review service read `ALLOWED_ORIGINS` from configuration and reject any cross-origin request whose `Origin` header isn't listed. The default is the local Live Server origin; production uses the deployed frontend URL.

**Why:** Stops malicious sites making authenticated requests on behalf of a logged-in user. Defence in depth: even if the gateway is misconfigured, the service still enforces. OWASP Top 10 A05 (Security Misconfiguration).

### 5. Strict HTTP security headers (Helmet)

Both services use `helmet()` with default settings. This sets `X-Content-Type-Options`, `Strict-Transport-Security`, `Content-Security-Policy`, `Referrer-Policy`, `X-DNS-Prefetch-Control`, and more.

**Why:** Mitigates clickjacking, MIME-type confusion, mixed-content attacks, and forces HTTPS upgrades on supporting clients.

### 6. Rate limiting (both layers)

`express-rate-limit` caps each client IP at 100 requests per 15-minute window. Applied at both the gateway and the review service. Both services call `app.set('trust proxy', 1)` so the rate limiter reads the genuine client IP from `X-Forwarded-For` instead of the upstream proxy's IP.

**Why:** Without `trust proxy`, every request appears to come from the same IP (the proxy), and a single attacker can DoS the service for all users. With it, limits apply per real client. OWASP API Top 10 #4 (Unrestricted Resource Consumption).

### 7. Password hashing (bcrypt)

Passwords are hashed with `bcrypt.hash(password, 12)` before storage. The plaintext is never logged or returned. On login, `bcrypt.compare` performs a constant-time comparison.

**Why:** bcrypt is purpose-built for password hashing — slow, salted, with a tunable work factor. Cost 12 is the modern minimum (OWASP cheat sheet). Constant-time comparison prevents timing-based discovery of valid emails.

### 8. Password complexity (defence in depth)

Both server (Joi regex in `routes/auth.js`) and client (mirrored regex in `index.html`) enforce: 8–72 characters with at least one uppercase, lowercase, digit, and special character.

**Why:** Client-side check gives immediate feedback (UX); server-side check is the actual security boundary (a hostile client can't bypass it). Note: NIST SP 800-63B (2017+) argues *against* mandatory complexity in favour of breached-password checks — this implementation chooses complexity for course alignment but acknowledges modern guidance.

### 9. JSON Web Tokens (JWT)

Tokens are signed with `HS256`, expire after 8 hours, and carry only `{ id, role }`. The verification middleware (`middleware/auth.js`) pins the algorithm to `HS256` explicitly to defeat the `alg: none` and key-confusion attacks.

**Why:** Stateless auth scales without a session store. Pinning the algorithm prevents a classic JWT vulnerability where an attacker forges a token by claiming a different signing algorithm. OWASP API Top 10 #2 (Broken Authentication).

### 10. Role-based access control

The `middleware/roles.js` factory accepts an allowlist of roles (`'user'`, `'admin'`) and rejects callers whose JWT-derived role isn't permitted. Used wherever privileged operations would be appropriate; reserved for future admin features.

**Why:** Coarse-grained authorisation distinct from authentication. Even a logged-in user shouldn't reach admin endpoints.

### 11. Resource ownership (private review data)

`PUT /reviews/:id` and `DELETE /reviews/:id` look up the review's `user_id` and compare to the JWT's `id`. Mismatched users get 403, regardless of role. `GET /reviews/me*` is scoped by the JWT subject — there is no endpoint that returns another user's reviews.

**Why:** Implements the principle of least privilege at the data layer. OWASP API Top 10 #1 (Broken Object Level Authorisation) is the most common API vulnerability — this check is what prevents IDOR.

### 12. Input validation (Joi + express-validator)

Every request body is validated against an explicit schema before reaching business logic. Joi handles registration/login; express-validator covers reviews. Out-of-range ratings, oversized comment bodies, and malformed emails are rejected with 400 before the handler runs.

**Why:** Defence in depth alongside parameterised queries: invalid data never reaches the model layer. OWASP Top 10 A03 (Injection) mitigation starts with not trusting input.

### 13. Parameterised SQL queries

Every query in `models/*.js` uses `$1, $2, ...` parameter placeholders. No string concatenation of user input into SQL.

**Why:** Eliminates SQL injection as a class. OWASP A03.

### 14. Safe DOM rendering (XSS prevention)

The frontend renders movie titles, review bodies, usernames, and TMDB content using `textContent` and `createElement` — never `innerHTML` with template strings. A helper `el()` enforces this pattern. Inline `onclick=` attributes were removed in favour of `addEventListener` so user-supplied strings (movie titles) can never appear in an attribute context.

**Why:** Closes the stored-XSS and HTML-injection paths. A review body containing `<script>` is rendered as literal text, not executed. OWASP Top 10 A03 (Injection — XSS).

### 15. Trailer iframe whitelist

When embedding a YouTube trailer, the video key is validated against the regex `/^[A-Za-z0-9_-]{6,15}$/` before being inserted into the iframe URL. The iframe uses `youtube-nocookie.com` (privacy-friendly variant), `referrerpolicy="strict-origin-when-cross-origin"`, and a minimal `allow` attribute (no `allow-same-origin` or `allow-scripts` sandbox escapes).

**Why:** Even though TMDB controls the data, *trusting* upstream data is a known supply-chain risk. Validating the key shape prevents a malicious or compromised TMDB response from injecting an attacker-controlled URL.

### 16. Error message sanitisation

The global error handler in the review service returns a generic `"Internal server error"` for any HTTP 5xx response. Only 4xx errors (validation, auth) carry specific messages back to the client. The full error is logged server-side via Winston for debugging.

**Why:** Stack traces, database constraint names, and ORM internals can leak schema and runtime details that aid an attacker mapping the system. OWASP Top 10 A09 (Security Logging and Monitoring Failures) — log internally, return generic externally.

### 17. Secrets management

No credentials live in the repository. `.env` and `logs/` are git-ignored. Local development uses a `.env` file (template in `.env.example` with all values blank). Production uses Render's encrypted environment variables and Neon's project-scoped credentials.

**Why:** Avoids the most common cause of leaks — accidental commits. Each environment has independent secrets (separate JWT signing keys, separate database credentials).

### 18. Resilience controls

- **Snapshot pattern in reviews**: when a review is created, the movie's title and poster path are denormalised into the row, so the user's profile page renders even if TMDB is unreachable.
- **Graceful pool errors**: idle Postgres connection errors are logged but do not crash the service. This prevents a transient network blip from becoming a self-inflicted DoS.

**Why:** Security isn't only about confidentiality — availability is part of the CIA triad. Brittle failure modes (crash on first error) are themselves a vulnerability class.

### 19. Logging (Winston)

All requests are logged with method, path, status, duration, and client IP. Auth events (registration, login success, login failure with reason) are logged separately. Passwords, tokens, and bcrypt hashes are never logged.

**Why:** Detection and forensic visibility. Without logs you cannot tell whether you have been attacked, let alone how. OWASP Top 10 A09.

---

## Threat model summary

| Threat | Mitigation |
|---|---|
| Credential interception | TLS everywhere (HTTPS, Postgres SSL) |
| Password database leak | bcrypt cost 12 |
| Brute-force login | Rate limiting + generic auth errors (no user enumeration) |
| JWT forgery (`alg: none`) | Algorithm pinned to HS256 |
| SQL injection | Parameterised queries everywhere |
| XSS in reviews | `textContent`-only rendering, no `innerHTML` of user content |
| CSRF | JWT in `Authorization` header (not cookie) → not auto-attached cross-site |
| Cross-origin abuse | CORS allowlist on both layers |
| Direct service access bypassing gateway | Internal secret header required |
| Information leakage via errors | 5xx responses sanitised; details logged server-side |
| IDOR (reading another user's review) | Owner check before mutation; no endpoint returns other users' data |
| Resource exhaustion | Rate limiting per real client IP (`trust proxy`) |
| Supply chain (TMDB) | Iframe URL validated against strict regex before insertion |
| Secrets in version control | `.gitignore`, `.env.example` only, Render env vars for prod |

---

## Deployment

The application is deployed across three free-tier services:

| Component | Platform | Notes |
|---|---|---|
| Frontend (static) | Render Static Site | Auto-deploys on push |
| API Gateway | Render Web Service | Auto-deploys on push; sleeps after 15 min idle |
| Review Service | Render Web Service | Same; protected by internal secret |
| Database | Neon Postgres | Free tier, always-on, TLS required |

Environment variables are managed through the Render and Neon dashboards. The frontend auto-detects local vs. deployed via `location.hostname` and points at the correct API base.
