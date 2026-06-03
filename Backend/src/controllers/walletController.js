const pool = require('../db');

// GET /api/wallet/:userId
const getWallet = async (req, res) => {
  try {
    const { userId } = req.params;

    const walletResult = await pool.query(
      'SELECT * FROM wallet WHERE user_id = $1',
      [userId]
    );
    if (!walletResult.rows[0])
      return res.status(404).json({ error: 'Wallet introuvable' });

    const w = walletResult.rows[0];

    const transResult = await pool.query(
      `SELECT * FROM wallet_transactions
       WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 10`,
      [userId]
    );

    res.json({
      wallet: {
        id:            w.id,
        solde:         parseFloat(w.balance),
        solde_initial: parseFloat(w.initial_balance),
        mis_a_jour_le: w.updated_at,
      },
      transactions: transResult.rows.map(t => ({
        id:          t.id,
        montant:     parseFloat(t.amount),
        type:        t.type,
        description: t.description,
        date_trans:  t.created_at,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/wallet/ajouter
// Body: { userId, montant, type, description }
const ajouterArgent = async (req, res) => {
  const client = await pool.connect();
  try {
    const { userId, montant, type = 'revenu', description = '' } = req.body;
    if (!userId || !montant || montant <= 0)
      return res.status(400).json({ error: 'userId et montant > 0 requis' });

    await client.query('BEGIN');

    const exists = await client.query(
      'SELECT id FROM wallet WHERE user_id = $1', [userId]
    );
    if (exists.rows.length === 0) {
      await client.query(
        'INSERT INTO wallet (user_id, balance, initial_balance) VALUES ($1,$2,$2)',
        [userId, montant]
      );
    } else {
      await client.query(
        `UPDATE wallet SET balance = balance + $1, updated_at = NOW()
         WHERE user_id = $2`,
        [montant, userId]
      );
    }

    await client.query(
      `INSERT INTO wallet_transactions (user_id, amount, type, description)
       VALUES ($1,$2,$3,$4)`,
      [userId, montant, type, description]
    );

    await client.query('COMMIT');

    const updated = await pool.query(
      'SELECT balance FROM wallet WHERE user_id = $1', [userId]
    );
    res.json({
      success: true,
      wallet: { solde: parseFloat(updated.rows[0].balance) },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

module.exports = { getWallet, ajouterArgent };