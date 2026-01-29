import React, { useRef, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  Box,
  Paper,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { type CheckboxField, AppMode, FIELD_PADDING } from "../types/types";

interface DraggableCheckboxFieldProps {
  field: CheckboxField;
  zoomLevel: number;
  mode: AppMode;
  isSelected?: boolean;
  onSelect?: (fieldId: number) => void;
  onDelete?: (fieldId: number) => void;
  onUpdateValue?: (fieldId: number, value: string | boolean) => void;
  pageDimensions?: { width: number; height: number };
}

const DraggableCheckboxField: React.FC<DraggableCheckboxFieldProps> = ({
  field,
  zoomLevel,
  mode,
  isSelected = false,
  onSelect,
  onDelete,
  onUpdateValue,
  pageDimensions,
}) => {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [localChecked, setLocalChecked] = useState(field.checked || false);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `checkbox-field-${field.id}`,
    data: { fieldId: field.id, type: "checkbox" },
    disabled: mode === AppMode.SIGN,
  });

  const getFontStyle = (): React.CSSProperties => {
    return {
      fontFamily: field.style.fontFamily,
      fontSize: `${field.style.fontSize * zoomLevel}px`,
      fontWeight: field.style.bold ? "bold" : "normal",
      fontStyle: field.style.italic ? "italic" : "normal",
      textDecoration: field.style.underline ? "underline" : "none",
      color: field.style.color,
    };
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode === AppMode.CREATE) {
      onSelect?.(field.id);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setLocalChecked(checked);
    onUpdateValue?.(field.id, checked);
  };

  return (
    <Paper
      ref={(node) => {
        fieldRef.current = node;
        setNodeRef(node);
      }}
      {...(mode === AppMode.CREATE ? listeners : {})}
      {...(mode === AppMode.CREATE ? attributes : {})}
      elevation={mode === AppMode.CREATE ? 2 : 1}
      sx={{
        position: "absolute",
        left: field.x * zoomLevel,
        top: field.y * zoomLevel,
        width: field.width * zoomLevel,
        height: field.height * zoomLevel,
        backgroundColor:
          mode === AppMode.CREATE
            ? field.colorCodes?.background || "rgba(76, 175, 80, 0.1)"
            : "white",
        border: `${1.5 * zoomLevel}px ${isSelected ? "dashed" : "solid"} ${
          field.colorCodes?.border || "#4caf50"
        }`,
        cursor:
          mode === AppMode.CREATE
            ? isDragging
              ? "grabbing"
              : "grab"
            : "pointer",
        opacity: isDragging ? 0.5 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        boxSizing: "border-box",
        "&:hover":
          mode === AppMode.CREATE
            ? {
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }
            : {},
      }}
      onClick={handleClick}
    >
      {mode === AppMode.CREATE ? (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Checkbox
            checked={false}
            disabled
            sx={{ padding: 0, marginRight: 1 }}
          />
          <Typography
            sx={{
              ...getFontStyle(),
              opacity: 0.6,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: "normal",
            }}
          >
            {field.label}
          </Typography>
        </Box>
      ) : (
        <FormControlLabel
          control={
            <Checkbox
              checked={localChecked}
              onChange={handleCheckboxChange}
              sx={{ padding: 0 }}
            />
          }
          label={<Typography sx={getFontStyle()}>{field.label}</Typography>}
          sx={{ margin: 0 }}
        />
      )}

      {isSelected && mode === AppMode.CREATE && (
        <Box
          sx={{
            position: "absolute",
            top: -40 * zoomLevel,
            right: -40 * zoomLevel,
            width: 32 * zoomLevel,
            height: 32 * zoomLevel,
            borderRadius: "50%",
            backgroundColor: "#f44336",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            fontSize: `${20 * zoomLevel}px`,
            fontWeight: "bold",
            zIndex: 10,
            "&:hover": {
              backgroundColor: "#d32f2f",
            },
          }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(field.id);
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        >
          ×
        </Box>
      )}
    </Paper>
  );
};

export default DraggableCheckboxField;
