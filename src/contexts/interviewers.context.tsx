"use client";

import React, { useState, useContext, ReactNode, useEffect } from "react";
import { Interviewer } from "@/types/interviewer";
import { InterviewerService } from "@/services/interviewers.service";
// import { useClerk } from "@clerk/nextjs"; // Removed - using dummy auth

interface InterviewerContextProps {
  interviewers: Interviewer[];
  setInterviewers: React.Dispatch<React.SetStateAction<Interviewer[]>>;
  createInterviewer: (payload: any) => void;
  interviewersLoading: boolean;
  setInterviewersLoading: (interviewersLoading: boolean) => void;
}

export const InterviewerContext = React.createContext<InterviewerContextProps>({
  interviewers: [],
  setInterviewers: () => { },
  createInterviewer: () => { },
  interviewersLoading: false,
  setInterviewersLoading: () => undefined,
});

interface InterviewerProviderProps {
  children: ReactNode;
}

export function InterviewerProvider({ children }: InterviewerProviderProps) {
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  // Dummy user
  const [userId, setUserId] = useState<string>("dummy-user-id");
  const [interviewersLoading, setInterviewersLoading] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem("tinaai_user_email") || "demo@tinaai.com";
    setUserId(`user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`);
  }, []);

  const fetchInterviewers = async () => {
    try {
      setInterviewersLoading(true);
      const response = await InterviewerService.getAllInterviewers(
        userId as string,
      );
      setInterviewers(response);
    } catch (error) {
      console.error(error);
    }
    setInterviewersLoading(false);
  };

  const createInterviewer = async (payload: any) => {
    await InterviewerService.createInterviewer({ ...payload });
    fetchInterviewers();
  };

  useEffect(() => {
    if (userId) {
      fetchInterviewers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <InterviewerContext.Provider
      value={{
        interviewers,
        setInterviewers,
        createInterviewer,
        interviewersLoading,
        setInterviewersLoading,
      }}
    >
      {children}
    </InterviewerContext.Provider>
  );
}

export const useInterviewers = () => {
  const value = useContext(InterviewerContext);

  return value;
};
