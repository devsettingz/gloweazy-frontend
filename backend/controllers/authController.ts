import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose, { Document, Schema } from "mongoose";

// User interface
interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "client" | "stylist" | "admin";
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["client", "stylist", "admin"], default: "client" },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);

// Generate JWT
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: "30d" });
};

// ✅ Signup
export const signup = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "client",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id.toString()),
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
      token: generateToken(user._id.toString()),
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
