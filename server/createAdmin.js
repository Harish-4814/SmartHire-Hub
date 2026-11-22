
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Admin = require("./models/Admin");

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const hashedPassword = await bcrypt.hash("Teacher@123", 10);

    await Admin.findOneAndUpdate(
      { email: "teacher@placement.com" },
      {
        $set: {
          name: "Placement Admin",
          password: hashedPassword,
          role: "admin"
        }
      },
      { new: true }
    );

    console.log("Admin password reset successfully!");
    console.log("Email: teacher@placement.com");
    console.log("Password: Teacher@123");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

resetAdmin();
