// routes/moduleRoutes.js
const express = require('express');
const router = express.Router();
const moduleController = require('../endpoint/StAnswers-ep');

router.post('/submit-answers', moduleController.submitAnswers);

module.exports = router;
