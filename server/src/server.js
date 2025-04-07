// server.js
require('dotenv').config();  // In case we need environment variables
const app = require('./app');

// Use PORT from environment variables or default to 4000
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
