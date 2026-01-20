import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import type { PageDimensions } from "../types/types";

// Configure PDF.js worker to use local file
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export const usePDFDocument = (pdfPath: string, zoomLevel: number = 1) => {
  const [pdfDocument, setPdfDocument] =
    useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const [pageDimensions, setPageDimensions] = useState<
    Map<number, PageDimensions>
  >(new Map());

  useEffect(() => {
    const loadPDF = async () => {
      try {
        setLoading(true);
        const loadingTask = pdfjsLib.getDocument(pdfPath);
        const pdf = await loadingTask.promise;
        setPdfDocument(pdf);
        setNumPages(pdf.numPages);

        // Get dimensions for all pages
        const dimensions = new Map<number, PageDimensions>();
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1 });
          dimensions.set(i, {
            width: viewport.width,
            height: viewport.height,
          });
        }
        setPageDimensions(dimensions);
        setLoading(false);
      } catch (error) {
        console.error("Error loading PDF:", error);
        setLoading(false);
      }
    };

    loadPDF();
  }, [pdfPath]);

  const renderPage = async (pageNumber: number, canvas: HTMLCanvasElement) => {
    if (!pdfDocument) return;

    try {
      const page = await pdfDocument.getPage(pageNumber);
      const viewport = page.getViewport({ scale: zoomLevel });

      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      canvasRefs.current.set(pageNumber, canvas);
    } catch (error) {
      console.error(`Error rendering page ${pageNumber}:`, error);
    }
  };

  const getPageDimensions = (
    pageNumber: number,
  ): PageDimensions | undefined => {
    return pageDimensions.get(pageNumber);
  };

  return {
    pdfDocument,
    numPages,
    currentPage,
    setCurrentPage,
    loading,
    renderPage,
    getPageDimensions,
    canvasRefs,
  };
};
