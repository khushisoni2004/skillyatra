import { useEffect, useMemo, useState } from "react";
import "./Resources.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const FILE_BASE = API_BASE.replace("/api", "");

const LOGOS = {
  youtube: "https://www.google.com/s2/favicons?domain=youtube.com&sz=128",
  apna: "/resource-logos/apna-college-logo.png",
  abdulbari: "/resource-logos/abdul-bari-logo.png",
  codewithharry: "/resource-logos/codewithharry-logo.png",
  gatesmashers: "/resource-logos/gate-smashers-logo.png",
  neso: "https://www.google.com/s2/favicons?domain=nesoacademy.org&sz=128",
  lovebabbar: "https://www.google.com/s2/favicons?domain=codehelp.in&sz=128",
  tuf: "https://www.google.com/s2/favicons?domain=takeuforward.org&sz=128",
  gfg: "https://www.google.com/s2/favicons?domain=geeksforgeeks.org&sz=128",
  w3: "https://www.google.com/s2/favicons?domain=w3schools.com&sz=128",
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
  { id: "web", label: "Web" },
  { id: "react", label: "React" },
  { id: "backend", label: "Backend" },
  { id: "dsa", label: "DSA" },
  { id: "core", label: "Core CS" },
  { id: "ai", label: "AI / ML" },
  { id: "aptitude", label: "Aptitude" },
  { id: "courses", label: "Courses" },
  { id: "custom", label: "My Resources" }
];

