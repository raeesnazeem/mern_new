const express = require("express");
const frameBuilderRouter = express.Router();
const frameController = require("../controllers/frameController");

// POST endpoint to add a screenshot by URL (no multer needed)
frameBuilderRouter.route("/add-section-type-ss").post(frameController.createSection);

// GET all screenshots, optionally filtered by sectionType
frameBuilderRouter.route("/get-all-sections").get(frameController.getAllSections);

module.exports = frameBuilderRouter;