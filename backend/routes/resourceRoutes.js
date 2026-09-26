const express = require("express");
const router = express.Router();
const {
  getResources,
  getResourceById,
  createResource,
} = require("../controllers/resourceController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getResources);
router.get("/:id", protect, getResourceById);
router.post("/", protect, createResource);

module.exports = router;
