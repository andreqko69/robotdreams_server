require('dotenv').config();

const { Client } = require('pg');

// Function to check and create the database if not exists
async function createDatabaseIfNotExists() {
  const adminClient = new Client({
    connectionString: process.env.ADMIN_DATABASE_URL, // Connect to the default 'postgres' database
    ssl: {
      rejectUnauthorized: false,
    }
  });

  try {
    await adminClient.connect();
    const result = await adminClient.query(`SELECT 1 FROM pg_database WHERE datname = 'todos_db';`);
    if (result.rowCount === 0) {
      console.log("Database 'todos_db' does not exist, creating...");
      await adminClient.query('CREATE DATABASE todos_db;');
      console.log("Database 'todos_db' created successfully.");
    } else {
      console.log("Database 'todos_db' already exists.");
    }
  } catch (err) {
    console.error('Error while creating database:', err);
  } finally {
    await adminClient.end();
  }
}

module.exports = createDatabaseIfNotExists;
