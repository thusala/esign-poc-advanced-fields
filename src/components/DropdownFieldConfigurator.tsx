import React, { useState, useEffect } from "react";
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
  type SelectChangeEvent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { type DropdownField, type TextFieldStyle, type DropdownOption } from "../types/types";

interface DropdownFieldConfiguratorProps {
  style: TextFieldStyle;
  placeholder: string;
  options: DropdownOption[];
  selectedField: DropdownField | null;
  onStyleChange: (style: TextFieldStyle) => void;
  onPlaceholderChange: (placeholder: string) => void;
  onOptionsChange: (options: DropdownOption[]) => void;
  onAddField: () => void;
  onUpdateSelectedField: (updates: Partial<DropdownField>) => void;
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

const DropdownFieldConfigurator: React.FC<DropdownFieldConfiguratorProps> = ({
  style,
  placeholder,
  options,
  selectedField,
  onStyleChange,
  onPlaceholderChange,
  onOptionsChange,
  onAddField,
  onUpdateSelectedField,
}) => {
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [newOptionValue, setNewOptionValue] = useState("");

  // Sync configurator with selected field
  useEffect(() => {
    if (selectedField) {
      onStyleChange(selectedField.style);
      onPlaceholderChange(selectedField.placeholder);
      onOptionsChange(selectedField.options);
    }
  }, [selectedField?.id]);

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

  const handleAddOption = () => {
    if (!newOptionLabel.trim() || !newOptionValue.trim()) return;

    const newOption: DropdownOption = {
      id: `option-${Date.now()}-${Math.random()}`,
      label: newOptionLabel.trim(),
      value: newOptionValue.trim(),
    };

    const updatedOptions = [...options, newOption];
    onOptionsChange(updatedOptions);

    if (selectedField) {
      onUpdateSelectedField({ options: updatedOptions });
    }

    setNewOptionLabel("");
    setNewOptionValue("");
  };

  const handleDeleteOption = (optionId: string) => {
    const updatedOptions = options.filter((opt) => opt.id !== optionId);
    onOptionsChange(updatedOptions);

    if (selectedField) {
      onUpdateSelectedField({ options: updatedOptions });
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
        Dropdown Field Configuration
      </Typography>

      {selectedField && (
        <Box
          sx={{
            padding: 1.5,
            backgroundColor: "#f3e5f5",
            borderRadius: 1,
            marginBottom: 2,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: "#9c27b0" }}
            fontWeight="bold"
          >
            Editing Dropdown Field #{selectedField.id}
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

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" fontWeight="bold">
          Dropdown Options
        </Typography>

        {/* Option List */}
        {options.length > 0 && (
          <List
            dense
            sx={{
              bgcolor: "#f5f5f5",
              borderRadius: 1,
              maxHeight: 200,
              overflow: "auto",
            }}
          >
            {options.map((option, index) => (
              <ListItem
                key={option.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    size="small"
                    onClick={() => handleDeleteOption(option.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={option.label}
                  secondary={`Value: ${option.value}`}
                  primaryTypographyProps={{ variant: "body2" }}
                  secondaryTypographyProps={{ variant: "caption" }}
                />
              </ListItem>
            ))}
          </List>
        )}

        {/* Add New Option */}
        <Box
          sx={{
            bgcolor: "#fafafa",
            p: 2,
            borderRadius: 1,
            border: "1px solid #e0e0e0",
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            gutterBottom
            display="block"
          >
            Add New Option
          </Typography>
          <Stack spacing={1}>
            <MuiTextField
              label="Display Label"
              value={newOptionLabel}
              onChange={(e) => setNewOptionLabel(e.target.value)}
              fullWidth
              size="small"
              placeholder="e.g., Manager"
            />
            <MuiTextField
              label="Value"
              value={newOptionValue}
              onChange={(e) => setNewOptionValue(e.target.value)}
              fullWidth
              size="small"
              placeholder="e.g., manager"
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddOption}
              disabled={!newOptionLabel.trim() || !newOptionValue.trim()}
              fullWidth
            >
              Add Option
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" fontWeight="bold">
          Text Styling
        </Typography>

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
            {placeholder || "Dropdown"}
          </Typography>
          {options.length > 0 && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1 }}
            >
              Options: {options.map((o) => o.label).join(", ")}
            </Typography>
          )}
        </Box>

        <Button
          variant="contained"
          color="secondary"
          onClick={onAddField}
          fullWidth
          sx={{ marginTop: 2 }}
          disabled={options.length === 0}
        >
          Add Dropdown Field to Document
        </Button>

        {options.length === 0 && (
          <Typography variant="caption" color="error" align="center">
            Please add at least one option before adding the field
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default DropdownFieldConfigurator;
