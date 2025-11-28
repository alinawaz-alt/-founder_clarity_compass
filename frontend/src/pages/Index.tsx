"use client";

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import Link
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useDiagnostic } from "@/context/DiagnosticContext";
import { CompanySize } from "@/types/diagnostic";
import { showSuccess } from "@/utils/toast";

// Define the form schema using Zod
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  companySize: z.enum(["15-35", "36-60", "61-95", "96-200"], {
    required_error: "Please select your company size.",
  }),
});

const Index = () => {
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const { startDiagnostic, diagnosticSession, resetDiagnostic } = useDiagnostic();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset diagnostic session on mount to ensure fresh start
  useEffect(() => {
    resetDiagnostic();
  }, [resetDiagnostic]);

  // Navigate to diagnostic page only when session is initialized and we are submitting
  useEffect(() => {
    if (isSubmitting && diagnosticSession) {
      navigate("/diagnostic");
    }
  }, [diagnosticSession, isSubmitting, navigate]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      companySize: undefined, // Ensure it's undefined initially for the placeholder
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    await startDiagnostic(values.name, values.email, values.companySize as CompanySize);
    showSuccess("Your details have been saved. Starting diagnostic...");
    // Navigation is handled by useEffect when diagnosticSession is ready
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      {!showForm ? (
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            Founder Clarity Compass
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
            Founders at growth inflection points often feel stuck and overwhelmed. The Founder
            Clarity Compass is an AI-powered diagnostic that helps you gain instant clarity on
            your leadership mindset and operational blind spots. In less than 10 minutes, you’ll
            uncover your top mindset shift, operational focus, and a suggested next move.
          </p>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-700 hover:from-blue-600 hover:to-purple-800 text-white font-semibold py-3 px-8 rounded-full text-lg shadow-lg transform transition-all duration-300 hover:scale-105"
          >
            Start Your Diagnostic
          </Button>
          <p className="text-sm text-gray-500 mt-8">
            Insights are directional, not prescriptive. Your data is private and used respectfully.
          </p>
          <Link to="/privacy-policy" className="text-blue-400 hover:text-blue-300 underline text-sm mt-2 block">
            Read our Privacy Policy
          </Link>
        </div>
      ) : (
        <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-100">
            Tell Us About Yourself
          </h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Your Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john.doe@example.com"
                        {...field}
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companySize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Company Size</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:border-blue-500">
                          <SelectValue placeholder="Select your company size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-700 text-white border-gray-600">
                        <SelectItem value="15-35">15–35 employees</SelectItem>
                        <SelectItem value="36-60">36–60 employees</SelectItem>
                        <SelectItem value="61-95">61–95 employees</SelectItem>
                        <SelectItem value="96-200">96–200 employees</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-700 hover:from-blue-600 hover:to-purple-800 text-white font-semibold py-3 rounded-md text-lg shadow-lg transform transition-all duration-300 hover:scale-105"
              >
                Start Diagnostic
              </Button>
            </form>
          </Form>
          <p className="text-sm text-gray-500 mt-8 text-center">
            Your data is private and used respectfully for your report and internal learning.
          </p>
          <Link to="/privacy-policy" className="text-blue-400 hover:text-blue-300 underline text-sm mt-2 block text-center">
            Read our Privacy Policy
          </Link>
        </div>
      )}
      <MadeWithDyad />
    </div>
  );
};

export default Index;