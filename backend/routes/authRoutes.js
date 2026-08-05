const express = require("express");
const router = express.Router();
const { registerUser, loginUser, logoutUser, refreshToken, registerAdmin, loginAdmin } = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refresh", refreshToken);

router.post("/admin/register", registerAdmin);
router.post("/admin/login", loginAdmin);

module.exports = router;