const sections = [
  {
    id: "web",
    badge: "WEB DEVELOPMENT",
    title: "Web Development Resources",
    desc: "HTML, CSS, JavaScript, responsive UI, deployment and project building.",
    cards: [
      {
        title: "Apna College Web Development",
        subtitle: "Beginner-friendly web development videos and projects.",
        type: "YouTube",
        logo: LOGOS.apna,
        url: "https://www.youtube.com/results?search_query=Apna+College+web+development"
      },
      {
        title: "CodeWithHarry Web Development",
        subtitle: "Hindi tutorials for HTML, CSS, JS and full-stack basics.",
        type: "YouTube",
        logo: LOGOS.codewithharry,
        url: "https://www.youtube.com/results?search_query=CodeWithHarry+web+development"
      },
      {
        title: "W3Schools Web Tutorials",
        subtitle: "HTML, CSS, JavaScript and web examples with practice.",
        type: "Docs",
        logo: LOGOS.w3,
        url: "https://www.w3schools.com/"
      },
      {
        title: "MDN Web Docs",
        subtitle: "Professional reference for frontend web development.",
        type: "Docs",
        logo: LOGOS.mdn,
        url: "https://developer.mozilla.org/en-US/"
      }
    ]
  },
  {
    id: "react",
    badge: "REACT FRONTEND",
    title: "React Learning Resources",
    desc: "React components, hooks, routing, UI design and frontend projects.",
    cards: [
      {
        title: "React Official Docs",
        subtitle: "Best official source for modern React learning.",
        type: "Docs",
        logo: LOGOS.react,
        url: "https://react.dev/learn"
      },
      {
        title: "CodeWithHarry React Course",
        subtitle: "React learning with Hindi explanation and projects.",
        type: "YouTube",
        logo: LOGOS.codewithharry,
        url: "https://www.youtube.com/results?search_query=CodeWithHarry+React+course"
      },
      {
        title: "Apna College React",
        subtitle: "React basics, frontend concepts and project learning.",
        type: "YouTube",
        logo: LOGOS.apna,
        url: "https://www.youtube.com/results?search_query=Apna+College+React"
      },
      {
        title: "W3Schools React",
        subtitle: "React concepts with simple examples and practice.",
        type: "Docs",
        logo: LOGOS.w3,
        url: "https://www.w3schools.com/react/"
      }
    ]
  },
  {
    id: "backend",
    badge: "BACKEND",
    title: "Backend Development Resources",
    desc: "Node.js, Express, MongoDB, APIs, authentication and deployment.",
    cards: [
      {
        title: "CodeWithHarry Backend",
        subtitle: "Backend and Node.js tutorials with Hindi explanation.",
        type: "YouTube",
        logo: LOGOS.codewithharry,
        url: "https://www.youtube.com/results?search_query=CodeWithHarry+Node+Express+MongoDB"
      },
      {
        title: "Express.js Docs",
        subtitle: "Official Express documentation for backend APIs.",
        type: "Docs",
        logo: LOGOS.express,
        url: "https://expressjs.com/"
      },
      {
        title: "MongoDB Docs",
        subtitle: "MongoDB Atlas, queries and database concepts.",
        type: "Docs",
        logo: LOGOS.mongodb,
        url: "https://www.mongodb.com/docs/"
      },
      {
        title: "freeCodeCamp Backend",
        subtitle: "Full backend courses and API project tutorials.",
        type: "YouTube",
        logo: LOGOS.freecodecamp,
        url: "https://www.youtube.com/results?search_query=freecodecamp+node+express+mongodb+backend"
      }
    ]
  },
  {
    id: "dsa",
    badge: "DSA PRACTICE",
    title: "DSA & Coding Resources",
    desc: "Coding practice, algorithm explanations and interview problem solving.",
    cards: [
      {
        title: "Love Babbar / CodeHelp",
        subtitle: "DSA, coding sheets and placement preparation resources.",
        type: "Course / Free",
        logo: LOGOS.lovebabbar,
        url: "https://www.codehelp.in/"
      },
      {
        title: "Abdul Bari Algorithms",
        subtitle: "Clear algorithm and data structure explanations.",
        type: "YouTube",
        logo: LOGOS.abdulbari,
        url: "https://www.youtube.com/results?search_query=Abdul+Bari+algorithms+data+structures"
      },
      {
        title: "GeeksforGeeks Practice",
        subtitle: "Topic-wise and company-wise coding practice.",
        type: "Practice",
        logo: LOGOS.gfg,
        url: "https://practice.geeksforgeeks.org/"
      },
      {
        title: "LeetCode Problemset",
        subtitle: "Interview coding problems and company questions.",
        type: "Practice",
        logo: LOGOS.leetcode,
        url: "https://leetcode.com/problemset/"
      }
    ]
  },
  {
    id: "core",
    badge: "CORE CS",
    title: "Core CS Subject Resources",
    desc: "DBMS, OS, CN, OOPs, TOC and interview theory preparation.",
    cards: [
      {
        title: "Gate Smashers",
        subtitle: "DBMS, OS, CN, TOC and compiler subject videos.",
        type: "YouTube",
        logo: LOGOS.gatesmashers,
        url: "https://www.youtube.com/results?search_query=Gate+Smashers+DBMS+OS+CN+TOC+Compiler"
      },
      {
        title: "Neso Academy",
        subtitle: "Professional core CS and engineering subject videos.",
        type: "YouTube",
        logo: LOGOS.neso,
        url: "https://www.youtube.com/results?search_query=Neso+Academy+Operating+System+DBMS+Computer+Networks"
      },
      {
        title: "GFG DBMS",
        subtitle: "DBMS notes, SQL, normalization and transactions.",
        type: "Notes",
        logo: LOGOS.gfg,
        url: "https://www.geeksforgeeks.org/dbms/"
      },
      {
        title: "GFG Operating System",
        subtitle: "OS notes, scheduling, memory and deadlock topics.",
        type: "Notes",
        logo: LOGOS.gfg,
        url: "https://www.geeksforgeeks.org/operating-systems/"
      }
    ]
  },
  {
    id: "ai",
    badge: "AI / ML",
    title: "AI, ML & Data Science",
    desc: "Python, machine learning, data science, Gen AI and model building.",
    cards: [
      {
        title: "Kaggle Learn",
        subtitle: "Free hands-on courses for ML, Python and data science.",
        type: "Free",
        logo: LOGOS.kaggle,
        url: "https://www.kaggle.com/learn"
      },
      {
        title: "Hugging Face Course",
        subtitle: "Transformers, NLP, datasets and Gen AI learning.",
        type: "Free",
        logo: LOGOS.huggingface,
        url: "https://huggingface.co/learn"
      },
      {
        title: "Coursera AI / ML Search",
        subtitle: "Search ML, AI, Gen AI and data science courses.",
        type: "Course Search",
        logo: LOGOS.coursera,
        url: "https://www.coursera.org/search?query=machine%20learning%20artificial%20intelligence"
      },
      {
        title: "freeCodeCamp ML",
        subtitle: "Free AI, Python and ML full course videos.",
        type: "YouTube",
        logo: LOGOS.freecodecamp,
        url: "https://www.youtube.com/results?search_query=freecodecamp+machine+learning+python+full+course"
      }
    ]
  },
  {
    id: "aptitude",
    badge: "APTITUDE",
    title: "Aptitude & Reasoning",
    desc: "Quantitative aptitude, logical reasoning and verbal ability.",
    cards: [
      {
        title: "IndiaBIX Aptitude",
        subtitle: "Quantitative aptitude practice for placement tests.",
        type: "Practice",
        logo: LOGOS.indiabix,
        url: "https://www.indiabix.com/aptitude/questions-and-answers/"
      },
      {
        title: "IndiaBIX Reasoning",
        subtitle: "Logical reasoning practice questions.",
        type: "Practice",
        logo: LOGOS.indiabix,
        url: "https://www.indiabix.com/logical-reasoning/questions-and-answers/"
      },
      {
        title: "PrepInsta",
        subtitle: "Company-wise placement preparation resources.",
        type: "Free / Paid",
        logo: LOGOS.prepinsta,
        url: "https://prepinsta.com/"
      },
      {
        title: "W3Schools Python Practice",
        subtitle: "Programming basics and practice examples.",
        type: "Practice",
        logo: LOGOS.w3,
        url: "https://www.w3schools.com/python/"
      }
    ]
  },
  {
    id: "courses",
    badge: "COURSE SEARCH",
    title: "Multiple Course Search Hub",
    desc: "Search and choose courses across Web, React, Backend, DSA, AI, ML and placement.",
    cards: [
      {
        title: "Udemy Web Development Search",
        subtitle: "Search full-stack, React, Node and project-based courses.",
        type: "Course Search",
        logo: LOGOS.udemy,
        url: "https://www.udemy.com/courses/search/?q=web%20development"
      },
      {
        title: "Udemy React Search",
        subtitle: "Search React, Redux and frontend project courses.",
        type: "Course Search",
        logo: LOGOS.udemy,
        url: "https://www.udemy.com/courses/search/?q=react"
      },
      {
        title: "CodeWithHarry Course Library",
        subtitle: "Free programming courses, notes and project tutorials.",
        type: "Free Courses",
        logo: LOGOS.codewithharry,
        url: "https://www.codewithharry.com/"
      },
      {
        title: "Apna College Courses",
        subtitle: "Structured programming and web development courses.",
        type: "Courses",
        logo: LOGOS.apna,
        url: "https://www.apnacollege.in/"
      },
      {
        title: "CodeHelp Courses",
        subtitle: "Love Babbar coding, DSA and placement-focused courses.",
        type: "Courses",
        logo: LOGOS.lovebabbar,
        url: "https://www.codehelp.in/"
      },
      {
        title: "Coursera CS Search",
        subtitle: "Search CS, software engineering and AI courses.",
        type: "Course Search",
        logo: LOGOS.coursera,
        url: "https://www.coursera.org/search?query=computer%20science"
      }
    ]
  }
];

