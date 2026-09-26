const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  switchPersona,
  getPersonas,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/switch-persona/:role", switchPersona);
router.get("/personas", getPersonas);

module.exports = router;
