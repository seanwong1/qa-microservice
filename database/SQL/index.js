const { Pool, Client } = require('pg');

const client = new Client({
  user: config.dbUser,
  host: config.dbHost, // use db if connecting with docker // use localhost if testing locally
  database: config.dbName,
  password: config.dbPassword,
  port: config.dbPort,
  // allowExitOnIdle: true
});

module.exports = { client };