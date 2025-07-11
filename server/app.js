const express = require("express");
const redis = require("redis");
const path = require("path");

const config = require('../config.js');
const client = require('../database/SQL').client;
client.connect();

const app = express();

let redisClient;

(async () => {
  redisClient = redis.createClient({
    socket: {
        host: config.redisHost,
        port: config.redisPort,
    },
    password: config.redisPassword,
});

  redisClient.on("error", (error) => console.error(`Error : ${error}`));

  await redisClient.connect();
  app.use('/qa', require("../routes")(client, redisClient));
})();

app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));

module.exports = app;