"use client";

import React, { createContext, useState, useContext, useCallback } from "react";
import { User, CompanySize, DiagnosticSession, Answer, Report, DiagnosticContextType } from "@/types/diagnostic";
import { api } from "../services/api";

const DiagnosticContext = createContext<DiagnosticContextType | undefined>(undefined);

export const DiagnosticProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [diagnosticSession, setDiagnosticSession] = useState<DiagnosticSession | null>(null);

  const startDiagnostic = useCallback(async (name: string, email: string, companySize: CompanySize) => {
    try {
      const data = await api.startDiagnostic(name, email, companySize);

      const newUser: User = {
        id: data.user_id,
        name,
        email,
        companySize,
        createdAt: new Date(),
      };
      setUser(newUser);

      const newSession: DiagnosticSession = {
        sessionId: data.session_id,
        userId: data.user_id,
        startTime: new Date(),
        answers: [],
        reportSentEmail: false,
        createdAt: new Date(),
      };
      setDiagnosticSession(newSession);
      console.log("TRACKING: Diagnostic Started", { userId: newUser.id, companySize });
    } catch (error) {
      console.error("Error starting diagnostic:", error);
      // Handle error appropriately (e.g., show toast)
    }
  }, []);

  const updateAnswers = useCallback((newAnswer: Answer) => {
    setDiagnosticSession((prevSession) => {
      if (!prevSession) return null;
      const existingAnswerIndex = prevSession.answers.findIndex(
        (ans) => ans.questionId === newAnswer.questionId
      );

      let updatedAnswers;
      if (existingAnswerIndex > -1) {
        updatedAnswers = prevSession.answers.map((ans, index) =>
          index === existingAnswerIndex ? newAnswer : ans
        );
      } else {
        updatedAnswers = [...prevSession.answers, newAnswer];
      }

      return {
        ...prevSession,
        answers: updatedAnswers,
      };
    });
  }, []);

  const completeDiagnostic = useCallback(async () => { // Changed to async and removed report param
    if (!diagnosticSession) return;

    try {
      const report = await api.completeDiagnostic(
        diagnosticSession.sessionId,
        diagnosticSession.answers,
        user?.email
      );

      setDiagnosticSession((prevSession) => {
        if (!prevSession) return null;
        const updatedSession = {
          ...prevSession,
          completionTime: new Date(),
          report,
          reportSentEmail: true,
        };
        console.log("TRACKING: Diagnostic Completed", { sessionId: updatedSession.sessionId, userId: updatedSession.userId });
        return updatedSession;
      });
      
      return report; // Return report so calling component can use it
    } catch (error) {
      console.error("Error completing diagnostic:", error);
    }
  }, [diagnosticSession]);

  const resetDiagnostic = useCallback(() => {
    setUser(null);
    setDiagnosticSession(null);
    console.log("TRACKING: Diagnostic Reset");
  }, []);

  const value: DiagnosticContextType = {
    user,
    diagnosticSession,
    startDiagnostic,
    updateAnswers,
    completeDiagnostic,
    resetDiagnostic,
  };

  return <DiagnosticContext.Provider value={value}>{children}</DiagnosticContext.Provider>;
};

export const useDiagnostic = () => {
  const context = useContext(DiagnosticContext);
  if (context === undefined) {
    throw new Error("useDiagnostic must be used within a DiagnosticProvider");
  }
  return context;
};