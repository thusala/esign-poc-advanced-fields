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
  type TextFieldStyle,
  type DropdownOption,
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
    FieldType.TEXT,
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
    } else {
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
    let fieldId: number | null = null;

    if (activeId.startsWith("text-field-")) {
      fieldId = parseInt(activeId.replace("text-field-", ""));
    } else if (activeId.startsWith("dropdown-field-")) {
      fieldId = parseInt(activeId.replace("dropdown-field-", ""));
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
    (fieldId: number, value: string) => {
      setFields((prev) =>
        prev.map((f) => {
          if (f.id === fieldId) {
            if (f.type === FieldType.TEXT) {
              return { ...f, value } as TextField;
            } else if (f.type === FieldType.DROPDOWN) {
              return { ...f, selectedValue: value } as DropdownField;
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
              selectedField={selectedField}
              onFieldTypeChange={setCurrentFieldType}
              onStyleChange={setCurrentStyle}
              onPlaceholderChange={setCurrentPlaceholder}
              onDropdownOptionsChange={setCurrentDropdownOptions}
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
