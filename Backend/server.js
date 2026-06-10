require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const walletRoutes    = require('./src/routes/wallet');
const depensesRoutes  = require('./src/routes/depenses');
const objectifsRoutes = require('./src/routes/objectifs');
const statsRoutes     = require('./src/routes/stats');
const authRoutes      = require('./src/routes/auth');
const tachesRoutes    = require('./src/routes/taches');   // ← NEW
const adminRoutes     = require('./src/routes/admin');

const app = express();

app.use(cors({ origin: 'https://finance-web-app-frontend.onrender.com' }));
app.use(express.json());

app.use('/api/auth',      authRoutes);
app.use('/api/wallet',    walletRoutes);
app.use('/api/depenses',  depensesRoutes);
app.use('/api/objectifs', objectifsRoutes);
app.use('/api/stats',     statsRoutes);
app.use('/api/taches',    tachesRoutes);   // ← NEW
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`)
);