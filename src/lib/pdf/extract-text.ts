import type { PdfExtraction, PdfPage, PdfTextItem } from "./types";

export const PDF_WORKER_SRC = "/pdf.worker.min.mjs";
export const MAX_PDF_BYTES = 15 * 1024 * 1024;
export const MAX_PDF_PAGES = 40;

export type PdfExtractionErrorCode =
  | "too-large"
  | "too-many-pages"
  | "no-text"
  | "invalid-pdf";

export class PdfExtractionError extends Error {
  constructor(
    readonly code: PdfExtractionErrorCode,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "PdfExtractionError";
  }
}

export async function extractPdf(file: File): Promise<PdfExtraction> {
  if (file.size > MAX_PDF_BYTES) {
    throw new PdfExtractionError(
      "too-large",
      "El PDF supera el tamaño máximo de 15 MB.",
    );
  }

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;

  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjs.getDocument({ data });
  let document;

  try {
    document = await loadingTask.promise;
  } catch (cause) {
    await loadingTask.destroy();
    throw new PdfExtractionError(
      "invalid-pdf",
      "No pudimos abrir el PDF. Verificá que el archivo no esté dañado.",
      { cause },
    );
  }

  try {
    if (document.numPages > MAX_PDF_PAGES) {
      throw new PdfExtractionError(
        "too-many-pages",
        "El PDF tiene demasiadas páginas. El máximo es 40.",
      );
    }

    const pages: PdfPage[] = [];
    let characterCount = 0;

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1 });
      const content = await page.getTextContent();
      const items: PdfTextItem[] = [];

      for (const item of content.items) {
        if (!("str" in item) || !item.str.trim()) {
          continue;
        }

        const [scaleX, , , , x, y] = item.transform;

        items.push({
          text: item.str,
          x,
          y,
          width: item.width,
          height: item.height,
          fontSize: Math.abs(scaleX) || item.height,
        });
        characterCount += item.str.trim().length;
      }

      pages.push({
        pageNumber,
        width: viewport.width,
        height: viewport.height,
        items,
      });
    }

    if (characterCount < 20) {
      throw new PdfExtractionError(
        "no-text",
        "El PDF no tiene texto seleccionable. Puede ser un archivo escaneado.",
      );
    }

    return {
      pageCount: document.numPages,
      pages,
    };
  } finally {
    await loadingTask.destroy();
  }
}
