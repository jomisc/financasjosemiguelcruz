import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'financas',
  user: process.env.DB_USER || 'financas_user',
  password: process.env.DB_PASSWORD || 'financas_password',
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Database connected successfully');
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ===== CATEGORIES API =====

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categories ORDER BY name ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create category
app.post('/api/categories', async (req, res) => {
  const { name, icon, is_default } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO categories (name, icon, is_default) VALUES ($1, $2, $3) RETURNING *',
      [name, icon || '💰', is_default || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// ===== TRANSACTIONS API =====

// Get all transactions (with optional filters)
app.get('/api/transactions', async (req, res) => {
  try {
    const { limit, type, category_id } = req.query;

    let query = `
      SELECT
        t.*,
        row_to_json(c.*) as categories
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (type) {
      query += ` AND t.type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    if (category_id) {
      query += ` AND t.category_id = $${paramCount}`;
      params.push(category_id);
      paramCount++;
    }

    query += ' ORDER BY t.date DESC, t.created_at DESC';

    if (limit) {
      query += ` LIMIT $${paramCount}`;
      params.push(parseInt(limit));
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Create transaction
app.post('/api/transactions', async (req, res) => {
  const { type, amount, category_id, date, description } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO transactions (type, amount, category_id, date, description)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [type, amount, category_id || null, date || new Date().toISOString().split('T')[0], description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Update transaction
app.put('/api/transactions/:id', async (req, res) => {
  const { id } = req.params;
  const { type, amount, category_id, date, description } = req.body;

  try {
    const result = await pool.query(
      `UPDATE transactions
       SET type = $1, amount = $2, category_id = $3, date = $4, description = $5
       WHERE id = $6
       RETURNING *`,
      [type, amount, category_id || null, date, description, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// Delete transaction
app.delete('/api/transactions/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM transactions WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// ===== BUDGETS API =====

// Get all budgets
app.get('/api/budgets', async (req, res) => {
  try {
    const { month, year } = req.query;

    let query = `
      SELECT
        b.*,
        row_to_json(c.*) as categories
      FROM budgets b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (month) {
      query += ` AND b.month = $${paramCount}`;
      params.push(parseInt(month));
      paramCount++;
    }

    if (year) {
      query += ` AND b.year = $${paramCount}`;
      params.push(parseInt(year));
      paramCount++;
    }

    query += ' ORDER BY b.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

// Create budget
app.post('/api/budgets', async (req, res) => {
  const { category_id, amount, month, year } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO budgets (category_id, amount, month, year)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (category_id, month, year)
       DO UPDATE SET amount = $2
       RETURNING *`,
      [category_id, amount, month, year]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

// Delete budget
app.delete('/api/budgets/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM budgets WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

// ===== DASHBOARD STATS API =====

// Get dashboard statistics
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Get total income and expenses for current month
    const statsResult = await pool.query(`
      SELECT
        type,
        SUM(amount) as total
      FROM transactions
      WHERE EXTRACT(MONTH FROM date) = $1
        AND EXTRACT(YEAR FROM date) = $2
      GROUP BY type
    `, [currentMonth, currentYear]);

    const stats = {
      income: 0,
      expenses: 0,
      balance: 0
    };

    statsResult.rows.forEach(row => {
      if (row.type === 'income') {
        stats.income = parseFloat(row.total) || 0;
      } else if (row.type === 'expense') {
        stats.expenses = parseFloat(row.total) || 0;
      }
    });

    stats.balance = stats.income - stats.expenses;

    // Get budget progress
    const budgetsResult = await pool.query(`
      SELECT
        b.*,
        row_to_json(c.*) as categories,
        COALESCE(SUM(t.amount), 0) as spent
      FROM budgets b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN transactions t ON t.category_id = b.category_id
        AND t.type = 'expense'
        AND EXTRACT(MONTH FROM t.date) = b.month
        AND EXTRACT(YEAR FROM t.date) = b.year
      WHERE b.month = $1 AND b.year = $2
      GROUP BY b.id, c.id
    `, [currentMonth, currentYear]);

    res.json({
      ...stats,
      budgets: budgetsResult.rows.map(b => ({
        ...b,
        spent: parseFloat(b.spent) || 0,
        amount: parseFloat(b.amount) || 0
      }))
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});
