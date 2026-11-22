
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const User = require("../models/User");

const {
    loginAdmin,
    uploadStudents,
    getStudents
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Excel upload configuration
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

// ===============================
// ADMIN AUTHORIZATION
// ===============================

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
// ADMIN LOGIN
// ===============================

router.post("/login", loginAdmin);

// ===============================
// UPLOAD STUDENTS FROM EXCEL
// ===============================

router.post(
    "/upload-students",
    upload.single("file"),
    uploadStudents
);

// ===============================
// GET ALL STUDENTS
// ===============================

router.get("/students", getStudents);

// ===============================
// GET ALL STUDENT RESUMES
// ===============================

router.get(
    "/resumes",
    protect,
    adminOnly,
    async (req, res) => {
        try {
            const students = await User.find({
                role: "student",
                resumePath: {
                    $exists: true,
                    $nin: ["", null]
                }
            }).select(
                "name email course year cgpa resumeFileName resumePath resumeUploadedAt"
            );

            const resumes = students.map(student => ({
                id: student._id,
                name: student.name,
                email: student.email,
                course: student.course,
                year: student.year,
                cgpa: student.cgpa,
                resumeFileName: student.resumeFileName,
                uploadedAt: student.resumeUploadedAt,
                viewUrl:
                    `/api/admin/resumes/${encodeURIComponent(student.resumePath)}`
            }));

            res.status(200).json({
                count: resumes.length,
                resumes
            });

        } catch (error) {
            console.error("Get Resumes Error:", error);

            res.status(500).json({
                message: "Failed to fetch student resumes"
            });
        }
    }
);

// ===============================
// VIEW / DOWNLOAD STUDENT RESUME
// ===============================

router.get(
    "/resumes/:filename",
    protect,
    adminOnly,
    async (req, res) => {
        try {
            const filename = path.basename(req.params.filename);

            const student = await User.findOne({
                role: "student",
                resumePath: filename
            });

            if (!student) {
                return res.status(404).json({
                    message: "Resume not found"
                });
            }

            const filePath = path.resolve(
                __dirname,
                "../uploads",
                filename
            );

            if (!fs.existsSync(filePath)) {
                return res.status(404).json({
                    message: "Resume file does not exist on server"
                });
            }

            res.sendFile(filePath);

        } catch (error) {
            console.error("View Resume Error:", error);

            res.status(500).json({
                message: "Failed to open resume"
            });
        }
    }
);

module.exports = router;
