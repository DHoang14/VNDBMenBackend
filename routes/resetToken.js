const express = require('express');
const router = express.Router();
const resetController = require('../controllers/resetTokenController');

router.route('/:token')
    .get(resetController.handleResetToken);

module.exports = router;