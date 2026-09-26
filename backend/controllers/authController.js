const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Company = require("../models/Company");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "enigma_jwt_secret_key_change_in_production", {
    expiresIn: "30d",
  });
};

// @desc    Register a new user & company
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, companyName, industry, city, state } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists with this email" });
    }

    let company = await Company.findOne({ name: companyName });
    if (!company) {
      company = await Company.create({
        name: companyName || `${name} Corp`,
        industry: industry || "Steel & Metallurgy",
        location: {
          city: city || "Mumbai",
          state: state || "Maharashtra",
        },
        verificationStatus: "Verified",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "buyer",
      company: company._id,
    });

    const populatedUser = await User.findById(user._id).populate("company");
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: populatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password").populate("company");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        jobTitle: user.jobTitle,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    if (!req.user) {
      // Return default demo user if available
      const defaultUser = await User.findOne().populate("company");
      if (defaultUser) {
        return res.json({ success: true, user: defaultUser });
      }
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    const user = await User.findById(req.user._id).populate("company");
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Quick demo persona switcher (Buyer, Seller, Admin)
// @route   GET /api/auth/switch-persona/:role
const switchPersona = async (req, res) => {
  try {
    const { role } = req.params;
    let targetUser = await User.findOne({ role }).populate("company");

    if (!targetUser) {
      targetUser = await User.findOne().populate("company");
    }

    const token = generateToken(targetUser._id);
    res.json({
      success: true,
      token,
      user: targetUser,
      message: `Switched active role to ${targetUser.role.toUpperCase()} (${targetUser.company?.name})`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all available demo personas for easy testing
// @route   GET /api/auth/personas
const getPersonas = async (req, res) => {
  try {
    const users = await User.find().populate("company");
    res.json({ success: true, personas: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  switchPersona,
  getPersonas,
};
