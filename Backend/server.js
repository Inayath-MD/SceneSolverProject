// scenesolver-backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Route files
const authRoutes = require('./routes/auth');
const analysisRoutes = require('./routes/analysis');

dotenv.config();
const app = express();

// ----------- MIDDLEWARE -----------
app.use(cors({ origin: 'http://localhost:3000' }));  // Allow React frontend
app.use(express.json());
app.use(express.static('public')); // Serve static files

// ----------- ROUTES -----------
app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);

const newsRoutes = require("./routes/news");
app.use("/api/news", newsRoutes);


// ----------- DATABASE CONNECTION -----------
mongoose
  .connect(process.env.MONGO_URI)   // No deprecated options
  .then(() => {
    console.log("✅ MongoDB connected");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch(err =>
    console.error("❌ MongoDB connection error:", err)
  );
