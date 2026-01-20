export interface TextFieldStyle {
  fontFamily: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: string;
}

export interface TextField {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  placeholder: string;
  style: TextFieldStyle;
  value?: string;
  userId?: string;
  colorCodes?: {
    background: string;
    border: string;
  };
  autoResize?: boolean; // New property to enable auto-resize
}

export enum AppMode {
  CREATE = "create",
  SIGN = "sign",
}

export interface PageDimensions {
  width: number;
  height: number;
}

// Standard field dimensions
export const STANDARD_FIELD_SIZE = {
  width: 103,
  height: 27,
};
