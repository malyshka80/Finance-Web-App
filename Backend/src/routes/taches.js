// ============================================================
// src/routes/taches.js
// ============================================================
const express = require('express');
const router  = express.Router();
const {
  getTaches,
  ajouterTache,
  toggleTache,
  supprimerTache,
} = require('../controllers/tachesController');

router.get('/:userId',     getTaches);
router.post('/',           ajouterTache);
router.patch('/:id/toggle', toggleTache);
router.delete('/:id',      supprimerTache);

module.exports = router;