"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { useDiagnostic } from "@/context/DiagnosticContext";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { showSuccess } from "@/utils/toast";
import { MadeWithDyad } from "@/components/made-with-dyad";

const ReportPage = () => {
  const navigate = useNavigate();
  const { user, diagnosticSession, resetDiagnostic } = useDiagnostic();

  if (!user || !diagnosticSession || !diagnosticSession.report) {
    // Redirect if no user or report data is available
    navigate("/");
    return null;
  }

  const report = diagnosticSession.report;

  const handleBookConsult = () => {
    console.log("TRACKING: CTA Clicked - Book a Consult", { userId: user.id, sessionId: diagnosticSession.sessionId });
    
    // Track the event
    api.trackEvent(diagnosticSession.sessionId, "cta_click", { label: "book_consultation" });

    showSuccess("Redirecting to booking page (simulated)...");
    // In a real app, this would redirect to a Calendly link or similar
    window.open("https://example.com/book-consult", "_blank"); // Placeholder
  };

  const handleJoinList = () => {
    console.log("TRACKING: CTA Clicked - Join Our List", { userId: user.id, sessionId: diagnosticSession.sessionId });

    // Track the event
    api.trackEvent(diagnosticSession.sessionId, "cta_click", { label: "join_list" });

    showSuccess("You've joined our exclusive insights list (simulated)! Check your email.");
    // In a real app, this would submit the email to a mailing list service
  };

  const handleStartNewDiagnostic = () => {
    resetDiagnostic();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <Card className="w-full max-w-2xl bg-gray-800 text-white border-gray-700 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            Your Personalized Report
          </CardTitle>
          <p className="text-gray-300 mt-2 text-lg">
            Insights for {user.name} at {user.companySize} employees
          </p>
        </CardHeader>
        <CardContent className="space-y-6 text-gray-200 text-base md:text-lg">
          <div className="bg-gray-700 p-4 rounded-md">
            <h3 className="font-semibold text-xl mb-2 text-blue-300">Mindset Shift:</h3>
            <p>{report.mindsetShift}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-md">
            <h3 className="font-semibold text-xl mb-2 text-purple-300">Operational Focus:</h3>
            <p>{report.operationalFocus}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-md">
            <h3 className="font-semibold text-xl mb-2 text-green-300">Your Next Move:</h3>
            <p>{report.nextMove}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-md">
            <h3 className="font-semibold text-xl mb-2 text-yellow-300">Full Report Summary:</h3>
            <p>{report.fullReportText}</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col md:flex-row justify-center gap-4 p-6">
          {report.ctaType === "consult" ? (
            <Button
              onClick={handleBookConsult}
              className="bg-gradient-to-r from-blue-500 to-purple-700 hover:from-blue-600 hover:to-purple-800 text-white font-semibold py-3 px-8 rounded-full text-lg w-full md:w-auto shadow-lg transform transition-all duration-300 hover:scale-105"
            >
              Book a Consult
            </Button>
          ) : (
            <Button
              onClick={handleJoinList}
              className="bg-gradient-to-r from-blue-500 to-purple-700 hover:from-blue-600 hover:to-purple-800 text-white font-semibold py-3 px-8 rounded-full text-lg w-full md:w-auto shadow-lg transform transition-all duration-300 hover:scale-105"
            >
              Join Our Exclusive List
            </Button>
          )}
          <Button
            onClick={handleStartNewDiagnostic}
            variant="ghost"
            className="text-blue-700 hover:text-blue-800 font-semibold py-3 px-8 rounded-full text-lg w-full md:w-auto"
          >
            Start New Diagnostic
          </Button>
        </CardFooter>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default ReportPage;