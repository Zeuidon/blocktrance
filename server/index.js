const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Import routes
const transactionsRoutes = require('./routes/transactions');

// Use routes
app.use('/api/transactions', transactionsRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));