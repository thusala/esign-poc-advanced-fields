export interface TextFieldStyle {
  fontFamily: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: string;
}

export interface RadioOption {
  id: string;
  label: string;
  value: string;
  selected?: boolean;
  x?: number;
  y?: number;
}

export interface CheckboxOption {
  id: string;
  label: string;
  checked?: boolean;
}

export interface BaseField {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  userId?: string;
  colorCodes?: {
    background: string;
    border: string;
  };
  baseX?: number;
  baseY?: number;
  baseWidth?: number;
  baseHeight?: number;
}

export interface TextField extends BaseField {
  type: "text";
  placeholder: string;
  style: TextFieldStyle;
  value?: string;
  autoResize?: boolean;
}

export interface DropdownField extends BaseField {
  type: "dropdown";
  placeholder: string;
  style: TextFieldStyle;
  options: DropdownOption[];
  selectedValue?: string;
}

export interface CheckboxField extends BaseField {
  type: "checkbox";
  label: string;
  style: TextFieldStyle;
  checked?: boolean;
  groupId?: string; // For grouping checkboxes
}

export interface RadioField extends BaseField {
  type: "radio";
  question: string;
  style: TextFieldStyle;
  options: RadioOption[];
  selectedValue?: string;
  groupId: string; // Required for grouping radio buttons
}

export type Field = TextField | DropdownField | CheckboxField | RadioField;

export enum AppMode {
  CREATE = "create",
  SIGN = "sign",
}

export enum FieldType {
  TEXT = "text",
  DROPDOWN = "dropdown",
  CHECKBOX = "checkbox",
  RADIO = "radio",
}

export interface PageDimensions {
  width: number;
  height: number;
}

// Standard field dimensions - base size for empty field
export const STANDARD_FIELD_SIZE = {
  width: 103,
  height: 27,
};

// Padding constants
export const FIELD_PADDING = {
  horizontal: 8,
  vertical: 4,
};

// Minimum field size to maintain usability
export const MIN_FIELD_SIZE = {
  width: 103,
  height: 27,
};
