const Item = require("../models/Item");

exports.getAllItemsAdmin = async (req, res) => {
  try {
    const items = await Item.find({})
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

exports.flagItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    item.flagged = !item.flagged;
    await item.save();
    res.status(200).json({ message: `Item ${item.flagged ? "flagged" : "unflagged"} successfully`, item });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.adminDeleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    await item.deleteOne();
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

