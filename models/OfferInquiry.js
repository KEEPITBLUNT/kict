const mongoose = require("mongoose");

const offerInquirySchema = new mongoose.Schema({
  email: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("OfferInquiry", offerInquirySchema);