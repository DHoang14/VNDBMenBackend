const express = require('express');
const router = express.Router();
const forgotController = require('../controllers/forgotPasswordController');

router.post('/', forgotController.handleForgotPassword);

module.exports = router;