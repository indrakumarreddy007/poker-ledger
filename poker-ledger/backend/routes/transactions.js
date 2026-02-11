const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { dbAsync } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Request buy-in
router.post('/buyin', authenticateToken, async (req, res) => {
  try {
    const { sessionId, amount } = req.body;
    const userId = req.user.id;

    if (!sessionId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Session ID and positive amount are required' });
    }

    // Check if session exists and is active
    const session = await dbAsync.get(
      'SELECT * FROM sessions WHERE id = ? AND status = ?',
      [sessionId, 'active']
    );

    if (!session) {
      return res.status(404).json({ error: 'Session not found or inactive' });
    }

    // Check if user is in session
    const isInSession = await dbAsync.get(
      'SELECT 1 FROM session_players WHERE session_id = ? AND user_id = ?',
      [sessionId, userId]
    );

    if (!isInSession) {
      return res.status(403).json({ error: 'Must be in session to request buy-in' });
    }

    // Create transaction
    const transactionId = uuidv4();
    await dbAsync.run(
      `INSERT INTO transactions (id, session_id, player_id, amount, type, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [transactionId, sessionId, userId, amount, 'buyin', 'pending']
    );

    const transaction = await dbAsync.get(
      `SELECT t.*, u.username 
       FROM transactions t 
       JOIN users u ON t.player_id = u.id 
       WHERE t.id = ?`,
      [transactionId]
    );

    res.status(201).json({
      message: 'Buy-in request submitted',
      transaction
    });
  } catch (error) {
    console.error('Buy-in request error:', error);
    res.status(500).json({ error: 'Failed to request buy-in' });
  }
});

// Approve transaction (admin only)
router.post('/:id/approve', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get transaction
    const transaction = await dbAsync.get(
      'SELECT * FROM transactions WHERE id = ?',
      [id]
    );

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ error: 'Transaction already processed' });
    }

    // Check if user is session admin
    const session = await dbAsync.get(
      'SELECT * FROM sessions WHERE id = ? AND current_admin_id = ?',
      [transaction.session_id, userId]
    );

    if (!session) {
      return res.status(403).json({ error: 'Only session admin can approve transactions' });
    }

    // Update transaction
    await dbAsync.run(
      'UPDATE transactions SET status = ?, approved_at = CURRENT_TIMESTAMP, approved_by = ? WHERE id = ?',
      ['approved', userId, id]
    );

    // Update player's stack
    await dbAsync.run(
      `UPDATE session_players 
       SET total_buyin = total_buyin + ?, current_stack = current_stack + ? 
       WHERE session_id = ? AND user_id = ?`,
      [transaction.amount, transaction.amount, transaction.session_id, transaction.player_id]
    );

    res.json({ message: 'Transaction approved' });
  } catch (error) {
    console.error('Approve transaction error:', error);
    res.status(500).json({ error: 'Failed to approve transaction' });
  }
});

// Reject transaction (admin only)
router.post('/:id/reject', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get transaction
    const transaction = await dbAsync.get(
      'SELECT * FROM transactions WHERE id = ?',
      [id]
    );

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ error: 'Transaction already processed' });
    }

    // Check if user is session admin
    const session = await dbAsync.get(
      'SELECT * FROM sessions WHERE id = ? AND current_admin_id = ?',
      [transaction.session_id, userId]
    );

    if (!session) {
      return res.status(403).json({ error: 'Only session admin can reject transactions' });
    }

    await dbAsync.run(
      'UPDATE transactions SET status = ? WHERE id = ?',
      ['rejected', id]
    );

    res.json({ message: 'Transaction rejected' });
  } catch (error) {
    console.error('Reject transaction error:', error);
    res.status(500).json({ error: 'Failed to reject transaction' });
  }
});

// Cash out
router.post('/cashout', authenticateToken, async (req, res) => {
  try {
    const { sessionId, amount } = req.body;
    const userId = req.user.id;

    if (!sessionId || amount === undefined || amount < 0) {
      return res.status(400).json({ error: 'Session ID and valid amount are required' });
    }

    // Check if session exists
    const session = await dbAsync.get(
      'SELECT * FROM sessions WHERE id = ?',
      [sessionId]
    );

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if user is in session
    const player = await dbAsync.get(
      'SELECT * FROM session_players WHERE session_id = ? AND user_id = ?',
      [sessionId, userId]
    );

    if (!player) {
      return res.status(403).json({ error: 'Must be in session to cash out' });
    }

    // Create cashout transaction
    const transactionId = uuidv4();
    await dbAsync.run(
      `INSERT INTO transactions (id, session_id, player_id, amount, type, status, approved_at, approved_by) 
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`,
      [transactionId, sessionId, userId, amount, 'cashout', 'approved', userId]
    );

    // Update player's cash out amount
    await dbAsync.run(
      'UPDATE session_players SET cash_out_amount = ? WHERE session_id = ? AND user_id = ?',
      [amount, sessionId, userId]
    );

    res.json({
      message: 'Cash out recorded successfully',
      profit: amount - player.total_buyin
    });
  } catch (error) {
    console.error('Cash out error:', error);
    res.status(500).json({ error: 'Failed to record cash out' });
  }
});

// Get pending transactions for a session
router.get('/session/:sessionId/pending', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    // Check if user is session admin
    const session = await dbAsync.get(
      'SELECT * FROM sessions WHERE id = ? AND current_admin_id = ?',
      [sessionId, userId]
    );

    if (!session) {
      return res.status(403).json({ error: 'Only session admin can view pending transactions' });
    }

    const transactions = await dbAsync.all(
      `SELECT t.*, u.username 
       FROM transactions t 
       JOIN users u ON t.player_id = u.id 
       WHERE t.session_id = ? AND t.status = ? AND t.type = ?
       ORDER BY t.created_at DESC`,
      [sessionId, 'pending', 'buyin']
    );

    res.json({ transactions });
  } catch (error) {
    console.error('Get pending transactions error:', error);
    res.status(500).json({ error: 'Failed to get pending transactions' });
  }
});

// Get user's transactions
router.get('/my-transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await dbAsync.all(
      `SELECT t.*, s.name as session_name
       FROM transactions t
       JOIN sessions s ON t.session_id = s.id
       WHERE t.player_id = ?
       ORDER BY t.created_at DESC`,
      [userId]
    );

    res.json({ transactions });
  } catch (error) {
    console.error('Get user transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

// Get analytics for user
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total profit/loss
    const profitData = await dbAsync.get(
      `SELECT 
        COALESCE(SUM(CASE WHEN type = 'cashout' AND status = 'approved' THEN amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN type = 'buyin' AND status = 'approved' THEN amount ELSE 0 END), 0) as total_profit
       FROM transactions 
       WHERE player_id = ?`,
      [userId]
    );

    // Get session stats
    const sessionStats = await dbAsync.get(
      `SELECT 
        COUNT(DISTINCT session_id) as total_sessions,
        COUNT(DISTINCT CASE WHEN cash_out_amount > total_buyin THEN session_id END) as winning_sessions
       FROM session_players 
       WHERE user_id = ? AND cash_out_amount IS NOT NULL`,
      [userId]
    );

    // Get biggest win/loss
    const extremes = await dbAsync.get(
      `SELECT 
        MAX(cash_out_amount - total_buyin) as biggest_win,
        MIN(cash_out_amount - total_buyin) as biggest_loss
       FROM session_players 
       WHERE user_id = ? AND cash_out_amount IS NOT NULL`,
      [userId]
    );

    // Get monthly data
    const monthlyData = await dbAsync.all(
      `SELECT 
        to_char(t.approved_at, 'YYYY-MM') as month,
        SUM(CASE WHEN t.type = 'cashout' THEN t.amount ELSE -t.amount END) as profit
       FROM transactions t
       WHERE t.player_id = ? AND t.status = 'approved'
       GROUP BY to_char(t.approved_at, 'YYYY-MM')
       ORDER BY month DESC
       LIMIT 12`,
      [userId]
    );

    // Get weekly data
    const weeklyData = await dbAsync.all(
      `SELECT 
        to_char(t.approved_at, 'IYYY-IW') as week,
        SUM(CASE WHEN t.type = 'cashout' THEN t.amount ELSE -t.amount END) as profit
       FROM transactions t
       WHERE t.player_id = ? AND t.status = 'approved'
       GROUP BY to_char(t.approved_at, 'IYYY-IW')
       ORDER BY week DESC
       LIMIT 12`,
      [userId]
    );

    // Get yearly data
    const yearlyData = await dbAsync.all(
      `SELECT 
        to_char(t.approved_at, 'YYYY') as year,
        SUM(CASE WHEN t.type = 'cashout' THEN t.amount ELSE -t.amount END) as profit
       FROM transactions t
       WHERE t.player_id = ? AND t.status = 'approved'
       GROUP BY to_char(t.approved_at, 'YYYY')
       ORDER BY year DESC
       LIMIT 5`,
      [userId]
    );

    res.json({
      totalProfit: profitData?.total_profit || 0,
      totalSessions: sessionStats?.total_sessions || 0,
      winningSessions: sessionStats?.winning_sessions || 0,
      biggestWin: extremes?.biggest_win || 0,
      biggestLoss: extremes?.biggest_loss || 0,
      monthlyData,
      weeklyData,
      yearlyData
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

module.exports = router;
