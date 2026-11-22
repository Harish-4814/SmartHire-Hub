
const express = require("express");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Get logged-in student's profile
router.get("/", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "Profile fetched successfully",
            user
        });

    } catch (error) {
        console.error("Profile Error:", error);
        res.status(500).json({
            message: "Server error while fetching profile"
        });
    }
});

// Update student's editable profile details
router.put("/", protect, async (req, res) => {
    try {
        const { phone, linkedin, github, skills } = req.body;

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (phone !== undefined) user.phone = phone;
        if (linkedin !== undefined) user.linkedin = linkedin;
        if (github !== undefined) user.github = github;

        if (skills !== undefined) {
            user.skills = Array.isArray(skills)
                ? skills
                : skills.split(",").map(skill => skill.trim()).filter(Boolean);
        }

        await user.save();

        const updatedUser = await User.findById(user._id).select("-password");

        res.json({
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({
            message: "Server error while updating profile"
        });
    }
});

module.exports = router;
