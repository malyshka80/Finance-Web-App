// ============================================================
// src/routes/auth.js
// ============================================================

const express        = require('express');
const router         = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  register,
  login,
  refresh,
  logout,
  getMe,
  changePassword,
} = require('../controllers/authController');

// Public routes (no token needed)
router.post('/register', register);
router.post('/login',    login);
router.post('/refresh',  refresh);
router.post('/logout',   logout);

// Protected routes (token required)
router.get('/me',                authMiddleware, getMe);
router.patch('/change-password', authMiddleware, changePassword);

module.exports = router;