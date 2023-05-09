const request = require('supertest');

const app = require('../server/app.js');
const client = require('../database/SQL/index.js').client;

describe('Test Server Routes', () => {
  beforeAll(async () => {
    await client.connect();
  });

  afterAll(async () => {
    await client.end();
  });

  test('GET /qa/questions', (done) => {
    request(app)
      .get('/qa/questions')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        return done();
      });
  });

  test('GET /qa/questions/:question_id/answers', (done) => {
    request(app)
      .get('/qa/questions/2/answers')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        return done();
      });
  });

  test('POST /qa/questions', (done) => {
    request(app)
      .post('/qa/questions')
      .query({
        body: 'hello, testing',
        name: 'francesca',
        email: 'francesca.irulan@gmail.com',
        timestamp: new Date().getTime(),
        product_id: 2
      })
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        return done();
      });
  });

  test('POST /qa/questions/:question_id/answers', (done) => {
    request(app)
      .post('/qa/questions/2/answers')
      .query({
        body: 'hello, testing',
        name: 'francesca',
        email: 'francesca.irulan@gmail.com',
        timestamp: new Date().getTime()
      })
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        return done();
      });
  });

});