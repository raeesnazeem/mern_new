const axios = require("axios");
const puppeteer = require("puppeteer");
const sharp = require("sharp");

async function sendToWordPressAndTakeScreenshot(templateData) {
  try {
    const cleanedJson = prepareTemplateForImport(templateData.json);

    // Step 1: Send template to WordPress
    const wpResponse = await axios.post(
      process.env.WP_API_IMPORT_URL,
      {
        name: templateData.name,
        json: cleanedJson,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!wpResponse.data?.public_url) {
      throw new Error("No public URL returned from WordPress");
    }

    const pageUrl = wpResponse.data.public_url;
    console.log("📸 Taking screenshot of:", pageUrl);

    // Step 2: Launch Puppeteer browser
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    //render page at standard desktop resolution
    await page.setViewport({
      width: 1366,
      height: 768,
    });

    // Wait until DOM is loaded, max 10s
    await page.goto(pageUrl, {
      waitUntil: "domcontentloaded",
      timeout: 10000,
    });

    // Give an extra 2 seconds for animations to complete
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Optional: Wait for specific element - this is puppeteer specific
    try {
      await page.waitForSelector(".template-ready", { timeout: 5000 });
    } catch (err) {
      console.warn(
        "Element '.template-ready' not found, continuing anyway."
      );
    }

    // Step 3: Take screenshot
    const screenshotBuffer = await page.screenshot({
      fullPage: true,
      type: "png",
    });

    await browser.close();

    const finalImageBuffer = await sharp(screenshotBuffer)
      .resize({
        width: 1200, // A standard width for high-quality previews.
        fit: "inside", // Maintains aspect ratio.
        withoutEnlargement: true, // Prevents upscaling smaller screenshots.
      })
      .webp({
        quality: 80, // 75-90 is the ideal range.
        effort: 6, // Use maximum effort for the best compression ratio (0-6).
      })
      .toBuffer();

    console.log(
      `✅ Compressed image size: ${Math.round(
        finalImageBuffer.length / 1024
      )} KB`
    );

    // Step 5: Encode as Base64 for MongoDB
    return `data:image/webp;base64,${finalImageBuffer.toString("base64")}`;
  } catch (err) {
    console.error("Error in WordPress/screenshot step:", err.message);
    throw err;
  }
}

function prepareTemplateForImport(templateJson) {
  let parsedJson =
    typeof templateJson === "string" ? JSON.parse(templateJson) : templateJson;

  const normalizeImageData = (data) => {
    if (Array.isArray(data)) return data.map(normalizeImageData);
    if (typeof data !== "object" || data === null) return data;

    const isImage =
      "url" in data &&
      ("id" in data || (data.source && data.source === "library"));
    if (isImage) {
      const { id, ...rest } = data;
      return { ...rest, source: "external" };
    }

    const normalized = {};
    for (const key in data) {
      normalized[key] = normalizeImageData(data[key]);
    }
    return normalized;
  };

  const removeUnwantedSections = (elements) => {
    if (!Array.isArray(elements)) return elements;
    return elements
      .filter((el) => {
        const pageTitle = (el.title || "").toLowerCase();
        return !(
          pageTitle.includes("title") ||
          pageTitle.includes("header") ||
          pageTitle.includes("footer")
        );
      })
      .map((el) => ({
        ...el,
        elements: el.elements ? removeUnwantedSections(el.elements) : undefined,
      }));
  };

  const cleanedContent = removeUnwantedSections(
    normalizeImageData(parsedJson.content || parsedJson)
  );
  return {
    content: cleanedContent,
    page_settings: {
      external_header_footer: true,
      hide_title: true,
      page_layout: "full_width",
      ui_theme_style: "no",
    },
    version: "0.4",
    type: "wp-page",
  };
}

module.exports = { sendToWordPressAndTakeScreenshot };
