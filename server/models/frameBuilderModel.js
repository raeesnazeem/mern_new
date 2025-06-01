const mongoose = require("mongoose");

const screenshotSchema = new mongoose.Schema({
  // Name of the section
  name: {
    type: String,
    required: true,
  },

  // Type/category of the section (e.g., Header, Footer)
  sectionType: {
    type: String,
    required: true,
  },


  category: {
    type: String,
    default: "screenshots",
  },

  // URL from WordPress media (already uploaded)
  imageUrl: {
    type: String,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("Screenshot", screenshotSchema);