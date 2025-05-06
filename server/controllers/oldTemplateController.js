const Template = require('../models/templateModel');
const { v4: uuidv4 } = require('uuid');

// Helper function to extract keywords from text
const extractKeywords = (text) => {
  if (!text) return [];
  const words = text.toLowerCase().split(/\s+/);
  const commonWords = new Set(['the', 'and', 'or', 'a', 'an', 'in', 'on', 'at', 'for', 'to', 'of']);
  return [...new Set(words.filter(word => word.length > 2 && !commonWords.has(word) && !/^\d+$/.test(word)))];
};

// Simple synonym lookup
const synonymMap = {
  'modern': ['contemporary', 'sleek', 'minimalist'],
  'creative': ['artistic', 'innovative', 'original'],
  'professional': ['business', 'corporate', 'formal'],
};

const getSynonyms = (term) => synonymMap[term] || [];

// Helper function to calculate keyword match score
const calculateKeywordMatchScore = (keywords, templateTags = []) => {
  if (!keywords.length || !templateTags.length) return 0;
  
  const lowerKeywords = keywords.map(k => k.toLowerCase());
  const lowerTags = templateTags.map(t => t.toLowerCase());
  
  // Exact matches
  const exactMatches = lowerTags.filter(tag => 
    lowerKeywords.includes(tag)
  ).length;
  
  // Partial matches
  const partialMatches = lowerTags.filter(tag => 
    lowerKeywords.some(keyword => 
      tag.includes(keyword) || keyword.includes(tag))
  ).length - exactMatches;
  
  // Synonym matches
  const synonymMatches = lowerTags.filter(tag => {
    const synonyms = getSynonyms(tag);
    return synonyms.some(syn => lowerKeywords.includes(syn));
  }).length;
  
  return (exactMatches * 1.0) + (partialMatches * 0.6) + (synonymMatches * 0.3);
};

// Helper function to find matching templates
const findMatchingTemplates = async (keywords, sectionType, limit = 5) => {
  const query = {
    sectionType,
    $or: [
      { tags: { $in: keywords } },
      { name: { $regex: keywords.join('|'), $options: 'i' } }
    ]
  };
  return await Template.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);
};

