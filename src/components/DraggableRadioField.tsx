import React, { useState, useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Box, IconButton } from "@mui/material";
import { RadioButtonChecked, Add } from "@mui/icons-material";
import { type RadioField, AppMode } from "../types/types";

interface DraggableRadioFieldProps {
  field: RadioField;
  zoomLevel: number;
  mode: AppMode;
  isSelected?: boolean;
  onSelect?: (fieldId: number) => void;
  onDelete?: (fieldId: number) => void;
  onUpdateValue?: (fieldId: number, value: string) => void;
  onAddOption?: (fieldId: number) => void;
  allFields?: RadioField[];
}

const DraggableRadioField: React.FC<DraggableRadioFieldProps> = ({
  field,
  zoomLevel,
  mode,
  isSelected = false,
  onSelect,
  onDelete,
  onUpdateValue,
  onAddOption,
  allFields = [],
}) => {
  return (
    <>
      {field.options.map((option, index) => (
        <DraggableRadioOption
          key={option.id}
          field={field}
          option={option}
          zoomLevel={zoomLevel}
          mode={mode}
          isSelected={isSelected}
          onSelect={onSelect}
          onUpdateValue={onUpdateValue}
          onAddOption={index === 0 && isSelected ? onAddOption : undefined}
          allFields={allFields}
        />
      ))}
    </>
  );
};

interface DraggableRadioOptionProps {
  field: RadioField;
  option: RadioField["options"][0];
  zoomLevel: number;
  mode: AppMode;
  isSelected?: boolean;
  onSelect?: (fieldId: number) => void;
  onUpdateValue?: (fieldId: number, value: string) => void;
  onAddOption?: (fieldId: number) => void;
  allFields?: RadioField[];
}

const DraggableRadioOption: React.FC<DraggableRadioOptionProps> = ({
  field,
  option,
  zoomLevel,
  mode,
  isSelected = false,
  onSelect,
  onUpdateValue,
  onAddOption,
  allFields = [],
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `radio-option-${field.id}-${option.id}`,
      disabled: mode === AppMode.SIGN,
    });

  // Find all radio fields in the same group
  const groupFields = useMemo(() => {
    return allFields.filter(
      (f) => f.groupId === field.groupId && f.page === field.page,
    );
  }, [allFields, field.groupId, field.page]);

  // Calculate group bounds for hover outline
  const groupBounds = useMemo(() => {
    if (!isHovered || groupFields.length === 0) return null;

    const allOptions = groupFields.flatMap((f) => f.options);
    if (allOptions.length === 0) return null;

    const minX = Math.min(...allOptions.map((o) => o.x || f.x));
    const minY = Math.min(...allOptions.map((o) => o.y || f.y));
    const maxX = Math.max(...allOptions.map((o) => (o.x || f.x) + 32)); // 32px width
    const maxY = Math.max(...allOptions.map((o) => (o.y || f.y) + 32)); // 32px height

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }, [groupFields, isHovered]);

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  const x = option.x || field.x;
  const y = option.y || field.y;

  return (
    <>
      {/* Group hover outline */}
      {groupBounds && (
        <Box
          sx={{
            position: "absolute",
            left: groupBounds.x * zoomLevel - 4,
            top: groupBounds.y * zoomLevel - 4,
            width: groupBounds.width * zoomLevel + 8,
            height: groupBounds.height * zoomLevel + 8,
            border: `2px dashed #2196f3`,
            borderRadius: 1,
            backgroundColor: "rgba(33, 150, 243, 0.1)",
            pointerEvents: "none",
            zIndex: 5,
          }}
        />
      )}

      <Box
        ref={setNodeRef}
        style={{
          ...style,
          position: "absolute",
          left: x * zoomLevel,
          top: y * zoomLevel,
          width: 32,
          height: 32,
          border: isSelected ? "2px solid blue" : "1px solid #ccc",
          backgroundColor:
            field.selectedValue === option.value ? "#e3f2fd" : "#fff",
          cursor: mode === AppMode.CREATE ? "grab" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        {...listeners}
        {...attributes}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          if (mode === AppMode.SIGN) {
            onUpdateValue?.(field.id, option.value);
          } else {
            onSelect?.(field.id);
          }
        }}
      >
        <RadioButtonChecked sx={{ fontSize: 20 }} />
        {onAddOption && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onAddOption(field.id);
            }}
            sx={{
              position: "absolute",
              top: -10,
              right: -10,
              backgroundColor: "white",
              border: "1px solid #ccc",
            }}
          >
            <Add sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>
    </>
  );
};

export default DraggableRadioField;
