const jwt = require('jsonwebtoken');
const { dbAsync } = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'poker-ledger-secret-key-change-in-production';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Verify JWT token middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await dbAsync.get('SELECT id, email, username, avatar_url FROM users WHERE id = ?', [decoded.userId]);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Optional authentication (for public endpoints)
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await dbAsync.get('SELECT id, email, username, avatar_url FROM users WHERE id = ?', [decoded.userId]);
      if (user) req.user = user;
    } catch (error) {
      // Continue without user
    }
  }
  next();
};

module.exports = { generateToken, authenticateToken, optionalAuth, JWT_SECRET };
