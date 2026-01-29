import React, { useState, useCallback } from "react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
  Box,
  Button,
  ButtonGroup,
  Typography,
  AppBar,
  Toolbar,
} from "@mui/material";
import { usePDFDocument } from "./hooks/usePDFDocument";
import PDFCanvas from "./components/PDFCanvas";
import Sidebar from "./components/Sidebar";
import {
  type Field,
  type TextField,
  type DropdownField,
  type CheckboxField,
  type RadioField,
  type TextFieldStyle,
  type DropdownOption,
  type RadioOption,
  AppMode,
  FieldType,
  STANDARD_FIELD_SIZE,
} from "./types/types";

const PDF_PATH = "/sample.pdf";

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CREATE);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);
  const [nextFieldId, setNextFieldId] = useState(1);

  const [currentFieldType, setCurrentFieldType] = useState<FieldType>(
    FieldType.RADIO,
  );
  const [currentStyle, setCurrentStyle] = useState<TextFieldStyle>({
    fontFamily: "Arial",
    fontSize: 14,
    bold: false,
    italic: false,
    underline: false,
    color: "#000000",
  });
  const [currentPlaceholder, setCurrentPlaceholder] =
    useState("Enter text here");
  const [currentDropdownOptions, setCurrentDropdownOptions] = useState<
    DropdownOption[]
  >([
    { id: "1", label: "Option 1", value: "option1" },
    { id: "2", label: "Option 2", value: "option2" },
    { id: "3", label: "Option 3", value: "option3" },
  ]);
  const [currentCheckboxLabel, setCurrentCheckboxLabel] = useState("Checkbox");
  const [currentRadioQuestion, setCurrentRadioQuestion] =
    useState("Select an option");
  const [currentRadioOptions, setCurrentRadioOptions] = useState<RadioOption[]>(
    [
      { id: "1", label: "Option 1", value: "option1", selected: false },
      { id: "2", label: "Option 2", value: "option2", selected: false },
    ],
  );
  const [currentGroupId, setCurrentGroupId] = useState("");

  const { numPages, loading, renderPage, getPageDimensions } = usePDFDocument(
    PDF_PATH,
    zoomLevel,
  );

  const selectedField = fields.find((f) => f.id === selectedFieldId) || null;

  const handleAddField = useCallback(() => {
    const firstPageDimensions = getPageDimensions(1);
    if (!firstPageDimensions) return;

    let newField: Field;

    if (currentFieldType === FieldType.TEXT) {
      newField = {
        type: FieldType.TEXT,
        id: nextFieldId,
        x: 50,
        y: 50,
        width: STANDARD_FIELD_SIZE.width,
        height: STANDARD_FIELD_SIZE.height,
        page: 1,
        placeholder: currentPlaceholder,
        style: { ...currentStyle },
        value: "",
        autoResize: true,
        baseX: 50,
        baseY: 50,
        baseWidth: STANDARD_FIELD_SIZE.width,
        baseHeight: STANDARD_FIELD_SIZE.height,
        colorCodes: {
          background: "rgba(33, 150, 243, 0.1)",
          border: "#2196f3",
        },
      } as TextField;
    } else if (currentFieldType === FieldType.DROPDOWN) {
      newField = {
        type: FieldType.DROPDOWN,
        id: nextFieldId,
        x: 50,
        y: 50,
        width: STANDARD_FIELD_SIZE.width,
        height: STANDARD_FIELD_SIZE.height,
        page: 1,
        placeholder: currentPlaceholder,
        style: { ...currentStyle },
        options: [...currentDropdownOptions],
        selectedValue: "",
        baseX: 50,
        baseY: 50,
        baseWidth: STANDARD_FIELD_SIZE.width,
        baseHeight: STANDARD_FIELD_SIZE.height,
        colorCodes: {
          background: "rgba(156, 39, 176, 0.1)",
          border: "#9c27b0",
        },
      } as DropdownField;
    } else if (currentFieldType === FieldType.CHECKBOX) {
      newField = {
        type: FieldType.CHECKBOX,
        id: nextFieldId,
        x: 50,
        y: 50,
        width: STANDARD_FIELD_SIZE.width,
        height: STANDARD_FIELD_SIZE.height,
        page: 1,
        label: currentCheckboxLabel,
        style: { ...currentStyle },
        checked: false,
        groupId: currentGroupId || undefined,
        baseX: 50,
        baseY: 50,
        baseWidth: STANDARD_FIELD_SIZE.width,
        baseHeight: STANDARD_FIELD_SIZE.height,
        colorCodes: {
          background: "rgba(76, 175, 80, 0.1)",
          border: "#4caf50",
        },
      } as CheckboxField;
    } else if (currentFieldType === FieldType.RADIO) {
      // Calculate height based on number of options
      const optionHeight = currentStyle.fontSize + 8; // font size + padding
      const totalHeight = currentRadioOptions.length * optionHeight + 40; // options + question padding

      newField = {
        type: FieldType.RADIO,
        id: nextFieldId,
        x: 50,
        y: 50,
        width: STANDARD_FIELD_SIZE.width,
        height: Math.max(totalHeight, STANDARD_FIELD_SIZE.height),
        page: 1,
        question: currentRadioQuestion,
        style: { ...currentStyle },
        options: [...currentRadioOptions],
        selectedValue: "",
        groupId: currentGroupId || `radio-group-${nextFieldId}`,
        baseX: 50,
        baseY: 50,
        baseWidth: STANDARD_FIELD_SIZE.width,
        baseHeight: Math.max(totalHeight, STANDARD_FIELD_SIZE.height),
        colorCodes: {
          background: "rgba(255, 193, 7, 0.1)",
          border: "#ffc107",
        },
      } as RadioField;
    }

    setFields((prev) => [...prev, newField]);
    setNextFieldId((prev) => prev + 1);
    setSelectedFieldId(newField.id);
  }, [
    nextFieldId,
    currentFieldType,
    currentPlaceholder,
    currentStyle,
    currentDropdownOptions,
    currentCheckboxLabel,
    currentRadioQuestion,
    currentRadioOptions,
    currentGroupId,
    getPageDimensions,
  ]);

  const handleUpdateSelectedField = useCallback(
    (updates: Partial<Field>) => {
      if (!selectedFieldId) return;

      setFields((prev) =>
        prev.map((f) => {
          if (f.id === selectedFieldId) {
            const updatedField = { ...f, ...updates };

            let adjustedX = updatedField.x;
            let adjustedY = updatedField.y;

            // If position or size changed, check boundaries
            if (
              updates.width !== undefined ||
              updates.height !== undefined ||
              updates.x !== undefined ||
              updates.y !== undefined
            ) {
              const pageDims = getPageDimensions(f.page);
              if (pageDims) {
                const maxX = pageDims.width / zoomLevel - updatedField.width;
                const maxY = pageDims.height / zoomLevel - updatedField.height;

                adjustedX = Math.max(0, Math.min(updatedField.x, maxX));
                adjustedY = Math.max(0, Math.min(updatedField.y, maxY));
              }
            }

            // Update base size if style changes in create mode
            const baseWidth =
              updates.style && mode === AppMode.CREATE
                ? updatedField.width
                : updatedField.baseWidth;
            const baseHeight =
              updates.style && mode === AppMode.CREATE
                ? updatedField.height
                : updatedField.baseHeight;

            return {
              ...updatedField,
              x: adjustedX,
              y: adjustedY,
              baseWidth,
              baseHeight,
            } as Field;
          }
          return f;
        }),
      );
    },
    [selectedFieldId, getPageDimensions, zoomLevel, mode],
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id.toString();

    // Handle new field creation
    if (
      activeId === "new-text-field" ||
      activeId === "new-dropdown-field" ||
      activeId === "new-checkbox-field" ||
      activeId === "new-radio-field"
    ) {
      const pageNumber = over.data.current?.pageNumber;
      if (!pageNumber) return;

      const pageDimensions = getPageDimensions(pageNumber);
      if (!pageDimensions) return;

      let newField: Field;
      const id = nextFieldId;
      setNextFieldId((prev) => prev + 1);

      // Default position: center of the page
      const x =
        (pageDimensions.width / zoomLevel - STANDARD_FIELD_SIZE.width) / 2;
      const y =
        (pageDimensions.height / zoomLevel - STANDARD_FIELD_SIZE.height) / 2;

      if (activeId === "new-text-field") {
        newField = {
          id,
          type: FieldType.TEXT,
          x,
          y,
          width: STANDARD_FIELD_SIZE.width,
          height: STANDARD_FIELD_SIZE.height,
          page: pageNumber,
          style: currentStyle,
          placeholder: currentPlaceholder,
          value: "",
        };
      } else if (activeId === "new-dropdown-field") {
        newField = {
          id,
          type: FieldType.DROPDOWN,
          x,
          y,
          width: STANDARD_FIELD_SIZE.width,
          height: STANDARD_FIELD_SIZE.height,
          page: pageNumber,
          style: currentStyle,
          placeholder: currentPlaceholder,
          options: currentDropdownOptions,
          value: "",
        };
      } else if (activeId === "new-checkbox-field") {
        newField = {
          id,
          type: FieldType.CHECKBOX,
          x,
          y,
          width: STANDARD_FIELD_SIZE.width,
          height: STANDARD_FIELD_SIZE.height,
          page: pageNumber,
          style: currentStyle,
          label: currentCheckboxLabel,
          groupId: currentGroupId,
          checked: false,
        };
      } else if (activeId === "new-radio-field") {
        const optionsWithPositions = currentRadioOptions.map(
          (option, index) => ({
            ...option,
            x: x,
            y: y + index * 40, // Stack vertically with 40px gap
          }),
        );
        newField = {
          id,
          type: FieldType.RADIO,
          x,
          y,
          width: STANDARD_FIELD_SIZE.width,
          height: STANDARD_FIELD_SIZE.height,
          page: pageNumber,
          style: currentStyle,
          question: currentRadioQuestion,
          options: optionsWithPositions,
          groupId: currentGroupId,
          selectedValue: null,
        };
      } else {
        return;
      }

      setFields((prev) => [...prev, newField]);
      return;
    }

    // Handle radio option dragging
    if (activeId.startsWith("radio-option-")) {
      const parts = activeId.split("-");
      const fieldId = parseInt(parts[2]);
      const optionId = parts[3];
      const field = fields.find((f) => f.id === fieldId) as RadioField;
      if (!field) return;
      const option = field.options.find((o) => o.id === optionId);
      if (!option) return;
      const pageNumber = over.data.current?.pageNumber;
      if (!pageNumber) return;
      const pageDimensions = getPageDimensions(pageNumber);
      if (!pageDimensions) return;
      const delta = event.delta;
      const newX = (option.x || field.x) + delta.x / zoomLevel;
      const newY = (option.y || field.y) + delta.y / zoomLevel;
      setFields((prev) =>
        prev.map((f) =>
          f.id === fieldId && f.type === FieldType.RADIO
            ? {
                ...f,
                options: f.options.map((o) =>
                  o.id === optionId ? { ...o, x: newX, y: newY } : o,
                ),
              }
            : f,
        ),
      );
      return;
    }

    let fieldId: number | null = null;

    if (activeId.startsWith("text-field-")) {
      fieldId = parseInt(activeId.replace("text-field-", ""));
    } else if (activeId.startsWith("dropdown-field-")) {
      fieldId = parseInt(activeId.replace("dropdown-field-", ""));
    } else if (activeId.startsWith("checkbox-field-")) {
      fieldId = parseInt(activeId.replace("checkbox-field-", ""));
    } else if (activeId.startsWith("radio-field-")) {
      fieldId = parseInt(activeId.replace("radio-field-", ""));
    }

    if (fieldId === null) return;

    const pageNumber = over.data.current?.pageNumber;

    if (!pageNumber) return;

    const pageDimensions = getPageDimensions(pageNumber);
    if (!pageDimensions) return;

    const delta = event.delta;
    const field = fields.find((f) => f.id === fieldId);

    if (!field) return;

    let newX = field.x + delta.x / zoomLevel;
    let newY = field.y + delta.y / zoomLevel;

    // Constrain to page boundaries
    const maxX = pageDimensions.width / zoomLevel - field.width;
    const maxY = pageDimensions.height / zoomLevel - field.height;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    setFields((prev) =>
      prev.map((f) =>
        f.id === fieldId
          ? {
              ...f,
              x: newX,
              y: newY,
              page: pageNumber,
              // Update base position when dragged
              baseX: newX,
              baseY: newY,
            }
          : f,
      ),
    );
  };

  const handleSelectField = useCallback((fieldId: number | null) => {
    setSelectedFieldId(fieldId);
  }, []);

  const handleDeleteField = useCallback((fieldId: number) => {
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
    setSelectedFieldId(null);
  }, []);

  const handleUpdateFieldValue = useCallback(
    (fieldId: number, value: string | boolean) => {
      setFields((prev) =>
        prev.map((f) => {
          if (f.id === fieldId) {
            if (f.type === FieldType.TEXT) {
              return { ...f, value: value as string } as TextField;
            } else if (f.type === FieldType.DROPDOWN) {
              return { ...f, selectedValue: value as string } as DropdownField;
            } else if (f.type === FieldType.CHECKBOX) {
              return { ...f, checked: value as boolean } as CheckboxField;
            } else if (f.type === FieldType.RADIO) {
              // For radio buttons, update the selected field and deselect others in the same group
              const radioField = f as RadioField;
              return { ...f, selectedValue: value as string } as RadioField;
            }
          } else if (f.type === FieldType.RADIO) {
            // Check if this field is in the same group as the updated field
            const updatedField = prev.find((field) => field.id === fieldId);
            if (updatedField && updatedField.type === FieldType.RADIO) {
              const updatedRadioField = updatedField as RadioField;
              const currentRadioField = f as RadioField;
              if (
                currentRadioField.groupId === updatedRadioField.groupId &&
                currentRadioField.page === updatedRadioField.page
              ) {
                // Deselect other radio buttons in the same group
                return { ...f, selectedValue: "" } as RadioField;
              }
            }
          }
          return f;
        }),
      );
    },
    [],
  );

  const handleUpdateFieldPosition = useCallback(
    (fieldId: number, x: number, y: number) => {
      setFields((prev) =>
        prev.map((f) => {
          if (f.id === fieldId) {
            const pageDims = getPageDimensions(f.page);
            if (pageDims) {
              const maxX = pageDims.width / zoomLevel - f.width;
              const maxY = pageDims.height / zoomLevel - f.height;

              return {
                ...f,
                x: Math.max(0, Math.min(x, maxX)),
                y: Math.max(0, Math.min(y, maxY)),
              };
            }
          }
          return f;
        }),
      );
    },
    [getPageDimensions, zoomLevel],
  );

  const handleUpdateFieldSize = useCallback(
    (fieldId: number, width: number, height: number) => {
      setFields((prev) =>
        prev.map((f) => {
          if (f.id === fieldId) {
            const pageDims = getPageDimensions(f.page);
            if (pageDims) {
              // Check if new size would exceed boundaries
              const maxX = pageDims.width / zoomLevel - width;
              const maxY = pageDims.height / zoomLevel - height;

              let adjustedX = f.x;
              let adjustedY = f.y;

              // Adjust position if field would exceed boundaries
              if (f.x > maxX) {
                adjustedX = Math.max(0, maxX);
              }
              if (f.y > maxY) {
                adjustedY = Math.max(0, maxY);
              }

              return {
                ...f,
                width,
                height,
                x: adjustedX,
                y: adjustedY,
              };
            }
          }
          return f;
        }),
      );
    },
    [getPageDimensions, zoomLevel],
  );

  const handleResetFieldToBase = useCallback((fieldId: number) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id === fieldId) {
          const resetField = {
            ...f,
            x: f.baseX ?? f.x,
            y: f.baseY ?? f.y,
            width: f.baseWidth ?? STANDARD_FIELD_SIZE.width,
            height: f.baseHeight ?? STANDARD_FIELD_SIZE.height,
          };

          if (f.type === FieldType.TEXT) {
            return resetField as TextField;
          } else if (f.type === FieldType.DROPDOWN) {
            return resetField as DropdownField;
          }
        }
        return f;
      }),
    );
  }, []);

  const handleAddOption = useCallback((fieldId: number) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id === fieldId && f.type === FieldType.RADIO) {
          const radioField = f as RadioField;
          const newOptionId = `option-${Date.now()}`;
          const newOption: RadioOption = {
            id: newOptionId,
            label: `Option ${radioField.options.length + 1}`,
            value: `option${radioField.options.length + 1}`,
            x: radioField.x,
            y: radioField.y + radioField.options.length * 40,
          };
          return {
            ...radioField,
            options: [...radioField.options, newOption],
          };
        }
        return f;
      }),
    );
  }, []);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () =>
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    setSelectedFieldId(null);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography variant="h5">Loading PDF...</Typography>
      </Box>
    );
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              E-Signature Text Field POC
            </Typography>

            <ButtonGroup variant="outlined" sx={{ marginRight: 2 }}>
              <Button
                variant={mode === AppMode.CREATE ? "contained" : "outlined"}
                onClick={() => handleModeChange(AppMode.CREATE)}
                sx={{
                  color: mode === AppMode.CREATE ? "white" : "white",
                  borderColor: "white",
                  "&:hover": {
                    borderColor: "white",
                    backgroundColor:
                      mode === AppMode.CREATE
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Create Mode
              </Button>
              <Button
                variant={mode === AppMode.SIGN ? "contained" : "outlined"}
                onClick={() => handleModeChange(AppMode.SIGN)}
                sx={{
                  color: mode === AppMode.SIGN ? "white" : "white",
                  borderColor: "white",
                  "&:hover": {
                    borderColor: "white",
                    backgroundColor:
                      mode === AppMode.SIGN
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Sign Mode
              </Button>
            </ButtonGroup>

            <ButtonGroup
              variant="outlined"
              sx={{
                "& .MuiButton-root": {
                  color: "white",
                  borderColor: "white",
                  "&:hover": {
                    borderColor: "white",
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                },
              }}
            >
              <Button onClick={handleZoomOut}>-</Button>
              <Button onClick={handleResetZoom}>
                {Math.round(zoomLevel * 100)}%
              </Button>
              <Button onClick={handleZoomIn}>+</Button>
            </ButtonGroup>
          </Toolbar>
        </AppBar>

        <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {mode === AppMode.CREATE && (
            <Sidebar
              currentFieldType={currentFieldType}
              currentStyle={currentStyle}
              currentPlaceholder={currentPlaceholder}
              currentDropdownOptions={currentDropdownOptions}
              currentCheckboxLabel={currentCheckboxLabel}
              currentRadioQuestion={currentRadioQuestion}
              currentRadioOptions={currentRadioOptions}
              currentGroupId={currentGroupId}
              selectedField={selectedField}
              onFieldTypeChange={setCurrentFieldType}
              onStyleChange={setCurrentStyle}
              onPlaceholderChange={setCurrentPlaceholder}
              onDropdownOptionsChange={setCurrentDropdownOptions}
              onCheckboxLabelChange={setCurrentCheckboxLabel}
              onRadioQuestionChange={setCurrentRadioQuestion}
              onRadioOptionsChange={setCurrentRadioOptions}
              onGroupIdChange={setCurrentGroupId}
              onAddField={handleAddField}
              onUpdateSelectedField={handleUpdateSelectedField}
            />
          )}

          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              backgroundColor: "#525659",
              padding: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {Array.from({ length: numPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <PDFCanvas
                    key={pageNum}
                    pageNumber={pageNum}
                    zoomLevel={zoomLevel}
                    onRenderPage={renderPage}
                    fields={fields}
                    mode={mode}
                    selectedFieldId={selectedFieldId}
                    onSelectField={handleSelectField}
                    onDeleteField={handleDeleteField}
                    onUpdateFieldValue={handleUpdateFieldValue}
                    onUpdateFieldPosition={handleUpdateFieldPosition}
                    onUpdateFieldSize={handleUpdateFieldSize}
                    onResetFieldToBase={handleResetFieldToBase}
                    onAddOption={handleAddOption}
                    pageDimensions={getPageDimensions(pageNum)}
                  />
                ),
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </DndContext>
  );
};

export default App;
