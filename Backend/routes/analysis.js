const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const auth = require('../middleware/auth');
const Analysis = require('../models/Analysis');
const path = require('path');
const mongoose = require('mongoose');  // ⭐ Important
const { v4: uuidv4 } = require('uuid');


// -----------------------------
// MULTER CONFIG
// -----------------------------
const upload = multer({ dest: 'uploads/' });


// -----------------------------
// AI SERVICE CALL
// -----------------------------
async function runAllAiModels(filePath, originalFilename, fileMimetype) {
    console.log(`➡️ Sending '${originalFilename}' to Flask...`);

    const form = new FormData();
    form.append('media', fs.createReadStream(filePath), {
        filename: originalFilename,
        contentType: fileMimetype,
    });

    try {
        const response = await axios.post(process.env.AI_SERVICE_URL, form, {
            headers: form.getHeaders(),
            timeout: 60000 // 60s timeout for model loading
        });
        console.log("✅ Flask AI responded.");
        return response.data;

    } catch (error) {
        console.error("❌ Error calling Flask:");

        let errorMessage = 'AI analysis failed.';

        if (error.code === 'ECONNREFUSED') {
            console.error("Connection Refused - AI Service likely down.");
            errorMessage = 'AI Service is not running or not ready on port 5001. Please wait for models to load.';
        } else if (error.code === 'ECONNABORTED') {
            console.error("Timeout - AI Service took too long.");
            errorMessage = 'AI Service timed out. It might be loading models, please try again.';
        } else if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
            errorMessage = `AI Service Error: ${error.response.status}`;
        } else {
            console.error("Message:", error.message);
            errorMessage = error.message;
        }

        return { error: errorMessage };
    }
}


// -----------------------------
// GET — USER HISTORY (non-deleted)
// -----------------------------
router.get('/history', auth, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);

        const userHistory = await Analysis.find({
            user: userId,
            isDeleted: false
        }).sort({ createdAt: -1 });

        res.json(userHistory);

    } catch (err) {
        console.error("Error fetching history:", err.message);
        res.status(500).send("Server Error");
    }
});


// -----------------------------
// GET — TRASH BIN (deleted items)
// -----------------------------
router.get('/trash/all', auth, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);

        const trash = await Analysis.find({
            user: userId,
            isDeleted: true
        }).sort({ deletedAt: -1 });

        res.json(trash);

    } catch (err) {
        console.error("Error fetching trash:", err.message);
        res.status(500).send("Server Error");
    }
});


// -----------------------------
// POST — ANALYZE UPLOADED MEDIA
// -----------------------------
router.post('/', [auth, upload.single('media')], async (req, res) => {

    if (!req.file) {
        return res.status(400).json({ msg: 'Please upload a media file.' });
    }

    const tempPath = req.file.path;
    let permanentPath;

    try {
        const mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';

        // STEP 1: Analyze with Flask
        const aiResults = await runAllAiModels(
            tempPath,
            req.file.originalname,
            req.file.mimetype
        );

        if (aiResults.error) throw new Error(aiResults.error);

        // STEP 2: Move to permanent location
        const fileExtension = path.extname(req.file.originalname);
        const uniqueFilename = `${uuidv4()}${fileExtension}`;

        permanentPath = path.join(__dirname, '..', 'public', 'media', uniqueFilename);
        fs.renameSync(tempPath, permanentPath);

        console.log(`📁 File moved to permanent location: ${permanentPath}`);

        const fileUrl = `http://localhost:5000/media/${uniqueFilename}`;

        // STEP 3: Save to DB
        const newAnalysis = new Analysis({
            user: req.user.id,
            mediaUrl: fileUrl,
            mediaPublicId: uniqueFilename,
            mediaType: mediaType,
            quickCaption: aiResults.quickCaption,
            fullStory: aiResults.fullStory,
            sceneKeywords: aiResults.sceneKeywords,
            foundObjects: aiResults.foundObjects,
            audioUrl: aiResults.audioUrl
        });

        await newAnalysis.save();
        console.log("💾 Saved new analysis:", newAnalysis._id);

        // STEP 4: Send response to frontend with audioUrl
        return res.status(201).json({
            ...newAnalysis._doc,
            audioUrl: aiResults.audioUrl
        });

    } catch (err) {
        console.error("Error during upload:", err.message);

        if (permanentPath && fs.existsSync(permanentPath)) {
            fs.unlinkSync(permanentPath);
        }
        if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
        }

        return res.status(500).json({ msg: err.message });
    }
});


// =====================================================================================
// ⭐ DELETE FEATURES (ALL OPTIONS A + B + C + D)
// =====================================================================================


// -----------------------------
// DELETE ONE — Soft delete
// -----------------------------
router.delete('/:id', auth, async (req, res) => {
    try {
        const item = await Analysis.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!item)
            return res.status(404).json({ msg: "Item not found" });

        item.isDeleted = true;
        item.deletedAt = new Date();
        await item.save();

        return res.json({ msg: "Moved to trash", id: item._id });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});


// -----------------------------
// DELETE ALL — Soft delete every item
// -----------------------------
router.delete('/delete-all/all', auth, async (req, res) => {
    try {
        await Analysis.updateMany(
            { user: req.user.id },
            { isDeleted: true, deletedAt: new Date() }
        );

        res.json({ msg: "All items moved to trash" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});


// -----------------------------
// RESTORE ONE — Undo + Trash restore
// -----------------------------
router.put('/restore/:id', auth, async (req, res) => {
    try {
        const item = await Analysis.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!item)
            return res.status(404).json({ msg: "Item not found" });

        item.isDeleted = false;
        item.deletedAt = null;
        await item.save();

        res.json({ msg: "Restored", id: item._id });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});


// -----------------------------
// PERMANENT DELETE — Removes file + DB
// -----------------------------
router.delete('/permanent/:id', auth, async (req, res) => {
    try {
        const item = await Analysis.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!item)
            return res.status(404).json({ msg: "Item not found" });

        // Delete file
        const filePath = path.join(__dirname, '..', 'public', 'media', item.mediaPublicId);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await item.deleteOne();

        res.json({ msg: "Permanently deleted" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});


module.exports = router;
