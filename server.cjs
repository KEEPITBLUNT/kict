require("dotenv").config(); // ✅ Load env vars

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5050;
const MONGO_URI = process.env.MONGO_URI;

// ✅ MongoDB Connection
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Schemas
const InquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  course: { type: String, required: true },
  message: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

const OfferInquirySchema = new mongoose.Schema({
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// ✅ Models
const Inquiry = mongoose.model("Inquiry", InquirySchema);
const OfferInquiry = mongoose.model("OfferInquiry", OfferInquirySchema);

// ✅ Middleware
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(bodyParser.json());

// 📩 Routes
app.post("/api/inquiry", async (req, res) => {
  try {
    const { name, phone, course, message } = req.body;
    if (!name || !phone || !course) {
      return res.status(400).json({ error: "Required fields are missing in contact form." });
    }

    const newInquiry = new Inquiry({
      name: name.trim(),
      phone: phone.trim(),
      course: course.trim(),
      message: message?.trim() || ""
    });

    await newInquiry.save();
    console.log("📩 General Inquiry Saved:", newInquiry);

    res.status(200).json({ success: true, message: "General inquiry received and saved successfully." });
  } catch (err) {
    console.error("❌ Inquiry Error:", err);
    res.status(500).json({ error: "Server error while processing inquiry." });
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

    res.status(200).json({ success: true, message: "Offer popup submission received and saved." });
  } catch (err) {
    console.error("❌ Offer Inquiry Error:", err);
    res.status(500).json({ error: "Server error while processing offer inquiry." });
  }
});

// 🚀 Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});