const app = require("./index");

module.exports = (req, res) => {
  req.url = "/next";
  return app(req, res);
};
