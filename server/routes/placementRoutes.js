
const express = require("express");
const mongoose = require("mongoose");

const Placement = require("../models/Placement");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Admin permission check
function adminOnly(req, res, next) {
    if (
        !req.user ||
        req.user.role !== "admin" ||
        !req.user.adminId
    ) {
        return res.status(403).json({
            message: "Admin access required"
        });
    }

    next();
}

// ===============================
// GET PUBLISHED PLACEMENTS (STUDENT)
// ===============================

router.get("/published", protect, async (req, res) => {
    try {
        const placements = await Placement.find({
            status: "published",
            deadline: { $gte: new Date() }
        }).sort({ createdAt: -1 });

        res.json({
            count: placements.length,
            placements
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch placements"
        });
    }
});

// ===============================
// GET ALL PLACEMENTS (ADMIN)
// ===============================

router.get("/admin/all", protect, adminOnly, async (req, res) => {
    try {
        const placements = await Placement.find()
            .sort({ createdAt: -1 });

        res.json({
            count: placements.length,
            placements
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch placements"
        });
    }
});

// ===============================
// ADD PLACEMENT (ADMIN)
// ===============================

router.post("/", protect, adminOnly, async (req, res) => {
    try {
        const {
            companyName,
            jobRole,
            description,
            eligibilityCGPA,
            eligibleCourse,
            eligibleYear,
            requiredSkills,
            salary,
            deadline,
            applicationLink,
            status
        } = req.body;

        if (!companyName || !jobRole || !deadline) {
            return res.status(400).json({
                message: "Company name, job role and deadline are required"
            });
        }

        const placement = await Placement.create({
            companyName,
            jobRole,
            description,
            eligibilityCGPA,
            eligibleCourse,
            eligibleYear,
            requiredSkills: Array.isArray(requiredSkills)
                ? requiredSkills
                : (requiredSkills || "")
                    .split(",")
                    .map(skill => skill.trim())
                    .filter(Boolean),
            salary,
            deadline,
            applicationLink,
            status: status || "draft",
            createdBy: new mongoose.Types.ObjectId(req.user.adminId)
        });

        res.status(201).json({
            message: "Placement created successfully",
            placement
        });

    } catch (error) {
        console.error("Add Placement Error:", error);

        res.status(500).json({
            message: "Failed to create placement"
        });
    }
});

// ===============================
// UPDATE PLACEMENT (ADMIN)
// ===============================

router.put("/:id", protect, adminOnly, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid placement ID"
            });
        }

        const allowedFields = [
            "companyName",
            "jobRole",
            "description",
            "eligibilityCGPA",
            "eligibleCourse",
            "eligibleYear",
            "requiredSkills",
            "salary",
            "deadline",
            "applicationLink",
            "status"
        ];

        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (typeof updates.requiredSkills === "string") {
            updates.requiredSkills = updates.requiredSkills
                .split(",")
                .map(skill => skill.trim())
                .filter(Boolean);
        }

        const placement = await Placement.findByIdAndUpdate(
            req.params.id,
            updates,
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if (!placement) {
            return res.status(404).json({
                message: "Placement not found"
            });
        }

        res.json({
            message: "Placement updated successfully",
            placement
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update placement"
        });
    }
});

// ===============================
// DELETE PLACEMENT (ADMIN)
// ===============================

router.delete("/:id", protect, adminOnly, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid placement ID"
            });
        }

        const placement = await Placement.findByIdAndDelete(
            req.params.id
        );

        if (!placement) {
            return res.status(404).json({
                message: "Placement not found"
            });
        }

        res.json({
            message: "Placement deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete placement"
        });
    }
});

module.exports = router;
