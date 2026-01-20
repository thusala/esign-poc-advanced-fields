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
  type TextField,
  type TextFieldStyle,
  AppMode,
  STANDARD_FIELD_SIZE,
} from "./types/types";

// Place your PDF in the public folder and update this path
const PDF_PATH = "/sample.pdf";

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CREATE);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [fields, setFields] = useState<TextField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);
  const [nextFieldId, setNextFieldId] = useState(1);

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

  const { numPages, loading, renderPage, getPageDimensions } = usePDFDocument(
    PDF_PATH,
    zoomLevel,
  );

  // Get selected field object
  const selectedField = fields.find((f) => f.id === selectedFieldId) || null;

  const handleAddField = useCallback(() => {
    const firstPageDimensions = getPageDimensions(1);
    if (!firstPageDimensions) return;

    const newField: TextField = {
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
      colorCodes: {
        background: "rgba(33, 150, 243, 0.1)",
        border: "#2196f3",
      },
    };

    setFields((prev) => [...prev, newField]);
    setNextFieldId((prev) => prev + 1);
    setSelectedFieldId(newField.id);
  }, [nextFieldId, currentPlaceholder, currentStyle, getPageDimensions]);

  const handleUpdateSelectedField = useCallback(
    (updates: Partial<TextField>) => {
      if (!selectedFieldId) return;

      setFields((prev) =>
        prev.map((f) => (f.id === selectedFieldId ? { ...f, ...updates } : f)),
      );
    },
    [selectedFieldId],
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const fieldId = parseInt(active.id.toString().replace("text-field-", ""));
    const pageNumber = over.data.current?.pageNumber;

    if (!pageNumber) return;

    const pageDimensions = getPageDimensions(pageNumber);
    if (!pageDimensions) return;

    const delta = event.delta;
    const field = fields.find((f) => f.id === fieldId);

    if (!field) return;

    const newX = field.x + delta.x / zoomLevel;
    const newY = field.y + delta.y / zoomLevel;

    setFields((prev) =>
      prev.map((f) =>
        f.id === fieldId
          ? {
              ...f,
              x: Math.max(0, newX),
              y: Math.max(0, newY),
              page: pageNumber,
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
        prev.map((f) => (f.id === fieldId ? { ...f, value } : f)),
      );
    },
    [],
  );

  const handleUpdateFieldPosition = useCallback(
    (fieldId: number, x: number, y: number) => {
      setFields((prev) =>
        prev.map((f) => (f.id === fieldId ? { ...f, x, y } : f)),
      );
    },
    [],
  );

  const handleUpdateFieldSize = useCallback(
    (fieldId: number, width: number, height: number) => {
      setFields((prev) =>
        prev.map((f) => (f.id === fieldId ? { ...f, width, height } : f)),
      );
    },
    [],
  );

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
              currentStyle={currentStyle}
              currentPlaceholder={currentPlaceholder}
              selectedField={selectedField}
              onStyleChange={setCurrentStyle}
              onPlaceholderChange={setCurrentPlaceholder}
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
