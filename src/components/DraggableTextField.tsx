import React, { useRef, useState, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Box, Paper, Typography } from "@mui/material";
import { type TextField, AppMode } from "../types/types";

interface DraggableTextFieldProps {
  field: TextField;
  zoomLevel: number;
  mode: AppMode;
  isSelected?: boolean;
  onSelect?: (fieldId: number) => void;
  onDelete?: (fieldId: number) => void;
  onUpdateValue?: (fieldId: number, value: string) => void;
  onUpdatePosition?: (fieldId: number, x: number, y: number) => void;
  onUpdateSize?: (fieldId: number, width: number, height: number) => void;
}

const DraggableTextField: React.FC<DraggableTextFieldProps> = ({
  field,
  zoomLevel,
  mode,
  isSelected = false,
  onSelect,
  onDelete,
  onUpdateValue,
  onUpdatePosition,
  onUpdateSize,
}) => {
  const fieldRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [localValue, setLocalValue] = useState(field.value || "");

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `text-field-${field.id}`,
    data: { fieldId: field.id, type: "text" },
    disabled: mode === AppMode.SIGN,
  });

  const getFontStyle = () => {
    const styles: React.CSSProperties = {
      fontFamily: field.style.fontFamily,
      fontSize: `${field.style.fontSize * zoomLevel}px`,
      fontWeight: field.style.bold ? "bold" : "normal",
      fontStyle: field.style.italic ? "italic" : "normal",
      textDecoration: field.style.underline ? "underline" : "none",
      color: field.style.color,
      width: "100%",
      border: "none",
      outline: "none",
      background: "transparent",
      padding: `${4 * zoomLevel}px ${8 * zoomLevel}px`,
    };
    return styles;
  };

  // Calculate content width and adjust field size
  const calculateContentSize = (text: string) => {
    if (!measureRef.current || !field.autoResize) return;

    measureRef.current.textContent = text || field.placeholder;
    const contentWidth = measureRef.current.offsetWidth;
    const contentHeight = measureRef.current.offsetHeight;

    // Add padding (16px total: 8px left + 8px right)
    const minWidth = 103;
    const minHeight = 27;
    const padding = 16;

    const newWidth = Math.max(minWidth, contentWidth + padding);
    const newHeight = Math.max(minHeight, contentHeight + 8); // 8px for vertical padding

    // Only update if size changed significantly (more than 5px difference)
    if (
      Math.abs(newWidth - field.width) > 5 ||
      Math.abs(newHeight - field.height) > 5
    ) {
      onUpdateSize?.(field.id, newWidth, newHeight);
    }
  };

  // Auto-resize when value changes
  useEffect(() => {
    if (mode === AppMode.SIGN && field.autoResize) {
      calculateContentSize(localValue);
    }
  }, [localValue, mode, field.autoResize]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onUpdateValue?.(field.id, newValue);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode === AppMode.CREATE) {
      onSelect?.(field.id);
    }
  };

  return (
    <>
      {/* Hidden measurement span for calculating text dimensions */}
      <span
        ref={measureRef}
        style={{
          position: "absolute",
          visibility: "hidden",
          whiteSpace: "nowrap",
          fontFamily: field.style.fontFamily,
          fontSize: `${field.style.fontSize * zoomLevel}px`,
          fontWeight: field.style.bold ? "bold" : "normal",
          fontStyle: field.style.italic ? "italic" : "normal",
          padding: `${4 * zoomLevel}px ${8 * zoomLevel}px`,
        }}
      />

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
              ? field.colorCodes?.background || "rgba(33, 150, 243, 0.1)"
              : "white",
          border: `${1.5 * zoomLevel}px ${isSelected ? "dashed" : "solid"} ${
            field.colorCodes?.border || "#2196f3"
          }`,
          cursor:
            mode === AppMode.CREATE
              ? isDragging
                ? "grabbing"
                : "grab"
              : "text",
          opacity: isDragging ? 0.5 : 1,
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          transition:
            mode === AppMode.SIGN && field.autoResize
              ? "width 0.2s ease, height 0.2s ease"
              : "none",
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
          <Typography
            sx={{
              ...getFontStyle(),
              opacity: 0.6,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {field.placeholder}
          </Typography>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={localValue}
            onChange={handleInputChange}
            placeholder={field.placeholder}
            style={getFontStyle()}
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
              "&:hover": {
                backgroundColor: "#d32f2f",
              },
            }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(field.id);
            }}
          >
            ×
          </Box>
        )}
      </Paper>
    </>
  );
};

export default DraggableTextField;
