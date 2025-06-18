import { useState, useEffect, useRef } from "react";
import AiLoader from "../AiLoader";
import axios from "axios";

function normalizeImageData(data) {
  if (Array.isArray(data)) {
    return data.map((item) => normalizeImageData(item));
  } else if (typeof data === "object" && data !== null) {
    if (
      "__dynamic__" in data ||
      (data.background_image && "id" in data.background_image) ||
      data.source === "library"
    )
      return data;
    const result = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key))
        result[key] = normalizeImageData(data[key]);
    }
    return result;
  }
  return data;
}

const transformTemplatesToWorkingFormat = (
  templatesBySectionType,
  suggestedOrder
) => {
  const finalContentArray = [];
  let sectionOrderToUse;
  let pageSettingsFromInput = null; // Variable to store page_settings from special section

  console.log(
    "[ProcessBlockResults] transformTemplatesToWorkingFormat. templatesBySectionType received:",
    templatesBySectionType ? "Exists" : "null/undefined"
  );

  if (templatesBySectionType?.reorderedGlobalSections?.length > 0) {
    console.log(
      "[ProcessBlockResults] Using reorderedGlobalSections. Count:",
      templatesBySectionType.reorderedGlobalSections.length
    );
    templatesBySectionType.reorderedGlobalSections.forEach(
      (section, sectionIdx) => {
        console.log(
          `[ProcessBlockResults] Processing reorderedGlobalSection ${sectionIdx}: Name: ${section?.name}, Type: ${section?.sectionType}`
        );

        // console.log(`[ProcessBlockResults]   Section JSON for reorderedGlobalSection ${sectionIdx}:`, section?.json ? JSON.parse(JSON.stringify(section.json)) : "No section.json");

        if (section?.json?.content && Array.isArray(section.json.content)) {
          // console.log(`[ProcessBlockResults]   Extracting content from reorderedGlobalSection ${sectionIdx}. Content items: ${section.json.content.length}`);
          finalContentArray.push(...normalizeImageData(section.json.content));

          // If this section IS our special "fullPageContentUpdate", grab its page_settings
          if (
            section.sectionType === "fullPageContentUpdate" &&
            section.json.page_settings
          ) {
            console.log(
              "[ProcessBlockResults]   Detected 'fullPageContentUpdate' section. Using its page_settings:",
              JSON.parse(JSON.stringify(section.json.page_settings))
            );
            pageSettingsFromInput = structuredClone(section.json.page_settings); // Deep clone
          }
        } else {
          console.warn(
            `[ProcessBlockResults] Skipping section in reorderedGlobalSections (idx ${sectionIdx}) due to invalid/empty section.json.content.`
          );
        }
      }
    );
  } else {
    console.log(
      "[ProcessBlockResults] No reorderedGlobalSections or empty. Using suggestedOrder/fallback for section iteration."
    );
    if (suggestedOrder?.length > 0) {
      sectionOrderToUse = suggestedOrder;
    } else {
      sectionOrderToUse = Object.keys(templatesBySectionType || {}).filter(
        (key) =>
          key !== "reorderedGlobalSections" &&
          key !== "reorderedSections" &&
          Array.isArray(templatesBySectionType[key]) &&
          [
            "full template",
            "header",
            "about",
            "cta",
            "features",
            "testimonials",
            "contact",
            "footer",
            "faq",
            "map",
            "breadcrumbs",
            "services",
            "conditions",
            "gallery",
            "before and afters",
            "form",
            "blog",
            "cards",
            "meet the team",
            "social feed",
            "mission and vision",
            "herospace",
            "herospace slider",
          ].includes(key.toLowerCase())
      );
    }
    sectionOrderToUse.forEach((sectionKey) => {
      const availableSectionsForType = templatesBySectionType?.[sectionKey];
      if (availableSectionsForType?.length > 0) {
        const chosenSectionObject =
          availableSectionsForType[
            Math.floor(Math.random() * availableSectionsForType.length)
          ];
        if (
          chosenSectionObject?.json?.content &&
          Array.isArray(chosenSectionObject.json.content)
        ) {
          finalContentArray.push(
            ...normalizeImageData(chosenSectionObject.json.content)
          );
          // If this chosen section also has page_settings, and it's the first one we process, consider using them.
          // This part of logic might need refinement if multiple sections could contribute page_settings.
          // For now, the primary source of page_settings_from_input is the "fullPageContentUpdate" section.
          if (
            !pageSettingsFromInput &&
            chosenSectionObject.json.page_settings
          ) {
            // pageSettingsFromInput = chosenSectionObject.json.page_settings;
          }
        }
      }
    });
  }

  if (finalContentArray.length === 0) {
    console.warn(
      "[ProcessBlockResults] Transformed content array is empty. Adding fallback."
    );
    finalContentArray.push({
      id: "fallback-empty-" + Date.now(),
      elType: "section",
      elements: [
        {
          id: "fallback-head-" + Date.now(),
          elType: "widget",
          widgetType: "heading",
          settings: {
            title: "Content could not be generated.",
            alignment: "center",
          },
        },
      ],
    });
  }
  return { content: finalContentArray, pageSettings: pageSettingsFromInput };
};

