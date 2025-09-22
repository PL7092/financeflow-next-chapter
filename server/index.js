import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.APP_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Health check endpoint with real database status (supports /health and /api/health)
app.get(['/health', '/api/health'], async (req, res) => {
  let dbStatus = 'disconnected';
  let dbError = null;
  
  try {
    if (db.pool) {
      const connection = await db.pool.getConnection();
      await connection.ping();
      connection.release();
      dbStatus = 'connected';
    }
  } catch (error) {
    dbStatus = 'error';
    dbError = error.message;
  }
  
  res.json({ 
    status: dbStatus === 'connected' ? 'healthy' : 'degraded', 
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      error: dbError
    }
  });
});

// Database API endpoints
app.post('/api/db/test', async (req, res) => {
  try {
    const config = req.body;
    const result = await db.testConnection(config);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

app.post('/api/db/init', async (req, res) => {
  try {
    // Prefer client-provided config; fallback to environment
    const bodyConfig = req.body || {};
    const config = bodyConfig.host ? bodyConfig : {
      host: process.env.DB_HOST === 'mariadb' ? 'localhost' : process.env.DB_HOST,
      port: process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      useSSL: process.env.DB_SSL === 'true'
    };

    // (Re)initialize connection with provided config
    await db.createConnection(config);

    const result = await db.initializeSchema();
    res.json(result);
  } catch (error) {
    console.error('❌ Failed to initialize schema:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao inicializar schema',
      error: error.message
    });
  }
});

app.get('/api/db/stats', async (req, res) => {
  try {
    if (!db.pool) {
      await db.createConnection({
        host: process.env.DB_HOST === 'mariadb' ? 'localhost' : process.env.DB_HOST,
        port: process.env.DB_PORT,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        useSSL: process.env.DB_SSL === 'true'
      });
    }
    
    const stats = await db.getTableStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Failed to get database stats:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter estatísticas',
      error: error.message
    });
  }
});

// Also allow POST with client-provided config
app.post('/api/db/stats', async (req, res) => {
  try {
    const bodyConfig = req.body || {};
    if (bodyConfig.host) {
      await db.createConnection(bodyConfig);
    } else if (!db.pool) {
      await db.createConnection({
        host: process.env.DB_HOST === 'mariadb' ? 'localhost' : process.env.DB_HOST,
        port: process.env.DB_PORT,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        useSSL: process.env.DB_SSL === 'true'
      });
    }

    const stats = await db.getTableStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('❌ Failed to get database stats via POST:', error.message);
    res.status(500).json({ success: false, message: 'Erro ao obter estatísticas', error: error.message });
  }
});

app.post('/api/db/import', async (req, res) => {
  try {
    const { config: bodyConfig, data } = req.body || {};

    if (bodyConfig) {
      await db.createConnection(bodyConfig);
    } else if (!db.pool) {
      await db.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        useSSL: process.env.DB_SSL === 'true'
      });
    }
    
    const payload = data || req.body;
    const result = await db.importData(payload);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao importar dados',
      error: error.message
    });
  }
});

