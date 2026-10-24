import type { SubjectTerm } from "../study-plan/types";

export interface PdfTextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
}

export interface PdfPage {
  pageNumber: number;
  width: number;
  height: number;
  items: PdfTextItem[];
}

export interface PdfExtraction {
  pageCount: number;
  pages: PdfPage[];
}

export interface ParsedSubject {
  code: string;
  name: string;
  year: number;
  term?: SubjectTerm;
  prerequisiteCodes: string[];
  warnings: string[];
}

export interface ParsedStudyPlan {
  career: string;
  university: string;
  planYear?: number;
  subjects: ParsedSubject[];
  warnings: string[];
}
