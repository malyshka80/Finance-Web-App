const express = require('express');
const router  = express.Router();
const { getWallet, ajouterArgent } = require('../controllers/walletController');

router.get('/:userId',    getWallet);
router.post('/ajouter',   ajouterArgent);

module.exports = router;