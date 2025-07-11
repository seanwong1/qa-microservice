module.exports = (client, redisClient) => {
  const getQuestions = async (req, res) => {
    let results;
    let isCached = false;

    if (!req.query.page) {
      req.query.page = 1;
    }
    if (!req.query.count) {
      req.query.count = 5;
    }
    if (!req.query.product_id) {
      res.end('Enter product id');
    } else {
      try {
        const cacheResults = await redisClient.get(req.query.product_id);
        if (cacheResults) {
          isCached = true;
          results = JSON.parse(cacheResults);
        } else {
          results = await client.query(`
          SELECT json_build_object(
            'product_id', $1::Integer,
            'results', (WITH q AS (SELECT * from questions WHERE product_id = $1::Integer OFFSET $2 LIMIT $3)
              SELECT json_agg(json_build_object(
                'question_id', q.id,
                'question_body', q.body,
                'question_date', q.date_written,
                'asker_name', q.asker_name,
                'question_helpfulness', q.helpful,
                'reported', q.reported,
                'answers', (SELECT json_object_agg(
                  a.id, json_build_object(
                    'id', a.id,
                    'body', a.body,
                    'date', a.date_written,
                    'answerer_name', a.answerer_name,
                    'helpfulness', a.helpful,
                    'photos', (SELECT json_agg(json_build_object(
                      'id', ap.id,
                      'url', ap.url
                    )) FROM answers_photos AS ap WHERE ap.answer_id = a.id)
                  )
                ) FROM answers AS a WHERE a.question_id = q.id)
              )) FROM q
            )
          )
          `, [req.query.product_id, req.query.page, req.query.count]);
          results = results.rows[0].json_build_object;
          await redisClient.set(req.query.product_id, JSON.stringify(results));
        }
        res.send({
          fromCache: isCached,
          data: results
        });
      } catch (err) {
        console.log(err);
        res.sendStatus(404);
      }
    }
  };

  const addQuestion = (req, res) => {
    const body = req.query.body;
    const name = req.query.name;
    const email = req.query.email;
    const product_id = req.query.product_id;
    const timestamp = new Date().getTime();
    client.query('INSERT INTO questions (id, body, asker_name, asker_email, product_id, date_written, reported, helpful) VALUES ((SELECT MAX(id) FROM questions) + 1, $1, $2, $3, $4, $5, 0, 0)', [body, name, email, product_id, timestamp])
      .then(() => {
        res.sendStatus(201);
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(404);
      });
  };

  const markQuestionHelpful = (req, res) => {
    const question_id = req.params.question_id;
    client.query('UPDATE questions SET helpful = helpful + 1 WHERE id = $1', [question_id])
      .then(() => {
        res.sendStatus(204);
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(404);
      });
  };

  const reportQuestion = (req, res) => {
    const question_id = req.params.question_id;
    client.query('UPDATE questions SET reported = reported + 1 WHERE id = $1', [question_id])
      .then(() => {
        res.sendStatus(204);
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(404);
      });
  };

  return { getQuestions, addQuestion, markQuestionHelpful, reportQuestion };
};