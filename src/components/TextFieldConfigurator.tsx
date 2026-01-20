import type { SelectChangeEvent } from "@mui/material";
import React, { useEffect } from "react";
import {
  Box,
  TextField as MuiTextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Switch,
  FormControlLabel,
  Divider,
} from "@mui/material";
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
} from "@mui/icons-material";
import { type TextField, type TextFieldStyle } from "../types/types";

interface TextFieldConfiguratorProps {
  style: TextFieldStyle;
  placeholder: string;
  selectedField: TextField | null;
  onStyleChange: (style: TextFieldStyle) => void;
  onPlaceholderChange: (placeholder: string) => void;
  onAddField: () => void;
  onUpdateSelectedField: (updates: Partial<TextField>) => void;
}

const FONT_FAMILIES = [
  "Arial",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Verdana",
  "Helvetica",
  "Comic Sans MS",
  "Impact",
  "Roboto",
  "Open Sans",
];

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

const TextFieldConfigurator: React.FC<TextFieldConfiguratorProps> = ({
  style,
  placeholder,
  selectedField,
  onStyleChange,
  onPlaceholderChange,
  onAddField,
  onUpdateSelectedField,
}) => {
  // Sync configurator with selected field
  useEffect(() => {
    if (selectedField) {
      onStyleChange(selectedField.style);
      onPlaceholderChange(selectedField.placeholder);
    }
  }, [selectedField?.id]); // Only trigger when field selection changes

  const handleFontFamilyChange = (event: SelectChangeEvent) => {
    const newStyle = { ...style, fontFamily: event.target.value };
    onStyleChange(newStyle);

    if (selectedField) {
      onUpdateSelectedField({ style: newStyle });
    }
  };

  const handleFontSizeChange = (event: SelectChangeEvent<number>) => {
    const newStyle = { ...style, fontSize: Number(event.target.value) };
    onStyleChange(newStyle);

    if (selectedField) {
      onUpdateSelectedField({ style: newStyle });
    }
  };

  const handleFormatChange = (
    _: React.MouseEvent<HTMLElement>,
    newFormats: string[],
  ) => {
    const newStyle = {
      ...style,
      bold: newFormats.includes("bold"),
      italic: newFormats.includes("italic"),
      underline: newFormats.includes("underline"),
    };
    onStyleChange(newStyle);

    if (selectedField) {
      onUpdateSelectedField({ style: newStyle });
    }
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newStyle = { ...style, color: event.target.value };
    onStyleChange(newStyle);

    if (selectedField) {
      onUpdateSelectedField({ style: newStyle });
    }
  };

  const handlePlaceholderChange = (value: string) => {
    onPlaceholderChange(value);

    if (selectedField) {
      onUpdateSelectedField({ placeholder: value });
    }
  };

  const handleAutoResizeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (selectedField) {
      onUpdateSelectedField({ autoResize: event.target.checked });
    }
  };

  const getCurrentFormats = () => {
    const formats: string[] = [];
    if (style.bold) formats.push("bold");
    if (style.italic) formats.push("italic");
    if (style.underline) formats.push("underline");
    return formats;
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Text Field Configuration
      </Typography>

      {selectedField && (
        <Box
          sx={{
            padding: 1.5,
            backgroundColor: "#e3f2fd",
            borderRadius: 1,
            marginBottom: 2,
          }}
        >
          <Typography variant="caption" color="primary" fontWeight="bold">
            Editing Field #{selectedField.id}
          </Typography>
        </Box>
      )}

      <Stack spacing={2}>
        <MuiTextField
          label="Placeholder Text"
          value={placeholder}
          onChange={(e) => handlePlaceholderChange(e.target.value)}
          fullWidth
          size="small"
          helperText={
            selectedField
              ? "Changes apply to selected field"
              : "Set default for new fields"
          }
        />

        <FormControl fullWidth size="small">
          <InputLabel>Font Family</InputLabel>
          <Select
            value={style.fontFamily}
            label="Font Family"
            onChange={handleFontFamilyChange}
          >
            {FONT_FAMILIES.map((font) => (
              <MenuItem key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Font Size</InputLabel>
          <Select
            value={style.fontSize}
            label="Font Size"
            onChange={handleFontSizeChange}
          >
            {FONT_SIZES.map((size) => (
              <MenuItem key={size} value={size}>
                {size}px
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            gutterBottom
            display="block"
          >
            Text Formatting
          </Typography>
          <ToggleButtonGroup
            value={getCurrentFormats()}
            onChange={handleFormatChange}
            aria-label="text formatting"
            size="small"
            sx={{ width: "100%", display: "flex" }}
          >
            <ToggleButton value="bold" aria-label="bold" sx={{ flex: 1 }}>
              <FormatBold />
            </ToggleButton>
            <ToggleButton value="italic" aria-label="italic" sx={{ flex: 1 }}>
              <FormatItalic />
            </ToggleButton>
            <ToggleButton
              value="underline"
              aria-label="underline"
              sx={{ flex: 1 }}
            >
              <FormatUnderlined />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            gutterBottom
            display="block"
          >
            Text Color
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <input
              type="color"
              value={style.color}
              onChange={handleColorChange}
              style={{
                width: "50px",
                height: "40px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            />
            <Typography variant="body2">{style.color}</Typography>
          </Box>
        </Box>

        {selectedField && (
          <>
            <Divider sx={{ my: 1 }} />
            <FormControlLabel
              control={
                <Switch
                  checked={selectedField.autoResize || false}
                  onChange={handleAutoResizeChange}
                  size="small"
                />
              }
              label={
                <Typography variant="body2">
                  Auto-resize based on content
                </Typography>
              }
            />
          </>
        )}

        <Box
          sx={{
            padding: 2,
            backgroundColor: "#f5f5f5",
            borderRadius: 1,
            marginTop: 2,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            gutterBottom
            display="block"
          >
            Preview
          </Typography>
          <Typography
            sx={{
              fontFamily: style.fontFamily,
              fontSize: `${style.fontSize}px`,
              fontWeight: style.bold ? "bold" : "normal",
              fontStyle: style.italic ? "italic" : "normal",
              textDecoration: style.underline ? "underline" : "none",
              color: style.color,
              marginTop: 1,
            }}
          >
            {placeholder || "Sample Text"}
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={onAddField}
          fullWidth
          sx={{ marginTop: 2 }}
        >
          Add Text Field to Document
        </Button>

        {selectedField && (
          <Typography variant="caption" color="text.secondary" align="center">
            Field dimensions: {selectedField.width.toFixed(0)}px ×{" "}
            {selectedField.height.toFixed(0)}px
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default TextFieldConfigurator;
