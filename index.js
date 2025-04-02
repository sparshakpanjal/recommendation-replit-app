
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/myapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const port = 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
