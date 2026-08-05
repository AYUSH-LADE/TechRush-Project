const express = require("express");
const { createQRCode, getAllQRCodes, generateQRCodeImage } = require("../controllers/qr.controllers");

const router = express.Router();

router.post("/", createQRCode);
router.get("/", getAllQRCodes);
router.post("/generate", generateQRCodeImage);

module.exports = router;
