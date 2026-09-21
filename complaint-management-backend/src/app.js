const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const systemRoutes = require("./routes/systemRoutes");
const { notFound, errorHandler } = require("./middleware/common");
const { memory } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api", systemRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = { app, memory };
