const app = require('./app.js');

const config = require("../config.js");

const createServer = (port) => {
  try {
    app.listen(port, () => {
      console.log("Server listening on port", port);
    });
  } catch (err) {
    console.error(err);
    process.exit();
  }
};

createServer(config.port);