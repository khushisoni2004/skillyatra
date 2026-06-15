import { useEffect, useMemo, useState } from "react";
import "./Resources.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const FILE_BASE = API_BASE.replace("/api", "");

const sections = [
  {
    id: "web",
    badge: "WEB DEV",
    title: "Web Development",
    desc: "HTML, CSS, JavaScript, Git, deployment and full website building.",
    videos: [
      { title: "Apna College Web Development", url: "https://www.youtube.com/@ApnaCollegeOfficial" },
      { title: "CodeWithHarry Web Dev", url: "https://www.youtube.com/@CodeWithHarry" },
      { title: "freeCodeCamp Web Full Course", url: "https://www.youtube.com/@freecodecamp" }
    ],
    resources: [
      { title: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/" },
      { title: "freeCodeCamp Learn", url: "https://www.freecodecamp.org/learn/" },
      { title: "The Odin Project", url: "https://www.theodinproject.com/" }
    ]
  },
  {
    id: "react",
    badge: "REACT",
    title: "React Frontend",
    desc: "React components, hooks, routing, state management and frontend projects.",
    videos: [
      { title: "React Official Learning", url: "https://react.dev/learn" },
      { title: "CodeWithHarry React", url: "https://www.youtube.com/@CodeWithHarry" },
      { title: "freeCodeCamp React", url: "https://www.youtube.com/@freecodecamp" }
    ],
    resources: [
      { title: "React Docs", url: "https://react.dev/learn" },
      { title: "Vite Docs", url: "https://vitejs.dev/guide/" },
      { title: "React Router Docs", url: "https://reactrouter.com/" }
    ]
  },
  {
    id: "backend",
    badge: "BACKEND",
    title: "Backend Development",
    desc: "Node.js, Express, APIs, authentication, MongoDB and deployment.",
    videos: [
      { title: "Node.js freeCodeCamp", url: "https://www.youtube.com/@freecodecamp" },
      { title: "CodeWithHarry Backend", url: "https://www.youtube.com/@CodeWithHarry" },
      { title: "MongoDB Official", url: "https://www.youtube.com/@MongoDB" }
    ],
    resources: [
      { title: "Express Docs", url: "https://expressjs.com/" },
      { title: "MongoDB Docs", url: "https://www.mongodb.com/docs/" },
      { title: "Render Deploy Docs", url: "https://render.com/docs" }
    ]
  },
  {
    id: "dsa",
    badge: "DSA",
    title: "DSA & Coding Practice",
    desc: "Topic-wise coding, interview patterns and competitive programming.",
    videos: [
      { title: "Striver Take U Forward", url: "https://www.youtube.com/@takeUforward" },
      { title: "Abdul Bari Algorithms", url: "https://www.youtube.com/@abdul_bari" },
      { title: "Apna College DSA", url: "https://www.youtube.com/@ApnaCollegeOfficial" }
    ],
    resources: [
      { title: "Striver A2Z Sheet", url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/" },
      { title: "LeetCode", url: "https://leetcode.com/problemset/" },
      { title: "GeeksforGeeks Practice", url: "https://practice.geeksforgeeks.org/" }
    ]
  },
  {
    id: "core",
    badge: "CORE CS",
    title: "Core CS Subjects",
    desc: "DBMS, OS, CN, OOPs and interview-focused theory preparation.",
    videos: [
      { title: "Neso Academy", url: "https://www.youtube.com/@nesoacademy" },
      { title: "Gate Smashers", url: "https://www.youtube.com/@GateSmashers" },
      { title: "Knowledge Gate", url: "https://www.youtube.com/@KnowledgeGATE" }
    ],
    resources: [
      { title: "GFG DBMS", url: "https://www.geeksforgeeks.org/dbms/" },
      { title: "GFG Operating System", url: "https://www.geeksforgeeks.org/operating-systems/" },
      { title: "GFG Computer Networks", url: "https://www.geeksforgeeks.org/computer-network-tutorials/" }
    ]
  },
  {
    id: "ai",
    badge: "AI / ML",
    title: "AI, ML & Gen AI",
    desc: "Python, ML, data science, transformers, Gen AI and project learning.",
    videos: [
      { title: "Krish Naik", url: "https://www.youtube.com/@krishnaik06" },
      { title: "CampusX", url: "https://www.youtube.com/@campusx-official" },
      { title: "Hugging Face", url: "https://www.youtube.com/@HuggingFace" }
    ],
    resources: [
      { title: "Kaggle Learn", url: "https://www.kaggle.com/learn" },
      { title: "Google ML Crash Course", url: "https://developers.google.com/machine-learning/crash-course" },
      { title: "Hugging Face Course", url: "https://huggingface.co/learn" }
    ]
  },
  {
    id: "aptitude",
    badge: "APTITUDE",
    title: "Aptitude & Reasoning",
    desc: "Quantitative aptitude, logical reasoning and verbal ability.",
    videos: [
      { title: "CareerRide Aptitude", url: "https://www.youtube.com/@CareerRideOfficial" },
      { title: "Freshersworld Aptitude", url: "https://www.youtube.com/@Freshersworld" },
      { title: "Feel Free To Learn", url: "https://www.youtube.com/@FeelFreetoLearn" }
    ],
    resources: [
      { title: "IndiaBIX Aptitude", url: "https://www.indiabix.com/aptitude/questions-and-answers/" },
      { title: "IndiaBIX Reasoning", url: "https://www.indiabix.com/logical-reasoning/questions-and-answers/" },
      { title: "IndiaBIX Verbal", url: "https://www.indiabix.com/verbal-ability/questions-and-answers/" }
    ]
  },
  {
    id: "paid",
    badge: "PAID",
    title: "Paid Course Platforms",
    desc: "Structured paid platforms for full-stack, DSA, AI and career programs.",
    videos: [
      { title: "Udemy", url: "https://www.udemy.com/" },
      { title: "Coursera", url: "https://www.coursera.org/" },
      { title: "Coding Ninjas", url: "https://www.codingninjas.com/" }
    ],
    resources: [
      { title: "PW Skills", url: "https://pwskills.com/" },
      { title: "Scaler", url: "https://www.scaler.com/" },
      { title: "UpGrad", url: "https://www.upgrad.com/" }
    ]
  }
];

const categories = [
  "Web Development",
  "React",
  "Backend",
  "DSA",
  "Core CS",
  "AI / ML",
  "Aptitude",
  "Resume",
  "College",
  "Other"
];

export default function Resources() {
  const [active, setActive] = useState("all");
  const [custom, setCustom] = useState([]);
  const [form, setForm] = useState({
    title: "",
    category: "DSA",
    type: "Link",
    url: "",
    description: ""
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const filteredSections = useMemo(() => {
    if (active === "all") return sections;
    return sections.filter((s) => s.id === active);
  }, [active]);

  async function loadCustom() {
    try {
      const res = await fetch(`${API_BASE}/resources`);
      const data = await res.json();
      setCustom(data.resources || []);
    } catch {
      setCustom([]);
    }
  }

  useEffect(() => {
    loadCustom();
  }, []);

  async function addResource(e) {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("Title required");
      return;
    }

    if (!form.url.trim() && !file) {
      alert("Add link or upload PDF/TXT file");
      return;
    }

    const body = new FormData();
    body.append("title", form.title);
    body.append("category", form.category);
    body.append("type", form.type);
    body.append("url", form.url);
    body.append("description", form.description);
    if (file) body.append("file", file);

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/resources`, {
        method: "POST",
        body
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.message || "Failed");

      setForm({
        title: "",
        category: "DSA",
        type: "Link",
        url: "",
        description: ""
      });
      setFile(null);
      await loadCustom();
    } catch (err) {
      alert(err.message || "Resource add failed");
    } finally {
      setLoading(false);
    }
  }

  async function deleteResource(id) {
    const ok = confirm("Delete this resource?");
    if (!ok) return;

    try {
      await fetch(`${API_BASE}/resources/${id}`, { method: "DELETE" });
      await loadCustom();
    } catch {
      alert("Delete failed");
    }
  }

  return (
    <div className="resources-page">
      <section className="resources-hero">
        <div>
          <span className="resources-kicker">RESOURCES</span>
          <h1>Placement Learning Hub</h1>
        </div>
      </section>

      <section className="resources-intro">
        <h2>Subject-wise videos, courses, PDFs and practice resources</h2>
        <p>
          DSA, React, Backend, Web Development, Core CS, Aptitude, AI/ML and paid learning platforms are arranged in separate sections.
        </p>
      </section>

      <div className="resources-tabs">
        <button className={active === "all" ? "active" : ""} onClick={() => setActive("all")}>All</button>
        {sections.map((s) => (
          <button key={s.id} className={active === s.id ? "active" : ""} onClick={() => setActive(s.id)}>
            {s.title}
          </button>
        ))}
      </div>

      <section className="resources-section-grid">
        {filteredSections.map((section) => (
          <div className="learning-section" key={section.id}>
            <div className="learning-head">
              <span>{section.badge}</span>
              <h2>{section.title}</h2>
              <p>{section.desc}</p>
            </div>

            <div className="learning-columns">
              <div className="learning-box">
                <h3>Best YouTube / Video Links</h3>
                {section.videos.map((v) => (
                  <a key={v.title} href={v.url} target="_blank" rel="noreferrer">
                    <strong>{v.title}</strong>
                    <b>Watch →</b>
                  </a>
                ))}
              </div>

              <div className="learning-box">
                <h3>Resources / Practice Links</h3>
                {section.resources.map((r) => (
                  <a key={r.title} href={r.url} target="_blank" rel="noreferrer">
                    <strong>{r.title}</strong>
                    <b>Open →</b>
                  </a>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="custom-resource-panel">
        <div className="custom-head">
          <span>ADD YOUR OWN</span>
          <h2>Add Link / PDF / TXT Resource</h2>
          <p>Your added resources are saved in backend JSON and will not delete on refresh.</p>
        </div>

        <form className="resource-form" onSubmit={addResource}>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Resource title"
          />

          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>

          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option>Link</option>
            <option>PDF</option>
            <option>TXT</option>
            <option>Notes</option>
            <option>Video</option>
          </select>

          <input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="Paste link URL"
          />

          <input
            type="file"
            accept=".pdf,.txt,.doc,.docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Short description"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Add Resource"}
          </button>
        </form>

        <div className="custom-list">
          {custom.length === 0 ? (
            <div className="empty-custom">No custom resources added yet.</div>
          ) : (
            custom.map((item) => (
              <div className="custom-card" key={item.id}>
                <span>{item.category} • {item.type}</span>
                <h3>{item.title}</h3>
                {item.description && <p>{item.description}</p>}

                <div className="custom-actions">
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noreferrer">Open Link</a>
                  )}
                  {item.fileUrl && (
                    <a href={`${FILE_BASE}${item.fileUrl}`} target="_blank" rel="noreferrer">
                      Open File
                    </a>
                  )}
                  <button onClick={() => deleteResource(item.id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
