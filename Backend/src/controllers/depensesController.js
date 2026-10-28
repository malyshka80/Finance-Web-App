const pool = require('../db');

const CATEGORY_ORDER = [
  'Factures',
  'Nourriture',
  'Vêtements',
  'Enfants',
  'Loisirs',
  'Transport',
  'Santé',
  'Éducation',
  'Autre',
];

const normalizeFrenchText = (value = '') =>
  value
    .replaceAll('VÃªtements', 'Vêtements')
    .replaceAll('SantÃ©', 'Santé')
    .replaceAll('Ã‰ducation', 'Éducation')
    .replaceAll('DÃ©pense', 'Dépense');

// GET /api/depenses/:userId?mois=4&annee=2025
const getDepenses = async (req, res) => {
  try {
    const { userId } = req.params;
    const { mois, annee } = req.query;

    let query = `
      SELECT
        e.id,
        e.amount         AS montant,
        e.description,
        e.date           AS date_depense,
        ec.name          AS categorie_nom,
        ec.icon          AS icone,
        ec.color         AS couleur
      FROM expenses e
      JOIN expense_categories ec ON e.category_id = ec.id
      WHERE e.user_id = $1
    `;
    const params = [userId];

    if (mois && annee) {
      query += ` AND EXTRACT(MONTH FROM e.date) = $2
                 AND EXTRACT(YEAR  FROM e.date) = $3`;
      params.push(mois, annee);
    }

    query += ' ORDER BY e.date DESC';

    const result = await pool.query(query, params);

    res.json(result.rows.map(r => ({
      ...r,
      montant: parseFloat(r.montant),
      categorie_nom: normalizeFrenchText(r.categorie_nom),
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/depenses
// Body: { userId, categorieId, montant, description, date_depense }
const ajouterDepense = async (req, res) => {
  const client = await pool.connect();
  try {
    const { userId, categorieId, montant, description, date_depense } = req.body;
    if (!userId || !categorieId || !montant || montant <= 0)
      return res.status(400).json({ error: 'Champs requis manquants' });

    await client.query('BEGIN');

    const depense = await client.query(
      `INSERT INTO expenses (user_id, category_id, amount, description, date)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [userId, categorieId, montant, description || '', date_depense || new Date()]
    );

    // Deduct from wallet
    await client.query(
      `UPDATE wallet
       SET balance = GREATEST(0, balance - $1), updated_at = NOW()
       WHERE user_id = $2`,
      [montant, userId]
    );

    // Record as negative wallet transaction
    await client.query(
      `INSERT INTO wallet_transactions (user_id, amount, type, description)
       VALUES ($1,$2,'depense',$3)`,
      [userId, -montant, description || 'Dépense']
    );

    await client.query('COMMIT');

    // Return with category info for frontend
    const enriched = await pool.query(
      `SELECT e.id, e.amount AS montant, e.description,
              e.date AS date_depense,
              ec.name AS categorie_nom, ec.icon AS icone, ec.color AS couleur
       FROM expenses e
       JOIN expense_categories ec ON e.category_id = ec.id
       WHERE e.id = $1`,
      [depense.rows[0].id]
    );

    res.json({
      success: true,
      depense: {
        ...enriched.rows[0],
        categorie_nom: normalizeFrenchText(enriched.rows[0].categorie_nom),
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

// DELETE /api/depenses/:id
const supprimerDepense = async (req, res) => {
  try {
    await pool.query('DELETE FROM expenses WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/depenses/categories/all
const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name AS nom, icon AS icone, color AS couleur, is_default
       FROM expense_categories
       ORDER BY is_default DESC, name, created_at`
    );
    const categoriesByName = new Map();

    result.rows.forEach((row) => {
      const nom = normalizeFrenchText(row.nom);
      const key = nom.toLocaleLowerCase('fr-FR');
      if (!categoriesByName.has(key)) {
        categoriesByName.set(key, { ...row, nom });
      }
    });

    const categories = [...categoriesByName.values()].sort((a, b) => {
      const aIndex = CATEGORY_ORDER.indexOf(a.nom);
      const bIndex = CATEGORY_ORDER.indexOf(b.nom);
      if (aIndex !== -1 || bIndex !== -1) {
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      }
      return a.nom.localeCompare(b.nom, 'fr-FR');
    });

    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getDepenses, ajouterDepense, supprimerDepense, getCategories };
