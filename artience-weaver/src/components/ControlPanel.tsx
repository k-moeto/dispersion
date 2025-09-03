"use client";

import { Box, Slider, Typography } from "@mui/material";

const ControlPanel = () => {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 20,
        left: 20,
        width: 300,
        padding: "16px",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        borderRadius: "8px",
        color: "white",
        fontFamily: "monospace",
      }}
    >
      <Typography gutterBottom>Artience Weaver Controls</Typography>

      <Box mt={2}>
        <Typography id="molecular-weight-slider" gutterBottom>
          Molecular Weight
        </Typography>
        <Slider
          defaultValue={30}
          aria-labelledby="molecular-weight-slider"
          valueLabelDisplay="auto"
          sx={{ color: "#6699ff" }}
        />
      </Box>

      <Box mt={2}>
        <Typography id="cross-link-density-slider" gutterBottom>
          Cross-link Density
        </Typography>
        <Slider
          defaultValue={50}
          aria-labelledby="cross-link-density-slider"
          valueLabelDisplay="auto"
          sx={{ color: "#6699ff" }}
        />
      </Box>

      <Box mt={2}>
        <Typography id="cohesive-energy-slider" gutterBottom>
          Cohesive Energy
        </Typography>
        <Slider
          defaultValue={70}
          aria-labelledby="cohesive-energy-slider"
          valueLabelDisplay="auto"
          sx={{ color: "#6699ff" }}
        />
      </Box>
    </Box>
  );
};

export default ControlPanel;
