const express = require("express");

const client = require('../database/SQL').client;
const config = require("../config.js");

const app = express();

app.use(express.json());

app.use('/qa/questions/:question_id/answers', (req, res) => {
  var question_id = req.params.question_id;
  if (!req.query.page) {
    req.query.page = 1;
  }
  if (!req.query.count) {
    req.query.count = 5;
  }
  client.connect();
  client.query('SELECT * FROM answers WHERE question_id = $1', [question_id])
    .then((result) => {
      res.send(result.rows);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(404);
    })
    .then(() => {
      client.end();
    });
})

app.use('/qa/questions', (req, res) => {
  if (!req.query.page) {
    req.query.page = 1;
  }
  if (!req.query.count) {
    req.query.count = 5;
  }
  if (!req.query.product_id) {
    res.end('Enter product id');
  } else {
    client.connect();
    client.query('SELECT * FROM questions WHERE product_id = $1', [req.query.product_id])
      .then((result) => {
        res.send(result.rows);
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(404);
      })
      .then(() => {
        client.end();
      });
  }
});

app.listen(config.port, () => {
  console.log("Server listening on port", config.port);
});
