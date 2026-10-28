// ============================================================
// src/middleware/adminMiddleware.js
// Runs AFTER authMiddleware — checks the user's role in the DB.
// Usage: router.get('/route', authMiddleware, adminMiddleware, controller)
// ============================================================

const pool = require('../db');

const adminMiddleware = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [req.userId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    if (result.rows[0].role !== 'admin') {
      return res.status(403).json({
        error: 'Accès refusé. Droits administrateur requis.',
        code: 'FORBIDDEN',
      });
    }

    next();
  } catch (err) {
    console.error('[adminMiddleware]', err.message);
    res.status(500).json({ error: 'Erreur de vérification du rôle' });
  }
};

module.exports = adminMiddleware;