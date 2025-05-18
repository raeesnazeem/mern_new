const Template = require("../models/templateModel");
const { v4: uuid } = require("uuid");

const templateController = {
  /* ----------------------------------------------------*
   * Process user prompt and find matching templates
   * ----------------------------------------------------*/
  // makeTemplatesByPrompt: async (req, res) => {
  //   try {
  //     const { prompt } = req.body

  //     if (!prompt) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'Prompt is required'
  //       })
  //     }

  //     // Extract relevant data from prompt
  //     const { styles, colors, sectionTypes, keywords } = analyzePrompt(prompt);

  //     // Use first detected style from prompt or fallback to null
  //     const finalStyle = styles?.[0] || []

  //     // Use detected section types from prompt or fallback to null
  //     const finalSectionTypes = sectionTypes || []

  //     // Get first color from prompt (or empty string if none)
  //     const promptColor = colors?.[0] || "";

  //     // STEP 1: Try to find templates that match BOTH color AND style criteria
  //     if (finalSectionTypes.length > 0 && finalStyle && promptColor) {
  //       const colorAndStyleQuery = {
  //         isActive: true,
  //         sectionType: {
  //           $in: finalSectionTypes.map(type => type.toLowerCase())
  //         },
  //         style: finalStyle.toLowerCase(),
  //         tags: promptColor.toLowerCase()
  //       };

  //       // Find templates matching both color AND style
  //       matchingTemplates = await Template.find(colorAndStyleQuery)
  //         .sort({
  //           popularity: -1,
  //           updatedAt: -1
  //         })
  //         .limit(50);
  //     }

  //     // STEP 2: If no results, try with JUST the color and sectionTypes (ignoring style)
  //     if (matchingTemplates.length === 0 && promptColor && finalSectionTypes.length > 0) {
  //       const colorOnlyQuery = {
  //         isActive: true,
  //         sectionType: {
  //           $in: finalSectionTypes.map(type => type.toLowerCase())
  //         },
  //         tags: promptColor.toLowerCase()
  //       };

  //       // Find templates matching color only
  //       matchingTemplates = await Template.find(colorOnlyQuery)
  //         .sort({
  //           popularity: -1,
  //           updatedAt: -1
  //         })
  //         .limit(50);
  //     }

  //     // STEP 3: If still no results, fall back to just sectionTypes
  //     if (matchingTemplates.length === 0 && finalSectionTypes.length > 0) {
  //       const sectionOnlyQuery = {
  //         isActive: true,
  //         sectionType: {
  //           $in: finalSectionTypes.map(type => type.toLowerCase())
  //         }
  //       };

  //       // Find templates matching sectionTypes only
  //       matchingTemplates = await Template.find(sectionOnlyQuery)
  //         .sort({
  //           popularity: -1,
  //           updatedAt: -1
  //         })
  //         .limit(50);
  //     }

  //     // Group templates by section and suggest an order
  //     const templatesBySection = groupTemplatesBySection(matchingTemplates);

  //     res.status(200).json({
  //       success: true,
  //       data: {
  //         allTemplates: matchingTemplates,
  //         templatesBySection,
  //         suggestedOrder: suggestTemplateOrder(Object.keys(templatesBySection)),
  //         matchedConditions: {
  //           style: finalStyle,
  //           color: promptColor,
  //           sectionTypes: finalSectionTypes,
  //           keywords
  //         }
  //       }
  //     });

  //   } catch (error) {
  //     console.error('Error finding templates:', error)
  //     res.status(500).json({
  //       success: false,
  //       message: 'Server error while processing template search',
  //       error: error.message
  //     })
  //   }
  // },

  makeTemplatesByPrompt: async (req, res) => {
    try {
      console.log("Request received - makeTemplatesByPrompt");

      const { prompt } = req.body;
      console.log("Prompt received:", prompt);

      if (!prompt) {
        console.warn(" No prompt provided in the request body");
        return res.status(400).json({
          success: false,
          message: "Prompt is required",
        });
      }

      // Extract relevant data from prompt
      const { styles, colors, sectionTypes, keywords } = analyzePrompt(prompt);
      console.log("Analyzed prompt result:", {
        styles,
        colors,
        sectionTypes,
        keywords,
      });

      // Use first detected style from prompt or fallback to null
      const finalStyle = styles?.[0] || null;
      console.log("Final style selected:", finalStyle);

      // Use detected section types from prompt or fallback to empty array
      const finalSectionTypes = sectionTypes || [];
      console.log("Final section types selected:", finalSectionTypes);

      // Get first color from prompt (or empty string if none)
      const promptColor = colors?.[0] || "";
      console.log("Final color selected:", promptColor);

      let matchingTemplates = [];

      // STEP 1: Try to find templates that match BOTH color AND style criteria
      if (finalSectionTypes.length > 0 && finalStyle && promptColor) {
        console.log("STEP 1: Searching by color, style, and section types");
        const colorAndStyleQuery = {
          isActive: true,
          sectionType: {
            $in: finalSectionTypes.map((type) => type.toLowerCase()),
          },
          style: finalStyle.toLowerCase(),
          tags: promptColor.toLowerCase(),
        };

        console.log("QUERY (STEP 1):", colorAndStyleQuery);

        matchingTemplates = await Template.find(colorAndStyleQuery)
          .sort({ popularity: -1, updatedAt: -1 })
          .limit(50);

        console.log(`Found ${matchingTemplates.length} templates in STEP 1`);
      }

      // STEP 2: If no results, try with JUST the color and sectionTypes (ignoring style)
      if (
        matchingTemplates.length === 0 &&
        promptColor &&
        finalSectionTypes.length > 0
      ) {
        console.log(
          "STEP 2: Falling back to search by color and section types only"
        );

        const colorOnlyQuery = {
          isActive: true,
          sectionType: {
            $in: finalSectionTypes.map((type) => type.toLowerCase()),
          },
          tags: promptColor.toLowerCase(),
        };

        console.log("QUERY (STEP 2):", colorOnlyQuery);

        matchingTemplates = await Template.find(colorOnlyQuery)
          .sort({ popularity: -1, updatedAt: -1 })
          .limit(50);

        console.log(`✅ Found ${matchingTemplates.length} templates in STEP 2`);
      }

      // STEP 3: If still no results, fall back to just sectionTypes
      if (matchingTemplates.length === 0 && finalSectionTypes.length > 0) {
        console.log("STEP 3: Falling back to section types only");

        const sectionOnlyQuery = {
          isActive: true,
          sectionType: {
            $in: finalSectionTypes.map((type) => type.toLowerCase()),
          },
        };

        console.log("QUERY (STEP 3):", sectionOnlyQuery);

        matchingTemplates = await Template.find(sectionOnlyQuery)
          .sort({ popularity: -1, updatedAt: -1 })
          .limit(50);

        console.log(`Found ${matchingTemplates.length} templates in STEP 3`);
      }

      // Final check
      if (matchingTemplates.length === 0) {
        console.log("No templates found after all steps.");
      }

      // Group templates by section and suggest an order
      const templatesBySection = groupTemplatesBySection(matchingTemplates);
      console.log("Templates grouped by section:", templatesBySection);

      res.status(200).json({
        success: true,
        data: {
          allTemplates: matchingTemplates,
          templatesOrderedBySection: templatesBySection,
          suggestedOrder: suggestTemplateOrder(Object.keys(templatesBySection)),
          matchedConditions: {
            style: finalStyle,
            color: promptColor,
            sectionTypes: finalSectionTypes,
            keywords,
          },
        },
      });
    } catch (error) {
      console.error("Error finding templates:", error.message);
      console.error("Full error object:", error); // Optional: log full error for debugging

      res.status(500).json({
        success: false,
        message: "Server error while processing template search",
        error: error.message,
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
          message: "sectionType query parameter is required",
        });
      }

      const templates = await Template.find({
        sectionType: { $regex: new RegExp(`^${sectionType}$`, "i") },
      }) //just making sectiontype case insensitive
        .select("name sectionType json createdAt tags isActive style") //Only includes these specific fields
        .sort({ createdAt: -1 })
        .lean();

      if (!templates || templates.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No templates found for the specified sectionType",
        });
      }

      res.json({
        success: true,
        count: templates.length,
        data: templates,
      });
    } catch (err) {
      console.error("Error fetching templates:", err);
      res.status(500).json({
        success: false,
        message: "Server error while fetching templates",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
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
          message: "Name, sectionType, and json are required fields",
        });
      }

      // Validate JSON content
      try {
        JSON.parse(JSON.stringify(json)); // Test if valid JSON
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid JSON content",
          error: error.message,
        });
      }

      // Check for existing template with same name and section type
      const existingTemplate = await Template.findOne({
        name: name.trim(),
        sectionType: sectionType.toLowerCase(),
      });

      if (existingTemplate) {
        return res.status(409).json({
          success: false,
          message: "Template with this name and section type already exists",
          existingTemplate: {
            _id: existingTemplate._id,
            uuid: existingTemplate.uuid,
            name: existingTemplate.name,
            sectionType: existingTemplate.sectionType,
          },
        });
      }

      // Create new template
      const newTemplate = await Template.create({
        name: name.trim(),
        sectionType: sectionType.toLowerCase(),
        json,
        tags: tags ? [...new Set(tags.map((tag) => tag.toLowerCase()))] : [], // Remove duplicates and lowercase
        style: style ? style.toLowerCase() : undefined,
        // uuid, createdAt and updatedAt are automatically handled
      });

      // Format the response
      const response = {
        success: true,
        message: "Template created successfully",
        data: {
          id: newTemplate._id,
          uuid: newTemplate.uuid,
          name: newTemplate.name,
          sectionType: newTemplate.sectionType,
          style: newTemplate.style,
          tags: newTemplate.tags,
          createdAt: newTemplate.createdAt,
        },
      };

      res.status(201).json(response);
    } catch (error) {
      console.error("Error creating template:", error);

      // Handle specific Mongoose validation errors
      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((val) => val.message);
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: messages,
        });
      }

      // Handle duplicate key errors including uuid conflicts
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "Template with similar unique attributes already exists",
          details: error.keyValue, // Will show which field caused conflict
        });
      }

      // Generic error handler
      res.status(500).json({
        success: false,
        message: "Server error while creating template",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  /* ----------------------------------------------------*
   * * Bulk upload templates
   * POST /api/templates/bulk
   * ----------------------------------------------------*/

  // bulkUploadTemplates: async (req, res) => {
  //   try {
  //     const { templates } = req.body;

  //     if (!templates || !Array.isArray(templates)) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'Templates array is required'
  //       });
  //     }

  //     // Validate each template
  //     const validatedTemplates = [];
  //     const errors = [];

  //     for (const [index, template] of templates.entries()) {
  //       try {
  //         // Basic validation
  //         if (!template.name || !template.sectionType || !template.json) {
  //           throw new Error('Missing required fields (name, sectionType, or json)');
  //         }

  //         // Check for duplicates in the batch
  //         const duplicateInBatch = validatedTemplates.some(
  //           t => t.name === template.name.trim() &&
  //             t.sectionType === template.sectionType.toLowerCase()
  //         );

  //         if (duplicateInBatch) {
  //           throw new Error('Duplicate template in upload batch');
  //         }

  //         // Add to validated list
  //         validatedTemplates.push({
  //           name: template.name.trim(),
  //           sectionType: template.sectionType.toLowerCase(),
  //           json: template.json,
  //           tags: template.tags ? [...new Set(template.tags.map(tag => tag.toLowerCase()))] : [],
  //           style: template.style ? template.style.toLowerCase() : undefined,
  //           isActive: template.isActive !== false // Default to true
  //         });
  //       } catch (error) {
  //         errors.push({
  //           index,
  //           name: template.name || 'unnamed',
  //           error: error.message
  //         });
  //       }
  //     }

  //     // Check if all templates failed validation
  //     if (validatedTemplates.length === 0 && errors.length > 0) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'All templates failed validation',
  //         errors
  //       });
  //     }

  //     // Insert validated templates
  //     const result = await Template.insertMany(validatedTemplates, { ordered: false });

  //     res.status(201).json({
  //       success: true,
  //       message: `Successfully uploaded ${result.length} templates`,
  //       data: {
  //         createdCount: result.length,
  //         errorCount: errors.length,
  //         errors: errors.length > 0 ? errors : undefined
  //       }
  //     });

  //   } catch (error) {
  //     console.error('Error during bulk upload:', error);
  //     res.status(500).json({
  //       success: false,
  //       message: 'Server error during bulk upload',
  //       error: process.env.NODE_ENV === 'development' ? error.message : undefined
  //     });
  //   }
  // }
};

/* ----------------------------------------------------*
 * *prompt analyzer - helper function
    analyzes the prompt and returns an object with keywords, style and sectionType
 * ----------------------------------------------------*/

const analyzePrompt = (prompt) => {
  if (!prompt) return { styles: [], colors: [], sectionTypes: [] };

  const words = prompt.toLowerCase().split(/\s+/);
  const commonWords = new Set([
    "the",
    "and",
    "or",
    "a",
    "an",
    "in",
    "on",
    "at",
    "for",
    "to",
    "of",
  ]);

  // Possible styles, colors, and sections
  const possibleStyles = [
    "modern",
    "classic",
    "minimalist",
    "bold",
    "elegant",
    "vintage",
    "futuristic",
    "rustic",
    "clean",
    "sleek",
    "professional",
    "corporate",
    "creative",
    "artistic",
    "playful",
    "fun",
    "luxury",
    "premium",
    "high-end",
    "minimal",
    "simple",
    "flat",
    "material",
    "3d",
    "abstract",
    "geometric",
    "handmade",
    "illustrative",
    "sketchy",
    "grunge",
    "industrial",
    "cyberpunk",
    "dark",
    "light",
    "monochrome",
    "pastel",
    "vibrant",
    "gradient",
    "duotone",
    "retro",
    "80s",
    "90s",
    "y2k",
    "bohemian",
    "tropical",
    "organic",
    "natural",
    "nature-inspired",
    "eco-friendly",
    "sustainable",
    "airy",
    "spacious",
    "compact",
    "cozy",
    "warm",
    "cold",
    "metallic",
    "wooden",
    "bold typography",
    "handwritten",
    "calligraphic",
    "animated",
    "interactive",
    "parallax",
    "asymmetric",
    "magazine",
    "editorial",
    "portfolio",
  ];

  const possibleColors = [
    "red",
    "blue",
    "cream",
    "turquoise",
    "green",
    "yellow",
    "black",
    "white",
    "gray",
    "purple",
    "pink",
    "orange",
    "teal",
    "gold",
    "silver",
    "violet",
    "indigo",
    "off-white",
    "brown",
  ];

  const possibleSections = [
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
  ];

  // Extract styles
  const styles = possibleStyles.filter((style) =>
    prompt.toLowerCase().includes(style)
  );

  // Extract colors
  const colors = possibleColors
    .filter((color) => prompt.toLowerCase().includes(color))
    .map((color) => {
      // Normalize 'grey' to 'gray'
      if (color === "grey") return "gray";
      return color;
    })

  // Extract section types (all matches)
  const sectionTypes = possibleSections.filter((section) =>
    prompt.toLowerCase().includes(section)
  )

  // Extract additional keywords
  const keywords = [
    ...new Set(
      words.filter(
        (word) =>
          word.length > 2 &&
          !commonWords.has(word) &&
          !/^\d+$/.test(word) &&
          !styles.includes(word) &&
          !colors.includes(word) &&
          !sectionTypes.includes(word)
      )
    ),
  ];

  return { styles, colors, sectionTypes, keywords };
};

// Helper function to group templates by their section type
const groupTemplatesBySection = (templates) => {
  return templates.reduce((acc, template) => {
    const { sectionType } = template;
    if (!acc[sectionType]) {
      acc[sectionType] = []; //checks if there's an object's value(not key) associated with the sectionType. Eg: for header-SectionType if empty, then initializes header: []_______ means acc.header = []. Helps in grouping by value.
    }
    acc[sectionType].push(template);
    return acc;
  }, {});
};

// Helper function to suggest a logical order of sections
// with additional sections inserted between features and testimonials
const suggestTemplateOrder = (availableSections) => {
  const defaultOrder = [
    "header",
    "breadcrumbs",
    "about",
    "features",
    // Additional sections will be inserted here
    "testimonials",
    "faq",
    "cta",
    "map",
    "contact",
    "footer",
  ];

  // Find the index where we want to insert additional sections (after 'features')
  const featuresIndex = defaultOrder.indexOf("features");

  // Split the default order into before and after parts
  const beforeFeatures = defaultOrder.slice(0, featuresIndex + 1);
  const afterFeatures = defaultOrder.slice(featuresIndex + 1);

  // Filter the sections that are in the default order
  const orderedBeforeFeatures = beforeFeatures.filter((section) =>
    availableSections.includes(section)
  );

  const orderedAfterFeatures = afterFeatures.filter((section) =>
    availableSections.includes(section)
  );

  // Find any sections that aren't in the default order
  const additionalSections = availableSections.filter(
    (section) => !defaultOrder.includes(section)
  );

  // Combine the three parts: before features, additional sections, and after features
  return [
    ...orderedBeforeFeatures,
    ...additionalSections,
    ...orderedAfterFeatures,
  ];
};

module.exports = { templateController };
