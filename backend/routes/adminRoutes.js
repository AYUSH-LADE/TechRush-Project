const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  getAllItemsAdmin,
  flagItem,
  adminDeleteItem,
} = require("../controllers/adminController");

router.get("/items", protect, admin, getAllItemsAdmin);
router.put("/items/:id/flag", protect, admin, flagItem);
router.delete("/items/:id", protect, admin, adminDeleteItem);

module.exports = router;
