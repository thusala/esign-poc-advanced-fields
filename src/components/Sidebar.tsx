import React from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  Box,
  Typography,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  TextFields,
  ArrowDropDownCircle,
  CheckBox,
  RadioButtonChecked,
} from "@mui/icons-material";
import TextFieldConfigurator from "./TextFieldConfigurator";
import DropdownFieldConfigurator from "./DropdownFieldConfigurator";
import CheckboxFieldConfigurator from "./CheckboxFieldConfigurator";
import RadioFieldConfigurator from "./RadioFieldConfigurator";
import {
  type Field,
  type TextField,
  type DropdownField,
  type CheckboxField,
  type RadioField,
  type TextFieldStyle,
  FieldType,
  type DropdownOption,
  type RadioOption,
} from "../types/types";

interface DraggableFieldProps {
  id: string;
  icon: React.ReactNode;
  label: string;
}

const DraggableField: React.FC<DraggableFieldProps> = ({ id, icon, label }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      sx={{
        display: "flex",
        alignItems: "center",
        padding: 1,
        border: "1px solid #ddd",
        borderRadius: 1,
        cursor: "grab",
        backgroundColor: "#fff",
        "&:hover": {
          backgroundColor: "#f5f5f5",
        },
      }}
    >
      {icon}
      <Typography variant="body2" sx={{ ml: 1 }}>
        {label}
      </Typography>
    </Box>
  );
};

interface SidebarProps {
  currentFieldType: FieldType;
  currentStyle: TextFieldStyle;
  currentPlaceholder: string;
  currentDropdownOptions: DropdownOption[];
  currentCheckboxLabel: string;
  currentRadioQuestion: string;
  currentRadioOptions: RadioOption[];
  currentGroupId: string;
  selectedField: Field | null;
  onFieldTypeChange: (fieldType: FieldType) => void;
  onStyleChange: (style: TextFieldStyle) => void;
  onPlaceholderChange: (placeholder: string) => void;
  onDropdownOptionsChange: (options: DropdownOption[]) => void;
  onCheckboxLabelChange: (label: string) => void;
  onRadioQuestionChange: (question: string) => void;
  onRadioOptionsChange: (options: RadioOption[]) => void;
  onGroupIdChange: (groupId: string) => void;
  onAddField: () => void;
  onUpdateSelectedField: (updates: Partial<Field>) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentFieldType,
  currentStyle,
  currentPlaceholder,
  currentDropdownOptions,
  currentCheckboxLabel,
  currentRadioQuestion,
  currentRadioOptions,
  currentGroupId,
  selectedField,
  onFieldTypeChange,
  onStyleChange,
  onPlaceholderChange,
  onDropdownOptionsChange,
  onCheckboxLabelChange,
  onRadioQuestionChange,
  onRadioOptionsChange,
  onGroupIdChange,
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
              <ToggleButton value={FieldType.RADIO} aria-label="radio field">
                <RadioButtonChecked sx={{ mr: 1 }} />
                Radio
              </ToggleButton>
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
              <ToggleButton
                value={FieldType.CHECKBOX}
                aria-label="checkbox field"
              >
                <CheckBox sx={{ mr: 1 }} />
                Checkbox
              </ToggleButton>
            </ToggleButtonGroup>
            <Divider sx={{ marginBottom: 2 }} />
          </>
        )}

        <Typography variant="subtitle2" gutterBottom>
          Drag Fields to PDF
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            marginBottom: 2,
          }}
        >
          <DraggableField
            id="new-text-field"
            icon={<TextFields />}
            label="Text Field"
          />
          <DraggableField
            id="new-dropdown-field"
            icon={<ArrowDropDownCircle />}
            label="Dropdown Field"
          />
          <DraggableField
            id="new-checkbox-field"
            icon={<CheckBox />}
            label="Checkbox Field"
          />
          <DraggableField
            id="new-radio-field"
            icon={<RadioButtonChecked />}
            label="Radio Field"
          />
        </Box>
        <Divider sx={{ marginBottom: 2 }} />

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

        {(currentFieldType === FieldType.CHECKBOX ||
          selectedField?.type === FieldType.CHECKBOX) && (
          <CheckboxFieldConfigurator
            style={currentStyle}
            label={currentCheckboxLabel}
            groupId={currentGroupId}
            selectedField={
              selectedField?.type === FieldType.CHECKBOX
                ? (selectedField as CheckboxField)
                : null
            }
            onStyleChange={onStyleChange}
            onLabelChange={onCheckboxLabelChange}
            onGroupIdChange={onGroupIdChange}
            onAddField={onAddField}
            onUpdateSelectedField={onUpdateSelectedField}
          />
        )}

        {(currentFieldType === FieldType.RADIO ||
          selectedField?.type === FieldType.RADIO) && (
          <RadioFieldConfigurator
            style={currentStyle}
            question={currentRadioQuestion}
            options={currentRadioOptions}
            groupId={currentGroupId}
            selectedField={
              selectedField?.type === FieldType.RADIO
                ? (selectedField as RadioField)
                : null
            }
            onStyleChange={onStyleChange}
            onQuestionChange={onRadioQuestionChange}
            onOptionsChange={onRadioOptionsChange}
            onGroupIdChange={onGroupIdChange}
            onAddField={onAddField}
            onUpdateSelectedField={onUpdateSelectedField}
          />
        )}
      </Box>
    </Box>
  );
};

export default Sidebar;
