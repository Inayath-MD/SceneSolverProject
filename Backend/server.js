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
const fs = require('fs');

// Ensure required directories exist
fs.mkdirSync('uploads', { recursive: true });
fs.mkdirSync('public/media', { recursive: true });

// ----------- MIDDLEWARE -----------
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000'];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(express.static('public')); // Serve static files

// ----------- ROUTES -----------
app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);

const newsRoutes = require("./routes/news");
app.use("/api/news", newsRoutes);


// ----------- START SERVER FIRST (keeps process alive on Render) -----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ----------- DATABASE CONNECTION -----------
console.log("Starting MongoDB connection...");
console.log("MONGO_URI is defined:", !!process.env.MONGO_URI);
console.log("MONGO_URI starts with:", process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 20) + "..." : "undefined");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("Full error:", JSON.stringify(err, null, 2));
  });
