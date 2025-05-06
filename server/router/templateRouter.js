const express = require("express")
const tempRouter = express.Router()
const templateController = require("../controllers/templateController")

tempRouter.route("/search").get(templateController.templateController.findTemplatesByPrompt)



module.exports = tempRouter
