const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { dbAsync } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Generate random join code
function generateJoinCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Create new session
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Session name is required' });
    }

    const sessionId = uuidv4();
    const joinCode = generateJoinCode();

    // Create session
    await dbAsync.run(
      `INSERT INTO sessions (id, name, current_admin_id, join_code, created_by) 
       VALUES (?, ?, ?, ?, ?)`,
      [sessionId, name.trim(), userId, joinCode, userId]
    );

    // Add creator as first player
    await dbAsync.run(
      `INSERT INTO session_players (session_id, user_id, total_buyin, current_stack) 
       VALUES (?, ?, 0, 0)`,
      [sessionId, userId]
    );

    const session = await dbAsync.get(
      `SELECT s.*, u.username as admin_username 
       FROM sessions s 
       JOIN users u ON s.current_admin_id = u.id 
       WHERE s.id = ?`,
      [sessionId]
    );

    res.status(201).json({
      message: 'Session created successfully',
      session
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Get all sessions for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get sessions where user is a participant
    const sessions = await dbAsync.all(
      `SELECT DISTINCT s.*, u.username as admin_username,
        (SELECT COUNT(*) FROM session_players WHERE session_id = s.id) as player_count
       FROM sessions s
       JOIN users u ON s.current_admin_id = u.id
       LEFT JOIN session_players sp ON s.id = sp.session_id
       WHERE sp.user_id = ? OR s.created_by = ?
       ORDER BY s.created_at DESC`,
      [userId, userId]
    );

    res.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

// Get session by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is in session
    const isParticipant = await dbAsync.get(
      'SELECT 1 FROM session_players WHERE session_id = ? AND user_id = ?',
      [id, userId]
    );

    if (!isParticipant) {
      return res.status(403).json({ error: 'Not authorized to view this session' });
    }

    const session = await dbAsync.get(
      `SELECT s.*, u.username as admin_username 
       FROM sessions s 
       JOIN users u ON s.current_admin_id = u.id 
       WHERE s.id = ?`,
      [id]
    );

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Get players in session
    const players = await dbAsync.all(
      `SELECT sp.*, u.username, u.avatar_url
       FROM session_players sp
       JOIN users u ON sp.user_id = u.id
       WHERE sp.session_id = ?`,
      [id]
    );

    res.json({ session, players });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

// Join session by code
router.post('/join', authenticateToken, async (req, res) => {
  try {
    const { joinCode } = req.body;
    const userId = req.user.id;

    if (!joinCode) {
      return res.status(400).json({ error: 'Join code is required' });
    }

    // Find session by join code
    const session = await dbAsync.get(
      'SELECT * FROM sessions WHERE join_code = ? AND status = ?',
      [joinCode.toUpperCase(), 'active']
    );

    if (!session) {
      return res.status(404).json({ error: 'Session not found or inactive' });
    }

    // Check if already in session
    const existingPlayer = await dbAsync.get(
      'SELECT 1 FROM session_players WHERE session_id = ? AND user_id = ?',
      [session.id, userId]
    );

    if (existingPlayer) {
      return res.json({ message: 'Already in session', session });
    }

    // Add player to session
    await dbAsync.run(
      `INSERT INTO session_players (session_id, user_id, total_buyin, current_stack) 
       VALUES (?, ?, 0, 0)`,
      [session.id, userId]
    );

    res.json({ message: 'Joined session successfully', session });
  } catch (error) {
    console.error('Join session error:', error);
    res.status(500).json({ error: 'Failed to join session' });
  }
});

// Close session
router.post('/:id/close', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { finalStacks } = req.body; // Object: { userId: amount }
    const userId = req.user.id;

    // Check if user is admin
    const session = await dbAsync.get(
      'SELECT * FROM sessions WHERE id = ? AND current_admin_id = ?',
      [id, userId]
    );

    if (!session) {
      return res.status(403).json({ error: 'Only admin can close session' });
    }

    if (finalStacks) {
      // Fetch all players to validate totals
      const players = await dbAsync.all('SELECT * FROM session_players WHERE session_id = ?', [id]);

      let totalBuyin = 0;
      let totalStack = 0;

      // Calculate totals
      for (const player of players) {
        totalBuyin += parseInt(player.total_buyin || 0);
        const stack = parseInt(finalStacks[player.user_id] || 0);
        totalStack += stack;
      }

      // Check if totals match (chips on table must equal chips bought in)
      if (totalBuyin !== totalStack) {
        return res.status(400).json({
          error: 'Financial verification failed. Total chips on table must equal total buy-ins.',
          totalBuyin,
          totalStack,
          difference: totalStack - totalBuyin
        });
      }

      // Process results
      for (const player of players) {
        const stack = parseInt(finalStacks[player.user_id] || 0);

        // Update session_player
        await dbAsync.run(
          'UPDATE session_players SET current_stack = ?, cash_out_amount = ? WHERE session_id = ? AND user_id = ?',
          [stack, stack, id, player.user_id]
        );

        // Create cashout transaction for record keeping
        const transactionId = uuidv4();
        await dbAsync.run(
          `INSERT INTO transactions (id, session_id, player_id, amount, type, status, approved_at, approved_by)
           VALUES (?, ?, ?, ?, 'cashout', 'approved', CURRENT_TIMESTAMP, ?)`,
          [transactionId, id, player.user_id, stack, userId]
        );
      }
    }

    await dbAsync.run(
      'UPDATE sessions SET status = ?, closed_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['closed', id]
    );

    res.json({ message: 'Session closed successfully' });
  } catch (error) {
    console.error('Close session error:', error);
    res.status(500).json({ error: 'Failed to close session' });
  }
});

// Transfer admin rights
router.post('/:id/transfer-admin', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { newAdminId } = req.body;
    const userId = req.user.id;

    if (!newAdminId) {
      return res.status(400).json({ error: 'New admin ID is required' });
    }

    // Check if user is current admin
    const session = await dbAsync.get(
      'SELECT * FROM sessions WHERE id = ? AND current_admin_id = ?',
      [id, userId]
    );

    if (!session) {
      return res.status(403).json({ error: 'Only current admin can transfer rights' });
    }

    // Check if new admin is in session
    const isInSession = await dbAsync.get(
      'SELECT 1 FROM session_players WHERE session_id = ? AND user_id = ?',
      [id, newAdminId]
    );

    if (!isInSession) {
      return res.status(400).json({ error: 'New admin must be in the session' });
    }

    await dbAsync.run(
      'UPDATE sessions SET current_admin_id = ? WHERE id = ?',
      [newAdminId, id]
    );

    res.json({ message: 'Admin rights transferred successfully' });
  } catch (error) {
    console.error('Transfer admin error:', error);
    res.status(500).json({ error: 'Failed to transfer admin rights' });
  }
});

module.exports = router;
