require("dotenv").config();

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const masterRoutes = require("./routes/master");
const adminRoutes = require("./routes/admin/user");
const hdActionAdminRoutes = require("./routes/admin/HDActions");
const hdActionRoutes = require("./routes/HDActions");
const chatRoutes = require("./routes/chat");
const sendEmailRouter = require('./routes/admin/sendEmail');
const botHistoryRouter = require('./routes/admin/botHistory');
const mongoose = require("mongoose");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const sendEmail = require("./utils/sendEmail");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/master/users", masterRoutes);
app.use("/api/admin/users", adminRoutes);
app.use("/api/admin/hd-actions", hdActionAdminRoutes);
app.use("/api/hd-actions", hdActionRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/send-email", sendEmailRouter);
app.use("/api/chat", botHistoryRouter);

// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("API is running...");
});

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
