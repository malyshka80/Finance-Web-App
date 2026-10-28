const express = require('express');
const router  = express.Router();
const {
  getDepenses, ajouterDepense,
  supprimerDepense, getCategories,
} = require('../controllers/depensesController');

router.get('/categories/all', getCategories);   // ← must be BEFORE /:userId
router.get('/:userId',        getDepenses);
router.post('/',              ajouterDepense);
router.delete('/:id',         supprimerDepense);

module.exports = router;