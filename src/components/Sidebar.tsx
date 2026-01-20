import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import TextFieldConfigurator from "./TextFieldConfigurator";
import { type TextField, type TextFieldStyle } from "../types/types";

interface SidebarProps {
  currentStyle: TextFieldStyle;
  currentPlaceholder: string;
  selectedField: TextField | null;
  onStyleChange: (style: TextFieldStyle) => void;
  onPlaceholderChange: (placeholder: string) => void;
  onAddField: () => void;
  onUpdateSelectedField: (updates: Partial<TextField>) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentStyle,
  currentPlaceholder,
  selectedField,
  onStyleChange,
  onPlaceholderChange,
  onAddField,
  onUpdateSelectedField,
}) => {
  return (
    <Box
      sx={{
        width: 320,
        borderRight: "1px solid #e0e0e0",
        height: "100vh",
        overflow: "auto",
        backgroundColor: "#fafafa",
      }}
    >
      <Box sx={{ padding: 2 }}>
        <Typography variant="h5" gutterBottom>
          Field Configuration
        </Typography>
        <Divider sx={{ marginBottom: 2 }} />

        <TextFieldConfigurator
          style={currentStyle}
          placeholder={currentPlaceholder}
          selectedField={selectedField}
          onStyleChange={onStyleChange}
          onPlaceholderChange={onPlaceholderChange}
          onAddField={onAddField}
          onUpdateSelectedField={onUpdateSelectedField}
        />
      </Box>
    </Box>
  );
};

export default Sidebar;
