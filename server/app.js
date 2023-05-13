const express = require("express");

const client = require('../database/SQL').client;
client.connect();

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
        res.send(result.rows[0].json_build_object);
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
});

app.post('/qa/questions', (req, res) => {
  var body = req.query.body;
  var name = req.query.name;
  var email = req.query.email;
  var product_id = req.query.product_id;
  var timestamp = new Date().getTime();
  client.query('INSERT INTO questions (id, body, asker_name, asker_email, product_id, date_written, reported, helpful) VALUES ((SELECT MAX(id) FROM questions) + 1, $1, $2, $3, $4, $5, 0, 0)', [body, name, email, product_id, timestamp])
    .then((result) => {
      res.sendStatus(201);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(404);
    });
});

app.post('/qa/questions/:question_id/answers', (req, res) => {
  var question_id = req.params.question_id;
  var body = req.query.body;
  var name = req.query.name;
  var email = req.query.email;
  var photos = JSON.parse(req.query.photos);
  var timestamp = new Date().getTime();
  client.query('INSERT INTO answers (id, question_id, body, date_written, answerer_name, answerer_email, reported, helpful) VALUES ((SELECT MAX(id) FROM answers) + 1, $1, $2, $3, $4, $5, 0, 0)', [question_id, body, timestamp, name, email])
    .then((result) => {
      client.query('SELECT MAX(id) FROM answers_photos')
        .then((result) => {
          var last_id = result.rows[0].max + 1;
          var photo_ids = Array.from({ length: photos.length }, (value, index) => last_id + index);
          // var answer_ids = Array(photos.length).fill();
          client.query('SELECT MAX(id) FROM answers')
            .then((result) => {
              var answer_id = Array(photos.length).fill(result.rows[0].max);
              client.query('INSERT INTO answers_photos (id, answer_id, url) (SELECT * FROM UNNEST ($1::int[], $2::int[], $3::text[]))', [photo_ids, answer_id, photos])
                .then((result) => {
                  res.sendStatus(201);
                })
                .catch((err) => {
                  console.log(err);
                  res.sendStatus(404);
                });
            })
            .catch((err) => {
              console.log(err);
              res.sendStatus(404);
            });
        })
        .catch((err) => {
          console.log(err);
          res.sendStatus(404);
        });
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(404);
    });
});

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

module.exports = app;