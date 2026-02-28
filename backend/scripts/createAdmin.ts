/**
 * Create Default Admin User Script
 * Run this to create an admin account for accessing the admin panel
 */

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User";
import dotenv from "dotenv";

dotenv.config();

const createAdmin = async () => {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/gloweazy";
  
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@gloweazy.com" });
    if (existingAdmin) {
      console.log("Admin user already exists!");
      console.log("Email: admin@gloweazy.com");
      console.log("Password: admin123");
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = await User.create({
      name: "Super Admin",
      email: "admin@gloweazy.com",
      password: hashedPassword,
      role: "admin",
      phone: "+233 20 000 0000",
      isActive: true,
    });

    console.log("✅ Admin user created successfully!");
    console.log("");
    console.log("Login Credentials:");
    console.log("Email: admin@gloweazy.com");
    console.log("Password: admin123");
    console.log("");
    console.log("Access the admin panel at:");
    console.log("https://gloweazy-frontend.vercel.app/admin");
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
