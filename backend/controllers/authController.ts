import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

// Generate JWT
const generateToken = (id: string, name: string, email: string, role: string) => {
  return jwt.sign({ id, name, email, role }, process.env.JWT_SECRET!, { expiresIn: "30d" });
};

// ✅ Signup
export const signup = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  
  // Generate name from email if not provided
  const userName = name || email.split('@')[0];

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: userName,
      email,
      password: hashedPassword,
      role: role || "client",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id.toString(), user.name, user.email, user.role),
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Signup failed" });
  }
};

// ✅ Login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id.toString(), user.name, user.email, user.role),
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

// ✅ Forgot Password (placeholder)
export const forgotPassword = async (req: Request, res: Response) => {
  res.json({ message: "Forgot password route hit" });
};

// ✅ Reset Password (placeholder)
export const resetPassword = async (req: Request, res: Response) => {
  res.json({ message: "Reset password route hit" });
};

// ✅ Update Profile
export const updateProfile = async (req: Request, res: Response) => {
  const { id, name, phone, businessName, bio } = req.body;
  
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Update fields if provided
    if (name) user.name = name;
    // Note: phone, businessName, bio would need to be added to User schema
    // For now, just update name
    
    await user.save();
    
    res.json({ 
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Profile update failed" });
  }
};
