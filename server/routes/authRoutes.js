
const express = require("express");
const {
    loginUser,
    changePassword
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Student Login
router.post("/login", loginUser);

// Student Change Password
router.put("/change-password", protect, changePassword);

module.exports = router;
