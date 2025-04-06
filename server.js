require('dotenv').config();
const express = require('express');
const app = express();
const heathRoutes = require('./routes/healthRoutes')
// const users = require('./users');

app.use(express.json());

// app.use('/api', users);

app.use("", heathRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
