const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

// Ignore the error if any on the following line
// script will work as expected
const User = require("../models/User.model");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const adminData = {
      email: "admin@gmail.com",
      password: "admin123",
      name: "System Administrator",
      role: "admin",
    };

    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log("Admin user already exists!");
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    const admin = new User({
      ...adminData,
      password: hashedPassword,
    });

    await admin.save();
    console.log("Admin created successfully!");
    console.log(`Email: ${adminData.email}`);
    console.log(`Password: ${adminData.password}`);
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed");
    process.exit(0);
  }
};

createAdmin();
