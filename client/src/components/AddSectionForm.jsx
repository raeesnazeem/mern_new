import React, { useState } from "react";
import axios from "axios";

// MUI Components
import {
  TextField,
  Select,
  MenuItem,
  Button,
  Typography,
  Box,
} from "@mui/material";

// Custom styles for layout only
import styles from "../styles/AddSectionForm.module.css";

const AddSectionForm = () => {
  const [name, setName] = useState("");
  const [sectionType, setSectionType] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isValidURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    if (isValidURL(url)) {
      setPreviewImage(url);
    } else {
      setPreviewImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !sectionType || !imageUrl) {
      setError("All fields are required.");
      return;
    }

    if (!isValidURL(imageUrl)) {
      setError("Invalid URL. Please enter a valid WordPress image URL.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_TO_SERVER_API_URL}/frame-builder/add-section-type-ss`,
        { name, sectionType, imageUrl }
      );

      console.log("Success:", response.data);
      setSuccessMessage("Screenshot added successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);

      // Reset form
      setName("");
      setSectionType("");
      setImageUrl("");
      setPreviewImage(null);
    } catch (err) {
      console.error("Error submitting form:", err.message);
      setError("Failed to save screenshot.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className={styles.formContainer}>
      <Typography variant="h6" gutterBottom>
        Add Section Screenshot
      </Typography>

      {/* Error Message */}
      {error && (
        <Typography color="error" align="center" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Success Message */}
      {successMessage && (
        <Typography color="success.main" align="center" sx={{ mb: 2 }}>
          {successMessage}
        </Typography>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Section Name */}
        <Box className={styles.formGroup}>
          <Typography variant="body2" gutterBottom>
            Section Name
          </Typography>
          <TextField
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Homepage Hero"
            variant="outlined"
            size="small"
            margin="dense"
            InputProps={{
              style: {
                borderRadius: 6,
                fontSize: "1rem",
              },
            }}
          />
        </Box>

        {/* Section Type */}
        <Box className={styles.formGroup}>
          <Typography variant="body2" gutterBottom>
            Section Type
          </Typography>
          <Select
            fullWidth
            value={sectionType}
            onChange={(e) => setSectionType(e.target.value)}
            displayEmpty
            inputProps={{ "aria-label": "Section Type" }}
            variant="outlined"
            size="small"
            margin="dense"
            sx={{
              borderRadius: 1.5,
              fontSize: "1rem",
            }}
          >
            <MenuItem value="" disabled>
              Choose a section type
            </MenuItem>
            <MenuItem value="Header">Header</MenuItem>
            <MenuItem value="Footer">Footer</MenuItem>
            <MenuItem value="Hero Section">Hero Section</MenuItem>
            <MenuItem value="Services">Services</MenuItem>
            <MenuItem value="Call To Action">Call To Action</MenuItem>
            <MenuItem value="Blog Carousel">Blog Carousel</MenuItem>
            <MenuItem value="Testimonial Feed">Testimonial Feed</MenuItem>
            <MenuItem value="Pricing">Pricing</MenuItem>
          </Select>
        </Box>

        {/* Image URL */}
        <Box className={styles.formGroup}>
          <Typography variant="body2" gutterBottom>
            Image URL (from WordPress)
          </Typography>
          <TextField
            fullWidth
            value={imageUrl}
            onChange={handleImageUrlChange}
            placeholder="https://your-wordpress-site.com/wp-content/uploads/... "
            variant="outlined"
            size="small"
            margin="dense"
            InputProps={{
              style: {
                borderRadius: 6,
                fontSize: "1rem",
              },
            }}
          />
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className={styles.previewImage}
            />
          )}
        </Box>

        {/* Submit Button */}
        <Button
          fullWidth
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{
            mt: 2,
            textTransform: "none",
            borderRadius: 2,
            padding: "0.75rem 1.5rem",
            fontWeight: 600,
            bgcolor: "#333", 
            color: "white",
            "&:hover": {
              bgcolor: "#92C0B199",
              color:"#000",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            },
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          {loading ? "Saving..." : "Add Screenshot"}
        </Button>
      </form>
    </Box>
  );
};

export default AddSectionForm;
