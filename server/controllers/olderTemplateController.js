const Template = require("../models/templateModel");
const { v4: uuid } = require("uuid");

const templateController = {
  /* ----------------------------------------------------*
   * Process user prompt and find matching templates
   * ----------------------------------------------------*/
  makeTemplatesByPrompt: async (req, res) => {
    try {
      const { prompt, style, sectionTypes } = req.body;

      if (!prompt) {
        return res.status(400).json({
          success: false,
          message: 'Prompt is required'
        });
      }

      // Extract keywords and potential style/section types from prompt
      const { keywords, potentialStyle, potentialSectionTypes } = analyzePrompt(prompt);

      // Use style from request or extract from prompt
      const finalStyle = style || potentialStyle;
      // Use sectionTypes from request or extract from prompt
      const finalSectionTypes = sectionTypes || potentialSectionTypes;

      // Build strict matching conditions
      const queryConditions = {
        isActive: true
      };

      // Add strict style matching if available
      if (finalStyle) {
        queryConditions.style = finalStyle.toLowerCase();
      }

      // Add strict section type matching if available
      if (finalSectionTypes && finalSectionTypes.length > 0) {
        queryConditions.sectionType = {
          $in: finalSectionTypes.map(type => type.toLowerCase())
        };
      }

      // Keyword matching (secondary priority)
      let keywordQuery = {};
      if (keywords.length > 0) {
        keywordQuery = {
          $or: [
            { name: { $regex: keywords.join('|'), $options: 'i' } },
            { tags: { $in: keywords } }
          ]
        };
      }

      // Find templates that match ALL conditions
      const matchingTemplates = await Template.find({
        ...queryConditions,
        ...keywordQuery
      })
        .sort({
          popularity: -1,
          updatedAt: -1
        })
        .limit(50);

      // If no strict matches found, relax the style condition
      let relaxedResults = [];
      if (matchingTemplates.length === 0 && finalStyle) {
        relaxedResults = await Template.find({
          ...(finalSectionTypes && { sectionType: { $in: finalSectionTypes } }),
          ...keywordQuery,
          isActive: true
        })
          .sort({ popularity: -1 })
          .limit(50);
      }

      const allResults = [...matchingTemplates, ...relaxedResults];
      const templatesBySection = groupTemplatesBySection(allResults);

      res.status(200).json({
        success: true,
        data: {
          allTemplates: allResults,
          templatesBySection,
          suggestedOrder: suggestTemplateOrder(Object.keys(templatesBySection)),
          matchedConditions: {
            style: finalStyle,
            sectionTypes: finalSectionTypes,
            keywords
          }
        }
      });

    } catch (error) {
      console.error('Error finding templates:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while processing template search',
        error: error.message
      });
    }
  },



  /* ----------------------------------------------------*
   * Search for templates and display it in the frontend
   * ----------------------------------------------------*/
  fetchAndDisplay: async (req, res) => {

    try {
      const { sectionType } = req.query;

      if (!sectionType) {
        return res.status(400).json({
          success: false,
          message: 'sectionType query parameter is required'
        });
      }

      const templates = await Template.find({ sectionType: { $regex: new RegExp(`^${sectionType}$`, 'i') } }) //just making sectiontype case insensitive
        .select('name sectionType json createdAt tags isActive style')
        .sort({ createdAt: -1 })
        .lean();

      if (!templates || templates.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No templates found for the specified sectionType'
        });
      }

      res.json({
        success: true,
        count: templates.length,
        data: templates
      });

    } catch (err) {
      console.error('Error fetching templates:', err);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching templates',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

  },



  /* ----------------------------------------------------*
   * Create/Upload a new template
   * POST /api/templates
   * Required fields: name, sectionType, json
  * ----------------------------------------------------*/

  createTemplate: async (req, res) => {
    try {
      const { name, sectionType, json, tags, style } = req.body;

      // Validate required fields
      if (!name || !sectionType || !json) {
        return res.status(400).json({
          success: false,
          message: 'Name, sectionType, and json are required fields'
        });
      }

      // Validate JSON content
      try {
        JSON.parse(JSON.stringify(json)); // Test if valid JSON
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid JSON content',
          error: error.message
        });
      }

      // Check for existing template with same name and section type
      const existingTemplate = await Template.findOne({
        name: name.trim(),
        sectionType: sectionType.toLowerCase()
      });

      if (existingTemplate) {
        return res.status(409).json({
          success: false,
          message: 'Template with this name and section type already exists',
          existingTemplate: {
            _id: existingTemplate._id,
            uuid: existingTemplate.uuid,
            name: existingTemplate.name,
            sectionType: existingTemplate.sectionType
          }
        });
      }

      // Create new template
      const newTemplate = await Template.create({
        name: name.trim(),
        sectionType: sectionType.toLowerCase(),
        json,
        tags: tags ? [...new Set(tags.map(tag => tag.toLowerCase()))] : [], // Remove duplicates and lowercase
        style: style ? style.toLowerCase() : undefined,
        // uuid, createdAt and updatedAt are automatically handled
      });

      // Format the response
      const response = {
        success: true,
        message: 'Template created successfully',
        data: {
          id: newTemplate._id,
          uuid: newTemplate.uuid,
          name: newTemplate.name,
          sectionType: newTemplate.sectionType,
          style: newTemplate.style,
          tags: newTemplate.tags,
          createdAt: newTemplate.createdAt
        }
      };

      res.status(201).json(response);

    } catch (error) {
      console.error('Error creating template:', error);

      // Handle specific Mongoose validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: messages
        });
      }

      // Handle duplicate key errors including uuid conflicts
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Template with similar unique attributes already exists',
          details: error.keyValue // Will show which field caused conflict
        });
      }

      // Generic error handler
      res.status(500).json({
        success: false,
        message: 'Server error while creating template',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },


  /* ----------------------------------------------------*
   * * Bulk upload templates
    * POST /api/templates/bulk
   * ----------------------------------------------------*/

  bulkUploadTemplates: async (req, res) => {
    try {
      const { templates } = req.body;

      if (!templates || !Array.isArray(templates)) {
        return res.status(400).json({
          success: false,
          message: 'Templates array is required'
        });
      }

      // Validate each template
      const validatedTemplates = [];
      const errors = [];

      for (const [index, template] of templates.entries()) {
        try {
          // Basic validation
          if (!template.name || !template.sectionType || !template.json) {
            throw new Error('Missing required fields (name, sectionType, or json)');
          }

          // Check for duplicates in the batch
          const duplicateInBatch = validatedTemplates.some(
            t => t.name === template.name.trim() &&
              t.sectionType === template.sectionType.toLowerCase()
          );

          if (duplicateInBatch) {
            throw new Error('Duplicate template in upload batch');
          }

          // Add to validated list
          validatedTemplates.push({
            name: template.name.trim(),
            sectionType: template.sectionType.toLowerCase(),
            json: template.json,
            tags: template.tags ? [...new Set(template.tags.map(tag => tag.toLowerCase()))] : [],
            style: template.style ? template.style.toLowerCase() : undefined,
            isActive: template.isActive !== false // Default to true
          });
        } catch (error) {
          errors.push({
            index,
            name: template.name || 'unnamed',
            error: error.message
          });
        }
      }

      // Check if all templates failed validation
      if (validatedTemplates.length === 0 && errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'All templates failed validation',
          errors
        });
      }

      // Insert validated templates
      const result = await Template.insertMany(validatedTemplates, { ordered: false });

      res.status(201).json({
        success: true,
        message: `Successfully uploaded ${result.length} templates`,
        data: {
          createdCount: result.length,
          errorCount: errors.length,
          errors: errors.length > 0 ? errors : undefined
        }
      });

    } catch (error) {
      console.error('Error during bulk upload:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during bulk upload',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }



};




