export type CompanySize = "15-35" | "36-60" | "61-95" | "96-200";

export interface User {
  id: string;
  name: string;
  email: string;
  companySize: CompanySize;
  createdAt: Date;
}

export interface Question {
  id: string;
  text: string;
  companySizeRanges: CompanySize[];
  type: "multiple_choice" | "scale"; // For MVP, we'll likely use a simple type
  options?: string[]; // For multiple_choice
  min?: number; // For scale
  max?: number; // For scale
  step?: number; // For scale
  order: number;
  affirmation?: string; // Brief affirmation after answering
}

export interface Answer {
  questionId: string;
  response: string | number;
}

export interface Report {
  mindsetShift: string;
  operationalFocus: string;
  nextMove: string;
  ctaType: "consult" | "join_list";
  fullReportText: string; // The full text-based report
}

export interface DiagnosticSession {
  sessionId: string;
  userId: string;
  startTime: Date;
  completionTime?: Date;
  answers: Answer[];
  report?: Report;
  reportSentEmail: boolean;
  createdAt: Date;
}

export interface DiagnosticContextType {
  user: User | null;
  diagnosticSession: DiagnosticSession | null;
  startDiagnostic: (name: string, email: string, companySize: CompanySize) => Promise<void>;
  updateAnswers: (newAnswer: Answer) => void;
  completeDiagnostic: () => Promise<Report | undefined>;
  resetDiagnostic: () => void;
}