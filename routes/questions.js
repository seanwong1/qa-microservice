const express = require('express');

module.exports = (client, redisClient) => {
  const router = express.Router();
  const controller = require('../controllers/questions')(client, redisClient);

  router.get('/', controller.getQuestions);
  router.post('/', controller.addQuestion);
  router.put('/:question_id/helpful', controller.markQuestionHelpful);
  router.put('/:question_id/report', controller.reportQuestion);

  return router;
};