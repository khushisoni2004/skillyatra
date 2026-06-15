import { useEffect, useMemo, useState } from "react";
import "./Resources.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const FILE_BASE = API_BASE.replace("/api", "");

const LOGOS = {
  youtube: "https://www.google.com/s2/favicons?domain=youtube.com&sz=128",

  apna: "/resource-logos/apna-college-logo.png",
  abdulbari: "/resource-logos/abdul-bari-logo.png",

  codewithharry: "https://www.google.com/s2/favicons?domain=codewithharry.com&sz=128",
  gatesmashers: "https://www.google.com/s2/favicons?domain=gatesmashers.com&sz=128",
  neso: "https://www.google.com/s2/favicons?domain=nesoacademy.org&sz=128",

  striver: "https://www.google.com/s2/favicons?domain=takeuforward.org&sz=128",
  lovebabbar: "https://www.google.com/s2/favicons?domain=codehelp.in&sz=128",

  gfg: "https://www.google.com/s2/favicons?domain=geeksforgeeks.org&sz=128",
  leetcode: "https://www.google.com/s2/favicons?domain=leetcode.com&sz=128",
  react: "https://www.google.com/s2/favicons?domain=react.dev&sz=128",
  mdn: "https://www.google.com/s2/favicons?domain=developer.mozilla.org&sz=128",
  freecodecamp: "https://www.google.com/s2/favicons?domain=freecodecamp.org&sz=128",
  express: "https://www.google.com/s2/favicons?domain=expressjs.com&sz=128",
  mongodb: "https://www.google.com/s2/favicons?domain=mongodb.com&sz=128",
  kaggle: "https://www.google.com/s2/favicons?domain=kaggle.com&sz=128",
  huggingface: "https://www.google.com/s2/favicons?domain=huggingface.co&sz=128",
  udemy: "https://www.google.com/s2/favicons?domain=udemy.com&sz=128",
  coursera: "https://www.google.com/s2/favicons?domain=coursera.org&sz=128",
  codingninjas: "https://www.google.com/s2/favicons?domain=codingninjas.com&sz=128",
  pwskills: "https://www.google.com/s2/favicons?domain=pwskills.com&sz=128",
  indiabix: "https://www.google.com/s2/favicons?domain=indiabix.com&sz=128",
  prepinsta: "https://www.google.com/s2/favicons?domain=prepinsta.com&sz=128"
};



const tabs = [
  { id: "all", label: "All" },
  { id: "dsa", label: "DSA" },
  { id: "web", label: "Web Dev" },
  { id: "react", label: "React" },
  { id: "backend", label: "Backend" },
  { id: "core", label: "Core CS" },
  { id: "ai", label: "AI / ML" },
  { id: "aptitude", label: "Aptitude" },
  { id: "paid", label: "Paid Courses" },
  { id: "custom", label: "My Resources" }
];

