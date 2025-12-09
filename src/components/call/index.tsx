"use client";

import {
  ArrowUpRightSquareIcon,
  AlarmClockIcon,
  XCircleIcon,
  CheckCircleIcon,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useResponses } from "@/contexts/responses.context";
import Image from "next/image";
import axios from "axios";
import { MockWebClient } from "@/lib/mock-web-client";
import MiniLoader from "../loaders/mini-loader/miniLoader";
import { toast } from "sonner";
import { isLightColor, testEmail } from "@/lib/utils";
import { ResponseService } from "@/services/responses.service";
import { Interview } from "@/types/interview";
import { FeedbackData } from "@/types/response";
import { FeedbackService } from "@/services/feedback.service";
import { FeedbackForm } from "@/components/call/feedbackForm";
import {
  TabSwitchWarning,
  useTabSwitchPrevention,
} from "./tabSwitchPrevention";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { InterviewerService } from "@/services/interviewers.service";

const webClient = new MockWebClient();

type InterviewProps = {
  interview: Interview;
};

type registerCallResponseType = {
  data: {
    registerCallResponse: {
      call_id: string;
      access_token: string;
    };
  };
};

type transcriptType = {
  role: string;
  content: string;
};

function Call({ interview }: InterviewProps) {
  const { createResponse } = useResponses();
  const [lastInterviewerResponse, setLastInterviewerResponse] =
    useState<string>("");
  const [lastUserResponse, setLastUserResponse] = useState<string>("");
  const [activeTurn, setActiveTurn] = useState<string>("");
  const [Loading, setLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [isValidEmail, setIsValidEmail] = useState<boolean>(false);
  const [isOldUser, setIsOldUser] = useState<boolean>(false);
  const [callId, setCallId] = useState<string>("");
  const { tabSwitchCount } = useTabSwitchPrevention();
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [interviewerImg, setInterviewerImg] = useState("");
  const [interviewTimeDuration, setInterviewTimeDuration] =
    useState<string>("1");
  const [time, setTime] = useState(0);
  const [currentTimeDuration, setCurrentTimeDuration] = useState<string>("0");
  const [mediaVerified, setMediaVerified] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string>("");

  const lastUserResponseRef = useRef<HTMLDivElement | null>(null);
  const userVideoRef = useRef<HTMLVideoElement | null>(null);

  const checkMediaPermissions = async () => {
    setLoading(true);
    setPermissionError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMediaVerified(true);
      toast.success("Camera and microphone access granted!");

      // Keep the stream reference to attach later or attach now if possible (but video element might not be rendered yet)
      // We'll attach it in a useEffect when isStarted becomes true
      (window as any).localStream = stream; // Temporary storage to pass to the next view

    } catch (err) {
      console.error("Error accessing media devices:", err);
      setPermissionError("Please allow camera and microphone access to continue.");
      toast.error("Camera and microphone access denied.");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (
    formData: Omit<FeedbackData, "interview_id">,
  ) => {
    try {
      const result = await FeedbackService.submitFeedback({
        ...formData,
        interview_id: interview.id,
      });

      if (result) {
        toast.success("Thank you for your feedback!");
        setIsFeedbackSubmitted(true);
        setIsDialogOpen(false);
      } else {
        toast.error("Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("An error occurred. Please try again later.");
    }
  };

  useEffect(() => {
    if (lastUserResponseRef.current) {
      const { current } = lastUserResponseRef;
      current.scrollTop = current.scrollHeight;
    }
  }, [lastUserResponse]);

  useEffect(() => {
    let intervalId: any;
    if (isCalling) {
      // setting time from 0 to 1 every 10 milisecond using javascript setInterval method
      intervalId = setInterval(() => setTime(time + 1), 10);
    }
    setCurrentTimeDuration(String(Math.floor(time / 100)));
    if (Number(currentTimeDuration) == Number(interviewTimeDuration) * 60) {
      webClient.stopCall();
      setIsEnded(true);
    }

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCalling, time, currentTimeDuration]);

  useEffect(() => {
    if (testEmail(email)) {
      setIsValidEmail(true);
    }
  }, [email]);

  useEffect(() => {
    webClient.on("call_started", () => {
      console.log("Call started");
      setIsCalling(true);
    });

    webClient.on("call_ended", () => {
      console.log("Call ended");
      setIsCalling(false);
      setIsEnded(true);
    });

    webClient.on("agent_start_talking", () => {
      setActiveTurn("agent");
    });

    webClient.on("agent_stop_talking", () => {
      // Optional: Add any logic when agent stops talking
      setActiveTurn("user");
    });

    webClient.on("error", (error) => {
      console.error("An error occurred:", error);
      webClient.stopCall();
      setIsEnded(true);
      setIsCalling(false);
    });

    webClient.on("update", (update) => {
      if (update.transcript) {
        const transcripts: transcriptType[] = update.transcript;
        const roleContents: { [key: string]: string } = {};

        transcripts.forEach((transcript) => {
          roleContents[transcript?.role] = transcript?.content;
        });

        setLastInterviewerResponse(roleContents["agent"]);
        setLastUserResponse(roleContents["user"]);
      }
      //TODO: highlight the newly uttered word in the UI
    });

    webClient.on("transcript_update", (update) => {
      console.log("Transcript update:", update);
      fullTranscriptRef.current = [...fullTranscriptRef.current, update];
    });

    return () => {
      // Clean up event listeners
      webClient.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    if (isStarted && userVideoRef.current && (window as any).localStream) {
      userVideoRef.current.srcObject = (window as any).localStream;
    }
  }, [isStarted]);

  const onEndCallClick = async () => {
    if (isStarted) {
      setLoading(true);
      webClient.stopCall();
      setIsEnded(true);
      setLoading(false);
    } else {
      setIsEnded(true);
    }
  };

  const startConversation = async () => {
    const data = {
      mins: interview?.time_duration,
      objective: interview?.objective,
      questions: interview?.questions.map((q) => q.question).join(", "),
      name: name || "not provided",
    };
    setLoading(true);

    const oldUserEmails: string[] = (
      await ResponseService.getAllEmails(interview.id)
    ).map((item) => item.email);
    const OldUser =
      oldUserEmails.includes(email) ||
      (interview?.respondents && !interview?.respondents.includes(email));

    if (OldUser) {
      setIsOldUser(true);
    } else {
      // Still register the call to get a call_id for the database
      const registerCallResponse: registerCallResponseType = await axios.post(
        "/api/register-call",
        { dynamic_data: data, interviewer_id: interview?.interviewer_id },
      );

      if (registerCallResponse.data.registerCallResponse.call_id) {
        // Start the mock client instead of Retell
        const interviewerName = String(interview.interviewer_id).toLowerCase().includes("sameer") ? "Sameer" : "Tina";

        await webClient
          .startCall({
            accessToken: "mock_token", // Not used by MockWebClient but kept for interface
            questions: interview.questions.map(q => q.question),
            agentName: interviewerName
          })
          .catch(console.error);

        setIsCalling(true);
        setIsStarted(true);

        setCallId(registerCallResponse?.data?.registerCallResponse?.call_id);

        const response = await createResponse({
          interview_id: interview.id,
          call_id: registerCallResponse.data.registerCallResponse.call_id,
          email: email,
          name: name,
        });
      } else {
        console.log("Failed to register call");
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    if (interview?.time_duration) {
      setInterviewTimeDuration(interview?.time_duration);
    }
  }, [interview]);

  useEffect(() => {
    const fetchInterviewer = async () => {
      const interviewer = await InterviewerService.getInterviewer(
        interview.interviewer_id,
      );
      setInterviewerImg(interviewer.image);
    };
    fetchInterviewer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interview.interviewer_id]);

  const fullTranscriptRef = useRef<transcriptType[]>([]);

  useEffect(() => {
    if (isEnded) {
      const updateInterview = async () => {
        console.log("Call ended. Saving response...", { callId, transcriptLength: fullTranscriptRef.current.length });

        if (!callId) {
          console.error("Error: callId is missing when saving response!");
          toast.error("Error saving response: Call ID missing");
          return;
        }

        // Format transcript for storage/analysis
        const formattedTranscript = fullTranscriptRef.current
          .map((t) => `${t.role}: ${t.content}`)
          .join("\n");

        try {
          const result = await ResponseService.saveResponse(
            {
              is_ended: true,
              tab_switch_count: tabSwitchCount,
              details: { transcript: formattedTranscript } // Save transcript in details
            },
            callId,
          );
          console.log("Response saved successfully:", result);

          // Trigger analysis
          console.log("Triggering analysis...");
          await fetch("/api/get-call", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: callId }),
          });
          console.log("Analysis triggered successfully");

          toast.success("Interview saved and analyzed successfully");
        } catch (error) {
          console.error("Error saving response:", error);
          toast.error("Failed to save interview response");
        }
      };

      updateInterview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnded]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {isStarted && <TabSwitchWarning />}
      <div className="bg-white rounded-md md:w-[80%] w-[90%]">
        <Card className="h-[88vh] rounded-lg border-2 border-b-4 border-r-4 border-black text-xl font-bold transition-all  md:block dark:border-white ">
          <div>
            <div className="m-4 h-[15px] rounded-lg border-[1px]  border-black">
              <div
                className=" bg-indigo-600 h-[15px] rounded-lg"
                style={{
                  width: isEnded
                    ? "100%"
                    : `${(Number(currentTimeDuration) /
                      (Number(interviewTimeDuration) * 60)) *
                    100
                    }%`,
                }}
              />
            </div>
            <CardHeader className="items-center p-1">
              {!isEnded && (
                <CardTitle className="flex flex-row items-center text-lg md:text-xl font-bold mb-2">
                  {interview?.name}
                </CardTitle>
              )}
              {!isEnded && (
                <div className="flex mt-2 flex-row">
                  <AlarmClockIcon
                    className="text-indigo-600 h-[1rem] w-[1rem] rotate-0 scale-100  dark:-rotate-90 dark:scale-0 mr-2 font-bold"
                    style={{ color: interview.theme_color }}
                  />
                  <div className="text-sm font-normal">
                    Expected duration:{" "}
                    <span
                      className="font-bold"
                      style={{ color: interview.theme_color }}
                    >
                      {interviewTimeDuration} mins{" "}
                    </span>
                    or less
                  </div>
                </div>
              )}
            </CardHeader>
            {!isStarted && !isEnded && !isOldUser && (
              <div className="w-fit min-w-[400px] max-w-[400px] mx-auto mt-2  border border-indigo-200 rounded-md p-2 m-2 bg-slate-50">
                <div>
                  {interview?.logo_url && (
                    <div className="p-1 flex justify-center">
                      <Image
                        src={interview?.logo_url}
                        alt="Logo"
                        className="h-10 w-auto"
                        width={100}
                        height={100}
                      />
                    </div>
                  )}
                  <div className="p-2 font-normal text-sm mb-4 whitespace-pre-line">
                    {interview?.description}
                    <p className="font-bold text-sm">
                      {"\n"}Ensure your volume is up and grant microphone access
                      when prompted. Additionally, please make sure you are in a
                      quiet environment.
                      {"\n\n"}Note: Tab switching will be recorded.
                    </p>
                  </div>
                  {!interview?.is_anonymous && (
                    <div className="flex flex-col gap-2 justify-center">
                      <div className="flex justify-center">
                        <input
                          value={email}
                          className="h-fit mx-auto py-2 border-2 rounded-md w-[75%] self-center px-2 border-gray-400 text-sm font-normal"
                          placeholder="Enter your email address"
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-center">
                        <input
                          value={name}
                          className="h-fit mb-4 mx-auto py-2 border-2 rounded-md w-[75%] self-center px-2 border-gray-400 text-sm font-normal"
                          placeholder="Enter your first name"
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="w-[80%] flex flex-col mx-auto justify-center items-center align-middle gap-2">
                  {permissionError && (
                    <p className="text-red-500 text-sm text-center mb-2">{permissionError}</p>
                  )}

                  {!mediaVerified ? (
                    <Button
                      className="min-w-20 h-10 rounded-lg flex flex-row justify-center mb-4"
                      style={{
                        backgroundColor: interview.theme_color ?? "#4F46E5",
                        color: isLightColor(interview.theme_color ?? "#4F46E5")
                          ? "black"
                          : "white",
                      }}
                      disabled={
                        Loading ||
                        (!interview?.is_anonymous && (!isValidEmail || !name))
                      }
                      onClick={checkMediaPermissions}
                    >
                      {!Loading ? "Check Camera & Mic" : <MiniLoader />}
                    </Button>
                  ) : (
                    <Button
                      className="min-w-20 h-10 rounded-lg flex flex-row justify-center mb-4"
                      style={{
                        backgroundColor: interview.theme_color ?? "#4F46E5",
                        color: isLightColor(interview.theme_color ?? "#4F46E5")
                          ? "black"
                          : "white",
                      }}
                      disabled={Loading}
                      onClick={startConversation}
                    >
                      {!Loading ? "Start Interview" : <MiniLoader />}
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger>
                      <Button
                        className="bg-white border ml-2 text-black min-w-15 h-10 rounded-lg flex flex-row justify-center mb-8"
                        style={{ borderColor: interview.theme_color }}
                        disabled={Loading}
                      >
                        Exit
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-indigo-600 hover:bg-indigo-800"
                          onClick={async () => {
                            await onEndCallClick();
                          }}
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
            {isStarted && !isEnded && !isOldUser && (
              <div className="flex flex-col md:flex-row h-full p-4 gap-4 grow">
                {/* Left Side: AI Interviewer */}
                <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                  <div className="relative w-32 h-32 md:w-48 md:h-48 mb-6">
                    <Image
                      src={interviewerImg}
                      alt="Interviewer"
                      fill
                      className={`object-cover rounded-full transition-all duration-300 ${activeTurn === "agent"
                        ? `ring-4 ring-[${interview.theme_color}] ring-offset-4 scale-105`
                        : "grayscale opacity-80"
                        }`}
                    />
                    {activeTurn === "agent" && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full text-xs font-bold shadow-md text-indigo-600 animate-pulse">
                        Speaking...
                      </div>
                    )}
                  </div>

                  <div className="w-full max-w-md text-center space-y-4">
                    <h3 className="font-semibold text-gray-900 text-lg">Interviewer</h3>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 min-h-[100px] flex items-center justify-center">
                      <p className="text-gray-700 text-lg leading-relaxed font-medium">
                        {lastInterviewerResponse || "..."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side: User Camera & Transcript */}
                <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 rounded-xl p-1 shadow-inner relative overflow-hidden group">
                  <video
                    ref={userVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                  />

                  <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-6">
                    <div className="w-full flex justify-end">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${activeTurn === 'user' ? 'bg-green-500 text-white animate-pulse' : 'bg-gray-700 text-gray-300'}`}>
                        {activeTurn === 'user' ? 'Listening...' : 'Mic Active'}
                      </div>
                    </div>

                    <div className="w-full max-w-md text-center mt-auto">
                      <div className="bg-black/50 backdrop-blur-sm p-4 rounded-lg border border-white/10 min-h-[100px] flex items-center justify-center">
                        <p ref={lastUserResponseRef} className="text-white text-lg leading-relaxed font-medium">
                          {lastUserResponse || "Listening..."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {isStarted && !isEnded && !isOldUser && (
              <div className="items-center p-2">
                <AlertDialog>
                  <AlertDialogTrigger className="w-full">
                    <Button
                      className=" bg-white text-black border  border-indigo-600 h-10 mx-auto flex flex-row justify-center mb-8"
                      disabled={Loading}
                    >
                      End Interview{" "}
                      <XCircleIcon className="h-[1.5rem] ml-2 w-[1.5rem] rotate-0 scale-100  dark:-rotate-90 dark:scale-0 text-red" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This action will end the
                        call.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-indigo-600 hover:bg-indigo-800"
                        onClick={async () => {
                          await onEndCallClick();
                        }}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            {isEnded && !isOldUser && (
              <div className="w-fit min-w-[400px] max-w-[400px] mx-auto mt-2  border border-indigo-200 rounded-md p-2 m-2 bg-slate-50  absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                <div>
                  <div className="p-2 font-normal text-base mb-4 whitespace-pre-line">
                    <CheckCircleIcon className="h-[2rem] w-[2rem] mx-auto my-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-indigo-500 " />
                    <p className="text-lg font-semibold text-center">
                      {isStarted
                        ? `Thank you for taking the time to participate in this interview`
                        : "Thank you very much for considering."}
                    </p>
                    <p className="text-center">
                      {"\n"}
                      You can close this tab now.
                    </p>
                  </div>

                  {!isFeedbackSubmitted && (
                    <AlertDialog
                      open={isDialogOpen}
                      onOpenChange={setIsDialogOpen}
                    >
                      <AlertDialogTrigger className="w-full flex justify-center">
                        <Button
                          className="bg-indigo-600 text-white h-10 mt-4 mb-4"
                          onClick={() => setIsDialogOpen(true)}
                        >
                          Provide Feedback
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <FeedbackForm
                          email={email}
                          onSubmit={handleFeedbackSubmit}
                        />
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            )}
            {isOldUser && (
              <div className="w-fit min-w-[400px] max-w-[400px] mx-auto mt-2  border border-indigo-200 rounded-md p-2 m-2 bg-slate-50  absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                <div>
                  <div className="p-2 font-normal text-base mb-4 whitespace-pre-line">
                    <CheckCircleIcon className="h-[2rem] w-[2rem] mx-auto my-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-indigo-500 " />
                    <p className="text-lg font-semibold text-center">
                      You have already responded in this interview or you are
                      not eligible to respond. Thank you!
                    </p>
                    <p className="text-center">
                      {"\n"}
                      You can close this tab now.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
        <a
          className="flex flex-row justify-center align-middle mt-3"
          href="https://folo-up.co/"
          target="_blank"
        >
          <div className="text-center text-md font-semibold mr-2  ">
            Powered by{" "}
            <span className="font-bold">
              Tina<span className="text-indigo-600">AI</span>
            </span>
          </div>
          <ArrowUpRightSquareIcon className="h-[1.5rem] w-[1.5rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-indigo-500 " />
        </a>
      </div>
    </div>
  );
}

export default Call;
