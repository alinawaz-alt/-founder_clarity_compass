import { Answer, CompanySize, Report } from "../types/diagnostic";

export const API_BASE_URL = "https://fcc-backend-4p6i.onrender.com";

interface StartDiagnosticResponse {
  session_id: string;
  user_id: string;
}

interface BackendReport {
  mindset_shift: string;
  operational_focus: string;
  next_move: string;
  cta_type: "consult" | "join_list";
  full_report_text: string;
}

export const api = {
  healthCheck: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/healthz`);
      return response.ok;
    } catch (error) {
      console.error("Health check failed:", error);
      return false;
    }
  },

  startDiagnostic: async (
    name: string,
    email: string,
    companySize: CompanySize
  ): Promise<StartDiagnosticResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/diagnostic/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        company_size: companySize,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to start diagnostic: ${response.statusText}`);
    }

    return response.json();
  },

  completeDiagnostic: async (
    sessionId: string,
    answers: Answer[],
    email?: string
  ): Promise<Report> => {
    // Map frontend answers to backend format
    const backendAnswers = answers.map((ans) => ({
      question_id: ans.questionId,
      response: ans.response,
    }));

    const response = await fetch(
      `${API_BASE_URL}/api/v1/diagnostic/${sessionId}/complete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: backendAnswers,
          email: email
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to complete diagnostic: ${response.statusText}`);
    }

    const data: BackendReport = await response.json();

    // Map backend report to frontend format
    return {
      mindsetShift: data.mindset_shift,
      operationalFocus: data.operational_focus,
      nextMove: data.next_move,
      ctaType: data.cta_type,
      fullReportText: data.full_report_text,
    };
  },

  trackEvent: async (
    sessionId: string,
    eventType: string,
    metadata: Record<string, any> = {}
  ): Promise<void> => {
    try {
      await fetch(`${API_BASE_URL}/api/v1/tracking/event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          event_type: eventType,
          metadata: metadata,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error("Failed to track event:", error);
      // We don't throw here to avoid blocking the UI flow for analytics errors
    }
  },
};