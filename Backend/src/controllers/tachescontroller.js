// ============================================================
// src/controllers/tachesController.js
// CRUD for the todos table
// ============================================================
const pool = require('../db');

// GET /api/taches/:userId
const getTaches = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         id,
         title            AS titre,
         description,
         due_date         AS date_echeance,
         is_completed     AS terminee,
         priority,
         related_goal_id  AS objectif_id,
         created_at
       FROM todos
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[getTaches]', err.message);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/taches
// Body: { userId, titre, date_echeance?, objectif_id? }
const ajouterTache = async (req, res) => {
  try {
    const { userId, titre, date_echeance, objectif_id } = req.body;
    if (!userId || !titre)
      return res.status(400).json({ error: 'userId et titre requis' });

    const result = await pool.query(
      `INSERT INTO todos (user_id, title, due_date, related_goal_id, is_completed)
       VALUES ($1, $2, $3, $4, false)
       RETURNING
         id,
         title           AS titre,
         description,
         due_date        AS date_echeance,
         is_completed    AS terminee,
         related_goal_id AS objectif_id,
         created_at`,
      [userId, titre.trim(), date_echeance || null, objectif_id || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[ajouterTache]', err.message);
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/taches/:id/toggle
const toggleTache = async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE todos
       SET
         is_completed = NOT is_completed,
         completed_at = CASE WHEN NOT is_completed THEN NOW() ELSE NULL END,
         updated_at   = NOW()
       WHERE id = $1
       RETURNING
         id,
         title           AS titre,
         description,
         due_date        AS date_echeance,
         is_completed    AS terminee,
         related_goal_id AS objectif_id`,
      [req.params.id]
    );

    if (!result.rows[0])
      return res.status(404).json({ error: 'Tâche introuvable' });

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[toggleTache]', err.message);
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/taches/:id
const supprimerTache = async (req, res) => {
  try {
    await pool.query('DELETE FROM todos WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('[supprimerTache]', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getTaches, ajouterTache, toggleTache, supprimerTache };