require('dotenv').config();
const express = require('express');
const cors = require('cors');
const createDatabaseIfNotExists = require('./admin-db');
const { Client } = require('pg');

async function startUp() {
  await createDatabaseIfNotExists();

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

  const app = express();

  app.use(cors());

  app.use(express.json());
  // Create a new todo
  app.post('/todos', async (req, res) => {
    const { title, description } = req.body;
    try {
      const result = await client.query(
        'INSERT INTO todos (title, description) VALUES ($1, $2) RETURNING *',
        [title, description]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });

// Get all todos
  app.get('/todos', async (req, res) => {
    try {
      const result = await client.query('SELECT * FROM todos');
      res.json(result.rows);
    } catch (err) {
      console.log('err:', err);
      res.status(500).json({ error: 'Database error' });
    }
  });

// Get a single todo by ID
  app.get('/todos/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await client.query('SELECT * FROM todos WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Todo not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });

// Update a todo by ID
  app.put('/todos/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    try {
      const result = await client.query(
        'UPDATE todos SET title = $1, description = $2 WHERE id = $3 RETURNING *',
        [title, description, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Todo not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });

// Delete a todo by ID
  app.delete('/todos/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await client.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Todo not found' });
      }
      res.json({ message: 'Todo deleted' });
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startUp();
