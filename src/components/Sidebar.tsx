import React from "react";
import {
  Box,
  Typography,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { TextFields, ArrowDropDownCircle } from "@mui/icons-material";
import TextFieldConfigurator from "./TextFieldConfigurator";
import DropdownFieldConfigurator from "./DropdownFieldConfigurator";
import {
  type Field,
  type TextField,
  type DropdownField,
  type TextFieldStyle,
  FieldType,
  type DropdownOption,
} from "../types/types";

interface SidebarProps {
  currentFieldType: FieldType;
  currentStyle: TextFieldStyle;
  currentPlaceholder: string;
  currentDropdownOptions: DropdownOption[];
  selectedField: Field | null;
  onFieldTypeChange: (fieldType: FieldType) => void;
  onStyleChange: (style: TextFieldStyle) => void;
  onPlaceholderChange: (placeholder: string) => void;
  onDropdownOptionsChange: (options: DropdownOption[]) => void;
  onAddField: () => void;
  onUpdateSelectedField: (updates: Partial<Field>) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentFieldType,
  currentStyle,
  currentPlaceholder,
  currentDropdownOptions,
  selectedField,
  onFieldTypeChange,
  onStyleChange,
  onPlaceholderChange,
  onDropdownOptionsChange,
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

        {!selectedField && (
          <>
            <Typography variant="subtitle2" gutterBottom>
              Select Field Type
            </Typography>
            <ToggleButtonGroup
              value={currentFieldType}
              exclusive
              onChange={(_, newType) => {
                if (newType !== null) {
                  onFieldTypeChange(newType);
                }
              }}
              aria-label="field type"
              fullWidth
              sx={{ marginBottom: 3 }}
            >
              <ToggleButton value={FieldType.TEXT} aria-label="text field">
                <TextFields sx={{ mr: 1 }} />
                Text
              </ToggleButton>
              <ToggleButton
                value={FieldType.DROPDOWN}
                aria-label="dropdown field"
              >
                <ArrowDropDownCircle sx={{ mr: 1 }} />
                Dropdown
              </ToggleButton>
            </ToggleButtonGroup>
            <Divider sx={{ marginBottom: 2 }} />
          </>
        )}

        {(currentFieldType === FieldType.TEXT ||
          selectedField?.type === FieldType.TEXT) && (
          <TextFieldConfigurator
            style={currentStyle}
            placeholder={currentPlaceholder}
            selectedField={
              selectedField?.type === FieldType.TEXT
                ? (selectedField as TextField)
                : null
            }
            onStyleChange={onStyleChange}
            onPlaceholderChange={onPlaceholderChange}
            onAddField={onAddField}
            onUpdateSelectedField={onUpdateSelectedField}
          />
        )}

        {(currentFieldType === FieldType.DROPDOWN ||
          selectedField?.type === FieldType.DROPDOWN) && (
          <DropdownFieldConfigurator
            style={currentStyle}
            placeholder={currentPlaceholder}
            options={currentDropdownOptions}
            selectedField={
              selectedField?.type === FieldType.DROPDOWN
                ? (selectedField as DropdownField)
                : null
            }
            onStyleChange={onStyleChange}
            onPlaceholderChange={onPlaceholderChange}
            onOptionsChange={onDropdownOptionsChange}
            onAddField={onAddField}
            onUpdateSelectedField={onUpdateSelectedField}
          />
        )}
      </Box>
    </Box>
  );
};

export default Sidebar;
