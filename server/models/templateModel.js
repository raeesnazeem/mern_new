const mongoose = require("mongoose")

const templateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Template name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    sectionType: {
        type: String,
        required: [true, 'Section type is required'],
        enum: {
            values: ["header", "about", "cta", "features", "testimonials", "contact", "footer", "faq", "map", "breadcrumbs"],
            message: '{VALUE} is not a valid section type'
        },
        lowercase: true
    },
    tags: {
        type: [String],
        default: [],
        index: true,
        validate: {
            validator: function(tags) {
                return tags.length <= 20; // Limit number of tags
            },
            message: 'Cannot have more than 20 tags'
        }
    },
    json: {
        type: Object,
        required: [true, 'JSON content is required']
    },

    isActive: {
        type: Boolean,
        default: true
      },
      popularity: {
        type: Number,
        default: 0
      },
      style: {
        type: String,
        enum: ['modern', 'classic', 'minimalist', 'bold', 'elegant']
      },

    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true // Prevent modification
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

// Update the updatedAt field before saving
templateSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
  })

  // Optional: Create text index for searching name and tags
templateSchema.index({ name: 'text', tags: 'text' })

const Template = new mongoose.model('Template', templateSchema)

module.exports = Template
