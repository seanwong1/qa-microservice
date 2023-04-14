const express = require("express");
const config = require("../config.js");

const app = express();

app.use(express.json());

app.listen(config.port, () => {
  console.log("Server listening on port ", config.port);
});
