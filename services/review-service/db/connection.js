require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
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