// General API status
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'Personal Finance Manager API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// ========== CATEGORIES CRUD ==========
app.get('/api/categories', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const categories = await db.executeQuery('SELECT * FROM categories WHERE user_id IS NULL OR user_id = ?', [1]);
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const { name, color, icon } = req.body;
    const result = await db.executeQuery(
      'INSERT INTO categories (name, color, icon, user_id) VALUES (?, ?, ?, ?)',
      [name, color || '#6366f1', icon || 'folder', 1]
    );
    const category = await db.executeQuery('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    res.json({ success: true, data: category[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const { id } = req.params;
    const { name, color, icon } = req.body;
    await db.executeQuery(
      'UPDATE categories SET name = ?, color = ?, icon = ? WHERE id = ? AND (user_id = ? OR user_id IS NULL)',
      [name, color, icon, id, 1]
    );
    const category = await db.executeQuery('SELECT * FROM categories WHERE id = ?', [id]);
    res.json({ success: true, data: category[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const { id } = req.params;
    await db.executeQuery('DELETE FROM categories WHERE id = ? AND user_id = ?', [id, 1]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== ACCOUNTS CRUD ==========
app.get('/api/accounts', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const accounts = await db.executeQuery('SELECT * FROM accounts WHERE user_id = ?', [1]);
    res.json({ success: true, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/accounts', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const { name, type, balance, currency } = req.body;
    const result = await db.executeQuery(
      'INSERT INTO accounts (name, type, balance, currency, user_id) VALUES (?, ?, ?, ?, ?)',
      [name, type, balance || 0, currency || 'EUR', 1]
    );
    const account = await db.executeQuery('SELECT * FROM accounts WHERE id = ?', [result.insertId]);
    res.json({ success: true, data: account[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/accounts/:id', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const { id } = req.params;
    const { name, type, balance, currency } = req.body;
    await db.executeQuery(
      'UPDATE accounts SET name = ?, type = ?, balance = ?, currency = ? WHERE id = ? AND user_id = ?',
      [name, type, balance, currency, id, 1]
    );
    const account = await db.executeQuery('SELECT * FROM accounts WHERE id = ?', [id]);
    res.json({ success: true, data: account[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/accounts/:id', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const { id } = req.params;
    await db.executeQuery('DELETE FROM accounts WHERE id = ? AND user_id = ?', [id, 1]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== TRANSACTIONS CRUD ==========
app.get('/api/transactions', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const transactions = await db.executeQuery(`
      SELECT t.*, c.name as category_name, c.color as category_color, 
             a.name as account_name 
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE t.user_id = ?
      ORDER BY t.date DESC, t.created_at DESC
    `, [1]);
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const { amount, description, type, category_id, account_id, date } = req.body;
    const result = await db.executeQuery(
      'INSERT INTO transactions (amount, description, type, category_id, account_id, date, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [amount, description, type, category_id, account_id, date, 1]
    );
    
    // Update account balance
    const balanceChange = type === 'income' ? amount : -amount;
    await db.executeQuery(
      'UPDATE accounts SET balance = balance + ? WHERE id = ?',
      [balanceChange, account_id]
    );
    
    const transaction = await db.executeQuery(`
      SELECT t.*, c.name as category_name, c.color as category_color, 
             a.name as account_name 
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE t.id = ?
    `, [result.insertId]);
    
    res.json({ success: true, data: transaction[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/transactions/:id', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const { id } = req.params;
    const { amount, description, type, category_id, account_id, date } = req.body;
    
    // Get old transaction to reverse balance change
    const oldTransaction = await db.executeQuery('SELECT * FROM transactions WHERE id = ?', [id]);
    if (oldTransaction.length > 0) {
      const oldBalanceChange = oldTransaction[0].type === 'income' ? -oldTransaction[0].amount : oldTransaction[0].amount;
      await db.executeQuery('UPDATE accounts SET balance = balance + ? WHERE id = ?', [oldBalanceChange, oldTransaction[0].account_id]);
    }
    
    await db.executeQuery(
      'UPDATE transactions SET amount = ?, description = ?, type = ?, category_id = ?, account_id = ?, date = ? WHERE id = ? AND user_id = ?',
      [amount, description, type, category_id, account_id, date, id, 1]
    );
    
    // Apply new balance change
    const balanceChange = type === 'income' ? amount : -amount;
    await db.executeQuery('UPDATE accounts SET balance = balance + ? WHERE id = ?', [balanceChange, account_id]);
    
    const transaction = await db.executeQuery(`
      SELECT t.*, c.name as category_name, c.color as category_color, 
             a.name as account_name 
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE t.id = ?
    `, [id]);
    
    res.json({ success: true, data: transaction[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const { id } = req.params;
    
    // Get transaction to reverse balance change
    const transaction = await db.executeQuery('SELECT * FROM transactions WHERE id = ? AND user_id = ?', [id, 1]);
    if (transaction.length > 0) {
      const balanceChange = transaction[0].type === 'income' ? -transaction[0].amount : transaction[0].amount;
      await db.executeQuery('UPDATE accounts SET balance = balance + ? WHERE id = ?', [balanceChange, transaction[0].account_id]);
    }
    
    await db.executeQuery('DELETE FROM transactions WHERE id = ? AND user_id = ?', [id, 1]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== BUDGETS CRUD ==========
app.get('/api/budgets', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const budgets = await db.executeQuery(`
      SELECT b.*, c.name as category_name, c.color as category_color
      FROM budgets b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `, [1]);
    res.json({ success: true, data: budgets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/budgets', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const { name, amount, category_id, period, start_date, end_date } = req.body;
    const result = await db.executeQuery(
      'INSERT INTO budgets (name, amount, category_id, period, start_date, end_date, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, amount, category_id, period, start_date, end_date, 1]
    );
    const budget = await db.executeQuery(`
      SELECT b.*, c.name as category_name, c.color as category_color
      FROM budgets b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.id = ?
    `, [result.insertId]);
    res.json({ success: true, data: budget[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/budgets/:id', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const { id } = req.params;
    const { name, amount, category_id, period, start_date, end_date } = req.body;
    await db.executeQuery(
      'UPDATE budgets SET name = ?, amount = ?, category_id = ?, period = ?, start_date = ?, end_date = ? WHERE id = ? AND user_id = ?',
      [name, amount, category_id, period, start_date, end_date, id, 1]
    );
    const budget = await db.executeQuery(`
      SELECT b.*, c.name as category_name, c.color as category_color
      FROM budgets b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.id = ?
    `, [id]);
    res.json({ success: true, data: budget[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/budgets/:id', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const { id } = req.params;
    await db.executeQuery('DELETE FROM budgets WHERE id = ? AND user_id = ?', [id, 1]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== INVESTMENTS CRUD ==========
app.get('/api/investments', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const investments = await db.executeQuery(`
      SELECT i.*, a.name as account_name
      FROM investments i
      LEFT JOIN accounts a ON i.account_id = a.id
      WHERE i.user_id = ?
      ORDER BY i.created_at DESC
    `, [1]);
    res.json({ success: true, data: investments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/investments', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const { name, symbol, type, quantity, purchase_price, current_price, purchase_date, account_id } = req.body;
    const result = await db.executeQuery(
      'INSERT INTO investments (name, symbol, type, quantity, purchase_price, current_price, purchase_date, account_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, symbol, type, quantity || 0, purchase_price || 0, current_price || purchase_price || 0, purchase_date, account_id, 1]
    );
    const investment = await db.executeQuery(`
      SELECT i.*, a.name as account_name
      FROM investments i
      LEFT JOIN accounts a ON i.account_id = a.id
      WHERE i.id = ?
    `, [result.insertId]);
    res.json({ success: true, data: investment[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/investments/:id', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const { id } = req.params;
    const { name, symbol, type, quantity, purchase_price, current_price, purchase_date, account_id } = req.body;
    await db.executeQuery(
      'UPDATE investments SET name = ?, symbol = ?, type = ?, quantity = ?, purchase_price = ?, current_price = ?, purchase_date = ?, account_id = ? WHERE id = ? AND user_id = ?',
      [name, symbol, type, quantity, purchase_price, current_price, purchase_date, account_id, id, 1]
    );
    const investment = await db.executeQuery(`
      SELECT i.*, a.name as account_name
      FROM investments i
      LEFT JOIN accounts a ON i.account_id = a.id
      WHERE i.id = ?
    `, [id]);
    res.json({ success: true, data: investment[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/investments/:id', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const { id } = req.params;
    await db.executeQuery('DELETE FROM investments WHERE id = ? AND user_id = ?', [id, 1]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== RECURRING TRANSACTIONS CRUD ==========
app.get('/api/recurring-transactions', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const recurringTransactions = await db.executeQuery(`
      SELECT rt.*, c.name as category_name, c.color as category_color, 
             a.name as account_name
      FROM recurring_transactions rt
      LEFT JOIN categories c ON rt.category_id = c.id
      LEFT JOIN accounts a ON rt.account_id = a.id
      WHERE rt.user_id = ?
      ORDER BY rt.created_at DESC
    `, [1]);
    res.json({ success: true, data: recurringTransactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/recurring-transactions', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const { amount, description, type, frequency, category_id, account_id, start_date, end_date, next_occurrence } = req.body;
    const result = await db.executeQuery(
      'INSERT INTO recurring_transactions (amount, description, type, frequency, category_id, account_id, start_date, end_date, next_occurrence, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [amount, description, type, frequency, category_id, account_id, start_date, end_date, next_occurrence || start_date, 1]
    );
    const recurringTransaction = await db.executeQuery(`
      SELECT rt.*, c.name as category_name, c.color as category_color, 
             a.name as account_name
      FROM recurring_transactions rt
      LEFT JOIN categories c ON rt.category_id = c.id
      LEFT JOIN accounts a ON rt.account_id = a.id
      WHERE rt.id = ?
    `, [result.insertId]);
    res.json({ success: true, data: recurringTransaction[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/recurring-transactions/:id', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const { id } = req.params;
    const { amount, description, type, frequency, category_id, account_id, start_date, end_date, next_occurrence, is_active } = req.body;
    await db.executeQuery(
      'UPDATE recurring_transactions SET amount = ?, description = ?, type = ?, frequency = ?, category_id = ?, account_id = ?, start_date = ?, end_date = ?, next_occurrence = ?, is_active = ? WHERE id = ? AND user_id = ?',
      [amount, description, type, frequency, category_id, account_id, start_date, end_date, next_occurrence, is_active, id, 1]
    );
    const recurringTransaction = await db.executeQuery(`
      SELECT rt.*, c.name as category_name, c.color as category_color, 
             a.name as account_name
      FROM recurring_transactions rt
      LEFT JOIN categories c ON rt.category_id = c.id
      LEFT JOIN accounts a ON rt.account_id = a.id
      WHERE rt.id = ?
    `, [id]);
    res.json({ success: true, data: recurringTransaction[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/recurring-transactions/:id', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const { id } = req.params;
    await db.executeQuery('DELETE FROM recurring_transactions WHERE id = ? AND user_id = ?', [id, 1]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== ASSETS CRUD ==========
app.get('/api/assets', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const assets = await db.executeQuery(`
      SELECT * FROM assets
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [1]);
    res.json({ success: true, data: assets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/assets', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const { name, type, purchase_price, current_value, purchase_date, description, depreciation_rate } = req.body;
    const result = await db.executeQuery(
      'INSERT INTO assets (name, type, purchase_price, current_value, purchase_date, description, depreciation_rate, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, type, purchase_price, current_value || purchase_price, purchase_date, description, depreciation_rate || 0, 1]
    );
    const asset = await db.executeQuery('SELECT * FROM assets WHERE id = ?', [result.insertId]);
    res.json({ success: true, data: asset[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/assets/:id', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const { id } = req.params;
    const { name, type, purchase_price, current_value, purchase_date, description, depreciation_rate } = req.body;
    await db.executeQuery(
      'UPDATE assets SET name = ?, type = ?, purchase_price = ?, current_value = ?, purchase_date = ?, description = ?, depreciation_rate = ? WHERE id = ? AND user_id = ?',
      [name, type, purchase_price, current_value, purchase_date, description, depreciation_rate, id, 1]
    );
    const asset = await db.executeQuery('SELECT * FROM assets WHERE id = ?', [id]);
    res.json({ success: true, data: asset[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/assets/:id', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const { id } = req.params;
    await db.executeQuery('DELETE FROM assets WHERE id = ? AND user_id = ?', [id, 1]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== SAVINGS GOALS CRUD ==========
app.get('/api/savings-goals', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const savingsGoals = await db.executeQuery(`
      SELECT sg.*, a.name as account_name
      FROM savings_goals sg
      LEFT JOIN accounts a ON sg.account_id = a.id
      WHERE sg.user_id = ?
      ORDER BY sg.created_at DESC
    `, [1]);
    res.json({ success: true, data: savingsGoals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/savings-goals', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const { name, target_amount, current_amount, target_date, description, priority, account_id } = req.body;
    const result = await db.executeQuery(
      'INSERT INTO savings_goals (name, target_amount, current_amount, target_date, description, priority, account_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, target_amount, current_amount || 0, target_date, description, priority || 'medium', account_id, 1]
    );
    const savingsGoal = await db.executeQuery(`
      SELECT sg.*, a.name as account_name
      FROM savings_goals sg
      LEFT JOIN accounts a ON sg.account_id = a.id
      WHERE sg.id = ?
    `, [result.insertId]);
    res.json({ success: true, data: savingsGoal[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/savings-goals/:id', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const { id } = req.params;
    const { name, target_amount, current_amount, target_date, description, priority, account_id, is_completed } = req.body;
    await db.executeQuery(
      'UPDATE savings_goals SET name = ?, target_amount = ?, current_amount = ?, target_date = ?, description = ?, priority = ?, account_id = ?, is_completed = ? WHERE id = ? AND user_id = ?',
      [name, target_amount, current_amount, target_date, description, priority, account_id, is_completed, id, 1]
    );
    const savingsGoal = await db.executeQuery(`
      SELECT sg.*, a.name as account_name
      FROM savings_goals sg
      LEFT JOIN accounts a ON sg.account_id = a.id
      WHERE sg.id = ?
    `, [id]);
    res.json({ success: true, data: savingsGoal[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/savings-goals/:id', async (req, res) => {
  try {
    if (!db.pool) await db.createConnection();
    const { id } = req.params;
    await db.executeQuery('DELETE FROM savings_goals WHERE id = ? AND user_id = ?', [id, 1]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../dist/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Personal Finance Manager running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  
  // Initialize database connection on startup
  try {
    await db.createConnection({
      host: process.env.DB_HOST === 'mariadb' ? 'localhost' : process.env.DB_HOST,
      port: process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      useSSL: process.env.DB_SSL === 'true'
    });
    console.log('✅ Database connection pool initialized');

    // Ensure default user (id=1) exists to satisfy FK references
    try {
      await db.executeQuery(
        'INSERT IGNORE INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)',
        [1, 'demo@local', 'Demo User', 'demo']
      );
      console.log('✅ Default demo user ensured (id=1)');
    } catch (seedErr) {
      console.warn('⚠️ Could not ensure default user:', seedErr.message);
    }
  } catch (error) {
    console.error('❌ Failed to initialize database connection:', error.message);
  }
});