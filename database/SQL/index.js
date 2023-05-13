const { Pool, Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost', // use db if connecting with docker
  database: 'sdc',
  password: 'mysecretpassword',
  port: 5432,
  // allowExitOnIdle: true
});

module.exports = { client };