const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  createItem,
  getItems,
  getItemById,
  getMyItems,
  markAsClaimed,
  deleteItem,
} = require("../controllers/itemController");

router.post("/", protect, upload.single("image"), createItem);
router.get("/", getItems);
router.get("/mine", protect, getMyItems);
router.get("/:id", getItemById);
router.put("/:id/claim", protect, markAsClaimed);
router.delete("/:id", protect, deleteItem);

module.exports = router;
