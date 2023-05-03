const express = require("express");

const client = require('../database/SQL').client;
const config = require("../config.js");

const app = express();

app.use(express.json());

app.get('/qa/questions/:question_id/answers', (req, res) => {
  var question_id = req.params.question_id;
  if (!req.query.page) {
    req.query.page = 1;
  }
  if (!req.query.count) {
    req.query.count = 5;
  }
  client.connect();
  client.query(
    "(SELECT *, ARRAY( \
        SELECT url \
        FROM answers_photos ap \
        WHERE a.id = ap.answer_id) AS photos \
      FROM answers a \
      WHERE question_id = $1) \
    ", [question_id])
    .then((result) => {
      res.send({
        'question': question_id,
        'page': req.query.page,
        'count': req.query.count,
        'results': result.rows
      });
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(404);
    })
    .then(() => {
      client.end();
    });
})

app.get('/qa/questions', (req, res) => {
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

app.put('/qa/questions/:question_id/helpful', (req, res) => {
  var question_id = req.params.question_id;
  client.connect();
  client.query('UPDATE questions SET helpful = helpful + 1 WHERE id = $1', [question_id])
    .then((result) => {
      res.sendStatus(204);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(404);
    })
    .then(() => {
      client.end();
    });
});

app.put('/qa/questions/:question_id/report', (req, res) => {
  var question_id = req.params.question_id;
  client.connect();
  client.query('UPDATE questions SET reported = reported + 1 WHERE id = $1', [question_id])
    .then((result) => {
      res.sendStatus(204);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(404);
    })
    .then(() => {
      client.end();
    });
});

app.put('/qa/answers/:answer_id/helpful', (req, res) => {
  var answer_id = req.params.answer_id;
  client.connect();
  client.query('UPDATE answers SET helpful = helpful + 1 WHERE id = $1', [answer_id])
    .then((result) => {
      res.sendStatus(204);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(404);
    })
    .then(() => {
      client.end();
    });
});

app.put('/qa/answers/:answer_id/report', (req, res) => {
  var answer_id = req.params.answer_id;
  client.connect();
  client.query('UPDATE answers SET reported = reported + 1 WHERE id = $1', [answer_id])
    .then((result) => {
      res.sendStatus(204);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(404);
    })
    .then(() => {
      client.end();
    });
});

app.listen(config.port, () => {
  console.log("Server listening on port", config.port);
});
