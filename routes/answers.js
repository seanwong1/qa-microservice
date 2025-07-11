const express = require('express');

module.exports = (client, redisClient) => {
  const router = express.Router();
  const controller = require('../controllers/answers')(client, redisClient);

  router.get('/questions/:question_id/answers', controller.getAnswers);
  router.post('/questions/:question_id/answers', controller.addAnswer);
  router.put('/answers/:answer_id/helpful', controller.markAnswerHelpful);
  router.put('/answers/:answer_id/report', controller.reportAnswer);

  return router;
};