const sections = [
  {
    id: "dsa",
    badge: "DSA",
    title: "DSA & Coding Practice",
    desc: "Best coding channels, DSA sheets and practice platforms.",
    color: "purple",
    cards: [
      {
        title: "Love Babbar DSA",
        subtitle: "DSA sheet and coding playlist",
        type: "YouTube",
        logo: LOGOS.lovebabbar,
        url: "https://www.youtube.com/results?search_query=Love+Babbar+DSA+Sheet"
      },
      {
        title: "Striver / Take U Forward",
        subtitle: "A2Z DSA, SDE Sheet and interviews",
        type: "YouTube + Sheet",
        logo: LOGOS.striver,
        url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/"
      },
      {
        title: "Abdul Bari Algorithms",
        subtitle: "Algorithms explained clearly",
        type: "YouTube",
        logo: LOGOS.abdulbari,
        url: "https://www.youtube.com/results?search_query=Abdul+Bari+algorithms+data+structures"
      },
      {
        title: "GeeksforGeeks Practice",
        subtitle: "Company and topic-wise DSA",
        type: "Practice",
        logo: LOGOS.gfg,
        url: "https://practice.geeksforgeeks.org/"
      }
    ]
  },
  {
    id: "web",
    badge: "WEB DEV",
    title: "Web Development",
    desc: "HTML, CSS, JavaScript, Git, deployment and full website projects.",
    color: "blue",
    cards: [
      {
        title: "Apna College Web Dev",
        subtitle: "Beginner friendly web development",
        type: "YouTube",
        logo: LOGOS.apna,
        url: "https://www.youtube.com/results?search_query=Apna+College+web+development"
      },
      {
        title: "CodeWithHarry Web Dev",
        subtitle: "Hindi full-stack tutorials",
        type: "YouTube",
        logo: LOGOS.codewithharry,
        url: "https://www.youtube.com/results?search_query=CodeWithHarry+web+development"
      },
      {
        title: "freeCodeCamp Web Course",
        subtitle: "Long complete courses",
        type: "YouTube",
        logo: LOGOS.freecodecamp,
        url: "https://www.youtube.com/results?search_query=freecodecamp+web+development+full+course"
      },
      {
        title: "MDN Web Docs",
        subtitle: "Best official web docs",
        type: "Docs",
        logo: LOGOS.mdn,
        url: "https://developer.mozilla.org/en-US/"
      }
    ]
  },
  {
    id: "react",
    badge: "REACT",
    title: "React Frontend",
    desc: "React components, hooks, routing, state and frontend projects.",
    color: "cyan",
    cards: [
      {
        title: "React Official Docs",
        subtitle: "Learn modern React properly",
        type: "Docs",
        logo: LOGOS.react,
        url: "https://react.dev/learn"
      },
      {
        title: "CodeWithHarry React",
        subtitle: "React in Hindi with projects",
        type: "YouTube",
        logo: LOGOS.codewithharry,
        url: "https://www.youtube.com/results?search_query=CodeWithHarry+React+course"
      },
      {
        title: "Apna College React",
        subtitle: "React frontend basics",
        type: "YouTube",
        logo: LOGOS.apna,
        url: "https://www.youtube.com/results?search_query=Apna+College+React"
      },
      {
        title: "React Router",
        subtitle: "Routing for React apps",
        type: "Docs",
        logo: LOGOS.react,
        url: "https://reactrouter.com/"
      }
    ]
  },
  {
    id: "backend",
    badge: "BACKEND",
    title: "Backend Development",
    desc: "Node.js, Express, APIs, MongoDB, auth and deployment.",
    color: "green",
    cards: [
      {
        title: "Node.js Full Course",
        subtitle: "Backend fundamentals",
        type: "YouTube",
        logo: LOGOS.youtube,
        url: "https://www.youtube.com/results?search_query=Node.js+Express+MongoDB+full+course"
      },
      {
        title: "CodeWithHarry Backend",
        subtitle: "Node Express backend in Hindi",
        type: "YouTube",
        logo: LOGOS.codewithharry,
        url: "https://www.youtube.com/results?search_query=CodeWithHarry+Node+Express+MongoDB"
      },
      {
        title: "Express.js Docs",
        subtitle: "Official Express documentation",
        type: "Docs",
        logo: LOGOS.express,
        url: "https://expressjs.com/"
      },
      {
        title: "MongoDB Docs",
        subtitle: "Database and queries",
        type: "Docs",
        logo: LOGOS.mongodb,
        url: "https://www.mongodb.com/docs/"
      }
    ]
  },
  {
    id: "core",
    badge: "CORE CS",
    title: "Core CS Subjects",
    desc: "DBMS, OS, CN, OOPs and interview theory preparation.",
    color: "orange",
    cards: [
      {
        title: "Gate Smashers",
        subtitle: "DBMS, OS, CN, TOC",
        type: "YouTube",
        logo: LOGOS.gatesmashers,
        url: "https://www.youtube.com/results?search_query=Gate+Smashers+DBMS+OS+CN"
      },
      {
        title: "Neso Academy",
        subtitle: "Core CS subject videos",
        type: "YouTube",
        logo: LOGOS.neso,
        url: "https://www.youtube.com/results?search_query=Neso+Academy+Operating+System+DBMS+Computer+Networks"
      },
      {
        title: "GFG DBMS",
        subtitle: "DBMS notes and interview topics",
        type: "Notes",
        logo: LOGOS.youtube,
        url: "https://www.geeksforgeeks.org/dbms/"
      },
      {
        title: "GFG Operating System",
        subtitle: "OS concepts and questions",
        type: "Notes",
        logo: LOGOS.youtube,
        url: "https://www.geeksforgeeks.org/operating-systems/"
      }
    ]
  },
  {
    id: "ai",
    badge: "AI / ML",
    title: "AI, ML & Gen AI",
    desc: "Python, data science, ML models, Gen AI and projects.",
    color: "pink",
    cards: [
      {
        title: "Krish Naik ML",
        subtitle: "Data science and ML projects",
        type: "YouTube",
        logo: LOGOS.youtube,
        url: "https://www.youtube.com/results?search_query=Krish+Naik+Machine+Learning+playlist"
      },
      {
        title: "CampusX ML",
        subtitle: "ML and data science Hindi",
        type: "YouTube",
        logo: LOGOS.youtube,
        url: "https://www.youtube.com/results?search_query=CampusX+Machine+Learning"
      },
      {
        title: "Kaggle Learn",
        subtitle: "Hands-on ML mini courses",
        type: "Free",
        logo: LOGOS.kaggle,
        url: "https://www.kaggle.com/learn"
      },
      {
        title: "Hugging Face Course",
        subtitle: "Transformers and Gen AI",
        type: "Free",
        logo: LOGOS.huggingface,
        url: "https://huggingface.co/learn"
      }
    ]
  },
  {
    id: "aptitude",
    badge: "APTITUDE",
    title: "Aptitude & Reasoning",
    desc: "Quantitative aptitude, logical reasoning and verbal ability.",
    color: "red",
    cards: [
      {
        title: "IndiaBIX Aptitude",
        subtitle: "Quant practice questions",
        type: "Practice",
        logo: LOGOS.indiabix,
        url: "https://www.indiabix.com/aptitude/questions-and-answers/"
      },
      {
        title: "IndiaBIX Reasoning",
        subtitle: "Logical reasoning practice",
        type: "Practice",
        logo: LOGOS.indiabix,
        url: "https://www.indiabix.com/logical-reasoning/questions-and-answers/"
      },
      {
        title: "Freshersworld Aptitude",
        subtitle: "Placement test videos",
        type: "YouTube",
        logo: LOGOS.youtube,
        url: "https://www.youtube.com/results?search_query=Freshersworld+aptitude+placement"
      },
      {
        title: "PrepInsta",
        subtitle: "Company-wise aptitude",
        type: "Free/Paid",
        logo: LOGOS.prepinsta,
        url: "https://prepinsta.com/"
      }
    ]
  },
  {
    id: "paid",
    badge: "PAID",
    title: "Paid Course Platforms",
    desc: "Structured paid courses for job-ready learning.",
    color: "dark",
    cards: [
      {
        title: "Udemy",
        subtitle: "Affordable paid tech courses",
        type: "Paid",
        logo: LOGOS.udemy,
        url: "https://www.udemy.com/"
      },
      {
        title: "Coursera",
        subtitle: "University-level certificates",
        type: "Paid/Audit",
        logo: LOGOS.coursera,
        url: "https://www.coursera.org/"
      },
      {
        title: "Coding Ninjas",
        subtitle: "DSA and full-stack courses",
        type: "Paid",
        logo: LOGOS.codingninjas,
        url: "https://www.codingninjas.com/"
      },
      {
        title: "PW Skills",
        subtitle: "Hindi job-ready programs",
        type: "Paid",
        logo: LOGOS.pwskills,
        url: "https://pwskills.com/"
      }
    ]
  }
];

