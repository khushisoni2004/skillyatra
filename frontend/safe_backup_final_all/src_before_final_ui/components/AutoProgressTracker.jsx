import { useEffect, useRef } from "react";
import { trackProgress } from "../lib/progress";

function getSectionFromPath() {
  const path = window.location.pathname.toLowerCase();

  if (path.includes("dsa")) return "DSA Tracker";
  if (path.includes("practice") || path.includes("mcq")) return "Practice MCQs";
  if (path.includes("resume")) return "Resume Coach";
  if (path.includes("interview")) return "Interview Coach";
  if (path.includes("today")) return "Today Plan";
  if (path.includes("roadmap")) return "Roadmaps";
  if (path.includes("resource")) return "Resources";
  if (path.includes("companies")) return "Companies";
  if (path.includes("progress")) return "Progress";

  return "Dashboard";
}

function shouldTrack(text) {
  const t = String(text || "").toLowerCase();

  return [
    "submit",
    "complete",
    "completed",
    "mark",
    "save",
    "generate",
    "analyze",
    "start",
    "finish",
    "check",
    "answer",
    "upload",
    "next",
    "done",
    "attempt",
    "practice"
  ].some((word) => t.includes(word));
}

export default function AutoProgressTracker() {
  const lastRef = useRef({ key: "", time: 0 });

  useEffect(() => {
    function onClick(event) {
      const target = event.target?.closest?.("button, a, [role='button']");
      if (!target) return;

      const text = target.innerText || target.textContent || target.getAttribute("aria-label") || "";
      const cleanText = String(text).replace(/\s+/g, " ").trim();

      if (!cleanText || !shouldTrack(cleanText)) return;

      const section = getSectionFromPath();
      const key = `${section}-${cleanText}`;
      const now = Date.now();

      if (lastRef.current.key === key && now - lastRef.current.time < 2500) return;

      lastRef.current = { key, time: now };

      trackProgress({
        itemType: "User Action",
        section,
        topic: cleanText.slice(0, 90),
        status: "completed"
      });
    }

    function onRouteActivity() {
      const section = getSectionFromPath();

      if (section === "Progress") return;

      trackProgress({
        itemType: "Page Visit",
        section,
        topic: `${section} opened`,
        status: "started"
      });
    }

    document.addEventListener("click", onClick);
    onRouteActivity();

    return () => {
      document.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}