const ProcessBlockResults = ({
  templatesOrderedBySection,
  suggestedOrderProp,
  onPreview,
}) => {
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [error, setError] = useState(null);
  const hasSentRequest = useRef(false);

  useEffect(() => {
    hasSentRequest.current = false;
  }, [templatesOrderedBySection, suggestedOrderProp]);

  useEffect(() => {
    if (templatesOrderedBySection && !hasSentRequest.current && !loading) {
      hasSentRequest.current = true;
      sendToWordPress(templatesOrderedBySection, suggestedOrderProp);
    }
  }, [templatesOrderedBySection, suggestedOrderProp, loading, onPreview]);

  const sendToWordPress = async (
    rawTemplatesBySection,
    currentSuggestedOrder
  ) => {
    setLoading(true);
    setShowLoader(true);
    setError(null);
    console.log(
      "[ProcessBlockResults] sendToWordPress. Name on rawTemplates:",
      rawTemplatesBySection?.name
    );

    try {
      const { content: transformedContent, pageSettings: inputPageSettings } =
        transformTemplatesToWorkingFormat(
          rawTemplatesBySection,
          currentSuggestedOrder
        );

      const finalPageSettings = inputPageSettings || {
        external_header_footer: true,
        hide_title: true,
        page_layout: "elementor_canvas",
        ui_theme_style: "no",
      };
      console.log(
        "[ProcessBlockResults] Using finalPageSettings for WP API:",
        JSON.parse(JSON.stringify(finalPageSettings))
      );

      // Wrap stitched content as fullPageContentUpdate section
      const fullJsonStructure = {
        content: transformedContent,
        page_settings: finalPageSettings,
        version: "0.4",
        type: "wp-page",
      };
      console.log("fulljson structure", JSON.stringify(fullJsonStructure));
      const wrappedAsSingleSection = {
        _id: `fp-${Date.now()}`,
        name: rawTemplatesBySection?.name || "Generated Page",
        sectionType: "fullPageContentUpdate",
        json: fullJsonStructure,
      };
      console.log("wrapped as single section: ", JSON.stringify(wrappedAsSingleSection));
      const newRawTemplates = {
        ...rawTemplatesBySection,
        reorderedGlobalSections: [wrappedAsSingleSection],
      };
      console.log("New raw templates: ", JSON.stringify(newRawTemplates));
      const requestData = {
        name: newRawTemplates?.name,
        json: structuredClone(fullJsonStructure),
      };
      console.log("Actual data being sent to WP: ", JSON.stringify(requestData));

      console.log(
        "[ProcessBlockResults] Sending to WordPress. Name:",
        requestData.name,
        "Content items:",
        requestData.json.content.length
      );

      const response = await axios.post(
        `${import.meta.env.VITE_WP_IMPORT_API_URL}`,
        requestData
      );

      if (!response.data || !response.data.success) {
        throw new Error("Page creation failed. Invalid response from server. Here's the response: " + JSON.stringify(response.data));
      }

      if (!response.data?.public_url) {
        throw new Error(
          "No post URL from WP. Response: " + JSON.stringify(response.data)
        );
      }
      console.log(
        "[ProcessBlockResults] WP API success. URL:",
        response.data.public_url
      );

      const minimumLoadTime = 1500;
      const loadStartTime = Date.now();
      const checkAndProceed = () => {
        if (Date.now() - loadStartTime >= minimumLoadTime) {
           onPreview(response.data.public_url, {
            name: response.data.name || requestData.name,
            json: {
              ...fullJsonStructure,
              public_url: response.data.public_url,
              edit_url: response.data.edit_url,
            },
          });
          setShowLoader(false);
          setLoading(false);
        } else {
          setTimeout(
            checkAndProceed,
            minimumLoadTime - (Date.now() - loadStartTime)
          );
        }
      };
      checkAndProceed();
    } catch (err) {
      console.error("[ProcessBlockResults] Error in sendToWordPress:", err);
      setError(err.message || "Failed to import template.");
      setShowLoader(false);
      setLoading(false);
    }
  };

  if (showLoader || loading) {
    return (
      <AiLoader
        heading="Your page is being generated"
        subHeading="powered by Buildbot from Growth99"
      />
    );
  }
  if (error) {
    return (
      <div style={{ color: "red", padding: "20px", textAlign: "center" }}>
        <h4> Page Gen Error</h4>
        <p>{error}</p>
      </div>
    );
  }
  return null;
};
export default ProcessBlockResults;
