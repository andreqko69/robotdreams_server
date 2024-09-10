require('dotenv').config();
const express = require('express');
const db = require('./db');

const app = express();

// Middleware to set CORS headers
app.use((req, res, next) => {
  // Allow all origins
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Allow specific methods (GET, POST, PUT, DELETE, etc.)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  // Allow specific headers
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Allow credentials if necessary (optional, but typically required for cookies)
  // res.setHeader('Access-Control-Allow-Credentials', true);

  // If the request is OPTIONS (preflight request), send an empty response
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204); // No Content
  }

  // Continue to the next middleware or route handler
  next();
});

app.use(express.json());

// Create a new todo
app.post('/todos', async (req, res) => {
  const { title, description } = req.body;
  try {
    const result = await db.query(
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
    const result = await db.query('SELECT * FROM todos');
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
    const result = await db.query('SELECT * FROM todos WHERE id = $1', [id]);
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
    const result = await db.query(
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
    const result = await db.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json({ message: 'Todo deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
