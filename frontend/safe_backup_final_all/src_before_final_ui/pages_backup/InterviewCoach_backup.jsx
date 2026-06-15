import React, { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

function Badge({ children, type = "default" }) {
  const styles = {
    default: "bg-slate-100 text-slate-700 ring-slate-200",
    success: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    danger: "bg-rose-50 text-rose-700 ring-rose-100",
    warning: "bg-amber-50 text-amber-700 ring-amber-100",
    primary: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    violet: "bg-violet-50 text-violet-700 ring-violet-100"
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${styles[type] || styles.default}`}>
      {children}
    </span>
  );
}

function questionTone(type) {
  if (type === "HR") return "warning";
  if (type === "Technical") return "primary";
  return "default";
}

export default function InterviewCoach() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef("");

  const [companies, setCompanies] = useState([]);
  const [companySearch, setCompanySearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const [resumeText, setResumeText] = useState("");
  const [questions, setQuestions] = useState([]);
  const [questionStats, setQuestionStats] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const [answer, setAnswer] = useState("");
  const [answerReport, setAnswerReport] = useState(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  const [error, setError] = useState("");
  const [voiceStatus, setVoiceStatus] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [interviewStarted, setInterviewStarted] = useState(false);

  const activeQuestion = questions[activeIndex];

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/interview/companies`);
      const data = await res.json();

      if (!data.ok) {
        setCompanies([]);
        setError(data.message || "Failed to load companies.");
        return;
      }

      setCompanies(Array.isArray(data.companies) ? data.companies : []);
    } catch (err) {
      setCompanies([]);
      setError("Backend not connected. Start backend on port 5001.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();

    return () => {
      stopCamera();
      stopVoice();
      stopListening(false);
    };
  }, []);

  useEffect(() => {
    if (!interviewStarted) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [interviewStarted]);

  const filteredCompanies = useMemo(() => {
    const q = companySearch.trim().toLowerCase();

    if (!q) return [];

    return companies
      .filter((company) =>
        String(company.companyName || "").toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [companies, companySearch]);

  const selectedCompanyData = useMemo(() => {
    return companies.find((company) => company.companyName === selectedCompany);
  }, [companies, selectedCompany]);

  const roles = selectedCompanyData?.roles || [];

  const uploadResumeFile = async (file) => {
    if (!file) return;

    try {
      setUploading(true);
      setError("");
      setQuestions([]);
      setQuestionStats(null);

      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch(`${API_BASE}/api/interview/extract-resume`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.message || "Could not read resume file.");
        return;
      }

      setResumeText(data.extractedText || "");
    } catch (err) {
      setError("Resume upload failed. Check backend /api/interview/extract-resume.");
    } finally {
      setUploading(false);
    }
  };

  const startCamera = async () => {
    try {
      setError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Camera is not supported in this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraOn(true);
    } catch (err) {
      setCameraOn(false);
      setError("Camera permission denied. Allow camera access from Chrome address bar.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOn(false);
  };

  const getFemaleVoice = () => {
    const voices = window.speechSynthesis?.getVoices?.() || [];

    return (
      voices.find((voice) =>
        /female|zira|samantha|victoria|karen|moira|tessa/i.test(voice.name)
      ) ||
      voices.find((voice) => /en/i.test(voice.lang)) ||
      voices[0]
    );
  };

  const speakText = (text, onEnd) => {
    if (!text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getFemaleVoice();

    if (voice) utterance.voice = voice;

    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1.15;
    utterance.volume = 1;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => {
      setSpeaking(false);
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      setSpeaking(false);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  };

  const speakQuestion = () => {
    if (!activeQuestion?.question) return;

    speakText(activeQuestion.question, () => {
      if (autoMode) {
        setTimeout(() => {
          startListening();
        }, 700);
      }
    });
  };

  const stopVoice = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  const startListening = () => {
    try {
      setError("");
      setVoiceStatus("");
      setAnswerReport(null);

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setError("Voice answer works best in Chrome. Use Chrome and allow microphone.");
        return;
      }

      stopVoice();

      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }

      transcriptRef.current = "";
      setAnswer("");

      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setListening(true);
        setVoiceStatus("Listening... speak your answer now.");
      };

      recognition.onresult = (event) => {
        let interim = "";
        let finalText = transcriptRef.current;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalText += transcript + " ";
          } else {
            interim += transcript;
          }
        }

        transcriptRef.current = finalText;
        setAnswer((finalText + interim).trim());
      };

      recognition.onerror = (event) => {
        setListening(false);
        setVoiceStatus("");
        setError(`Voice recognition error: ${event.error}. Allow microphone and try again.`);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setListening(false);
      setError("Could not start voice answer. Use Chrome and allow microphone permission.");
    }
  };

  const stopListening = (shouldAnalyze = true) => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    setListening(false);
    setVoiceStatus("");

    if (shouldAnalyze) {
      setTimeout(() => {
        const finalAnswer = transcriptRef.current.trim() || answer.trim();

        if (!finalAnswer) {
          setError("No voice answer detected. Please speak again.");
          speakText("I could not hear your answer clearly. Please say it again.");
          return;
        }

        analyzeAnswer(finalAnswer, true);
      }, 600);
    }
  };

  const generateQuestions = async () => {
    try {
      setError("");
      setQuestions([]);
      setQuestionStats(null);
      setActiveIndex(0);
      setAnswer("");
      setAnswerReport(null);

      if (!selectedCompany) {
        setError("Search and select company first.");
        return;
      }

      if (!selectedRole) {
        setError("Select role first.");
        return;
      }

      setQuestionLoading(true);

      const res = await fetch(`${API_BASE}/api/interview/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          companyName: selectedCompany,
          roleName: selectedRole,
          resumeText,
          seed: Date.now()
        })
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.message || "Questions not loaded.");
        return;
      }

      const onlyHrTechnical = (data.questions || []).filter(
        (question) => question.type === "HR" || question.type === "Technical"
      );

      setQuestions(onlyHrTechnical);
      setQuestionStats(data);

      setTimeout(() => {
        speakText("Fresh interview questions generated. Start interview when you are ready.");
      }, 400);
    } catch (err) {
      setError("Failed to generate questions. Check backend.");
    } finally {
      setQuestionLoading(false);
    }
  };

  const analyzeAnswer = async (customAnswer = "", fromVoice = false) => {
    try {
      setError("");
      setAnswerReport(null);

      const finalAnswer = (customAnswer || answer).trim();

      if (!finalAnswer) {
        setError("Write or speak your answer first.");
        speakText("Please answer first.");
        return;
      }

      setAnswer(finalAnswer);
      setAnalyzing(true);

      const res = await fetch(`${API_BASE}/api/interview/analyze-answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ answer: finalAnswer })
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.message || "Answer analysis failed.");
        return;
      }

      setAnswerReport(data);

      if (fromVoice) {
        if (data.score >= 60) {
          speakText(`Good answer. Moving to the next question.`, () => {
            setTimeout(() => {
              if (activeIndex < questions.length - 1) {
                const nextIndex = activeIndex + 1;
                const nextQuestion = questions[nextIndex];

                setActiveIndex(nextIndex);
                setAnswer("");
                setAnswerReport(null);

                if (autoMode && nextQuestion) {
                  setTimeout(() => {
                    speakText(nextQuestion.question, () => {
                      setTimeout(() => startListening(), 700);
                    });
                  }, 700);
                }
              } else {
                speakText("Interview completed. Good practice session.");
              }
            }, 700);
          });
        } else {
          speakText("This answer is not strong enough. Please try again with a clear example and result.");
        }
      }
    } catch (err) {
      setError("Answer analysis failed. Check backend.");
    } finally {
      setAnalyzing(false);
    }
  };

  const changeQuestion = (direction) => {
    stopVoice();
    stopListening(false);
    setAnswer("");
    setAnswerReport(null);

    setActiveIndex((prev) => {
      if (direction === "next") return Math.min(prev + 1, questions.length - 1);
      return Math.max(prev - 1, 0);
    });
  };

  const formatTime = (value) => {
    const min = Math.floor(value / 60);
    const sec = value % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const startInterview = () => {
    if (!activeQuestion) {
      setError("Generate questions first.");
      return;
    }

    setAutoMode(true);
    setInterviewStarted(true);
    speakQuestion();
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section className="rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-900 to-violet-700 p-6 text-white shadow-xl sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-indigo-100">
            Interview Coach
          </p>

          <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
            Mock Interview Practice
          </h1>

          <p className="mt-3 max-w-3xl text-sm font-semibold text-indigo-100 sm:text-base">
            Practice HR and technical interview questions for selected company roles.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
              <p className="text-xs font-bold text-indigo-100">Companies</p>
              <h2 className="mt-2 text-3xl font-black">{companies.length}</h2>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
              <p className="text-xs font-bold text-indigo-100">Company</p>
              <h2 className="mt-2 truncate text-base font-black">{selectedCompany || "Not selected"}</h2>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
              <p className="text-xs font-bold text-indigo-100">Role</p>
              <h2 className="mt-2 truncate text-base font-black">{selectedRole || "Not selected"}</h2>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
              <p className="text-xs font-bold text-indigo-100">Questions</p>
              <h2 className="mt-2 text-3xl font-black">{questions.length}</h2>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
              <p className="text-xs font-bold text-indigo-100">Voice</p>
              <h2 className="mt-2 text-base font-black">
                {listening ? "Listening" : speaking ? "Speaking" : "Ready"}
              </h2>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Select Interview Target</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Search company, choose role, then generate questions.
                </p>
              </div>

              {loading && <Badge type="primary">Loading...</Badge>}
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-black text-slate-700">Search Company</label>
              <input
                value={companySearch}
                onChange={(e) => {
                  setCompanySearch(e.target.value);
                  setSelectedCompany("");
                  setSelectedRole("");
                  setQuestions([]);
                  setQuestionStats(null);
                  setError("");
                }}
                placeholder="Search Google, Amazon, Flipkart, Accenture..."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              />
            </div>

            {companySearch.trim() && (
              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800">Matching Companies</h3>
                  <span className="text-xs font-bold text-slate-500">{filteredCompanies.length} results</span>
                </div>

                {filteredCompanies.length === 0 ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
                    No company found for "{companySearch}".
                  </div>
                ) : (
                  <div className="max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {filteredCompanies.map((company, index) => {
                        const active = selectedCompany === company.companyName;

                        return (
                          <button
                            key={`${company.companyName}-${index}`}
                            type="button"
                            onClick={() => {
                              setSelectedCompany(company.companyName);
                              setSelectedRole("");
                              setQuestions([]);
                              setQuestionStats(null);
                              setError("");
                            }}
                            className={`rounded-xl border p-4 text-left transition hover:shadow-md ${
                              active ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 bg-white text-slate-900"
                            }`}
                          >
                            <p className="truncate text-sm font-black">{company.companyName}</p>
                            <p className={`mt-1 text-xs font-bold ${active ? "text-indigo-100" : "text-slate-500"}`}>
                              {company.totalJobCount || 0} jobs
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!companySearch.trim() && (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
                <div className="text-4xl">🎯</div>
                <h3 className="mt-3 text-lg font-black text-slate-900">Search company to start</h3>
              </div>
            )}

            {selectedCompany && (
              <div className="mt-6">
                <label className="mb-2 block text-sm font-black text-slate-700">Choose Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    setQuestions([]);
                    setQuestionStats(null);
                    setError("");
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                >
                  <option value="">Select role</option>
                  {roles.map((role, index) => (
                    <option key={`${role.roleName}-${index}`} value={role.roleName}>
                      {role.roleName} | {role.jobCount || 0} jobs
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mt-6">
              <label className="mb-2 block text-sm font-black text-slate-700">Resume Input</label>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => uploadResumeFile(e.target.files?.[0])}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold"
              />

              {uploading && (
                <div className="mt-3 rounded-xl bg-indigo-50 p-3 text-sm font-black text-indigo-700">
                  Reading resume file...
                </div>
              )}

              <textarea
                value={resumeText}
                onChange={(e) => {
                  setResumeText(e.target.value);
                  setQuestions([]);
                  setQuestionStats(null);
                }}
                placeholder="Paste resume text here or upload PDF/DOCX/TXT..."
                rows={6}
                className="mt-4 w-full rounded-2xl border border-slate-200 p-4 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              />
            </div>

            <button
              onClick={generateQuestions}
              disabled={questionLoading}
              className="mt-5 w-full rounded-xl bg-indigo-600 px-6 py-4 text-sm font-black text-white shadow-lg transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {questionLoading ? "Generating Questions..." : "Generate Fresh HR & Technical Questions →"}
            </button>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-black text-red-700">
                {error}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-black text-slate-900">Mock Interview Mode</h2>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
              <video ref={videoRef} autoPlay playsInline muted className="h-72 w-full bg-slate-900 object-cover" />

              {!cameraOn && (
                <div className="border-t border-slate-800 bg-slate-950 p-4 text-center text-sm font-bold text-slate-300">
                  Camera is off.
                </div>
              )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button onClick={startCamera} className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700">
                Start Camera
              </button>

              <button onClick={stopCamera} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-slate-800">
                Stop Camera
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                onClick={startInterview}
                disabled={!activeQuestion}
                className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white hover:bg-violet-700 disabled:bg-slate-300"
              >
                Start Interview
              </button>

              <button
                onClick={speakQuestion}
                disabled={!activeQuestion}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white hover:bg-indigo-700 disabled:bg-slate-300"
              >
                Repeat Question
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                onClick={startListening}
                disabled={!activeQuestion || listening}
                className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:bg-slate-300"
              >
                {listening ? "Listening..." : "Start Answer"}
              </button>

              <button
                onClick={() => stopListening(true)}
                disabled={!listening}
                className="rounded-xl bg-rose-600 px-5 py-3 text-sm font-black text-white hover:bg-rose-700 disabled:bg-slate-300"
              >
                Submit Answer
              </button>
            </div>

            <label className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-sm font-bold text-slate-700">
              <input
                type="checkbox"
                checked={autoMode}
                onChange={(e) => setAutoMode(e.target.checked)}
                className="h-4 w-4"
              />
              Auto mode
            </label>

            {voiceStatus && (
              <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm font-black text-indigo-700">
                {voiceStatus}
              </div>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-500">Interview Time</p>
                <h3 className="mt-1 text-2xl font-black text-slate-900">{formatTime(seconds)}</h3>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-500">Status</p>
                <h3 className="mt-1 text-lg font-black text-slate-900">
                  {listening ? "Answering" : speaking ? "Question" : interviewStarted ? "In Progress" : "Ready"}
                </h3>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-500">Progress</p>
                <h3 className="mt-1 text-2xl font-black text-slate-900">
                  {questions.length ? `${activeIndex + 1}/${questions.length}` : "0/0"}
                </h3>
              </div>
            </div>

            {questionStats && (
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-500">Role Match</p>
                  <h3 className="mt-1 text-2xl font-black text-slate-900">{questionStats.roleMatchScore || 0}%</h3>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-500">Matched</p>
                  <h3 className="mt-1 text-2xl font-black text-emerald-700">{questionStats.matchedSkills?.length || 0}</h3>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-500">Missing</p>
                  <h3 className="mt-1 text-2xl font-black text-rose-700">{questionStats.missingSkills?.length || 0}</h3>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Interview Questions</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                HR and technical questions.
              </p>
            </div>

            {questions.length > 0 && (
              <Badge type="primary">
                Question {activeIndex + 1} / {questions.length}
              </Badge>
            )}
          </div>

          {questions.length === 0 && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center">
              <div className="text-5xl">��</div>
              <h3 className="mt-4 text-xl font-black text-slate-900">No questions loaded yet</h3>
            </div>
          )}

          {activeQuestion && (
            <>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-black text-slate-900">Question Queue</h3>
                <Badge type="primary">{questions.length} total</Badge>
              </div>

              <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                {questions.map((question, index) => (
                  <button
                    key={question.id || index}
                    onClick={() => {
                      stopVoice();
                      stopListening(false);
                      setActiveIndex(index);
                      setAnswer("");
                      setAnswerReport(null);
                    }}
                    className={`min-w-10 rounded-full px-4 py-2 text-xs font-black ${
                      index === activeIndex
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-slate-700 ring-1 ring-slate-200"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex items-center justify-between gap-3">
                  <Badge type={questionTone(activeQuestion.type)}>{activeQuestion.type}</Badge>

                  <div className="flex gap-2">
                    <button
                      onClick={() => changeQuestion("prev")}
                      disabled={activeIndex === 0}
                      className="rounded-lg bg-white px-3 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200 disabled:opacity-40"
                    >
                      Prev
                    </button>

                    <button
                      onClick={() => changeQuestion("next")}
                      disabled={activeIndex === questions.length - 1}
                      className="rounded-lg bg-white px-3 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>

                <h3 className="mt-5 text-2xl font-black text-slate-900">
                  {activeQuestion.question}
                </h3>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="text-xl font-black text-slate-900">Your Answer</h3>

                <textarea
                  value={answer}
                  onChange={(e) => {
                    setAnswer(e.target.value);
                    setAnswerReport(null);
                  }}
                  placeholder="Write your answer here or use voice answer..."
                  rows={9}
                  className="mt-4 w-full rounded-2xl border border-slate-200 p-4 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                />

                <button
                  onClick={() => analyzeAnswer("", false)}
                  disabled={analyzing}
                  className="mt-4 w-full rounded-xl bg-indigo-600 px-6 py-4 text-sm font-black text-white shadow-lg transition hover:bg-indigo-700 disabled:bg-slate-300"
                >
                  {analyzing ? "Analyzing..." : "Analyze Answer →"}
                </button>

                {answerReport && (
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-slate-900">Answer Score</h4>
                      <Badge type={answerReport.score >= 60 ? "success" : answerReport.score >= 40 ? "warning" : "danger"}>
                        {answerReport.score}%
                      </Badge>
                    </div>

                    <div className="mt-4 space-y-3">
                      {(answerReport.feedback || []).map((item, index) => (
                        <p key={index} className="rounded-2xl bg-white p-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
                          {item}
                        </p>
                      ))}
                    </div>

                    {(answerReport.improve || answerReport.missing || []).length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-black text-slate-900">Improve These</h5>
                        <div className="mt-2 space-y-2">
                          {(answerReport.improve || answerReport.missing || []).map((item, index) => (
                            <p key={index} className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">
                              {item}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
