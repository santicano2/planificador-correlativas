export type SubjectStatus =
  | "pending"
  | "in_progress"
  | "regularized"
  | "approved";

export type RequiredStatus = Extract<
  SubjectStatus,
  "regularized" | "approved"
>;

export type SubjectTerm = "1" | "2" | "annual";

export interface Subject {
  id: string;
  code?: string;
  name: string;
  year: number;
  term?: SubjectTerm;
  requiresRegularized: string[];
  requiresApproved: string[];
}

export interface StudyPlan {
  career: string;
  university: string;
  planYear?: number;
  subjects: Subject[];
}

export type StudyProgress = Record<string, SubjectStatus>;
