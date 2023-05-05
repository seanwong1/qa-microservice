const express = require("express");

const client = require('../database/SQL').client;
client.connect();

const config = require("../config.js");

const app = express();

app.use(express.json());

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
    client.query(" \
      SELECT json_build_object( \
        'product_id', $1::Integer, \
        'results', (WITH q AS (SELECT * from questions WHERE product_id = $1::Integer OFFSET $2 LIMIT $3) \
          SELECT json_agg(json_build_object( \
            'question_id', q.id, \
            'question_body', q.body, \
            'question_date', q.date_written, \
            'asker_name', q.asker_name, \
            'question_helpfulness', q.helpful, \
            'reported', q.reported, \
            'answers', (SELECT json_object_agg( \
              a.id, json_build_object( \
                'id', a.id, \
                'body', a.body, \
                'date', a.date_written, \
                'answerer_name', a.answerer_name, \
                'helpfulness', a.helpful, \
                'photos', (SELECT json_agg(json_build_object( \
                  'id', ap.id, \
                  'url', ap.url \
                )) FROM answers_photos AS ap WHERE ap.answer_id = a.id) \
              ) \
            ) FROM answers AS a WHERE a.question_id = q.id) \
          )) FROM q \
        ) \
      ) \
    ", [req.query.product_id, req.query.page, req.query.count])
      .then((result) => {
        res.send(result.rows);
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(404);
      });
      // .then(() => {
      //   client.end();
      // });
  }
});

app.get('/qa/questions/:question_id/answers', (req, res) => {
  var question_id = req.params.question_id;
  if (!req.query.page) {
    req.query.page = 1;
  }
  if (!req.query.count) {
    req.query.count = 5;
  }
  // client.connect();
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
    });
    // .then(() => {
    //   client.end();
    // });
})

app.put('/qa/questions/:question_id/helpful', (req, res) => {
  var question_id = req.params.question_id;
  // client.connect();
  client.query('UPDATE questions SET helpful = helpful + 1 WHERE id = $1', [question_id])
    .then((result) => {
      res.sendStatus(204);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(404);
    })
    // .then(() => {
    //   client.end();
    // });
});

app.put('/qa/questions/:question_id/report', (req, res) => {
  var question_id = req.params.question_id;
  // client.connect();
  client.query('UPDATE questions SET reported = reported + 1 WHERE id = $1', [question_id])
    .then((result) => {
      res.sendStatus(204);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(404);
    })
    // .then(() => {
    //   client.end();
    // });
});

app.put('/qa/answers/:answer_id/helpful', (req, res) => {
  var answer_id = req.params.answer_id;
  // client.connect();
  client.query('UPDATE answers SET helpful = helpful + 1 WHERE id = $1', [answer_id])
    .then((result) => {
      res.sendStatus(204);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(404);
    })
    // .then(() => {
    //   client.end();
    // });
});

app.put('/qa/answers/:answer_id/report', (req, res) => {
  var answer_id = req.params.answer_id;
  // client.connect();
  client.query('UPDATE answers SET reported = reported + 1 WHERE id = $1', [answer_id])
    .then((result) => {
      res.sendStatus(204);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(404);
    })
    // .then(() => {
    //   client.end();
    // });
});

app.listen(config.port, () => {
  console.log("Server listening on port", config.port);
});
