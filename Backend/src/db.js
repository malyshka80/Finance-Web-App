// ============================================================
// src/db.js — Connexion à PostgreSQL via le module "pg"
// ============================================================
// Pool = ensemble de connexions réutilisables.
// Au lieu d'ouvrir/fermer une connexion à chaque requête,
// le pool maintient plusieurs connexions ouvertes et les
// distribue à la demande → bien plus performant.
// ============================================================

const { Pool } = require('pg');

// Les variables d'environnement sont lues depuis un fichier
// .env (géré par dotenv) pour ne jamais mettre le mot de
// passe en dur dans le code.
const pool = new Pool({
  user:     process.env.DB_USER     || 'postgres',
  host:     process.env.DB_HOST     || 'localhost',
  database: process.env.DB_NAME     || 'financeapp',
  password: process.env.DB_PASSWORD || 'password',
  port:     process.env.DB_PORT     || 5432,
});

// On exporte le pool pour l'utiliser dans tous les fichiers
// qui ont besoin de faire des requêtes SQL.
module.exports = pool;