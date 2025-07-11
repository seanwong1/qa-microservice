require("dotenv").config();

module.exports = {
  port: process.env.PORT,
  dbUser: process.env.DB_USER,
  dbHost: process.env.DB_HOST,
  dbPassword: process.env.DB_PASSWORD,
  dbPort: process.env.DB_PORT,
  dbName: process.env.DB_NAME,
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
  redisPassword: process.env.REDIS_PASSWORD,
};
