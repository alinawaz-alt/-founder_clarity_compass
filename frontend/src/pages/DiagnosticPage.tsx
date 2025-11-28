"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDiagnostic } from "@/context/DiagnosticContext";
import { mockQuestions } from "@/data/questions";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { showSuccess, showError } from "@/utils/toast";
import { Report } from "@/types/diagnostic"; // Import Report type

const DiagnosticPage = () => {
  const navigate = useNavigate();
  const { user, diagnosticSession, updateAnswers, completeDiagnostic, resetDiagnostic } = useDiagnostic();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  // Removed showAffirmation state as we'll use toasts directly

  useEffect(() => {
    if (!user || !diagnosticSession) {
      showError("Please start the diagnostic from the landing page.");
      navigate("/");
    }
  }, [user, diagnosticSession, navigate]);

  // Effect for tracking diagnostic drop-offs
  useEffect(() => {
    return () => {
      // This cleanup function runs when the component unmounts
      if (diagnosticSession && !diagnosticSession.completionTime) {
        console.log("TRACKING: Diagnostic Dropped Off", { sessionId: diagnosticSession.sessionId, userId: diagnosticSession.userId, currentQuestionIndex });
      }
    };
  }, [diagnosticSession, currentQuestionIndex]);


  const filteredQuestions = useMemo(() => {
    if (!user) return [];
    return mockQuestions
      .filter((q) => q.companySizeRanges.includes(user.companySize))
      .sort((a, b) => a.order - b.order);
  }, [user]);

  const currentQuestion = filteredQuestions[currentQuestionIndex];

  useEffect(() => {
    if (currentQuestion && diagnosticSession) {
      const existingAnswer = diagnosticSession.answers.find(
        (ans) => ans.questionId === currentQuestion.id
      );
      setSelectedAnswer(existingAnswer ? existingAnswer.response : null);
    }
  }, [currentQuestion, diagnosticSession]);

  const handleNext = async () => {
    if (selectedAnswer === null) {
      showError("Please select an answer to proceed.");
      return;
    }

    if (currentQuestion) {
      updateAnswers({
        questionId: currentQuestion.id,
        response: selectedAnswer,
      });
    }

    if (currentQuestionIndex < filteredQuestions.length - 1) {
      // Show affirmation as a toast
      if (currentQuestion?.affirmation) {
        showSuccess(currentQuestion.affirmation);
      }
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
      }, 1500); // Delay for 1.5 seconds to allow toast to be read
    } else {
      // All questions answered, generate report
      showSuccess("Diagnostic complete! Generating your personalized report...");
      // Simulate AI logic mapping and report generation (FR-004)
      await completeDiagnostic();
      navigate("/report"); // Navigate to the report page
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setSelectedAnswer(null); // Reset selected answer when going back
    }
  };

  if (!user || !diagnosticSession || filteredQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Loading diagnostic or redirecting...</p>
      </div>
    );
  }

  // Removed the conditional rendering for the full-screen affirmation card

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <Card className="w-full max-w-md bg-gray-800 text-white border-gray-700">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            Diagnostic Question {currentQuestionIndex + 1} of {filteredQuestions.length}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-6 text-gray-200">{currentQuestion?.text}</p>
          {currentQuestion?.type === "multiple_choice" && currentQuestion.options && (
            <RadioGroup
              onValueChange={(value) => setSelectedAnswer(value)}
              value={selectedAnswer as string}
              className="space-y-4"
            >
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <RadioGroupItem
                    value={option}
                    id={`option-${index}`}
                    className="text-blue-400 border-gray-600 focus:ring-blue-500"
                  />
                  <Label htmlFor={`option-${index}`} className="text-gray-300 text-base">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
          {/* Add other question types (scale, text) here if needed in the future */}
        </CardContent>
        <CardFooter className="flex justify-between mt-6">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-blue-500 to-purple-700 hover:from-blue-600 hover:to-purple-800 text-white font-semibold py-2 px-4 rounded-md shadow-lg transform transition-all duration-300 hover:scale-105"
          >
            {currentQuestionIndex === filteredQuestions.length - 1 ? "Complete Diagnostic" : "Next"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DiagnosticPage;