const fs = require("fs");
const path = require("path");
const QRCode = require("../models/qr.model");
const QRCodeLib = require("qrcode");

async function createQRCode(req, res) {
  try {
    const { title, content, description } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required",
      });
    }

    const qrCode = await QRCode.create({
      title,
      content,
      description,
    });

    return res.status(201).json({
      message: "QR code information stored successfully",
      data: qrCode,
    });
  } catch (error) {
    console.error("Error creating QR code entry:", error);
    return res.status(500).json({
      message: "Failed to store QR code information",
      error: error.message,
    });
  }
}

async function getAllQRCodes(req, res) {
  try {
    const qrCodes = await QRCode.find().sort({ createdAt: -1 });

    return res.status(200).json({
      message: "QR codes fetched successfully",
      data: qrCodes,
    });
  } catch (error) {
    console.error("Error fetching QR codes:", error);
    return res.status(500).json({
      message: "Failed to fetch QR codes",
      error: error.message,
    });
  }
}

async function generateQRCodeImage(req, res) {
  try {
    const { text, title, description } = req.body;

    if (!text) {
      return res.status(400).json({
        message: "Text is required to generate a QR image",
      });
    }

    const buffer = await QRCodeLib.toBuffer(text, {
      type: "png",
      margin: 1,
      scale: 6,
    });

    const fileName = `qr-${Date.now()}.png`;
    const filePath = path.join(__dirname, "../../uploads", fileName);
    fs.writeFileSync(filePath, buffer);

    if (title || description) {
      await QRCode.create({
        title: title || "Generated QR",
        content: text,
        description: description || "",
      });
    }

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    return res.status(200).send(buffer);
  } catch (error) {
    console.error("Error generating QR image:", error);
    return res.status(500).json({
      message: "Failed to generate QR image",
      error: error.message,
    });
  }
}

module.exports = {
  createQRCode,
  getAllQRCodes,
  generateQRCodeImage,
};
