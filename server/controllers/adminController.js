
const Admin = require("../models/Admin");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const XLSX = require("xlsx");

// =========================
// ADMIN LOGIN
// =========================

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const admin = await Admin.findOne({
            email: email.toLowerCase().trim()
        });

        if (!admin) {
            return res.status(401).json({
                message: "Invalid admin email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            admin.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid admin email or password"
            });
        }

        const token = jwt.sign(
            {
                adminId: admin._id,
                role: "admin"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.json({
            message: "Admin login successful",
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });

    } catch (error) {
        console.error("Admin Login Error:", error);

        res.status(500).json({
            message: "Server error during admin login"
        });
    }
};


// =========================
// UPLOAD STUDENTS FROM EXCEL
// =========================

const uploadStudents = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                message: "Please upload an Excel file"
            });
        }

        // Read Excel file
        const workbook = XLSX.read(req.file.buffer, {
            type: "buffer"
        });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert Excel data into JSON
        const students = XLSX.utils.sheet_to_json(worksheet, {
            defval: ""
        });

        if (students.length === 0) {
            return res.status(400).json({
                message: "Excel file is empty"
            });
        }

        let created = 0;
        let skipped = 0;
        let errors = [];

        // Process each student
        for (const student of students) {

            const name = student.Name;
            const email = student.Email;

            // Correct Excel password column
            const password = student["Temporary Password"];

            // Validate required fields
            if (!name || !email || !password) {

                skipped++;

                errors.push({
                    name: name || "Unknown",
                    email: email || "",
                    reason: "Name, Email or Temporary Password missing"
                });

                continue;
            }

            const cleanEmail = email.toString().trim().toLowerCase();

            // Check duplicate students
            const existingStudent = await User.findOne({
                email: cleanEmail
            });

            if (existingStudent) {

                skipped++;

                errors.push({
                    name,
                    email: cleanEmail,
                    reason: "Student already exists"
                });

                continue;
            }

            // Hash temporary password
            const hashedPassword = await bcrypt.hash(
                password.toString(),
                10
            );

            // Save student in MongoDB
            await User.create({

                name: name.toString().trim(),

                email: cleanEmail,

                password: hashedPassword,

                course: "BCA AI & DS",

                year: 3,

                cgpa: 0,

                skills: [],

                activeBacklogs: 0,

                mustChangePassword: true,

                role: "student"

            });

            created++;
        }

        res.status(200).json({

            message: `${created} students uploaded successfully`,

            total: students.length,

            created,

            skipped,

            errors

        });

    } catch (error) {

        console.error("Student Upload Error:", error);

        res.status(500).json({

            message: "Server error while uploading students",

            error: error.message

        });
    }
};


// =========================
// GET ALL STUDENTS
// =========================

const getStudents = async (req, res) => {

    try {

        const students = await User.find(
            { role: "student" },
            { password: 0 }
        ).sort({ createdAt: -1 });

        res.status(200).json({

            message: "Students fetched successfully",

            count: students.length,

            students

        });

    } catch (error) {

        console.error("Get Students Error:", error);

        res.status(500).json({

            message: "Server error while fetching students"

        });
    }
};


// =========================
// EXPORT
// =========================

module.exports = {
    loginAdmin,
    uploadStudents,
    getStudents
};
