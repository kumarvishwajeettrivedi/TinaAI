"use client";

import React, { useState, useContext, ReactNode, useEffect } from "react";
import { Interview } from "@/types/interview";
import { InterviewService } from "@/services/interviews.service";
// import { useClerk, useOrganization } from "@clerk/nextjs"; // Removed - using dummy auth

interface InterviewContextProps {
  interviews: Interview[];
  setInterviews: React.Dispatch<React.SetStateAction<Interview[]>>;
  getInterviewById: (interviewId: string) => Interview | null | any;
  interviewsLoading: boolean;
  setInterviewsLoading: (interviewsLoading: boolean) => void;
  fetchInterviews: () => void;
}

export const InterviewContext = React.createContext<InterviewContextProps>({
  interviews: [],
  setInterviews: () => { },
  getInterviewById: () => null,
  setInterviewsLoading: () => undefined,
  interviewsLoading: false,
  fetchInterviews: () => { },
});

interface InterviewProviderProps {
  children: ReactNode;
}

export function InterviewProvider({ children }: InterviewProviderProps) {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  // Dummy user and organization - using localStorage
  const [userId, setUserId] = useState<string>("dummy-user-id");
  const [orgId, setOrgId] = useState<string>("dummy-org-id");
  const [interviewsLoading, setInterviewsLoading] = useState(false);

  useEffect(() => {
    // Set dummy IDs from localStorage or use defaults
    const email = localStorage.getItem("tinaai_user_email") || "demo@tinaai.com";
    setUserId(`user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`);
    setOrgId("org_tinaai_default");
  }, []);

  const fetchInterviews = async () => {
    try {
      setInterviewsLoading(true);
      const response = await InterviewService.getAllInterviews(
        userId as string,
        orgId as string,
      );
      setInterviewsLoading(false);
      setInterviews(response);
    } catch (error) {
      console.error(error);
    }
    setInterviewsLoading(false);
  };

  const getInterviewById = async (interviewId: string) => {
    const response = await InterviewService.getInterviewById(interviewId);

    return response;
  };

  useEffect(() => {
    if (orgId || userId) {
      fetchInterviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, userId]);

  return (
    <InterviewContext.Provider
      value={{
        interviews,
        setInterviews,
        getInterviewById,
        interviewsLoading,
        setInterviewsLoading,
        fetchInterviews,
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
}

export const useInterviews = () => {
  const value = useContext(InterviewContext);

  return value;
};
