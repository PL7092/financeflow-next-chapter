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

// Health check endpoint with real database status
app.get('/health', async (req, res) => {
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
    // Initialize connection if not exists
    if (!db.pool) {
      await db.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        useSSL: process.env.DB_SSL === 'true'
      });
    }
    
    const result = await db.initializeSchema();
    res.json(result);
  } catch (error) {
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
        host: process.env.DB_HOST,
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
    res.status(500).json({
      success: false,
      message: 'Erro ao obter estatísticas',
      error: error.message
    });
  }
});

app.post('/api/db/import', async (req, res) => {
  try {
    if (!db.pool) {
      await db.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        useSSL: process.env.DB_SSL === 'true'
      });
    }
    
    const result = await db.importData(req.body);
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
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      useSSL: process.env.DB_SSL === 'true'
    });
    console.log('✅ Database connection pool initialized');
  } catch (error) {
    console.error('❌ Failed to initialize database connection:', error.message);
  }
});