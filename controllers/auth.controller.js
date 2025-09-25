const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user.model");

class AuthController {
  static signToken(user) {
    return jwt.sign(
      { sub: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
  }

  static async registerCitizen(req, res) {
    try {
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
        return res
          .status(400)
          .json({ success: false, message: "All fields are required" });
      }
      if (password.length < 6) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Password must be at least 6 characters",
          });
      }
      const existing = await User.findOne({ email });
      if (existing) {
        return res
          .status(400)
          .json({ success: false, message: "Email already in use" });
      }
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({
        email,
        password: hashed,
        name,
        role: "citizen",
      });
      const token = AuthController.signToken(user);
      return res.json({
        success: true,
        message: "Registration successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      return res
        .status(500)
        .json({ success: false, message: "Server error", error: err.message });
    }
  }

  static async loginCitizen(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ success: false, message: "Email and password required" });
      }
      const user = await User.findOne({ email, role: "citizen" });
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }
      const token = AuthController.signToken(user);
      return res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      return res
        .status(500)
        .json({ success: false, message: "Server error", error: err.message });
    }
  }

  static async loginAdmin(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ success: false, message: "Email and password required" });
      }
      const admin = await User.findOne({ email, role: "admin" });
      if (!admin) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }
      const ok = await bcrypt.compare(password, admin.password);
      if (!ok) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }
      const token = AuthController.signToken(admin);
      return res.json({
        success: true,
        message: "Admin login successful",
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      });
    } catch (err) {
      return res
        .status(500)
        .json({ success: false, message: "Server error", error: err.message });
    }
  }
}

module.exports = AuthController;
