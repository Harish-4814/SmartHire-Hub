
const mongoose = require("mongoose");

const placementSchema = new mongoose.Schema(
    {
        companyName: {
            type: String,
            required: true,
            trim: true
        },

        jobRole: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        eligibilityCGPA: {
            type: Number,
            default: 0
        },

        eligibleCourse: {
            type: String,
            default: "BCA AI & DS"
        },

        eligibleYear: {
            type: Number,
            default: 0
        },

        requiredSkills: {
            type: [String],
            default: []
        },

        salary: {
            type: String,
            default: "Not specified"
        },

        deadline: {
            type: Date,
            required: true
        },

        applicationLink: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: ["draft", "published", "closed"],
            default: "draft"
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Placement", placementSchema);
