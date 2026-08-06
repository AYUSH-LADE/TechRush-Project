const express = require('express');
const router = express.Router();
const {
  createItem,
  getItems,
  getItemById,
  getItemImage,
  getMyItems,
  markAsClaimed,
  deleteItem
} = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/mine', protect, getMyItems);
router.get('/', getItems);
router.get('/:id/image', getItemImage);   // must come before '/:id' so it isn't swallowed
router.get('/:id', getItemById);
router.post('/', protect, upload.single('image'), createItem);
router.put('/:id/claim', protect, markAsClaimed);
router.delete('/:id', protect, deleteItem);

module.exports = router;
