const express = require("express")
const tempRouter = express.Router()
const templateController = require("../controllers/templateController")

tempRouter.route("/make-template-prompt").get(templateController.templateController.makeTemplatesByPrompt)
tempRouter.route("/create-template").post(templateController.templateController.createTemplate)
tempRouter.route("/fetch-template").get(templateController.templateController.fetchAndDisplay)



module.exports = tempRouter
