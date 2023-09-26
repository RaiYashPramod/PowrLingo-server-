const router = require('express').Router();

const controller = require('../controller/questions');

router.post('/add-question', controller.addQuestions)

router.get('/get-questions', controller.getQuestions)

router.post('/answer', controller.answerQuestion)

module.exports = router;