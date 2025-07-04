const express = require("express")
const tempRouter = express.Router()
const templateController = require("../controllers/templateController")

tempRouter.route("/make-template-prompt").post(templateController.templateController.makeTemplatesByPrompt)
tempRouter.route("/create-template").post(templateController.templateController.createTemplate)
tempRouter.route("/create-and-preview").post(templateController.templateController.createTemplateAndPreview)
tempRouter.route("/edit/:id").get(templateController.templateController.getTemplateForEdit)
tempRouter.route("/edit/:id").put(templateController.templateController.updateTemplate)
tempRouter.route("/delete/:id").delete(templateController.templateController.deleteTemplate)
tempRouter.route("/all").get(templateController.templateController.getAllTemplates)
tempRouter.route("/fetch-template").get(templateController.templateController.fetchAndDisplay)
tempRouter.route("/fetch-sections-by-type").post(templateController.templateController.fetchSectionsByType);



module.exports = tempRouter
