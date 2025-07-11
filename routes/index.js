const express = require('express');
const questions = require('./questions');
const answers = require('./answers');

module.exports = (client, redisClient) => {
  const router = express.Router();
  router.use('/questions', questions(client, redisClient));
  router.use('/', answers(client, redisClient));
  return router;
};