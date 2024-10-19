const express = require('express');
const router = express.Router();
const updatePasswordController = require('../controllers/updatePasswordController');

router.put('/', updatePasswordController.handleUpdatePassword);

module.exports = router;