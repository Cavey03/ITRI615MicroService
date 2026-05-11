require('dotenv').config();
const { Pool } = require('pg');

// Two modes:
//   1. DATABASE_URL (production / Neon / Render Postgres) — single connection
//      string. Requires SSL.
//   2. Individual DB_HOST/PORT/NAME/USER/PASSWORD (local development).
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host:     process.env.DB_HOST,
      port:     process.env.DB_PORT,
      database: process.env.DB_NAME,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

// Idle clients in the pool can emit transient errors (network blips, server
// restarts). Log them and let the pool replace the client — don't crash the
// whole service, that's overkill and a self-inflicted DoS.
pool.on('error', (err) => {
  console.error('Unexpected idle database client error:', err.message);
});

module.exports = pool;
