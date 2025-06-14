const Template = require("../models/templateModel");
const { v4: uuid } = require("uuid");
const axios = require("axios");

const templateController = {
  /* ----------------------------------------------------*
   * Process user prompt and find matching templates
   * ----------------------------------------------------*/

  // makeTemplatesByPrompt
  makeTemplatesByPrompt: async (req, res) => {
    try {
      console.log("Request received - makeTemplatesByPrompt");
      const { prompt } = req.body;
      if (!prompt) {
        return res
          .status(400)
          .json({ success: false, message: "Prompt is required" });
      }
      console.log("Prompt received:", prompt);

      // 1. Analyze Prompt
      const { styles, colors, sectionTypes, keywords } = analyzePrompt(prompt);
      const finalStyle = styles?.[0] || null;
      const promptColor = colors?.[0] || null;
      const finalSectionTypes = sectionTypes || [];
      console.log("Analyzed prompt result:", {
        styles,
        colors,
        sectionTypes,
        keywords,
      });

      let pageContextTag = null;

      // 2. Detect Page Context
      const promptLower = prompt.toLowerCase();
      if (/\b(home|homepage|main|mainpage)\b/i.test(promptLower)) {
        pageContextTag = "home-page";
      } else if (/\b(service|services|servicepage)\b/i.test(promptLower)) {
        pageContextTag = "services-page";
      } else if (/\b(contact)\b/i.test(promptLower)) {
        pageContextTag = "contact-page";
      } else if (/\b(about)\b/i.test(promptLower)) {
        pageContextTag = "about-page";
      }

      // This helper function runs a prioritized search using the correct $and operator
      const runPrioritizedQuery = async (baseCondition) => {
        const queriesToTry = [];
        const baseAndArray = [baseCondition];

        if (finalStyle && promptColor) {
          queriesToTry.push({
            $and: [
              ...baseAndArray,
              { style: finalStyle.toLowerCase() },
              { tags: promptColor.toLowerCase() },
            ],
          });
        }
        if (promptColor) {
          queriesToTry.push({
            $and: [...baseAndArray, { tags: promptColor.toLowerCase() }],
          });
        }
        if (finalStyle) {
          queriesToTry.push({
            $and: [...baseAndArray, { style: finalStyle.toLowerCase() }],
          });
        }
        queriesToTry.push({ $and: baseAndArray });

        for (const query of queriesToTry) {
          const templates = await Template.find(query)
            .sort({ popularity: -1, updatedAt: -1 })
            .limit(50);
          if (templates.length > 0) {
            console.log("   >>> Using Query:", JSON.stringify(query, null, 2));
            return templates;
          }
        }
        return [];
      };

      const logTemplates = (templates) => {
        console.log(
          JSON.stringify(
            templates.map((t) => ({
              name: t.name,
              sectionType: t.sectionType,
              tags: t.tags,
            })),
            null,
            2
          )
        );
      };

      const allFoundTemplates = [];
      const foundIds = new Set();
      const addTemplates = (templates) => {
        templates.forEach((t) => {
          if (!foundIds.has(t._id.toString())) {
            allFoundTemplates.push(t);
            foundIds.add(t._id.toString());
          }
        });
      };

      // 3. Execute Searches based on Page Context
      if (pageContextTag) {
        console.log(
          `\n[STEP A] Searching for Page-Specific templates with tag: "${pageContextTag}"`
        );
        let pageSpecificCondition = { isActive: true, tags: pageContextTag };
        if (finalSectionTypes.length > 0) {
          pageSpecificCondition.sectionType = {
            $in: finalSectionTypes.map((s) => s.toLowerCase()),
          };
          console.log(
            `   ...and sectionTypes: [${finalSectionTypes.join(", ")}]`
          );
        }
        const pageTemplates = await runPrioritizedQuery(pageSpecificCondition);
        console.log(
          `✅ Found ${pageTemplates.length} page-specific templates.`
        );
        if (pageTemplates.length > 0) logTemplates(pageTemplates);
        addTemplates(pageTemplates);
      } else {
        console.log(
          `\n[STEP A] No page context found. Searching all templates based on color/style.`
        );
        let noPageCondition = { isActive: true };
        if (finalSectionTypes.length > 0) {
          noPageCondition.sectionType = {
            $in: finalSectionTypes.map((s) => s.toLowerCase()),
          };
          console.log(
            `   ...filtered by sectionTypes: [${finalSectionTypes.join(", ")}]`
          );
        }
        const noPageTemplates = await runPrioritizedQuery(noPageCondition);
        console.log(`✅ Found ${noPageTemplates.length} templates.`);
        if (noPageTemplates.length > 0) logTemplates(noPageTemplates);
        addTemplates(noPageTemplates);
      }

      console.log(
        `\n[STEP B] Searching for General-Purpose templates with tag: "general"`
      );
      const generalTemplates = await runPrioritizedQuery({
        isActive: true,
        tags: "general",
      });
      console.log(`✅ Found ${generalTemplates.length} general templates.`);
      if (generalTemplates.length > 0) logTemplates(generalTemplates);
      addTemplates(generalTemplates);

      // --- START: NEWLY ADDED FINAL FILTERING STEP ---
      console.log(`\n[STEP C] Applying final dark/light style filter.`);
      let finalTemplates = [...allFoundTemplates];

      if (finalStyle === "light") {
        finalTemplates = allFoundTemplates.filter(
          (template) => !(template.tags || []).includes("dark")
        );
        console.log(
          `   Style is 'light', removed templates with 'dark' tag. Count is now ${finalTemplates.length}.`
        );
      } else if (finalStyle === "dark") {
        finalTemplates = allFoundTemplates.filter(
          (template) => !(template.tags || []).includes("light")
        );
        console.log(
          `   Style is 'dark', removed templates with 'light' tag. Count is now ${finalTemplates.length}.`
        );
      } else if (finalStyle === "") {
        finalTemplates = allFoundTemplates.filter(
          (template) => !(template.tags || []).includes("dark")
        );
        console.log(
          `   Style is 'empty', defaulting to 'light' tag. Count is now ${finalTemplates.length}.`
        );
      } else {
        finalTemplates = allFoundTemplates.filter(
          (template) => !(template.tags || []).includes("dark")
        );
        console.log(
          `   Style is 'empty', defaulting to 'light' tag. Count is now ${finalTemplates.length}.`
        );
      }
      // --- END: NEWLY ADDED FINAL FILTERING STEP ---

      // 4. Final processing and response
      console.log(
        `\nTotal unique templates to be returned: ${finalTemplates.length}`
      );
      const templatesBySection = groupTemplatesBySection(finalTemplates);

      res.status(200).json({
        success: true,
        data: {
          allTemplates: finalTemplates,
          templatesOrderedBySection: templatesBySection,
          suggestedOrder: suggestTemplateOrder(Object.keys(templatesBySection)),
          matchedConditions: {
            style: finalStyle,
            color: promptColor,
            sectionTypes: finalSectionTypes,
            keywords,
            pageContextTag,
          },
        },
      });
    } catch (error) {
      console.error("Error finding templates:", error.message);
      res.status(500).json({
        success: false,
        message: "Server error while processing template search",
        error: error.message,
      });
    }
  },

  /* ----------------------------------------------------*
   * Send data to wordpress and create a page
   * ----------------------------------------------------*/

  createWordPressPage: async (req, res) => {
    try {
      // 1. Get the page data from the frontend's request
      const requestData = req.body;
      const wpUsername = process.env.WP_USERNAME;
      const appPassword = process.env.WP_APPLICATION_PASSWORD;

      if (!wpUsername || !appPassword) {
        console.error("WordPress credentials are not set on the server.");
        return res
          .status(500)
          .json({ success: false, message: "Server configuration error." });
      }

      if (!requestData || !requestData.name || !requestData.json) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid page data received." });
      }

      // 2. Create the Authorization token
      const token = Buffer.from(`${wpUsername}:${appPassword}`).toString(
        "base64"
      );

      console.log(
        "Proxying request to WordPress to create page:",
        requestData.name
      );

      // 3. Forward the request to WordPress with the Authorization header
      const wpResponse = await axios.post(
        `${process.env.WP_PAGE_GENERATE}`,
        requestData,
        {
          headers: {
            Authorization: `Basic ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // 4. Combine the necessary elements into one 
      const combinedResponse = {
            success: wpResponse.data.success,
            wp_data: wpResponse.data, // This will have { public_url, edit_url, post_id }
            original_payload: requestData // This is the full { name, json } payload
      };

      // 5. Send the successful response from WordPress back to the React frontend
      res.status(200).json(combinedResponse);

      
    } catch (error) {
      console.error(
        "Error in createWordPressPage proxy:",
        error.response ? error.response.data : error.message
      );
      res.status(error.response?.status || 500).json({
        success: false,
        message: "Failed to create WordPress page.",
        error: error.response?.data || error.message,
      });
    }
  },

  /* ----------------------------------------------------*
   * Search for single templates and display it in the frontend
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
};

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

  // Extract colors using word boundaries to avoid partial matches (e.g., 'red' in 'colored')
  const colors = possibleColors
    .filter((color) => new RegExp(`\\b${color}\\b`, "i").test(prompt))
    .map((color) => {
      if (color === "grey") return "gray";
      return color;
    });

  // Extract section types (all matches)
  const sectionTypes = possibleSections.filter((section) =>
    prompt.toLowerCase().includes(section)
  );

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
      acc[sectionType] = [];
    }
    acc[sectionType].push(template);
    return acc;
  }, {});
};

// Helper function to suggest a logical order of sections
const suggestTemplateOrder = (availableSections) => {
  const defaultOrder = [
    "header",
    "breadcrumbs",
    "herospace",
    "herospace slider",
    "about",
    "features",
    "services",
    "gallery",
    "before and afters",
    "cards",
    "meet the team",
    "mission and vision",
    "testimonials",
    "faq",
    "cta",
    "map",
    "contact",
    "footer",
  ];

  const orderedSections = defaultOrder.filter((section) =>
    availableSections.includes(section)
  );

  const additionalSections = availableSections.filter(
    (section) => !defaultOrder.includes(section)
  );

  return [...orderedSections, ...additionalSections];
};

module.exports = { templateController };
