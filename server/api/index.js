const serverless = require('serverless-http');
const app = require('../src/app');   // you already module.exports = app in src/app.js
module.exports = serverless(app);