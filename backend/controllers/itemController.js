const Item = require('../models/Item');

// @route POST /api/items — token required
// multipart/form-data: title, description, category, location, type, image (file, optional)
const createItem = async (req, res) => {
  try {
    const { title, description, category, type, location } = req.body;

    if (!title || !description || !category || !type || !location) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const itemData = {
      title,
      description,
      category,
      type,
      location,
      reportedBy: req.user._id
    };

    // If an image was uploaded, it arrives as a Buffer via multer memoryStorage
    if (req.file) {
      itemData.imageData = req.file.buffer;
      itemData.imageMimeType = req.file.mimetype;
    }

    const item = await Item.create(itemData);

    // Don't send the raw binary back in the create response — just confirm
    // whether an image exists, the frontend can fetch it via the image route
    const itemObj = item.toObject();
    delete itemObj.imageData;
    itemObj.hasImage = !!item.imageData;

    res.status(201).json(itemObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/items?category=&location=&type=&keyword=  — public
// Excludes imageData on purpose so list/search responses stay fast and light.
const getItems = async (req, res) => {
  try {
    const { type, category, location, keyword, status } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (keyword) filter.title = { $regex: keyword, $options: 'i' };

    const items = await Item.find(filter)
      .select('-imageData') // exclude the heavy binary field from list results
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });

    // Add a simple hasImage flag so the frontend knows whether to render <img>
    const withFlag = items.map((item) => {
      const obj = item.toObject();
      obj.hasImage = !!item.imageMimeType;
      return obj;
    });

    res.status(200).json(withFlag);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/items/:id — public
// Also excludes imageData — full item details, image fetched separately by <img> tag.
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .select('-imageData')
      .populate('reportedBy', 'name email');

    if (!item) return res.status(404).json({ message: 'Item not found' });

    const obj = item.toObject();
    obj.hasImage = !!item.imageMimeType;

    res.status(200).json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/items/:id/image — public
// Serves the raw image bytes directly, meant to be used as an <img src="..."> target.
const getItemImage = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).select('imageData imageMimeType');

    if (!item || !item.imageData) {
      return res.status(404).json({ message: 'No image found for this item' });
    }

    res.set('Content-Type', item.imageMimeType);
    res.send(item.imageData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/items/mine — token required
const getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ reportedBy: req.user._id })
      .select('-imageData')
      .sort({ createdAt: -1 });

    const withFlag = items.map((item) => {
      const obj = item.toObject();
      obj.hasImage = !!item.imageMimeType;
      return obj;
    });

    res.status(200).json(withFlag);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/items/:id/claim — token required, owner only
const markAsClaimed = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    item.status = 'claimed';
    await item.save();

    const obj = item.toObject();
    delete obj.imageData;
    obj.hasImage = !!item.imageMimeType;

    res.status(200).json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route DELETE /api/items/:id — token required, owner only
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await item.deleteOne();
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  getItemImage,
  getMyItems,
  markAsClaimed,
  deleteItem
};
