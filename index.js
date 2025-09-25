require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./configs/mongoose");

const authRoutes = require("./routers/auth.router");
const complaintRoutes = require("./routers/complaint.router");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(500)
    .json({ success: false, message: "Server error", error: err.message });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
