// ============================================================
// src/controllers/adminController.js
// Handles all admin-only operations.
// ============================================================

const pool = require('../db');

// ── GET /api/admin/stats ─────────────────────────────────────
const getAdminStats = async (req, res) => {
  try {
    const [usersRes, expensesRes, goalsRes, todosRes, newUsersRes] = await Promise.all([
      pool.query('SELECT COUNT(*) AS count FROM users'),
      pool.query('SELECT COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total FROM expenses'),
      pool.query("SELECT COUNT(*) AS count FROM goals WHERE status = 'active'"),
      pool.query('SELECT COUNT(*) AS count FROM todos WHERE is_completed = false'),
      pool.query(
        `SELECT COUNT(*) AS count FROM users
         WHERE created_at >= NOW() - INTERVAL '7 days'`
      ),
    ]);

    res.json({
      total_users:     parseInt(usersRes.rows[0].count),
      total_expenses:  parseInt(expensesRes.rows[0].count),
      total_amount:    parseFloat(expensesRes.rows[0].total),
      active_goals:    parseInt(goalsRes.rows[0].count),
      pending_todos:   parseInt(todosRes.rows[0].count),
      new_users_week:  parseInt(newUsersRes.rows[0].count),
    });
  } catch (err) {
    console.error('[getAdminStats]', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ── GET /api/admin/users ─────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        u.professional_status,
        u.monthly_income,
        u.created_at,
        COALESCE(w.balance, 0) AS wallet_balance,
        (SELECT COUNT(*) FROM expenses WHERE user_id = u.id)::int AS expense_count,
        (SELECT COUNT(*) FROM goals    WHERE user_id = u.id)::int AS goal_count
      FROM users u
      LEFT JOIN wallet w ON w.user_id = u.id
      ORDER BY u.created_at DESC
    `);

    res.json(result.rows.map(r => ({
      id:                 r.id,
      nom:                `${r.first_name} ${r.last_name}`,
      prenom:             r.first_name,
      email:              r.email,
      role:               r.role || 'user',
      situation_pro:      r.professional_status,
      revenu_mensuel:     parseFloat(r.monthly_income || 0),
      wallet_balance:     parseFloat(r.wallet_balance),
      expense_count:      r.expense_count,
      goal_count:         r.goal_count,
      created_at:         r.created_at,
    })));
  } catch (err) {
    console.error('[getAllUsers]', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ── DELETE /api/admin/users/:id ───────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Cannot delete yourself
    if (id === req.userId) {
      return res.status(400).json({ error: 'Impossible de supprimer votre propre compte' });
    }

    // Cannot delete other admins
    const check = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [id]
    );
    if (!check.rows[0]) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }
    if (check.rows[0].role === 'admin') {
      return res.status(403).json({ error: 'Impossible de supprimer un autre administrateur' });
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ success: true, message: 'Utilisateur supprimé' });
  } catch (err) {
    console.error('[deleteUser]', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ── PATCH /api/admin/users/:id/role ──────────────────────────
const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide. Valeurs: user | admin' });
    }

    // Cannot demote yourself
    if (id === req.userId && role !== 'admin') {
      return res.status(400).json({ error: 'Impossible de retirer votre propre rôle admin' });
    }

    await pool.query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2',
      [role, id]
    );

    res.json({ success: true, role });
  } catch (err) {
    console.error('[changeUserRole]', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAdminStats, getAllUsers, deleteUser, changeUserRole };