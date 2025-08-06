// server.cjs
// Production-ready CommonJS server with dynamic CORS (allows localhost + Netlify)

require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5050;
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Schemas
const InquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  course: { type: String, required: true },
  message: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

const OfferInquirySchema = new mongoose.Schema({
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Models
const Inquiry = mongoose.model("Inquiry", InquirySchema);
const OfferInquiry = mongoose.model("OfferInquiry", OfferInquirySchema);

/*
  Dynamic CORS middleware:
  - Whitelists allowed origins (local dev + Netlify front-end)
  - Mirrors origin in Access-Control-Allow-Origin for credentialed requests
  - Handles preflight (OPTIONS) requests properly
*/
const allowedOrigins = [
  "http://localhost:5173",                     // local dev
  "https://krishnacomputerkict.netlify.app"    // production frontend
];

app.use((req, res, next) => {
  const origin = req.get("origin");

  if (!origin) {
    // no origin (server-to-server or curl) — allow (you can change to deny if needed)
    res.header("Access-Control-Allow-Origin", "*");
  } else if (allowedOrigins.includes(origin)) {
    // mirror the origin to allow credentials and correct origin header
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
  } else {
    // origin not allowed — do not set Access-Control-Allow-Origin
    // Browser will block the request on the client side.
  }

  // Standard CORS headers for preflight and actual requests
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  // If preflight request, return 204 No Content
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(bodyParser.json());

// Routes
app.post("/api/inquiry", async (req, res) => {
  try {
    const { name, phone, course, message } = req.body;
    if (!name || !phone || !course) {
      return res
        .status(400)
        .json({ error: "Required fields are missing in contact form." });
    }

    const newInquiry = new Inquiry({
      name: name.trim(),
      phone: phone.trim(),
      course: course.trim(),
      message: message?.trim() || "",
    });

    await newInquiry.save();
    console.log("📩 General Inquiry Saved:", newInquiry);

    return res
      .status(200)
      .json({ success: true, message: "General inquiry received and saved successfully." });
  } catch (err) {
    console.error("❌ Inquiry Error:", err);
    return res.status(500).json({ error: "Server error while processing inquiry." });
  }
});

app.post("/api/offer-inquiry", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required for popup offer." });
    }

    const newOffer = new OfferInquiry({ email: email.trim() });

    await newOffer.save();
    console.log("🎯 Popup Offer Saved:", newOffer);

    return res
      .status(200)
      .json({ success: true, message: "Offer popup submission received and saved." });
  } catch (err) {
    console.error("❌ Offer Inquiry Error:", err);
    return res.status(500).json({ error: "Server error while processing offer inquiry." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
