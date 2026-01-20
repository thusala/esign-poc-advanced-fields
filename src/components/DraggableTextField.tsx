import React, { useRef, useState, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Box, Paper, Typography } from "@mui/material";
import {
  type TextField,
  AppMode,
  FIELD_PADDING,
  MIN_FIELD_SIZE,
} from "../types/types";

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
  onResetToBase?: (fieldId: number) => void;
  pageDimensions?: { width: number; height: number };
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
  onResetToBase,
  pageDimensions,
}) => {
  const fieldRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const measureRef = useRef<HTMLPreElement>(null);
  const [localValue, setLocalValue] = useState(field.value || "");

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `text-field-${field.id}`,
    data: { fieldId: field.id, type: "text" },
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
      width: "100%",
      border: "none",
      outline: "none",
      background: "transparent",
      padding: `${FIELD_PADDING.vertical * zoomLevel}px ${FIELD_PADDING.horizontal * zoomLevel}px`,
      resize: "none",
      overflow: "hidden",
      lineHeight: "1.4",
    };
  };

  // Calculate content size and adjust field size
  const calculateAndUpdateSize = (text: string) => {
    if (!measureRef.current || !field.autoResize || !pageDimensions) return;

    // If text is empty, reset to base size
    if (!text || text.trim() === "") {
      if (onResetToBase) {
        onResetToBase(field.id);
      }
      return;
    }

    // Set the text to measure
    measureRef.current.textContent = text;

    const rect = measureRef.current.getBoundingClientRect();
    const contentWidth = rect.width / zoomLevel;
    const contentHeight = rect.height / zoomLevel;

    // Add padding
    const totalHorizontalPadding = FIELD_PADDING.horizontal * 2;
    const totalVerticalPadding = FIELD_PADDING.vertical * 2;

    let newWidth = Math.ceil(contentWidth + totalHorizontalPadding);
    let newHeight = Math.ceil(contentHeight + totalVerticalPadding);

    // Apply minimum constraints (base size)
    newWidth = Math.max(MIN_FIELD_SIZE.width, newWidth);
    newHeight = Math.max(MIN_FIELD_SIZE.height, newHeight);

    // Check if size changed significantly (more than 2px difference)
    if (
      Math.abs(newWidth - field.width) > 2 ||
      Math.abs(newHeight - field.height) > 2
    ) {
      // Check page boundaries
      const maxX = pageDimensions.width / zoomLevel - newWidth;
      const maxY = pageDimensions.height / zoomLevel - newHeight;

      let adjustedX = field.x;
      let adjustedY = field.y;

      // Adjust position if field exceeds boundaries
      if (field.x + newWidth > pageDimensions.width / zoomLevel) {
        adjustedX = Math.max(0, maxX);
      }
      if (field.y + newHeight > pageDimensions.height / zoomLevel) {
        adjustedY = Math.max(0, maxY);
      }

      // Update position if it changed
      if (adjustedX !== field.x || adjustedY !== field.y) {
        onUpdatePosition?.(field.id, adjustedX, adjustedY);
      }

      // Update size
      onUpdateSize?.(field.id, newWidth, newHeight);
    }
  };

  // Auto-resize when value changes in sign mode
  useEffect(() => {
    if (mode === AppMode.SIGN && field.autoResize) {
      calculateAndUpdateSize(localValue);
    }
  }, [localValue, mode, field.autoResize]);

  // Recalculate size when style changes in create mode
  useEffect(() => {
    if (mode === AppMode.CREATE) {
      calculateAndUpdateSize("");
    }
  }, [
    field.style.fontFamily,
    field.style.fontSize,
    field.style.bold,
    field.style.italic,
    field.style.underline,
    field.placeholder,
    mode,
  ]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onUpdateValue?.(field.id, newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow Shift+Enter for new line
    if (e.key === "Enter" && e.shiftKey) {
      // Let the default behavior happen (new line)
      return;
    }

    // Prevent default Enter (single line break)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode === AppMode.CREATE) {
      onSelect?.(field.id);
    }
  };

  // Auto-adjust textarea height
  useEffect(() => {
    if (textareaRef.current && mode === AppMode.SIGN) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [localValue, mode]);

  return (
    <>
      {/* Hidden measurement element for calculating text dimensions */}
      <pre
        ref={measureRef}
        style={{
          position: "absolute",
          visibility: "hidden",
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
          fontFamily: field.style.fontFamily,
          fontSize: `${field.style.fontSize * zoomLevel}px`,
          fontWeight: field.style.bold ? "bold" : "normal",
          fontStyle: field.style.italic ? "italic" : "normal",
          textDecoration: field.style.underline ? "underline" : "none",
          padding: `${FIELD_PADDING.vertical * zoomLevel}px ${FIELD_PADDING.horizontal * zoomLevel}px`,
          pointerEvents: "none",
          lineHeight: "1.4",
          margin: 0,
          border: "none",
          maxWidth: `${field.width * zoomLevel}px`,
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
          alignItems: mode === AppMode.SIGN ? "flex-start" : "center",
          overflow: "hidden",
          transition:
            mode === AppMode.SIGN && field.autoResize
              ? "width 0.15s ease-out, height 0.15s ease-out"
              : "none",
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
            {field.placeholder}
          </Typography>
        ) : (
          <textarea
            ref={textareaRef}
            value={localValue}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={field.placeholder}
            style={{
              ...getFontStyle(),
              minHeight: `${(field.baseHeight || MIN_FIELD_SIZE.height) * zoomLevel}px`,
              height: "auto",
            }}
            rows={1}
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
    </>
  );
};

export default DraggableTextField;
