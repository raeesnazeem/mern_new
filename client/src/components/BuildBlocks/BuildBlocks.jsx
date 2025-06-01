import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextField, Box, Typography } from "@mui/material";
import ReactFlow from "reactflow";
import axios from 'axios';


const BuildBlocks = () => {
  const navigate = useNavigate();
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);


  
//handle prompt form submission
  const handleSubmit = async (prompt) => {
    setIsLoading(true)

    console.log("Sending prompt:", inputPrompt);


    try {
      // This returns a data object with keys allTemplates, templatesOrderedBySection, suggestedOrder and matchedConditions object
      const response = await axios.post(
        `${
          import.meta.env.VITE_TO_SERVER_API_URL
        }/template/make-template-prompt`,
        { prompt: inputPrompt }
      );


      // from the response data - Extract templatesOrderedBySection alone
      const templatesInOrder = response.data.data.templatesOrderedBySection;

      console.log("data is sent including section names: ", templatesInOrder)

      // console.log('These are the templates in order:', templatesInOrder);

      // /preview route renders TemplatePreview Component
      navigate("/intermediate-component", {
        state: { templatesOrderedBySection: templatesInOrder },
      });
    } catch (error) {
      console.error("Error:", error.message);
      console.error("Full error response:", error.response?.data); 
      alert("Failed to generate templates.");
    } finally {
      setIsLoading(false);
    }
    
  };

  return (
    <Box p={2}>
      <Typography variant="h5">Build Blocks</Typography>
      <TextField
        label="Enter Prompt"
        value={inputPrompt}
        onChange={(e) => setInputPrompt(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={!inputPrompt}
      >
        Process Prompt
      </Button>
    </Box>
  );
};

export default BuildBlocks;
