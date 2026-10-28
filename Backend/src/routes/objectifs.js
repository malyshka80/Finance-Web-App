const express = require('express');
const router  = express.Router();
const {
  getObjectifs, creerObjectif,
  mettreAJourProgression, supprimerObjectif,
} = require('../controllers/objectifsController');

router.get('/:userId',           getObjectifs);
router.post('/',                 creerObjectif);
router.patch('/:id/progression', mettreAJourProgression);
router.delete('/:id',            supprimerObjectif);

module.exports = router;