const categories = ["Web Development", "React", "Backend", "DSA", "Core CS", "AI / ML", "Aptitude", "Resume", "College", "Other"];

export default function Resources() {
  const [active, setActive] = useState("all");
  const [custom, setCustom] = useState([]);
  const [form, setForm] = useState({ title: "", category: "DSA", type: "Link", url: "", description: "" });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const visibleSections = useMemo(() => {
    if (active === "all") return sections;
    if (active === "custom") return [];
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
    if (!form.title.trim()) return alert("Title required");
    if (!form.url.trim() && !file) return alert("Add link or upload PDF/TXT file");

    const body = new FormData();
    Object.entries(form).forEach(([k, v]) => body.append(k, v));
    if (file) body.append("file", file);

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/resources`, { method: "POST", body });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message || "Save failed");
      setForm({ title: "", category: "DSA", type: "Link", url: "", description: "" });
      setFile(null);
      await loadCustom();
    } catch (err) {
      alert(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function deleteResource(id) {
    if (!confirm("Delete this resource?")) return;
    await fetch(`${API_BASE}/resources/${id}`, { method: "DELETE" });
    await loadCustom();
  }

  return (
    <div className="resources-page">
      <section className="resources-hero">
        <div>
          <span className="resources-kicker">RESOURCES</span>
          <h1>Placement Learning Hub</h1>
          <p>Videos, notes, courses, links and your saved PDFs in one place.</p>
        </div>
      </section>

      <div className="resources-tabs">
        {tabs.map((t) => (
          <button key={t.id} className={active === t.id ? "active" : ""} onClick={() => setActive(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <section className="resources-grid">
        {visibleSections.map((section) => (
          <div className={`resource-section ${section.color}`} key={section.id}>
            <div className="section-title-row">
              <span>{section.badge}</span>
              <div>
                <h2>{section.title}</h2>
                <p>{section.desc}</p>
              </div>
            </div>

            <div className="resource-card-grid">
              {section.cards.map((card) => (
                <a className="pro-resource-card" href={card.url} target="_blank" rel="noreferrer" key={card.title}>
                  <div className="logo-wrap">
                    <img src={card.logo} alt={card.title} />
                  </div>
                  <span>{card.type}</span>
                  <h3>{card.title}</h3>
                  <p>{card.subtitle}</p>
                  <b>Open →</b>
                </a>
              ))}
            </div>
          </div>
        ))}
      </section>

      {(active === "all" || active === "custom") && (
        <section className="custom-resource-panel">
          <div className="section-title-row custom-title">
            <span>ADD YOUR OWN</span>
            <div>
              <h2>Add Link / PDF / TXT Resource</h2>
              <p>Saved in backend JSON, refresh ke baad delete nahi hoga. Delete button se hata sakte ho.</p>
            </div>
          </div>

          <form className="resource-form" onSubmit={addResource}>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Resource title" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option>Link</option>
              <option>PDF</option>
              <option>TXT</option>
              <option>Notes</option>
              <option>Video</option>
            </select>
            <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="Paste link URL" />
            <input type="file" accept=".pdf,.txt,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description" />
            <button disabled={saving}>{saving ? "Saving..." : "Add Resource"}</button>
          </form>

          <div className="custom-list">
            {custom.length === 0 ? (
              <div className="empty-custom">No custom resources added yet.</div>
            ) : custom.map((item) => (
              <div className="custom-card" key={item.id}>
                <span>{item.category} • {item.type}</span>
                <h3>{item.title}</h3>
                {item.description && <p>{item.description}</p>}
                <div className="custom-actions">
                  {item.url && <a href={item.url} target="_blank" rel="noreferrer">Open Link</a>}
                  {item.fileUrl && <a href={`${FILE_BASE}${item.fileUrl}`} target="_blank" rel="noreferrer">Open File</a>}
                  <button onClick={() => deleteResource(item.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
