const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.get('/api/auth/test', (req, res) => res.json({ msg: "Backend is working!" }));
app.post('/api/analysis', (req, res) => {
    // Mock response
    res.json({
        quickCaption: "Debug Mode Caption",
        sceneKeywords: [{ keyword: "debug", match: 100 }],
        foundObjects: [],
        fullStory: "This is a debug response because MongoDB is likely down.",
        audioUrl: ""
    });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 DEBUG Server running on port ${PORT}`));
