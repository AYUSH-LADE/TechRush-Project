const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/items", require("./routes/itemRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.get("/", (req, res) => res.send("Lost & Found API running"));
app.get("/health", (req, res) => {
  res.json({ status: "ok", database: "unavailable" });
});

const PORT = Number(process.env.PORT) || 3000;

const startServer = (port = PORT, attempt = 1) => {
  const server = app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      if (attempt < 10) {
        console.error(`Port ${port} is already in use. Trying ${port + 1}...`);
        server.close(() => startServer(port + 1, attempt + 1));
      } else {
        console.error("No available port found for the server.");
        process.exit(1);
      }
    } else {
      console.error("Server startup error:", error);
      process.exit(1);
    }
  });
};

startServer();
