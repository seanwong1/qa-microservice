module.exports = (client, redisClient) => {
  const getAnswers = async (req, res) => {
    let results;
    let isCached = false;

    const question_id = req.params.question_id;
    if (!req.query.page) {
      req.query.page = 1;
    }
    if (!req.query.count) {
      req.query.count = 5;
    }
    try {
      const cacheResults = await redisClient.get(question_id);
      if (cacheResults) {
        isCached = true;
        results = JSON.parse(cacheResults);
      } else {
        results = await client.query(
          `(SELECT *, ARRAY(
            SELECT url
            FROM answers_photos ap
            WHERE a.id = ap.answer_id) AS photos
          FROM answers a
          WHERE question_id = $1)`, [question_id]);
        await redisClient.set(question_id, JSON.stringify(results));
      }
      res.send({
        fromCache: isCached,
        data: {
          question: question_id,
          page: req.query.page,
          count: req.query.count,
          results: results.rows
        }
      });
    } catch (err) {
      console.log(err);
      res.sendStatus(404);
    }
  };

  const addAnswer = (req, res) => {
    const question_id = req.params.question_id;
    const body = req.query.body;
    const name = req.query.name;
    const email = req.query.email;
    const photos = JSON.parse(req.query.photos);
    const timestamp = new Date().getTime();
    client.query('INSERT INTO answers (id, question_id, body, date_written, answerer_name, answerer_email, reported, helpful) VALUES ((SELECT MAX(id) FROM answers) + 1, $1, $2, $3, $4, $5, 0, 0)', [question_id, body, timestamp, name, email])
      .then(() => {
        client.query('SELECT MAX(id) FROM answers_photos')
          .then((result) => {
            const last_id = result.rows[0].max + 1;
            const photo_ids = Array.from({ length: photos.length }, (value, index) => last_id + index);
            client.query('SELECT MAX(id) FROM answers')
              .then((result) => {
                const answer_id = Array(photos.length).fill(result.rows[0].max);
                client.query('INSERT INTO answers_photos (id, answer_id, url) (SELECT * FROM UNNEST ($1::int[], $2::int[], $3::text[]))', [photo_ids, answer_id, photos])
                  .then(() => {
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
  };

  const markAnswerHelpful = (req, res) => {
    const answer_id = req.params.answer_id;
    client.query('UPDATE answers SET helpful = helpful + 1 WHERE id = $1', [answer_id])
      .then(() => {
        res.sendStatus(204);
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(404);
      });
  };

  const reportAnswer = (req, res) => {
    const answer_id = req.params.answer_id;
    client.query('UPDATE answers SET reported = reported + 1 WHERE id = $1', [answer_id])
      .then(() => {
        res.sendStatus(204);
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(404);
      });
  };

  return { getAnswers, addAnswer, markAnswerHelpful, reportAnswer };
};