
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =========================
// REGISTER USER
// =========================

const registerUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            course,
            year,
            activeBacklogs
        } = req.body;

        if (!name || !email || !password || !year) {
            return res.status(400).json({
                message: "Please fill all required fields"
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: cleanEmail
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email: cleanEmail,
            password: hashedPassword,
            course: course || "BCA AI & DS",
            year,
            activeBacklogs: activeBacklogs || 0,
            role: "student",
            mustChangePassword: false
        });

        res.status(201).json({
            message: "Registration successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Registration Error:", error);

        res.status(500).json({
            message: "Server error during registration"
        });
    }
};


// =========================
// LOGIN USER
// =========================

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: cleanEmail
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        if (user.role !== "student") {
            return res.status(403).json({
                message: "Student account required"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                course: user.course,
                year: user.year,
                cgpa: user.cgpa,
                activeBacklogs: user.activeBacklogs,
                skills: user.skills,
                mustChangePassword: user.mustChangePassword
            }
        });

    } catch (error) {
        console.error("Login Error:", error);

        res.status(500).json({
            message: "Server error during login"
        });
    }
};


// =========================
// CHANGE PASSWORD
// =========================

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Please fill all password fields"
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                message: "New password must be at least 8 characters"
            });
        }

        const user = await User.findById(req.user.userId);

        if (!user || user.role !== "student") {
            return res.status(404).json({
                message: "Student account not found"
            });
        }

        const passwordMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!passwordMatch) {
            return res.status(400).json({
                message: "Current password is incorrect"
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.mustChangePassword = false;

        await user.save();

        res.json({
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error("Change Password Error:", error);

        res.status(500).json({
            message: "Server error while changing password"
        });
    }
};


// =========================
// EXPORT FUNCTIONS
// =========================

module.exports = {
    registerUser,
    loginUser,
    changePassword
};