const categories = ["Web", "React", "Backend", "DSA", "Core CS", "AI / ML", "Aptitude", "Courses", "Other"];

function getCustomSectionId(category = "") {
  const value = String(category || "").toLowerCase();

  if (value.includes("web")) return "web";
  if (value.includes("react")) return "react";
  if (value.includes("backend")) return "backend";
  if (value.includes("dsa")) return "dsa";
  if (value.includes("core")) return "core";
  if (value.includes("ai") || value.includes("ml")) return "ai";
  if (value.includes("aptitude")) return "aptitude";
  if (value.includes("course")) return "courses";

  return "courses";
}

function customToResourceCard(item) {
  const fileLink = item?.fileUrl ? `${FILE_BASE}${item.fileUrl}` : "";
  const openUrl = item?.url || fileLink;

  return {
    custom: true,
    deleteId: item?._id || item?.id,
    sectionId: getCustomSectionId(item?.category),
    title: item?.title || "Saved Resource",
    subtitle: item?.description || "Custom saved resource from MongoDB Atlas.",
    type: `${item?.category || "Resource"} • ${item?.type || "Link"}`,
    logo: LOGOS.gfg,
    url: openUrl
  };
}

export default function Resources() {
  const [active, setActive] = useState("all");
  const [custom, setCustom] = useState([]);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    title: "",
    category: "DSA",
    type: "Link",
    url: "",
    description: ""
  });

  const visibleSections = useMemo(() => {
    const customCards = (custom || []).map(customToResourceCard);

    const mergedSections = sections.map((section) => {
      const sectionCustomCards = customCards.filter((card) => card.sectionId === section.id);

      if (section.id === "courses") {
        return {
          ...section,
          cards: sectionCustomCards
        };
      }

      return {
        ...section,
        cards: [...section.cards, ...sectionCustomCards]
      };
    });

    if (active === "all") {
      return mergedSections.filter((section) => section.cards.length > 0);
    }

    if (active === "custom") {
      return mergedSections.filter((section) =>
        section.cards.some((card) => card.custom)
      );
    }

    return mergedSections.filter((section) => section.id === active && section.cards.length > 0);
  }, [active, custom]);

  async function loadCustomResources() {
    try {
      const response = await fetch(`${API_BASE}/resources`);
      const data = await response.json();
      setCustom(data.resources || []);
    } catch {
      setCustom([]);
    }
  }

  useEffect(() => {
    loadCustomResources();
  }, []);

  async function handleAddResource(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      alert("Resource title required");
      return;
    }

    if (!form.url.trim() && !file) {
      alert("Add a link or upload PDF/TXT file");
      return;
    }

    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => body.append(key, value));
    if (file) body.append("file", file);

    setSaving(true);

    try {
      const response = await fetch(`${API_BASE}/resources`, {
        method: "POST",
        body
      });

      const data = await response.json();
      if (!data.ok) throw new Error(data.message || "Resource save failed");

      setForm({
        title: "",
        category: "DSA",
        type: "Link",
        url: "",
        description: ""
      });
      setFile(null);
      await loadCustomResources();
    } catch (error) {
      alert(error.message || "Resource save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteResource(id) {
    if (!confirm("Delete this resource?")) return;

    try {
      await fetch(`${API_BASE}/resources/${id}`, { method: "DELETE" });
      await loadCustomResources();
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

      <div className="resources-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={active === tab.id ? "active" : ""}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section className="resources-grid">
        {visibleSections.map((section) => (
          <div className="resource-section" key={section.id}>
            <div className="section-title-row">
              <span>{section.badge}</span>
              <div>
                <h2>{section.title}</h2>
                <p>{section.desc}</p>
              </div>
            </div>

            <div className="resource-card-grid">
              {section.cards.map((card) =>
                card.custom ? (
                  <div
                    className="pro-resource-card custom-resource-inline"
                    key={`${card.title}-${card.deleteId}`}
                  >
                    <div className="logo-wrap">
                      <img src={card.logo} alt={card.title} />
                    </div>

                    <span>{card.type}</span>
                    <h3>{card.title}</h3>
                    <p>{card.subtitle}</p>

                    <div className="custom-actions">
                      {card.url && (
                        <a href={card.url} target="_blank" rel="noreferrer">
                          Open Link
                        </a>
                      )}

                      <button onClick={() => handleDeleteResource(card.deleteId)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <a
                    className="pro-resource-card"
                    href={card.url}
                    target="_blank"
                    rel="noreferrer"
                    key={card.title}
                  >
                    <div className="logo-wrap">
                      <img src={card.logo} alt={card.title} />
                    </div>
                    <span>{card.type}</span>
                    <h3>{card.title}</h3>
                    <p>{card.subtitle}</p>
                    <b>Open →</b>
                  </a>
                )
              )}
            </div>
          </div>
        ))}
      </section>

      {(active === "all" || active === "custom") && (
        <section className="custom-resource-panel">
          <div className="section-title-row">
            <span>MY RESOURCES</span>
            <div>
              <h2>Add Link / PDF / TXT Resource</h2>
              <p>Saved in MongoDB Atlas. Refresh ke baad delete nahi hoga. Delete button se remove kar sakte ho.</p>
            </div>
          </div>

          <form className="resource-form" onSubmit={handleAddResource}>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Resource title"
            />

            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
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

            <button disabled={saving}>{saving ? "Saving..." : "Add Resource"}</button>
          </form>

          <div className="custom-list">
            {custom.length === 0 ? (
              <div className="empty-custom">No custom resources added yet.</div>
            ) : (
              custom.map((item) => (
                <div className="custom-card" key={item._id || item.id}>
                  <span>{item.category} • {item.type}</span>
                  <h3>{item.title}</h3>
                  {item.description && <p>{item.description}</p>}

                  <div className="custom-actions">
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noreferrer">Open Link</a>
                    )}
                    {item.fileUrl && (
                      <a href={`${FILE_BASE}${item.fileUrl}`} target="_blank" rel="noreferrer">Open File</a>
                    )}
                    <button onClick={() => handleDeleteResource(item._id || item.id)}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
