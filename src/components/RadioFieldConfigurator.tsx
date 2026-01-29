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
  RadioButtonChecked,
} from "@mui/icons-material";
import { type RadioField, type TextFieldStyle, type RadioOption } from "../types/types";

interface RadioFieldConfiguratorProps {
  style: TextFieldStyle;
  question: string;
  options: RadioOption[];
  groupId: string;
  selectedField: RadioField | null;
  onStyleChange: (style: TextFieldStyle) => void;
  onQuestionChange: (question: string) => void;
  onOptionsChange: (options: RadioOption[]) => void;
  onGroupIdChange: (groupId: string) => void;
  onAddField: () => void;
  onUpdateSelectedField: (updates: Partial<RadioField>) => void;
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

const RadioFieldConfigurator: React.FC<RadioFieldConfiguratorProps> = ({
  style,
  question,
  options,
  groupId,
  selectedField,
  onStyleChange,
  onQuestionChange,
  onOptionsChange,
  onGroupIdChange,
  onAddField,
  onUpdateSelectedField,
}) => {
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [newOptionValue, setNewOptionValue] = useState("");

  // Sync configurator with selected field
  useEffect(() => {
    if (selectedField) {
      onStyleChange(selectedField.style);
      onQuestionChange(selectedField.question);
      onOptionsChange(selectedField.options);
      onGroupIdChange(selectedField.groupId);
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

  const handleQuestionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuestion = event.target.value;
    onQuestionChange(newQuestion);

    if (selectedField) {
      onUpdateSelectedField({ question: newQuestion });
    }
  };

  const handleGroupIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newGroupId = event.target.value;
    onGroupIdChange(newGroupId);

    if (selectedField) {
      onUpdateSelectedField({ groupId: newGroupId });
    }
  };

  const handleAddOption = () => {
    if (newOptionLabel.trim() && newOptionValue.trim()) {
      const newOption: RadioOption = {
        id: Date.now().toString(),
        label: newOptionLabel.trim(),
        value: newOptionValue.trim(),
        selected: false,
      };

      const updatedOptions = [...options, newOption];
      onOptionsChange(updatedOptions);

      if (selectedField) {
        onUpdateSelectedField({ options: updatedOptions });
      }

      setNewOptionLabel("");
      setNewOptionValue("");
    }
  };

  const handleDeleteOption = (optionId: string) => {
    const updatedOptions = options.filter((opt) => opt.id !== optionId);
    onOptionsChange(updatedOptions);

    if (selectedField) {
      onUpdateSelectedField({ options: updatedOptions });
    }
  };

  const handleUpdateOption = (optionId: string, label: string, value: string) => {
    const updatedOptions = options.map((opt) =>
      opt.id === optionId ? { ...opt, label, value } : opt
    );
    onOptionsChange(updatedOptions);

    if (selectedField) {
      onUpdateSelectedField({ options: updatedOptions });
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Radio Button Configuration
      </Typography>

      {/* Question */}
      <MuiTextField
        fullWidth
        label="Question"
        value={question}
        onChange={handleQuestionChange}
        margin="normal"
        variant="outlined"
      />

      {/* Group ID */}
      <MuiTextField
        fullWidth
        label="Group ID"
        value={groupId}
        onChange={handleGroupIdChange}
        margin="normal"
        variant="outlined"
        helperText="All radio buttons with the same Group ID belong to the same question"
      />

      <Divider sx={{ my: 2 }} />

      {/* Font Family */}
      <FormControl fullWidth margin="normal">
        <InputLabel>Font Family</InputLabel>
        <Select
          value={style.fontFamily}
          label="Font Family"
          onChange={handleFontFamilyChange}
        >
          {FONT_FAMILIES.map((font) => (
            <MenuItem key={font} value={font}>
              {font}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Font Size */}
      <FormControl fullWidth margin="normal">
        <InputLabel>Font Size</InputLabel>
        <Select
          value={style.fontSize}
          label="Font Size"
          onChange={handleFontSizeChange}
        >
          {FONT_SIZES.map((size) => (
            <MenuItem key={size} value={size}>
              {size}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Text Formatting */}
      <Box sx={{ my: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Formatting
        </Typography>
        <ToggleButtonGroup
          value={[
            ...(style.bold ? ["bold"] : []),
            ...(style.italic ? ["italic"] : []),
            ...(style.underline ? ["underline"] : []),
          ]}
          onChange={handleFormatChange}
          aria-label="text formatting"
        >
          <ToggleButton value="bold" aria-label="bold">
            <FormatBold />
          </ToggleButton>
          <ToggleButton value="italic" aria-label="italic">
            <FormatItalic />
          </ToggleButton>
          <ToggleButton value="underline" aria-label="underline">
            <FormatUnderlined />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Color Picker */}
      <Box sx={{ my: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Text Color
        </Typography>
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
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Options Management */}
      <Typography variant="subtitle2" gutterBottom>
        Radio Options
      </Typography>

      <List dense>
        {options.map((option) => (
          <ListItem key={option.id} sx={{ px: 0, flexDirection: 'column', alignItems: 'flex-start' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
              <RadioButtonChecked sx={{ mr: 1, color: "action.disabled" }} />
              <Typography variant="body2" sx={{ flex: 1 }}>
                Option {options.indexOf(option) + 1}
              </Typography>
              <IconButton
                size="small"
                onClick={() => handleDeleteOption(option.id)}
                disabled={options.length <= 2}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
            <Box sx={{ width: '100%', pl: 4 }}>
              <MuiTextField
                fullWidth
                size="small"
                label="Label"
                value={option.label}
                onChange={(e) =>
                  handleUpdateOption(option.id, e.target.value, option.value)
                }
                placeholder="Option label"
                sx={{ mb: 1 }}
              />
              <MuiTextField
                fullWidth
                size="small"
                label="Value"
                value={option.value}
                onChange={(e) =>
                  handleUpdateOption(option.id, option.label, e.target.value)
                }
                placeholder="Option value"
              />
            </Box>
          </ListItem>
        ))}
      </List>

      {/* Add New Option */}
      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <MuiTextField
          size="small"
          label="Option Label"
          value={newOptionLabel}
          onChange={(e) => setNewOptionLabel(e.target.value)}
          sx={{ flex: 1 }}
        />
        <MuiTextField
          size="small"
          label="Option Value"
          value={newOptionValue}
          onChange={(e) => setNewOptionValue(e.target.value)}
          sx={{ flex: 1 }}
        />
        <Button
          variant="outlined"
          size="small"
          onClick={handleAddOption}
          disabled={!newOptionLabel.trim() || !newOptionValue.trim()}
          startIcon={<AddIcon />}
        >
          Add
        </Button>
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
        At least 2 options are required for radio buttons
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* Add Field Button */}
      {!selectedField && (
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={onAddField}
          disabled={options.length < 2 || !question.trim() || !groupId.trim()}
          sx={{ mt: 2 }}
        >
          Add Radio Button Group
        </Button>
      )}
    </Box>
  );
};

export default RadioFieldConfigurator;