const express = require('express');
const router = express.Router();
const commentsController = require('../../controllers/commentsController');
const verifyJWT = require('../../middleware/verifyJWT');

router.route('/:id')
    .get(commentsController.getComments)
    .post(verifyJWT, commentsController.createComment);

module.exports = router;