/* ----------------------------------------------------*
 * * Enhanced prompt analyzer - helper function
    analayzes the prompt and returns an object with keywords, style and sectionType
 * ----------------------------------------------------*/

    const analyzePrompt = (prompt) => {
      if (!prompt) return { styles: [], colors: [], sectionTypes: [] }
    
      const words = prompt.toLowerCase().split(/\s+/)
      const commonWords = new Set(['the', 'and', 'or', 'a', 'an', 'in', 'on', 'at', 'for', 'to', 'of'])
    
      // Possible styles, colors, and sections 
      const possibleStyles = ['modern', 'classic', 'minimalist', 'bold', 'elegant', 'vintage', 'futuristic', 'rustic', 'clean', 'sleek', 'professional', 'corporate', 'creative', 'artistic', 'playful', 'fun',  
        'luxury', 'premium', 'high-end', 'minimal', 'simple', 'flat', 'material', '3d', 'abstract', 'geometric', 'handmade', 'illustrative', 'sketchy', 'grunge', 'industrial', 'cyberpunk', 'dark', 'light', 'monochrome', 'pastel', 'vibrant', 'gradient', 'duotone', 'retro', '80s', '90s', 'y2k', 'bohemian', 'tropical', 'organic', 'natural', 'nature-inspired', 'eco-friendly', 'sustainable', 'airy', 'spacious', 'compact', 'cozy', 'warm', 'cold', 'metallic', 'wooden', 'bold typography', 'handwritten', 'calligraphic', 'animated', 'interactive', 'parallax','asymmetric', 'magazine', 'editorial',  'portfolio']
      const possibleColors = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'gray', 'purple', 'pink', 'orange', 'teal', 'gold', 'silver', 'violet', 'indigo', 'off-white', 'brown']
      const possibleSections = ["full template", "header", "about", "cta", "features", "testimonials", "contact", "footer", "faq", "map", "breadcrumbs", "services", "conditions", "gallery", "before and afters", "form", "blog", "cards", "meet the team", "social feed", "mission and vision", "herospace", "herospace slider"]
    
      // Extract styles 
      const styles = possibleStyles.filter(style => 
        prompt.toLowerCase().includes(style)
      )
    
      // Extract colors
      const colors = possibleColors.filter(color => 
        prompt.toLowerCase().includes(color)
      )
    
      // Extract section types (all matches)
      const sectionTypes = possibleSections.filter(section => 
        prompt.toLowerCase().includes(section)
      )
    
      // Extract additional keywords
      const keywords = [...new Set(words.filter(word =>
        word.length > 2 &&
        !commonWords.has(word) &&
        !/^\d+$/.test(word) &&
        !styles.includes(word) &&
        !colors.includes(word) &&
        !sectionTypes.includes(word)
      ))]
    
      return { styles, colors, sectionTypes, keywords }; 
    }

// Helper function to group templates by their section type
const groupTemplatesBySection = (templates) => {
  return templates.reduce((acc, template) => {
    const { sectionType } = template;
    if (!acc[sectionType]) {
      acc[sectionType] = [];
    }
    acc[sectionType].push(template);
    return acc;
  }, {});
};

// Helper function to suggest a logical order of sections
const suggestTemplateOrder = (availableSections) => {
  const defaultOrder = [
    'header',
    'breadcrumbs',
    'about',
    'features',
    'testimonials',
    'faq',
    'cta',
    'map',
    'contact',
    'footer'
  ];

  // Create ordered array with available sections
  const orderedSections = defaultOrder.filter(section =>
    availableSections.includes(section)
  );

  // Add any remaining sections that weren't in the default order
  const remainingSections = availableSections.filter(section =>
    !defaultOrder.includes(section)
  );

  return [...orderedSections, ...remainingSections];
};

module.exports = { templateController };