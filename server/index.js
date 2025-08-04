const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuração do PostgreSQL
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'threatpulse',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres123',
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Rotas de autenticação
app.post('/api/db/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuário
    const userResult = await pool.query(
      'SELECT * FROM auth_users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Verificar senha
    const validPassword = await bcrypt.compare(password, user.encrypted_password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Buscar perfil e role
    const profileResult = await pool.query(`
      SELECT p.*, ur.role 
      FROM profiles p
      LEFT JOIN user_roles ur ON p.user_id = ur.user_id
      WHERE p.user_id = $1
    `, [user.id]);

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    const profile = profileResult.rows[0];

    // Gerar token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Criar sessão
    const sessionResult = await pool.query(`
      INSERT INTO auth_sessions (user_id, access_token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [user.id, token, new Date(Date.now() + 24 * 60 * 60 * 1000)]);

    const userData = {
      id: user.id,
      email: user.email,
      name: profile.name,
      role: profile.role || 'analista',
      avatar: profile.avatar_url,
      createdAt: profile.created_at,
      lastLogin: new Date(),
      isActive: true
    };

    res.json({
      user: userData,
      session: {
        access_token: token,
        user: userData,
        expires_at: sessionResult.rows[0].expires_at
      }
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/db/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Verificar se usuário já existe
    const existingUser = await pool.query(
      'SELECT id FROM auth_users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const userResult = await pool.query(`
      INSERT INTO auth_users (email, encrypted_password, confirmed_at, raw_user_meta_data)
      VALUES ($1, $2, NOW(), $3)
      RETURNING *
    `, [email, hashedPassword, JSON.stringify({ name })]);

    const user = userResult.rows[0];

    // Buscar perfil criado pelo trigger
    const profileResult = await pool.query(`
      SELECT p.*, ur.role 
      FROM profiles p
      LEFT JOIN user_roles ur ON p.user_id = ur.user_id
      WHERE p.user_id = $1
    `, [user.id]);

    const profile = profileResult.rows[0];

    // Gerar token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Criar sessão
    const sessionResult = await pool.query(`
      INSERT INTO auth_sessions (user_id, access_token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [user.id, token, new Date(Date.now() + 24 * 60 * 60 * 1000)]);

    const userData = {
      id: user.id,
      email: user.email,
      name: profile.name,
      role: profile.role || 'analista',
      avatar: profile.avatar_url,
      createdAt: profile.created_at,
      lastLogin: new Date(),
      isActive: true
    };

    res.json({
      user: userData,
      session: {
        access_token: token,
        user: userData,
        expires_at: sessionResult.rows[0].expires_at
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/db/auth/signout', authenticateToken, async (req, res) => {
  try {
    // Remover sessão
    await pool.query(
      'DELETE FROM auth_sessions WHERE user_id = $1',
      [req.user.userId]
    );

    res.json({ message: 'Signed out successfully' });
  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Query genérica
app.post('/api/db/query', authenticateToken, async (req, res) => {
  try {
    const { sql, params } = req.body;
    
    // Validação básica de segurança (adicionar mais validações conforme necessário)
    const allowedQueries = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
    const sqlUpper = sql.trim().toUpperCase();
    
    if (!allowedQueries.some(query => sqlUpper.startsWith(query))) {
      return res.status(400).json({ message: 'Query not allowed' });
    }

    const result = await pool.query(sql, params);
    res.json({ rows: result.rows, rowCount: result.rowCount });

  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ message: 'Database query error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`ThreatPulse server running on port ${port}`);
});