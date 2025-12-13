// scenesolver-backend/models/Analysis.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnalysisSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',             // ⭐ FIXED: Should match your User model
        required: true,
    },
    isDeleted: {
    type: Boolean,
    default: false
    },
    deletedAt: {
        type: Date,
        default: null
    },

    mediaUrl: {
        type: String,
        required: true,
    },

    mediaPublicId: {
        type: String,
        required: true,
    },

    mediaType: {
        type: String,
        required: true,
        enum: ['image', 'video'],  // Only allowed types
    },

    quickCaption: {
        type: String,
        default: 'No caption available.',
    },

    fullStory: {
        type: String,
        default: 'A detailed story could not be generated for this scene.',
    },

    // Scene classification keywords (CLIP categories)
    sceneKeywords: [{
        keyword: String,
        match: Number,
    }],

    // Objects detected by YOLO
    foundObjects: [{
        object: String,
        match: Number,
        box: [Number],
    }],

    // ⭐ NEW: Required for the audio player in the UI
    audioUrl: {
        type: String,
        default: '',  // If no audio, stays empty
    }

}, { timestamps: true });


module.exports = mongoose.model('Analysis', AnalysisSchema);
