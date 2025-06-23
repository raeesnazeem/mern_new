const express = require("express")
const EmailRouter = express.Router()
const EmailController = require("../controllers/EmailController")

EmailRouter.route("/send-email").post(EmailController.sendEmail);






module.exports = EmailRouter;
