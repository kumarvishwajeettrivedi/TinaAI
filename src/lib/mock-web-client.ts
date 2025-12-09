import { EventEmitter } from "events";

export class MockWebClient extends EventEmitter {
    private synthesis: SpeechSynthesis | null = null;
    private recognition: any; // SpeechRecognition type is not always available in TS by default
    private isListening: boolean = false;
    private isAgentTalking: boolean = false;
    private questions: string[] = [];
    private currentQuestionIndex: number = 0;
    private agentName: string = "Tina"; // Default
    private audio: HTMLAudioElement | null = null;

    constructor() {
        super();
        if (typeof window !== "undefined") {
            this.synthesis = window.speechSynthesis;
            // @ts-ignore
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                this.recognition = new SpeechRecognition();
                this.recognition.continuous = true;
                this.recognition.interimResults = true;
                this.recognition.lang = "en-US";

                let silenceTimer: any;
                let finalTranscript = "";

                let lastEmitTime = 0;
                const EMIT_INTERVAL = 100; // ms

                this.recognition.onresult = (event: any) => {
                    let interimTranscript = "";

                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript + " ";
                        } else {
                            interimTranscript += event.results[i][0].transcript;
                        }
                    }

                    // console.log("Interim:", interimTranscript);
                    // console.log("Final:", finalTranscript);

                    const now = Date.now();
                    if (now - lastEmitTime > EMIT_INTERVAL || finalTranscript.trim().length > 0) {
                        // Emit update for UI
                        this.emit("update", {
                            transcript: [
                                { role: "user", content: finalTranscript + interimTranscript },
                            ],
                        });
                        lastEmitTime = now;
                    }

                    // Reset silence timer
                    clearTimeout(silenceTimer);

                    // If we have a significant final transcript and silence for 2 seconds, assume user is done
                    if (finalTranscript.trim().length > 0) {
                        silenceTimer = setTimeout(() => {
                            if (this.isListening) {
                                this.handleUserResponse(finalTranscript.trim());
                                finalTranscript = ""; // Reset for next turn
                            }
                        }, 2000);
                    }
                };

                this.recognition.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error);
                    if (event.error === 'no-speech') {
                        // Just ignore no-speech errors in continuous mode
                        return;
                    }
                    if (event.error === 'network') {
                        console.log("Network error detected, attempting to restart recognition...");
                        if (this.isListening) {
                            setTimeout(() => {
                                try {
                                    this.recognition.start();
                                } catch (e) {
                                    // ignore
                                }
                            }, 1000);
                        }
                        return;
                    }
                };

                this.recognition.onend = () => {
                    if (this.isListening && !this.isAgentTalking) {
                        try {
                            this.recognition.start();
                        } catch (e) {
                            // ignore
                        }
                    }
                }
            }
        }
    }

    async startCall(config: { accessToken: string; questions?: string[]; agentName?: string }) {
        console.log("MockWebClient: Starting call with config", config);
        this.questions = config.questions || ["Tell me about yourself."];
        this.agentName = config.agentName || "Tina";
        this.currentQuestionIndex = 0;

        this.emit("call_started");

        // Start with greeting
        await this.playGreeting();
    }

    stopCall() {
        console.log("MockWebClient: Stopping call");
        this.isListening = false;
        if (this.recognition) {
            this.recognition.stop();
        }
        if (this.synthesis) {
            this.synthesis.cancel();
        }
        if (this.audio) {
            this.audio.pause();
            this.audio = null;
        }
        this.emit("call_ended");
    }

    private async playGreeting() {
        this.isAgentTalking = true;
        this.emit("agent_start_talking");

        const audioFile = this.agentName.toLowerCase().includes("sameer")
            ? "/audio/sameer.mp3"
            : "/audio/tina.mp3";

        console.log(`Playing greeting: ${audioFile} `);

        try {
            this.audio = new Audio(audioFile);
            this.audio.onended = () => {
                this.isAgentTalking = false;
                this.emit("agent_stop_talking");
                // After greeting, ask the first question (or if greeting implies first question, wait for answer)
                // Assuming greeting is just "Hi I'm Tina...", let's ask the first question immediately after.
                this.askNextQuestion();
            };
            await this.audio.play();
        } catch (error) {
            console.error("Error playing audio greeting, falling back to TTS", error);
            this.speak(`Hello, I am ${this.agentName}. Let's start the interview.`);
        }
    }

    private askNextQuestion() {
        if (this.currentQuestionIndex < this.questions.length) {
            const question = this.questions[this.currentQuestionIndex];
            this.speak(question);
        } else {
            this.speak("Thank you for your time. The interview is now complete.");
            setTimeout(() => {
                this.stopCall();
            }, 3000);
        }
    }

    private speak(text: string) {
        if (!this.synthesis) return;

        this.isAgentTalking = true;
        this.emit("agent_start_talking");
        this.emit("update", {
            transcript: [
                { role: "agent", content: text },
            ],
        });

        // Emit final transcript for storage
        this.emit("transcript_update", { role: "agent", content: text });

        const utterance = new SpeechSynthesisUtterance(text);

        // Try to select a voice that matches the gender
        const voices = this.synthesis.getVoices();
        const isMale = this.agentName.toLowerCase().includes("sameer");

        // Simple heuristic for voice selection
        const preferredVoice = voices.find(v =>
            isMale
                ? (v.name.includes("Male") || v.name.includes("David") || v.name.includes("Daniel"))
                : (v.name.includes("Female") || v.name.includes("Google US English") || v.name.includes("Samantha"))
        );

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onend = () => {
            this.isAgentTalking = false;
            this.emit("agent_stop_talking");
            this.startListening();
        };

        this.synthesis.speak(utterance);
    }

    private startListening() {
        if (!this.recognition) return;
        this.isListening = true;
        try {
            this.recognition.start();
        } catch (e) {
            console.log("Recognition already started");
        }
    }

    private handleUserResponse(transcript: string) {
        this.isListening = false;
        this.recognition.stop();

        // Emit final transcript for storage
        this.emit("transcript_update", { role: "user", content: transcript });

        // Simulate processing time
        setTimeout(() => {
            this.currentQuestionIndex++;
            this.askNextQuestion();
        }, 1000);
    }
}
