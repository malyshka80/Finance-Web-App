// ============================================================
// src/middleware/auth.js
// Verifies the JWT access token on protected routes.
// Usage: router.get('/protected', authMiddleware, controller)
// ============================================================

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_me_in_prod';

const authMiddleware = (req, res, next) => {
  // ── 1. Extract token from Authorization header ──
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Accès refusé. Token manquant.',
      code:  'NO_TOKEN',
    });
  }

  const token = authHeader.split(' ')[1]; // "Bearer <token>"

  // ── 2. Verify token ──
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach userId to request so controllers can use it
    req.userId = decoded.userId;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Session expirée. Veuillez vous reconnecter.',
        code:  'TOKEN_EXPIRED',
      });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token invalide.',
        code:  'INVALID_TOKEN',
      });
    }
    return res.status(401).json({
      error: 'Erreur d\'authentification.',
      code:  'AUTH_ERROR',
    });
  }
};

module.exports = authMiddleware;