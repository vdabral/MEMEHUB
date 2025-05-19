const User = require("../models/User");
const { generateToken } = require("../utils/jwt");

// Register a new user
const register = async (req, res) => {
  console.log("➡️ /register called");
  const { username, email, password } = req.body;
  console.log("Register endpoint hit", { username, email });

  try {
    console.time("User creation");
    const newUser = new User({ username, email, password });
    await newUser.save();
    console.timeEnd("User creation");

    // Generate JWT token for the new user
    const token = generateToken(newUser._id);

    // Return user object and token for frontend compatibility
    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
        bio: newUser.bio,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in register endpoint (full error):", error);
    res.status(500).json({
      message: "Error registering user",
      error: error.message,
      errorName: error.name,
      errorCode: error.code,
      errorKeyValue: error.keyValue,
      errorStack: error.stack,
      errorErrors: error.errors,
    });
  }
};

// Login a user
const login = async (req, res) => {
  // Defensive: handle missing or invalid body
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({ message: "Missing request body" });
  }
  const { identifier, password } = req.body; // identifier = username or email
  if (!identifier || !password) {
    return res
      .status(400)
      .json({ message: "Identifier and password are required" });
  }

  try {
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    // Return user object and token for frontend compatibility
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// Get user profile (protected route)
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res
      .status(500)
      .json({ message: "Error fetching profile", error: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
};
