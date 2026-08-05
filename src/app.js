const express = require("express");
const path = require("path");
const authRoutes = require("./routes/auth.route");
const qrRoutes = require("./routes/qr.route");
const searchRoutes = require("./routes/search.route");
const cookieParser = require("cookie-parser");
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api/auth", authRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/search", searchRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/search.html"));
});

module.exports = app;