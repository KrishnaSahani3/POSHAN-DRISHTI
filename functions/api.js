const serverless = require("serverless-http");
const app = require("../server");

// Netlify Function handler
module.exports.handler = serverless(app);