const templateController = {
  // Create a new template
  createTemplate: async (req, res) => {
    try {
      const { name, sectionType, json, tags } = req.body;
      const finalTags = tags || extractKeywords(name);
      
      const newTemplate = new Template({
        name,
        sectionType,
        json,
        tags: finalTags
      });

      await newTemplate.save();
      
      res.status(201).json({
        success: true,
        data: newTemplate
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get all templates with optional filtering
  getTemplates: async (req, res) => {
    try {
      const { sectionType, tag, search } = req.query;
      const query = {};
      
      if (sectionType) query.sectionType = sectionType;
      if (tag) query.tags = tag;
      if (search) query.$text = { $search: search };
      
      const templates = await Template.find(query).sort({ createdAt: -1 });
      
      res.status(200).json({
        success: true,
        data: templates
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get a single template by ID
  getTemplate: async (req, res) => {
    try {
      const template = await Template.findById(req.params.id);
      
      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: template
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Update a template
  updateTemplate: async (req, res) => {
    try {
      const { name, json, tags } = req.body;
      
      const template = await Template.findByIdAndUpdate(
        req.params.id,
        { name, json, tags, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );
      
      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: template
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Delete a template
  deleteTemplate: async (req, res) => {
    try {
      const template = await Template.findByIdAndDelete(req.params.id);
      
      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Template deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Generate a complete webpage from sections
  generateWebpage: async (req, res) => {
    try {
      const { prompt, selectedSections } = req.body;
      const sectionOrder = ['header', 'about', 'features', 'testimonials', 'team', 'cta', 'contact', 'footer'];
      const keywords = extractKeywords(prompt);
      const allMatches = {};
      let finalSections = [];

      // Step 1: Get all possible matching templates grouped by keyword
      for (const keyword of keywords) {
        allMatches[keyword] = [];
        const sectionsToInclude = selectedSections && Object.keys(selectedSections).length > 0 
          ? Object.keys(selectedSections).filter(section => selectedSections[section] === true)
          : sectionOrder;

        for (const sectionType of sectionsToInclude) {
          const matchingTemplates = await Template.find({
            sectionType,
            $or: [
              { tags: { $regex: keyword, $options: 'i' } },
              { name: { $regex: keyword, $options: 'i' } }
            ]
          }).lean();

          if (matchingTemplates.length > 0) {
            allMatches[keyword].push({
              sectionType,
              templates: matchingTemplates
            });
          }
        }
      }

      // Step 2: Randomly select one keyword's matches for the final webpage
      const keywordsWithMatches = Object.keys(allMatches).filter(k => allMatches[k].length > 0);
      
      if (keywordsWithMatches.length > 0) {
        const selectedKeyword = keywordsWithMatches[Math.floor(Math.random() * keywordsWithMatches.length)];
        
        for (const sectionGroup of allMatches[selectedKeyword]) {
          if (sectionGroup.templates.length > 0) {
            const selectedTemplate = sectionGroup.templates[
              Math.floor(Math.random() * sectionGroup.templates.length)
            ];
            
            finalSections.push({
              sectionType: sectionGroup.sectionType,
              templateId: selectedTemplate._id,
              templateName: selectedTemplate.name,
              json: selectedTemplate.json,
              matchedKeyword: selectedKeyword
            });
          }
        }
      }

      // Fallback if no keyword matches found
      if (finalSections.length === 0) {
        const sectionsToInclude = selectedSections && Object.keys(selectedSections).length > 0 
          ? Object.keys(selectedSections).filter(section => selectedSections[section] === true)
          : sectionOrder;

        for (const sectionType of sectionsToInclude) {
          const defaultTemplates = await Template.find({ sectionType }).limit(10).lean();
          if (defaultTemplates.length > 0) {
            const selectedTemplate = defaultTemplates[
              Math.floor(Math.random() * defaultTemplates.length)
            ];
            
            finalSections.push({
              sectionType,
              templateId: selectedTemplate._id,
              templateName: selectedTemplate.name,
              json: selectedTemplate.json,
              matchedKeyword: 'default'
            });
          }
        }
      }

      res.status(200).json({
        success: true,
        data: {
          webpageId: uuidv4(),
          sections: finalSections,
          promptUsed: prompt,
          keywordsExtracted: keywords,
          allPossibleMatches: allMatches
        }
      });
    } catch (error) {
      console.error('Error generating webpage:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate webpage',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Regenerate a specific section
  regenerateSection: async (req, res) => {
    try {
      const { webpageId, currentSections, sectionToRegenerate, prompt } = req.body
      
      // Find the section to regenerate in current sections
      const sectionIndex = currentSections.findIndex(
        section => section.sectionType === sectionToRegenerate
      );
      
      if (sectionIndex === -1) {
        return res.status(400).json({
          success: false,
          message: 'Section not found in current webpage'
        })
      }
      
      // Find alternative templates for this section
      const keywords = extractKeywords(prompt);
      const matchingTemplates = await findMatchingTemplates(keywords, sectionToRegenerate)
      
      if (matchingTemplates.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No alternative templates found for this section'
        });
      }
      
      // Select a different template (not the current one)
      const currentTemplateId = currentSections[sectionIndex].templateId;
      const newTemplate = matchingTemplates.find(
        t => t._id.toString() !== currentTemplateId.toString()
      ) || matchingTemplates[0];
      
      // Update the section
      const updatedSections = [...currentSections]
      updatedSections[sectionIndex] = {
        sectionType: sectionToRegenerate,
        templateId: newTemplate._id,
        json: newTemplate.json
      };
      
      res.status(200).json({
        success: true,
        data: {
          webpageId,
          sections: updatedSections,
          regeneratedSection: sectionToRegenerate
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Apply color palette to all sections
  applyColorPalette: async (req, res) => {
    try {
      const { sections, colors } = req.body
      
      if (!sections || !Array.isArray(sections) || !colors) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request data'
        })
      }
      
      // Process each section's JSON to apply colors
      const processedSections = sections.map(section => {
        const processedJson = JSON.parse(JSON.stringify(section.json))
        
        // This is a simplified example - actual implementation would need to 
        // traverse the Elementor JSON structure and update color values
        // based on your specific Elementor template structure
        
        // Example: Replace primary color
        const jsonString = JSON.stringify(processedJson);
        const updatedJsonString = jsonString.replace(/#3498db/g, colors.primary)
        // Add similar replacements for secondary, accent colors, etc.
        
        return {
          ...section,
          json: JSON.parse(updatedJsonString)
        };
      });
      
      res.status(200).json({
        success: true,
        data: {
          sections: processedSections,
          colorsApplied: colors
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Export complete webpage as single Elementor JSON
  exportWebpage: async (req, res) => {
    try {
      const { sections } = req.body
      
      if (!sections || !Array.isArray(sections)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid sections data'
        })
      }
      
      // Combine all sections into a single Elementor JSON structure
      // This is a simplified example - actual implementation depends on 
      // how Elementor expects combined templates to be structured
      
      const combinedJson = {
        // Elementor template metadata
        "version": "0.4",
        "title": "Generated Webpage",
        "type": "page",
        
        // Combine content from all sections
        "content": sections.reduce((acc, section) => {
          // Assuming each section's json has a "content" array
          if (section.json && section.json.content) {
            return [...acc, ...section.json.content];
          }
          return acc;
        }, [])
      };
      
      // Set filename with timestamp
      const filename = `elementor-template-${Date.now()}.json`;
      
      res.status(200)
        .attachment(filename)
        .json({
          success: true,
          data: combinedJson
        });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

const search = async (req, res) => {
  try {
    res.status(200).json(extractKeywords("This is a fairly new system"))
  } catch (error) {
    res.status(500).json("Internal Server error")
  }
}

module.exports = {templateController}