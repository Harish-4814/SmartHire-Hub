
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Admin = require("./models/Admin");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await Admin.findOne({
      email: "teacher@placement.com"
    });

    if (existingAdmin) {
      console.log("Admin already exists.");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("Teacher@123", 10);

    await Admin.create({
      name: "Placement Admin",
      email: "teacher@placement.com",
      password: hashedPassword,
      role: "admin"
    });

    console.log("Admin created successfully.");
    console.log("Email: teacher@placement.com");
    console.log("Password: Teacher@123");

    process.exit();

  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();