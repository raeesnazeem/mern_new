const Template = require('../models/templateModel')
const {v4: uuidv4} = require('uuid')

// Helper function to extract keywords from text  - this will return an array of the words processed without common words
const extractKeywords = (text) => {
    if (!text) return []
    const words = text.toLowerCase().split(/\s+/); //splits the string into an array of substrings wherever it finds one or more whitespace characters.
    const commonWords = new Set(['the', 'and', 'or', 'a', 'an', 'in', 'on', 'at', 'for', 'to', 'of']) //filter out insignificant words from text processing.
    return [...new Set(words.filter(word => word.length > 2 && !commonWords.has(word)))]
  }

 // Helper function to find matching templates based on keywords
const findMatchingTemplates = async (keywords, sectionType) => {
    const query = {
      sectionType,
      tags: { $in: keywords }
    } 
    return await Template.find(query)
    .sort({ createdAt: -1 }) // Get most recent first
    .limit(5); // Limit results to prevent overload
}


const templateController = {
    // Create a new template
    createTemplate: async (req, res) => {
      try {
        const { name, sectionType, json, tags } = req.body
        
        // Auto-extract tags from name if not provided
        let finalTags = tags || extractKeywords(name)
        
        const newTemplate = new Template({
          name,
          sectionType,
          json,
          tags: finalTags
        })
  
        await newTemplate.save()
        
        res.status(201).json({
          success: true,
          data: newTemplate
        })
      } catch (error) {
        res.status(400).json({
          success: false,
          message: error.message
        })
      }
    },
  
    // Get all templates with optional filtering
    getTemplates: async (req, res) => {
      try {
        const { sectionType, tag, search } = req.query;
        const query = {}
        
        if (sectionType) query.sectionType = sectionType;
        if (tag) query.tags = tag;
        if (search) {
          query.$text = { $search: search }
        }
        
        const templates = await Template.find(query).sort({ createdAt: -1 })
        
        res.status(200).json({
          success: true,
          data: templates
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message
        })
      }
    },
  
    // Get a single template by ID
    getTemplate: async (req, res) => {
      try {
        const template = await Template.findById(req.params.id)
        
        if (!template) {
          return res.status(404).json({
            success: false,
            message: 'Template not found'
          })
        }
        
        res.status(200).json({
          success: true,
          data: template
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message
        })
      }
    },
  
    // Update a template
    updateTemplate: async (req, res) => {
      try {
        const { name, json, tags } = req.body
        
        const template = await Template.findByIdAndUpdate(
          req.params.id,
          { name, json, tags, updatedAt: Date.now() },
          { new: true, runValidators: true }
        )
        
        if (!template) {
          return res.status(404).json({
            success: false,
            message: 'Template not found'
          })
        }
        
        res.status(200).json({
          success: true,
          data: template
        })
      } catch (error) {
        res.status(400).json({
          success: false,
          message: error.message
        })
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
          })
        }
        
        res.status(200).json({
          success: true,
          message: 'Template deleted successfully'
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message
        })
      }
    },
  
    // Generate a complete webpage from sections
    generateWebpage: async (req, res) => {
      try {
        const { prompt, selectedSections } = req.body
        
        // Default section order (can be customized by client)
        const sectionOrder = [
          'header',
          'about',
          'features', // or 'services'
          'testimonials',
          'team',
          'cta',
          'contact',
          'footer'
        ]
        
        let finalSections = [];
        
        // If specific sections are selected, use those
        if (selectedSections && Object.keys(selectedSections).length > 0) {
          for (const sectionType of sectionOrder) {
            if (selectedSections[sectionType]) {
              const template = await Template.findById(selectedSections[sectionType])
              if (template) {
                finalSections.push({
                  sectionType,
                  templateId: template._id,
                  json: template.json
                });
              }
            }
          }
        } else {
          // Otherwise, find matching templates based on prompt keywords
          const keywords = extractKeywords(prompt)
          
          for (const sectionType of sectionOrder) {
            const matchingTemplates = await findMatchingTemplates(keywords, sectionType);
            
            if (matchingTemplates.length > 0) {
              // Select the best match (simple implementation - could be enhanced)
              const selectedTemplate = matchingTemplates[0]
              finalSections.push({
                sectionType,
                templateId: selectedTemplate._id,
                json: selectedTemplate.json
              });
            }
          }
        }
        
        // Generate a unique ID for this webpage configuration
        const webpageId = uuidv4()
        
        res.status(200).json({
          success: true,
          data: {
            webpageId,
            sections: finalSections,
            promptUsed: prompt
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message
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
        });
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
  };
    



const search = async (req, res) => {
    try{
        res.status(200).json(extractKeywords("This is a fairly new system"))
    } catch(error) {
        res.status(500).json("Internal Server error")
    }
}

module.exports = {templateController, search}