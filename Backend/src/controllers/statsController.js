const pool = require('../db');

// GET /api/stats/:userId
const getStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // User + wallet info
    const userRes = await pool.query(
      `SELECT u.monthly_income AS revenu_mensuel, w.balance AS solde
       FROM users u
       JOIN wallet w ON w.user_id = u.id
       WHERE u.id = $1`,
      [userId]
    );
    if (!userRes.rows[0])
      return res.status(404).json({ error: 'Utilisateur introuvable' });

    const { revenu_mensuel, solde } = userRes.rows[0];

    // Current month expenses
    const depensesMoisRes = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM expenses
       WHERE user_id = $1
         AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM NOW())
         AND EXTRACT(YEAR  FROM date) = EXTRACT(YEAR  FROM NOW())`,
      [userId]
    );
    const depensesMois = parseFloat(depensesMoisRes.rows[0].total);

    // Expenses by category
    const catRes = await pool.query(
      `SELECT ec.name AS categorie, ec.color AS couleur,
              COALESCE(SUM(e.amount), 0) AS montant
       FROM expense_categories ec
       LEFT JOIN expenses e
         ON e.category_id = ec.id AND e.user_id = $1
       GROUP BY ec.name, ec.color
       ORDER BY montant DESC`,
      [userId]
    );

    // Monthly trend (last 6 months)
    const trendRes = await pool.query(
      `SELECT
         TO_CHAR(date_trunc('month', date), 'Mon YYYY') AS mois,
         SUM(amount) AS total
       FROM expenses
       WHERE user_id = $1
         AND date >= NOW() - INTERVAL '6 months'
       GROUP BY date_trunc('month', date)
       ORDER BY date_trunc('month', date)`,
      [userId]
    );

    // Goals summary
    const goalsRes = await pool.query(
      `SELECT COUNT(*) AS total,
              COUNT(*) FILTER (WHERE status = 'completed') AS atteints
       FROM goals WHERE user_id = $1`,
      [userId]
    );

    res.json({
      solde_actuel:   parseFloat(solde),
      revenu_mensuel: parseFloat(revenu_mensuel),
      depenses_mois:  depensesMois,
      economies_mois: parseFloat(revenu_mensuel) - depensesMois,
      taux_epargne:   revenu_mensuel > 0
        ? Math.round(((revenu_mensuel - depensesMois) / revenu_mensuel) * 100)
        : 0,
      par_categorie:  catRes.rows.map(r => ({
        ...r,
        montant: parseFloat(r.montant),
      })),
      tendance_mensuelle: trendRes.rows.map(r => ({
        mois:  r.mois,
        total: parseFloat(r.total),
      })),
      objectifs: {
        total:   parseInt(goalsRes.rows[0].total),
        atteints: parseInt(goalsRes.rows[0].atteints),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getStats };