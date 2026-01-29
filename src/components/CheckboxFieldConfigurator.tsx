import React, { useEffect } from "react";
import {
  Box,
  TextField as MuiTextField,
  Button,
  Typography,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from "@mui/material";
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
} from "@mui/icons-material";
import { type CheckboxField, type TextFieldStyle } from "../types/types";

interface CheckboxFieldConfiguratorProps {
  style: TextFieldStyle;
  label: string;
  groupId?: string;
  selectedField: CheckboxField | null;
  onStyleChange: (style: TextFieldStyle) => void;
  onLabelChange: (label: string) => void;
  onGroupIdChange: (groupId: string) => void;
  onAddField: () => void;
  onUpdateSelectedField: (updates: Partial<CheckboxField>) => void;
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

const CheckboxFieldConfigurator: React.FC<CheckboxFieldConfiguratorProps> = ({
  style,
  label,
  groupId,
  selectedField,
  onStyleChange,
  onLabelChange,
  onGroupIdChange,
  onAddField,
  onUpdateSelectedField,
}) => {
  // Sync configurator with selected field
  useEffect(() => {
    if (selectedField) {
      onStyleChange(selectedField.style);
      onLabelChange(selectedField.label);
      onGroupIdChange(selectedField.groupId || "");
    }
  }, [selectedField?.id]);

  const handleFontFamilyChange = (event: any) => {
    const newStyle = { ...style, fontFamily: event.target.value };
    onStyleChange(newStyle);

    if (selectedField) {
      onUpdateSelectedField({ style: newStyle });
    }
  };

  const handleFontSizeChange = (event: any) => {
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

  const handleLabelChange = (value: string) => {
    onLabelChange(value);

    if (selectedField) {
      onUpdateSelectedField({ label: value });
    }
  };

  const handleGroupIdChange = (value: string) => {
    onGroupIdChange(value);

    if (selectedField) {
      onUpdateSelectedField({ groupId: value || undefined });
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
        Checkbox Field Configuration
      </Typography>

      {selectedField && (
        <Box
          sx={{
            padding: 1.5,
            backgroundColor: "#e8f5e8",
            borderRadius: 1,
            marginBottom: 2,
          }}
        >
          <Typography variant="caption" color="primary" fontWeight="bold">
            Editing Field #{selectedField.id}
          </Typography>
          {selectedField.groupId && (
            <Typography variant="caption" color="text.secondary">
              Group: {selectedField.groupId}
            </Typography>
          )}
        </Box>
      )}

      <Stack spacing={2}>
        <MuiTextField
          label="Checkbox Label"
          value={label}
          onChange={(e) => handleLabelChange(e.target.value)}
          fullWidth
          size="small"
          helperText={
            selectedField
              ? "Changes apply to selected field"
              : "Set default for new fields"
          }
        />

        <MuiTextField
          label="Group ID (optional)"
          value={groupId || ""}
          onChange={(e) => handleGroupIdChange(e.target.value)}
          fullWidth
          size="small"
          helperText="Group related checkboxes together"
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
          <Box sx={{ display: "flex", alignItems: "center", marginTop: 1 }}>
            <input type="checkbox" disabled style={{ marginRight: "8px" }} />
            <Typography
              sx={{
                fontFamily: style.fontFamily,
                fontSize: `${style.fontSize}px`,
                fontWeight: style.bold ? "bold" : "normal",
                fontStyle: style.italic ? "italic" : "normal",
                textDecoration: style.underline ? "underline" : "none",
                color: style.color,
              }}
            >
              {label || "Checkbox Label"}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={onAddField}
          fullWidth
          sx={{ marginTop: 2 }}
        >
          Add Checkbox Field to Document
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

export default CheckboxFieldConfigurator;
