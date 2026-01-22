import React, { useRef, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Box, Paper, Typography, Menu, MenuItem } from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";
import { type DropdownField, AppMode, FIELD_PADDING } from "../types/types";

interface DraggableDropdownFieldProps {
  field: DropdownField;
  zoomLevel: number;
  mode: AppMode;
  isSelected?: boolean;
  onSelect?: (fieldId: number) => void;
  onDelete?: (fieldId: number) => void;
  onUpdateValue?: (fieldId: number, value: string) => void;
  pageDimensions?: { width: number; height: number };
}

const DraggableDropdownField: React.FC<DraggableDropdownFieldProps> = ({
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `dropdown-field-${field.id}`,
    data: { fieldId: field.id, type: "dropdown" },
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
    } else if (mode === AppMode.SIGN) {
      // Open dropdown menu in sign mode
      setAnchorEl(e.currentTarget as HTMLElement);
    }
  };

  const handleOptionSelect = (value: string) => {
    onUpdateValue?.(field.id, value);
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getDisplayValue = () => {
    if (field.selectedValue) {
      const selectedOption = field.options.find(
        (opt) => opt.value === field.selectedValue,
      );
      return selectedOption?.label || field.selectedValue;
    }
    return field.placeholder;
  };

  const isPlaceholder = !field.selectedValue;

  return (
    <>
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
              ? field.colorCodes?.background || "rgba(156, 39, 176, 0.1)"
              : "white",
          border: `${1.5 * zoomLevel}px ${isSelected ? "dashed" : "solid"} ${
            field.colorCodes?.border || "#9c27b0"
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
          justifyContent: "space-between",
          overflow: "hidden",
          boxSizing: "border-box",
          padding: `${FIELD_PADDING.vertical * zoomLevel}px ${FIELD_PADDING.horizontal * zoomLevel}px`,
          "&:hover":
            mode === AppMode.CREATE
              ? {
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }
              : {
                  backgroundColor: "#f5f5f5",
                },
        }}
        onClick={handleClick}
      >
        <Typography
          sx={{
            ...getFontStyle(),
            opacity: isPlaceholder ? 0.6 : 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            flex: 1,
            lineHeight: "normal",
          }}
        >
          {getDisplayValue()}
        </Typography>

        <KeyboardArrowDown
          sx={{
            fontSize: `${16 * zoomLevel}px`,
            color: field.colorCodes?.border || "#9c27b0",
            marginLeft: `${4 * zoomLevel}px`,
            flexShrink: 0,
          }}
        />

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

      {/* Dropdown Menu */}
      {mode === AppMode.SIGN && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          PaperProps={{
            sx: {
              minWidth: field.width * zoomLevel,
              maxHeight: 300,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            },
          }}
        >
          {field.options.length === 0 ? (
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                No options available
              </Typography>
            </MenuItem>
          ) : (
            field.options.map((option) => (
              <MenuItem
                key={option.id}
                onClick={() => handleOptionSelect(option.value)}
                selected={field.selectedValue === option.value}
                sx={{
                  ...getFontStyle(),
                  fontSize: `${field.style.fontSize}px`, // Use base font size for menu
                  "&.Mui-selected": {
                    backgroundColor: "rgba(156, 39, 176, 0.1)",
                    "&:hover": {
                      backgroundColor: "rgba(156, 39, 176, 0.2)",
                    },
                  },
                }}
              >
                {option.label}
              </MenuItem>
            ))
          )}
        </Menu>
      )}
    </>
  );
};

export default DraggableDropdownField;
