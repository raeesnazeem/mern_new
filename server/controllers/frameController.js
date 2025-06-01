const Screenshot = require("../models/frameBuilderModel");

// Add a new screenshot
exports.createSection = async (req, res) => {
  const { name, sectionType, imageUrl } = req.body;

  try {
    const newScreenshot = new Screenshot({
      name,
      sectionType,
      imageUrl,
    });

    const saved = await newScreenshot.save();
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    console.error("Error saving screenshot:", error.message);
    res.status(500).json({ success: false, message: "Failed to save screenshot" });
  }
};

// Get all screenshots
exports.getAllSections = async (req, res) => {
  try {
    console.log("Fetching all screenshots...");
    const screenshots = await Screenshot.find();
    console.log("Fetched screenshots:", screenshots.length);
    res.status(200).json({ success: true, data: screenshots });
  } catch (error) {
    console.error("Error fetching screenshots:", error.message || error);
    res.status(500).json({ success: false, message: "Failed to fetch screenshots" });
  }

};