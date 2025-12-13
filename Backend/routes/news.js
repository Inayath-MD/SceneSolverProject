const express = require("express");
const router = express.Router();
const axios = require("axios");

const GNEWS_API_KEY = process.env.NEWS_API_KEY;

// Crime topics (GNews supports OR logic, not long sentences)
const CRIME_QUERY = "crime OR murder OR police OR forensic OR violence OR kidnapping";

router.get("/crime", async (req, res) => {
  try {
    const response = await axios.get(
      `https://gnews.io/api/v4/search?q=${encodeURIComponent(CRIME_QUERY)}&lang=en&max=20&apikey=${GNEWS_API_KEY}`
    );

    return res.json({
      success: true,
      articles: response.data.articles || [],
    });
  } catch (err) {
    console.log("GNews Error:", err.response?.data || err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch crime news",
      error: err.message,
    });
  }
});

module.exports = router;
