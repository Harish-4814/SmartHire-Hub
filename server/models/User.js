
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        course: {
            type: String,
            default: "BCA AI & DS"
        },

        year: {
            type: Number,
            required: true
        },

        cgpa: {
            type: Number,
            default: 0
        },

        skills: {
            type: [String],
            default: []
        },

        activeBacklogs: {
            type: Number,
            default: 0
        },

        phone: {
            type: String,
            default: ""
        },

        linkedin: {
            type: String,
            default: ""
        },

        github: {
            type: String,
            default: ""
        },

        // Uploaded resume information
        resumeFileName: {
            type: String,
            default: ""
        },

        resumePath: {
            type: String,
            default: ""
        },

        resumeUploadedAt: {
            type: Date,
            default: null
        },

        mustChangePassword: {
            type: Boolean,
            default: true
        },

        role: {
            type: String,
            enum: ["student", "admin"],
            default: "student"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);
