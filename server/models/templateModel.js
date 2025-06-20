const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid"); // UUID generator

const templateSchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: () => uuidv4(), // Auto-generate UUIDv4
    unique: true,
    immutable: true, // Prevent modification after creation
    index: true, //helps in faster querying
  },
  name: {
    type: String,
    required: [true, "Template name is required"],
    trim: true,
    maxlength: [100, "Name cannot exceed 100 characters"],
  },
  sectionType: {
    type: String,
    required: [true, "Section type is required"],
    enum: {
      values: [
        "full template",
        "header",
        "about",
        "cta",
        "features",
        "testimonials",
        "contact",
        "footer",
        "faq",
        "map",
        "breadcrumbs",
        "services",
        "conditions",
        "gallery",
        "before and afters",
        "form",
        "blog",
        "cards",
        "meet the team",
        "social feed",
        "mission and vision",
        "herospace",
        "herospace slider",
        "about-expertise",
        "about-introduction",
        "about-teams",
        "services-intro",
        "services-faq",
        "services-box",
        "services-benefits",
        "services-experience",
        "contact-info",
        "contact-share",
      ],
      message: "{VALUE} is not a valid section type",
    },
    lowercase: true,
  },
  tags: {
    type: [String],
    default: [],
    index: true,
    validate: {
      validator: function (tags) {
        return tags.length <= 50; // Limit number of tags
      },
      message: "Cannot have more than 50 tags",
    },
  },
  json: {
    type: Object,
    required: [true, "JSON content is required"],
  },
  screenshot: {
    type: String,
    default: null, // Optionally we can set a default value
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  popularity: {
    type: Number,
    default: 0,
  },
  style: {
    type: String,
  },
  description: {
    type: String,
    maxlength: 100 * 20, // Approx. 100 words assuming an average of 20 characters per word
    trim: true, // Remove extra whitespace
  },

  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true, // Prevent modification
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
templateSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Creating text index for searching name and tags
templateSchema.index({ name: "text", tags: "text" });

const Template = new mongoose.model("Template", templateSchema);

module.exports = Template;
