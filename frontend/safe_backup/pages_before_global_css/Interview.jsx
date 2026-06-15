import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Mic,
  MicOff,
  Play,
  Save,
  Search,
  Upload,
  UserRound,
  Volume2
} from "lucide-react";
import api from "../lib/api";

const tabs = ["All", "HR", "Technical", "Resume"];

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function scoreAnswer(answer, question) {
  const text = String(answer || "").toLowerCase();
  const words = String(answer || "").trim().split(/\s+/).filter(Boolean);

  const errors = [];
  const suggestions = [];

  if (words.length < 35) {
    errors.push("Answer is too short.");
    suggestions.push("Give at least 35-70 words.");
  }

  if (!/project|example|used|built|created|implemented|worked|result|impact|learned/.test(text)) {
    errors.push("Add project/example connection.");
    suggestions.push("Connect answer with your resume project, internship, or real use case.");
  }

  let score = 35;
  if (words.length >= 35) score += 25;
  if (words.length >= 70) score += 15;
  if (/project|built|implemented|used|created/.test(text)) score += 15;
  if (/result|impact|improved|learned/.test(text)) score += 10;

  score = Math.min(score, 100);
  if (errors.length) score = Math.min(score, 65);

  return {
    score,
    errors,
    suggestions,
    status: errors.length ? "Needs improvement" : "Good interview answer"
  };
}

