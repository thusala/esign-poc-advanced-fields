import React, { useEffect, useRef } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Box } from "@mui/material";
import {
  type Field,
  AppMode,
  FieldType,
  type RadioField,
} from "../types/types";
import DraggableTextField from "./DraggableTextField";
import DraggableDropdownField from "./DraggableDropdownField";
import DraggableCheckboxField from "./DraggableCheckboxField";
import DraggableRadioField from "./DraggableRadioField";

interface PDFCanvasProps {
  pageNumber: number;
  zoomLevel: number;
  onRenderPage: (pageNumber: number, canvas: HTMLCanvasElement) => void;
  fields: Field[];
  mode: AppMode;
  selectedFieldId: number | null;
  onSelectField: (fieldId: number | null) => void;
  onDeleteField: (fieldId: number) => void;
  onUpdateFieldValue: (fieldId: number, value: string | boolean) => void;
  onUpdateFieldPosition: (fieldId: number, x: number, y: number) => void;
  onUpdateFieldSize: (fieldId: number, width: number, height: number) => void;
  onResetFieldToBase: (fieldId: number) => void;
  onAddOption?: (fieldId: number) => void;
  pageDimensions?: { width: number; height: number };
}

const PDFCanvas: React.FC<PDFCanvasProps> = ({
  pageNumber,
  zoomLevel,
  onRenderPage,
  fields,
  mode,
  selectedFieldId,
  onSelectField,
  onDeleteField,
  onUpdateFieldValue,
  onUpdateFieldPosition,
  onUpdateFieldSize,
  onResetFieldToBase,
  onAddOption,
  pageDimensions,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { setNodeRef } = useDroppable({
    id: `page-${pageNumber}`,
    data: { pageNumber },
  });

  useEffect(() => {
    if (canvasRef.current) {
      onRenderPage(pageNumber, canvasRef.current);
    }
  }, [pageNumber, zoomLevel, onRenderPage]);

  const pageFields = fields.filter((field) => field.page === pageNumber);

  const handleCanvasClick = () => {
    if (mode === AppMode.CREATE) {
      onSelectField(null);
    }
  };

  return (
    <Box
      ref={(node) => {
        containerRef.current = node;
        setNodeRef(node);
      }}
      sx={{
        position: "relative",
        marginBottom: 3,
        display: "inline-block",
        backgroundColor: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
      onClick={handleCanvasClick}
    >
      <canvas ref={canvasRef} style={{ display: "block" }} />

      {pageFields.map((field) => {
        if (field.type === FieldType.TEXT) {
          return (
            <DraggableTextField
              key={field.id}
              field={field}
              zoomLevel={zoomLevel}
              mode={mode}
              isSelected={selectedFieldId === field.id}
              onSelect={onSelectField}
              onDelete={onDeleteField}
              onUpdateValue={onUpdateFieldValue}
              onUpdatePosition={onUpdateFieldPosition}
              onUpdateSize={onUpdateFieldSize}
              onResetToBase={onResetFieldToBase}
              pageDimensions={pageDimensions}
            />
          );
        } else if (field.type === FieldType.DROPDOWN) {
          return (
            <DraggableDropdownField
              key={field.id}
              field={field}
              zoomLevel={zoomLevel}
              mode={mode}
              isSelected={selectedFieldId === field.id}
              onSelect={onSelectField}
              onDelete={onDeleteField}
              onUpdateValue={onUpdateFieldValue}
              pageDimensions={pageDimensions}
            />
          );
        } else if (field.type === FieldType.CHECKBOX) {
          return (
            <DraggableCheckboxField
              key={field.id}
              field={field}
              zoomLevel={zoomLevel}
              mode={mode}
              isSelected={selectedFieldId === field.id}
              onSelect={onSelectField}
              onDelete={onDeleteField}
              onUpdateValue={onUpdateFieldValue}
              pageDimensions={pageDimensions}
            />
          );
        } else if (field.type === FieldType.RADIO) {
          return (
            <DraggableRadioField
              key={field.id}
              field={field}
              zoomLevel={zoomLevel}
              mode={mode}
              isSelected={selectedFieldId === field.id}
              onSelect={onSelectField}
              onDelete={onDeleteField}
              onUpdateValue={onUpdateFieldValue}
              onAddOption={onAddOption}
              pageDimensions={pageDimensions}
              allFields={
                fields.filter((f) => f.type === FieldType.RADIO) as RadioField[]
              }
            />
          );
        }
        return null;
      })}
    </Box>
  );
};

export default PDFCanvas;
