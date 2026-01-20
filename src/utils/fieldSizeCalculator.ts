import {
  type TextFieldStyle,
  STANDARD_FIELD_SIZE,
  FIELD_PADDING,
  MIN_FIELD_SIZE,
} from "../types/types";

export interface FieldSizeCalculation {
  width: number;
  height: number;
}

/**
 * Calculate field dimensions based on text content and styling
 */
export const calculateFieldSize = (
  text: string,
  style: TextFieldStyle,
  placeholder: string,
  zoomLevel: number = 1,
): FieldSizeCalculation => {
  // Create a temporary measurement element
  const measureElement = document.createElement("span");
  measureElement.style.position = "absolute";
  measureElement.style.visibility = "hidden";
  measureElement.style.whiteSpace = "nowrap";
  measureElement.style.fontFamily = style.fontFamily;
  measureElement.style.fontSize = `${style.fontSize}px`;
  measureElement.style.fontWeight = style.bold ? "bold" : "normal";
  measureElement.style.fontStyle = style.italic ? "italic" : "normal";
  measureElement.style.textDecoration = style.underline ? "underline" : "none";

  // Use text if available, otherwise use placeholder
  measureElement.textContent = text || placeholder;

  document.body.appendChild(measureElement);

  const rect = measureElement.getBoundingClientRect();
  const contentWidth = rect.width;
  const contentHeight = rect.height;

  document.body.removeChild(measureElement);

  // Calculate total width and height with padding
  const totalHorizontalPadding = FIELD_PADDING.horizontal * 2;
  const totalVerticalPadding = FIELD_PADDING.vertical * 2;

  let calculatedWidth = Math.ceil(contentWidth + totalHorizontalPadding);
  let calculatedHeight = Math.ceil(contentHeight + totalVerticalPadding);

  // Apply minimum size constraints
  calculatedWidth = Math.max(MIN_FIELD_SIZE.width, calculatedWidth);
  calculatedHeight = Math.max(MIN_FIELD_SIZE.height, calculatedHeight);

  // If no text, use standard size
  if (!text) {
    calculatedWidth = Math.max(STANDARD_FIELD_SIZE.width, calculatedWidth);
    calculatedHeight = Math.max(STANDARD_FIELD_SIZE.height, calculatedHeight);
  }

  return {
    width: calculatedWidth,
    height: calculatedHeight,
  };
};

/**
 * Calculate field size based on style changes (for create mode)
 */
export const calculateFieldSizeForStyle = (
  placeholder: string,
  style: TextFieldStyle,
): FieldSizeCalculation => {
  return calculateFieldSize("", style, placeholder, 1);
};

/**
 * Check if field position is within page boundaries
 */
export const constrainFieldToPage = (
  x: number,
  y: number,
  fieldWidth: number,
  fieldHeight: number,
  pageWidth: number,
  pageHeight: number,
  zoomLevel: number = 1,
): { x: number; y: number } => {
  const maxX = pageWidth / zoomLevel - fieldWidth;
  const maxY = pageHeight / zoomLevel - fieldHeight;

  const constrainedX = Math.max(0, Math.min(x, maxX));
  const constrainedY = Math.max(0, Math.min(y, maxY));

  return {
    x: constrainedX,
    y: constrainedY,
  };
};

/**
 * Adjust field position if it exceeds page boundaries after resize
 */
export const adjustFieldPositionAfterResize = (
  x: number,
  y: number,
  oldWidth: number,
  oldHeight: number,
  newWidth: number,
  newHeight: number,
  pageWidth: number,
  pageHeight: number,
  zoomLevel: number = 1,
): { x: number; y: number } => {
  let adjustedX = x;
  let adjustedY = y;

  const maxX = pageWidth / zoomLevel - newWidth;
  const maxY = pageHeight / zoomLevel - newHeight;

  // If field now exceeds right boundary, adjust x
  if (adjustedX + newWidth > pageWidth / zoomLevel) {
    adjustedX = Math.max(0, maxX);
  }

  // If field now exceeds bottom boundary, adjust y
  if (adjustedY + newHeight > pageHeight / zoomLevel) {
    adjustedY = Math.max(0, maxY);
  }

  return {
    x: adjustedX,
    y: adjustedY,
  };
};
