const express = require("express");
const { getRelevantItems } = require("../controllers/search.controllers");

const router = express.Router();

router.get("/", getRelevantItems);

module.exports = router;
