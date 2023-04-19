const express = require("express");

const client = require('../database/SQL').client;
const config = require("../config.js");

const app = express();

app.use(express.json());

client.connect();
client.query('SELECT * FROM answers LIMIT 10', (err, res) => {
  if (err) {
    console.log('err', err);
  } else {
    console.log('res', res);
  }
  client.end();
});
app.listen(config.port, () => {
  console.log("Server listening on port", config.port);
});
