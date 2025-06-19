const express = require("express")
const AiRouter = express.Router()
const AiController = require("../controllers/AiController")

AiRouter.route("/generate-section").post(AiController.AiController.generateSection);
AiRouter.route("/get-questions").get(AiController.AiController.getQuestions);





module.exports = AiRouter;