export default function Interview() {
  const [questions, setQuestions] = useState([]);
  const [skills, setSkills] = useState([]);
  const [type, setType] = useState("All");
  const [search, setSearch] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [seconds, setSeconds] = useState(30 * 60);
  const [started, setStarted] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const current = questions[currentIndex];

  async function loadQuestions() {
    try {
      setLoading(true);

      const params = { limit: 300 };

      if (type !== "All") params.type = type;
      if (search.trim()) params.search = search.trim();

      const { data } = await api.get("/interview/all", { params });

      setQuestions(data || []);
      setCurrentIndex(0);
      setAnswer("");
      setFeedback(null);
    } catch (err) {
      alert("Interview questions not loading. Check backend API and database.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuestions();
  }, [type]);

  useEffect(() => {
    if (!started) return;

    const t = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          speak("Your thirty minute mock interview is completed.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [started]);

  async function toggleCamera() {
    if (videoOn) {
      streamRef.current?.getTracks()?.forEach((track) => track.stop());
      streamRef.current = null;
      setVideoOn(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setVideoOn(true);
    } catch {
      alert("Camera blocked. Use Chrome, allow Camera/Microphone from lock icon, then refresh.");
    }
  }

  function speak(text) {
    if (!window.speechSynthesis || !text) return;

    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-IN";
    utter.rate = 0.95;
    utter.pitch = 1;

    window.speechSynthesis.speak(utter);
  }

  function speakCurrentQuestion() {
    if (!current) return;
    speak(current.question);
  }

  function startVoiceAnswer() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice answer works in Chrome browser.");
      return;
    }

    const recog = new SpeechRecognition();
    recog.lang = "en-IN";
    recog.continuous = false;
    recog.interimResults = false;

    recog.onstart = () => setListening(true);
    recog.onend = () => setListening(false);

    recog.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setAnswer((prev) => `${prev} ${text}`.trim());
    };

    recog.start();
  }

  async function analyzeResume() {
    try {
      setLoading(true);

      const form = new FormData();

      if (resumeFile) form.append("resume", resumeFile);
      form.append("resumeText", resumeText);

      const { data } = await api.post("/interview/analyze-resume", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setSkills(data.skills || []);
      setQuestions(data.questions || []);
      setCurrentIndex(0);
      setAnswer("");
      setFeedback(null);

      if ((data.questions || []).length) {
        speak("Resume analysed. I will start asking questions based on your resume and dataset.");
        setTimeout(() => speak(data.questions[0].question), 1500);
      } else {
        alert("No dataset questions found. Import interview dataset first.");
      }
    } catch (err) {
      alert("Resume analysis failed. Check backend and database.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function startInterview() {
    if (!questions.length) {
      alert("No interview questions loaded. Click Apply Filters or Analyse Resume first.");
      return;
    }

    setStarted(true);
    setSeconds(30 * 60);
    speak(`Mock interview started. Question one. ${questions[0].question}`);
  }

  function checkAnswer() {
    if (!current) return;
    setFeedback(scoreAnswer(answer, current));
  }

  async function saveAnswer() {
    if (!current || !answer.trim()) {
      alert("Write or speak your answer first.");
      return;
    }

    const result = feedback || scoreAnswer(answer, current);

    await api.post("/interview/save-answer", {
      questionId: current._id,
      question: current.question,
      answer,
      score: result.score,
      feedback: result.status
    });

    alert("Answer saved.");
  }

  function nextQuestion() {
    if (currentIndex < questions.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      setAnswer("");
      setFeedback(null);
      speak(`Next question. ${questions[next].question}`);
    }
  }

  function previousQuestion() {
    if (currentIndex > 0) {
      const prev = currentIndex - 1;
      setCurrentIndex(prev);
      setAnswer("");
      setFeedback(null);
      speak(`Previous question. ${questions[prev].question}`);
    }
  }

  return (
    <div className="space-y-7">
      <div className="gradient-hero p-8 lg:p-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-2 font-bold text-sm">
              Real Video Interview
            </span>
            <h1 className="text-4xl lg:text-5xl font-black mt-5 tracking-tight">
              AI Mock Interview Room
            </h1>
            <p className="text-indigo-50 text-lg mt-3 max-w-3xl font-medium">
              Upload resume, start camera, hear questions in voice, answer by speaking, and get instant feedback.
            </p>
          </div>

          <div className="bg-white/15 border border-white/20 rounded-3xl p-5 min-w-[220px]">
            <div className="flex items-center gap-2 text-indigo-100 font-bold">
              <Clock size={18} />
              Interview Timer
            </div>
            <h2 className="text-5xl font-black mt-2">{formatTime(seconds)}</h2>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-4 gap-6">
        <div className="card xl:col-span-3 space-y-5">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setType(tab)}
                className={`px-4 py-2 rounded-xl font-black border ${
                  type === tab
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-indigo-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                className="input pl-11"
                placeholder="Search React, DBMS, OOP, project..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button className="btn" onClick={loadQuestions}>
              Apply Filters
            </button>

            <button className="btn btn-green" onClick={startInterview}>
              <Play size={18} />
              Start 30 Min Interview
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="text-indigo-600" />
              <h2 className="text-xl font-black">Resume Analysis</h2>
            </div>

            <textarea
              className="input min-h-[130px]"
              placeholder="Paste resume text here, or upload PDF/TXT resume below."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />

            <div className="flex flex-wrap gap-3 mt-4">
              <label className="btn btn-secondary cursor-pointer">
                <Upload size={18} />
                Upload Resume PDF/TXT
                <input
                  type="file"
                  accept=".pdf,.txt"
                  className="hidden"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                />
              </label>

              <button className="btn" onClick={analyzeResume}>
                Analyse Resume & Ask Dataset Questions
              </button>
            </div>

            {resumeFile && (
              <p className="font-bold text-slate-600 mt-3">
                Selected file: {resumeFile.name}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
              {skills.length ? (
                skills.map((s) => <span key={s} className="badge">{s}</span>)
              ) : (
                <p className="text-slate-500 font-bold">Detected skills will show here.</p>
              )}
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <div className="aspect-video bg-slate-950 rounded-3xl overflow-hidden flex items-center justify-center">
            {videoOn ? (
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-white">
                <UserRound size={46} className="mx-auto mb-3" />
                <p className="font-black">Video Interview Preview</p>
                <p className="text-sm text-slate-300">Use Chrome and allow camera</p>
              </div>
            )}
          </div>

          <button className="btn w-full" onClick={toggleCamera}>
            {videoOn ? <CameraOff size={18} /> : <Camera size={18} />}
            {videoOn ? "Stop Camera" : "Start Camera"}
          </button>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="font-black text-slate-500">Available Questions</p>
            <h2 className="text-4xl font-black">{questions.length}</h2>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="card">
          <h2 className="text-xl font-black mb-4">Interview Queue</h2>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {questions.map((q, i) => (
              <button
                key={q._id}
                onClick={() => {
                  setCurrentIndex(i);
                  setAnswer("");
                  setFeedback(null);
                  speak(q.question);
                }}
                className={`w-full text-left p-3 rounded-2xl border font-bold ${
                  i === currentIndex
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="text-xs opacity-75">{q.type} • {q.role}</div>
                <div className="line-clamp-2">Q{i + 1}. {q.question}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="card lg:col-span-3">
          {loading ? (
            <div className="text-center py-20 font-black">Loading dataset questions...</div>
          ) : !current ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-black">No interview questions loaded</h2>
              <p className="text-slate-500 font-bold mt-2">
                Import interview dataset, then click Apply Filters.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <span className="badge">{current.type}</span>
                <span className="badge">{current.role}</span>
                <span className="badge">{current.difficulty}</span>
                <span className="badge">{current.sourceDataset}</span>
              </div>

              <div>
                <p className="text-slate-500 font-black">
                  Question {currentIndex + 1} of {questions.length}
                </p>
                <h2 className="text-3xl font-black mt-2">{current.question}</h2>
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="btn btn-secondary" onClick={speakCurrentQuestion}>
                  <Volume2 size={18} />
                  Speak Question
                </button>
                <button className="btn" onClick={startVoiceAnswer}>
                  {listening ? <MicOff size={18} /> : <Mic size={18} />}
                  {listening ? "Listening..." : "Voice Answer"}
                </button>
              </div>

              <textarea
                className="input min-h-[220px] text-base"
                placeholder="Your spoken or typed answer will appear here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />

              <div className="flex flex-wrap gap-3">
                <button className="btn btn-secondary" onClick={previousQuestion} disabled={currentIndex === 0}>
                  <ChevronLeft size={18} />
                  Previous
                </button>

                <button className="btn" onClick={checkAnswer}>
                  Check Answer
                </button>

                <button className="btn btn-green" onClick={saveAnswer}>
                  <Save size={18} />
                  Save
                </button>

                <button className="btn btn-secondary" onClick={nextQuestion} disabled={currentIndex === questions.length - 1}>
                  Next
                  <ChevronRight size={18} />
                </button>
              </div>

              {feedback && (
                <div className={`rounded-2xl border p-5 ${
                  feedback.errors.length ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"
                }`}>
                  <h3 className="text-xl font-black">Score: {feedback.score}/100</h3>
                  <p className="font-bold mt-1">{feedback.status}</p>

                  {feedback.errors.length > 0 && (
                    <ul className="list-disc ml-6 mt-3 text-red-700 font-semibold">
                      {feedback.errors.map((e) => <li key={e}>{e}</li>)}
                    </ul>
                  )}

                  {feedback.suggestions.length > 0 && (
                    <ul className="list-disc ml-6 mt-3 font-semibold">
                      {feedback.suggestions.map((s) => <li key={s}>{s}</li>)}
                    </ul>
                  )}
                </div>
              )}

              {current.goodAnswer && (
                <details className="rounded-2xl bg-slate-50 p-4">
                  <summary className="font-black cursor-pointer">Show ideal dataset answer</summary>
                  <p className="mt-3 whitespace-pre-line text-slate-700">{current.goodAnswer}</p>
                </details>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
