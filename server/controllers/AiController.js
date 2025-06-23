require("dotenv").config();

const { InferenceClient } = require("@huggingface/inference"); //huggingface
const hf = new InferenceClient(process.env.HF_TOKEN);

const AiController = {
  generateSection: async (req, res) => {
    try {
      const { prompt: userPrompt } = req.body;
      if (!userPrompt) {
        return res.status(400).send({ error: "Prompt is required" });
      }

      console.log("Calling Hugging Face AI using the 'chatCompletion' task...");

      // The corrected function call is here:
      const aiResponse = await hf.chatCompletion({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: [
          {
            role: "system",
            content:
              "You are an expert Elementor JSON code generator. Your task is to generate a single, valid Elementor section JSON object based on the user's request. Provide ONLY the raw JSON object. Do not include any explanations, comments, or markdown code fences like ```json.",
          },
          { role: "user", content: userPrompt },
        ],
        parameters: {
          max_new_tokens: 2048,
          temperature: 0.5,
        },
      });

      console.log("AI Response Received.");

      // The response structure for chatCompletion is different. The message is in 'choices[0].message.content'.
      let generatedJsonString = aiResponse.choices[0].message.content;

      // The same cleanup logic as before
      const startIndex = generatedJsonString.indexOf("{");
      const endIndex = generatedJsonString.lastIndexOf("}");
      if (startIndex === -1 || endIndex === -1) {
        throw new Error("AI did not return a valid object structure.");
      }
      generatedJsonString = generatedJsonString.substring(
        startIndex,
        endIndex + 1
      );

      // The same validation logic
      try {
        const jsonObject = JSON.parse(generatedJsonString);
        res.send(jsonObject);
      } catch (jsonError) {
        console.error("Failed to parse AI response as JSON:", jsonError);
        res
          .status(500)
          .send({
            error: "AI did not return valid JSON.",
            aiResponse: generatedJsonString,
          });
      }
    } catch (error) {
      console.error("Error processing AI request:", error);
      res
        .status(500)
        .send({
          error: "An error occurred with the AI call.",
          details: error.message,
        });
    }
  },

  getQuestions: async (req, res) => {
     res.json(require('../utils/assets/questions.json'));
  }
};

module.exports = { AiController };
