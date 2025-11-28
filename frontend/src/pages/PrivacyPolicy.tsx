"use client";

import React from "react";
import { Link } from "react-router-dom";
import { MadeWithDyad } from "@/components/made-with-dyad";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="w-full max-w-3xl bg-gray-800 p-8 rounded-lg shadow-xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          Privacy Policy
        </h1>
        <div className="prose prose-invert text-gray-300 leading-relaxed space-y-4">
          <p>
            Welcome to the Founder Clarity Compass. Your privacy is important to us. This policy
            explains how we handle your data in this frontend-only application.
          </p>
          <h2 className="text-2xl font-semibold text-gray-100 mt-6 mb-3">
            Data Collection and Use
          </h2>
          <p>
            When you use the Founder Clarity Compass, we collect your name, email address, and
            company size. We also record your answers to the diagnostic questions. This information
            is used exclusively for:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-2">
            <li>Generating your personalized diagnostic report.</li>
            <li>Sending a copy of your report to the email address you provide.</li>
            <li>Internal learning and improving the diagnostic tool (through aggregated, anonymized data).</li>
          </ul>
          <h2 className="text-2xl font-semibold text-gray-100 mt-6 mb-3">
            Data Storage and Security
          </h2>
          <p>
            **Important:** This application is entirely frontend-based. This means all your
            personal data (name, email, company size, diagnostic answers, and generated report)
            is processed and stored **only within your browser's local session memory** while you are
            using the application.
          </p>
          <p>
            We do **not** store your personal data on any backend servers or databases. Once you
            close your browser tab or window, or reset the diagnostic, this data is cleared from
            your local session. The only exception is the email delivery, which is simulated
            in this MVP and would typically involve a secure, external email service in a production
            environment (which would have its own privacy policy).
          </p>
          <p>
            We do not share your personal data with any third parties.
          </p>
          <h2 className="text-2xl font-semibold text-gray-100 mt-6 mb-3">
            Your Choices and Rights
          </h2>
          <p>
            Since your data is processed locally in your browser, you control its retention by
            closing the application or resetting the diagnostic. If you have any concerns, please
            contact us.
          </p>
          <p className="text-sm text-gray-400 mt-8">
            This Privacy Policy is effective as of [Current Date] and may be updated periodically.
          </p>
        </div>
        <div className="text-center mt-8">
          <Link to="/" className="text-blue-400 hover:text-blue-300 underline text-lg">
            Return to Home
          </Link>
        </div>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default PrivacyPolicy;