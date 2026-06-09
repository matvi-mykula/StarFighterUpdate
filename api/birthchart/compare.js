const app = require("../index");

module.exports = (req, res) => {
  req.url = "/birthchart/compare";
  return app(req, res);
};
