const express = require('express');
const router = express.Router();
const resetController = require('../controllers/resetTokenController');

router.get('/', resetController.handleResetToken);

module.exports = router;