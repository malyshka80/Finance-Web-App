// ============================================================
// server.js — Point d'entrée du backend Express
// ============================================================
// Ce fichier initialise le serveur Express, connecte la base
// de données PostgreSQL, et monte toutes les routes.
// ============================================================

const express = require('express');
const cors = require('cors');
const pool = require('./src/db');  // connexion PostgreSQL

// Import des routes
const walletRoutes    = require('./src/routes/wallet');
const depensesRoutes  = require('./src/routes/depenses');
const objectifsRoutes = require('./src/routes/objectifs');
const tachesRoutes    = require('./src/routes/taches');
const statsRoutes     = require('./src/routes/stats');
const aiRoutes        = require('./src/routes/ai');

const app = express();

// ── Middleware ──────────────────────────────────────────────
// cors() : autorise le frontend React (port 3000) à appeler
//          ce backend (port 5000)
app.use(cors());

// express.json() : parse automatiquement le body JSON des
//                  requêtes POST/PUT
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────
// Chaque préfixe correspond à un module de l'application
app.use('/api/wallet',    walletRoutes);
app.use('/api/depenses',  depensesRoutes);
app.use('/api/objectifs', objectifsRoutes);
app.use('/api/taches',    tachesRoutes);
app.use('/api/stats',     statsRoutes);
app.use('/api/ai',        aiRoutes);

// ── Démarrage ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});