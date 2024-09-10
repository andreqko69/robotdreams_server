require('dotenv').config();

const { Client } = require('pg');

// PostgreSQL client setup
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  }
});

client.connect()
  .then(async () => {
    console.log('Connected to todos_db')

    await client.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT
      );
    `);

  })
  .catch(err => console.error('Connection error', err.stack));

module.exports = client;
