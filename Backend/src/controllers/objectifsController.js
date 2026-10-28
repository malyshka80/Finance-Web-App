const pool = require('../db');

// GET /api/objectifs/:userId
const getObjectifs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id,
              title        AS titre,
              description,
              target_amount AS montant_cible,
              current_amount AS montant_actuel,
              deadline     AS date_limite,
              status       AS statut,
              priority
       FROM goals
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.params.userId]
    );
    res.json(result.rows.map(r => ({
      ...r,
      montant_cible:  parseFloat(r.montant_cible),
      montant_actuel: parseFloat(r.montant_actuel),
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/objectifs
// Body: { userId, titre, description, montant_cible, date_limite }
const creerObjectif = async (req, res) => {
  try {
    const { userId, titre, description, montant_cible, date_limite } = req.body;
    if (!userId || !titre || !montant_cible)
      return res.status(400).json({ error: 'userId, titre et montant_cible requis' });

    const result = await pool.query(
      `INSERT INTO goals
         (user_id, title, description, target_amount, current_amount, deadline, status)
       VALUES ($1,$2,$3,$4,0,$5,'active')
       RETURNING
         id,
         title AS titre, description,
         target_amount AS montant_cible,
         current_amount AS montant_actuel,
         deadline AS date_limite,
         status AS statut`,
      [userId, titre, description || '', montant_cible, date_limite || null]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/objectifs/:id/progression
// Body: { montant_actuel, userId }
const mettreAJourProgression = async (req, res) => {
  const client = await pool.connect();
  try {
    const { montant_actuel, userId } = req.body;
    const { id } = req.params;

    await client.query('BEGIN');

    // Get current goal
    const goalRes = await client.query(
      'SELECT * FROM goals WHERE id = $1', [id]
    );
    if (!goalRes.rows[0])
      return res.status(404).json({ error: 'Objectif introuvable' });

    const goal = goalRes.rows[0];
    const diff = montant_actuel - parseFloat(goal.current_amount);

    const result = await client.query(
      `UPDATE goals
       SET current_amount = $1,
           status = CASE WHEN $1 >= target_amount THEN 'completed' ELSE 'active' END,
           updated_at = NOW()
       WHERE id = $2
       RETURNING
         id,
         title AS titre, description,
         target_amount AS montant_cible,
         current_amount AS montant_actuel,
         deadline AS date_limite,
         status AS statut`,
      [montant_actuel, id]
    );

    // Record contribution
    if (diff > 0 && userId) {
      await client.query(
        `INSERT INTO goal_contributions (goal_id, user_id, amount, date)
         VALUES ($1,$2,$3,CURRENT_DATE)`,
        [id, userId, diff]
      );

      // Deduct from wallet
      await client.query(
        `UPDATE wallet
         SET balance = GREATEST(0, balance - $1), updated_at = NOW()
         WHERE user_id = $2`,
        [diff, userId]
      );
    }

    await client.query('COMMIT');

    res.json({
      ...result.rows[0],
      montant_cible:  parseFloat(result.rows[0].montant_cible),
      montant_actuel: parseFloat(result.rows[0].montant_actuel),
      statut: result.rows[0].statut === 'completed' ? 'atteint' : 'en_cours',
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

// DELETE /api/objectifs/:id
const supprimerObjectif = async (req, res) => {
  try {
    await pool.query('DELETE FROM goals WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getObjectifs,
  creerObjectif,
  mettreAJourProgression,
  supprimerObjectif,
};