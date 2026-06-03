// ============================================================
// src/controllers/authController.js
// Handles: register, login, logout, refresh token, get profile
// ============================================================

const pool    = require('../db');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');

const JWT_SECRET         = process.env.JWT_SECRET         || 'change_me_in_prod';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'change_refresh_secret';
const JWT_EXPIRES        = process.env.JWT_EXPIRES        || '1h';
const JWT_REFRESH_EXPIRES = '7d';

// ── Helpers ──────────────────────────────────────────────────

// Generate access token (short-lived: 1h)
const generateAccessToken = (userId) =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

// Generate refresh token (long-lived: 7d)
const generateRefreshToken = (userId) =>
  jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES });

// Format user for response (strips sensitive data)
const formatUser = (u) => ({
  id:             u.id,
  nom:            `${u.first_name} ${u.last_name}`,
  prenom:         u.first_name,
  email:          u.email,
  revenu_mensuel: parseFloat(u.monthly_income || 0),
  devise:         u.currency || 'TND',
  langue:         u.language || 'fr',
  situation_pro:  u.professional_status,
  situation_fam:  u.family_status,
  a_des_enfants:  u.has_children,
  nb_enfants:     u.children_count,
});

// ── POST /api/auth/register ───────────────────────────────────
const register = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      professional_status = 'employed',
      family_status       = 'single',
      has_children        = false,
      children_count      = 0,
      monthly_income      = 0,
      currency            = 'TND',
      language            = 'fr',
    } = req.body;

    // ── Validation ──
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({
        error: 'Champs requis : email, password, first_name, last_name',
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Le mot de passe doit contenir au moins 6 caractères',
      });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'Email invalide' });
    }

    // ── Check duplicate email ──
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }

    // ── Hash password ──
    const password_hash = await bcrypt.hash(password, 12);

    await client.query('BEGIN');

    // ── Insert user ──
    const userRes = await client.query(
      `INSERT INTO users
         (email, password_hash, first_name, last_name,
          professional_status, family_status,
          has_children, children_count,
          monthly_income, currency, language)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        email.toLowerCase().trim(),
        password_hash,
        first_name.trim(),
        last_name.trim(),
        professional_status,
        family_status,
        has_children,
        children_count,
        monthly_income,
        currency,
        language,
      ]
    );
    const user = userRes.rows[0];

    // ── Create wallet with initial balance = monthly_income ──
    await client.query(
      `INSERT INTO wallet (user_id, balance, initial_balance)
       VALUES ($1, $2, $2)`,
      [user.id, monthly_income]
    );

    await client.query('COMMIT');

    // ── Generate tokens ──
    const accessToken  = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      message:       'Compte créé avec succès',
      access_token:  accessToken,
      refresh_token: refreshToken,
      expires_in:    JWT_EXPIRES,
      user:          formatUser(user),
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[register]', err.message);
    res.status(500).json({ error: 'Erreur serveur lors de l\'inscription' });
  } finally {
    client.release();
  }
};

// ── POST /api/auth/login ──────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // ── Find user ──
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    if (result.rows.length === 0) {
      // Generic message — do NOT reveal which field is wrong
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const user = result.rows[0];

    // ── Verify password ──
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // ── Generate tokens ──
    const accessToken  = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      message:       'Connexion réussie',
      access_token:  accessToken,
      refresh_token: refreshToken,
      expires_in:    JWT_EXPIRES,
      user:          formatUser(user),
    });
  } catch (err) {
    console.error('[login]', err.message);
    res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
  }
};

// ── POST /api/auth/refresh ────────────────────────────────────
// Body: { refresh_token }
// Returns a new access token without requiring login again
const refresh = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ error: 'refresh_token requis' });
    }

    // ── Verify refresh token ──
    let decoded;
    try {
      decoded = jwt.verify(refresh_token, JWT_REFRESH_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Session expirée, veuillez vous reconnecter',
          code:  'REFRESH_EXPIRED',
        });
      }
      return res.status(401).json({ error: 'Token de rafraîchissement invalide' });
    }

    // ── Check user still exists ──
    const userRes = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [decoded.userId]
    );
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Utilisateur introuvable' });
    }

    // ── Issue new access token ──
    const newAccessToken = generateAccessToken(decoded.userId);

    res.json({
      access_token: newAccessToken,
      expires_in:   JWT_EXPIRES,
    });
  } catch (err) {
    console.error('[refresh]', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// ── POST /api/auth/logout ─────────────────────────────────────
// JWTs are stateless — logout is handled client-side by deleting
// the stored tokens. This endpoint just confirms the action.
const logout = (req, res) => {
  res.json({ message: 'Déconnexion réussie. Supprimez vos tokens localement.' });
};

// ── GET /api/auth/me ──────────────────────────────────────────
// Protected route — requires valid access token
const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.*, w.balance AS solde
       FROM users u
       LEFT JOIN wallet w ON w.user_id = u.id
       WHERE u.id = $1`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    const u = result.rows[0];
    res.json({
      ...formatUser(u),
      solde: parseFloat(u.solde || 0),
    });
  } catch (err) {
    console.error('[getMe]', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// ── PATCH /api/auth/change-password ──────────────────────────
// Body: { old_password, new_password }
const changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(400).json({ error: 'Ancien et nouveau mot de passe requis' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'Nouveau mot de passe : 6 caractères minimum' });
    }

    const userRes = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.userId]
    );
    const user = userRes.rows[0];

    const match = await bcrypt.compare(old_password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Ancien mot de passe incorrect' });
    }

    const newHash = await bcrypt.hash(new_password, 12);
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newHash, req.userId]
    );

    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (err) {
    console.error('[changePassword]', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
  changePassword,
};