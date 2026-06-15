import { useEffect, useMemo, useState } from "react";
import "./Resources.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const FILE_BASE = API_BASE.replace("/api", "");

const LOGOS = {
  youtube: "/resource-logos/youtube.svg",
  apna: "/resource-logos/apna-college-logo.png",
  abdulbari: "/resource-logos/abdul-bari-logo.png",
  codewithharry: "/resource-logos/codewithharry-logo.png",
  gatesmashers: "/resource-logos/gate-smashers-logo.png",
  lovebabbar: "/resource-logos/love-babbar.svg",
  tuf: "/resource-logos/striver.svg",
  udemy: "/resource-logos/udemy-logo.png",
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
  coursera: "https://www.google.com/s2/favicons?domain=coursera.org&sz=128",
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

const categories = ["Web", "React", "Backend", "DSA", "Core CS", "AI / ML", "Aptitude", "Courses", "Other"];

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
        title: "Web Development Practice Questions",
        subtitle: "HTML, CSS, JavaScript and frontend interview practice questions.",
        type: "Practice Questions",
        logo: LOGOS.gfg,
        url: "https://www.geeksforgeeks.org/web-development/"
      },
      {
        title: "W3Schools Web Practice",
        subtitle: "HTML, CSS and JavaScript examples with practice exercises.",
        type: "W3 Practice",
        logo: LOGOS.w3,
        url: "https://www.w3schools.com/"
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
        title: "React Interview Practice Questions",
        subtitle: "React hooks, components, routing and frontend interview questions.",
        type: "Practice Questions",
        logo: LOGOS.gfg,
        url: "https://www.geeksforgeeks.org/react-interview-questions/"
      },
      {
        title: "React Project YouTube Playlist",
        subtitle: "React project-based playlist for frontend placement preparation.",
        type: "YouTube Playlist",
        logo: LOGOS.youtube,
        url: "https://www.youtube.com/results?search_query=React+project+playlist+frontend+interview"
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
        title: "Backend Interview Practice Questions",
        subtitle: "Node.js, Express, MongoDB, API and authentication practice questions.",
        type: "Practice Questions",
        logo: LOGOS.gfg,
        url: "https://www.geeksforgeeks.org/node-js-interview-questions-and-answers/"
      },
      {
        title: "Backend Project YouTube Playlist",
        subtitle: "Node, Express, MongoDB and REST API project playlist.",
        type: "YouTube Playlist",
        logo: LOGOS.youtube,
        url: "https://www.youtube.com/results?search_query=Node+Express+MongoDB+backend+project+playlist"
      }
    ]
  },
  {
    id: "dsa",
    badge: "DSA PRACTICE",
    title: "DSA & Coding Resources",
    desc: "Coding practice, YouTube video lectures, GFG notes and W3Schools DSA references.",
    cards: [
      {
        title: "Love Babbar / CodeHelp DSA Playlists",
        subtitle: "DSA placement preparation lectures by Love Babbar / CodeHelp.",
        type: "YouTube Video",
        logo: LOGOS.lovebabbar,
        url: "https://www.youtube.com/results?search_query=Love+Babbar+DSA+playlist"
      },
      {
        title: "Abdul Bari Algorithms",
        subtitle: "Clear algorithm and data structure explanations with visual examples.",
        type: "YouTube Video",
        logo: LOGOS.abdulbari,
        url: "https://www.youtube.com/results?search_query=Abdul+Bari+algorithms+data+structures"
      },
      {
        title: "GeeksforGeeks DSA Notes",
        subtitle: "Topic-wise DSA notes, examples, interview problems and explanations.",
        type: "GFG Notes",
        logo: LOGOS.gfg,
        url: "https://www.geeksforgeeks.org/data-structures/"
      },
      {
        title: "DSA Topic-Wise Practice Questions",
        subtitle: "Arrays, strings, linked list, stack, queue, trees and graphs practice.",
        type: "Coding Practice",
        logo: LOGOS.gfg,
        url: "https://practice.geeksforgeeks.org/explore"
      },
      {
        title: "W3Schools DSA Notes",
        subtitle: "Simple DSA reference notes for arrays, stacks, queues, trees and graphs.",
        type: "W3 Notes",
        logo: LOGOS.w3,
        url: "https://www.w3schools.com/dsa/"
      },
      {
        title: "DSA YouTube Practice Playlist",
        subtitle: "Topic-wise DSA problem solving playlist for placements.",
        type: "YouTube Playlist",
        logo: LOGOS.youtube,
        url: "https://www.youtube.com/results?search_query=DSA+practice+questions+playlist+placement"
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
        logo: LOGOS.youtube,
        url: "https://www.youtube.com/results?search_query=Neso+Academy+Operating+System+DBMS+Computer+Networks"
      },
      {
        title: "DBMS Interview Practice Questions",
        subtitle: "SQL, normalization, transactions and indexing practice questions.",
        type: "Practice Questions",
        logo: LOGOS.gfg,
        url: "https://www.geeksforgeeks.org/dbms-interview-questions/"
      },
      {
        title: "Operating System Practice Questions",
        subtitle: "Process, threads, memory, scheduling and deadlock practice questions.",
        type: "Practice Questions",
        logo: LOGOS.gfg,
        url: "https://www.geeksforgeeks.org/operating-systems-interview-questions/"
      },
      {
        title: "GFG Computer Networks",
        subtitle: "CN notes: OSI, TCP/IP, routing, DNS, HTTP and protocols.",
        type: "Notes",
        logo: LOGOS.gfg,
        url: "https://www.geeksforgeeks.org/computer-network-tutorials/"
      },
      {
        title: "Core CS YouTube Playlist",
        subtitle: "DBMS, OS, CN and OOPs interview preparation playlist.",
        type: "YouTube Playlist",
        logo: LOGOS.youtube,
        url: "https://www.youtube.com/results?search_query=DBMS+OS+CN+OOPs+interview+playlist"
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
        title: "AI / ML Interview Practice Questions",
        subtitle: "Machine learning, model evaluation, Python and AI interview questions.",
        type: "Practice Questions",
        logo: LOGOS.gfg,
        url: "https://www.geeksforgeeks.org/machine-learning-interview-questions/"
      },
      {
        title: "AI / ML Project YouTube Playlist",
        subtitle: "Machine learning and AI project playlist for portfolio preparation.",
        type: "YouTube Playlist",
        logo: LOGOS.youtube,
        url: "https://www.youtube.com/results?search_query=machine+learning+project+playlist+python"
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
        title: "Logical Reasoning Practice",
        subtitle: "Blood relation, direction, series, seating and puzzle practice questions.",
        type: "Practice Questions",
        logo: LOGOS.indiabix,
        url: "https://www.indiabix.com/logical-reasoning/questions-and-answers/"
      },
      {
        title: "Aptitude YouTube Playlist",
        subtitle: "Placement aptitude and reasoning playlist for NQT and campus drives.",
        type: "YouTube Playlist",
        logo: LOGOS.youtube,
        url: "https://www.youtube.com/results?search_query=placement+aptitude+reasoning+playlist"
      },
      {
        title: "PrepInsta",
        subtitle: "Company-wise placement preparation resources.",
        type: "Free / Paid",
        logo: LOGOS.prepinsta,
        url: "https://prepinsta.com/"
      }
    ]
  },
  {
    id: "courses",
    badge: "COURSE SEARCH",
    title: "Multiple Course Search Hub",
    desc: "Only paid/custom course resources added by you will appear here.",
    cards: []
  }
];

function getCustomSectionId(category = "", item = {}) {
  const combined = [
    category,
    item?.title,
    item?.description,
    item?.type,
    item?.url
  ].join(" ").toLowerCase();

  if (combined.includes("dbms") || combined.includes("operating system") || combined.includes(" os ") || combined.includes("computer network") || combined.includes(" cn ") || combined.includes("coa") || combined.includes("computer organization") || combined.includes("toc") || combined.includes("compiler")) return "core";
  if (combined.includes("dsa") || combined.includes("striver") || combined.includes("takeuforward") || combined.includes("love babbar") || combined.includes("codehelp") || combined.includes("data structure") || combined.includes("algorithm") || combined.includes("coding sheet") || combined.includes("practice sheet")) return "dsa";
  if (combined.includes("react") || combined.includes("redux") || combined.includes("hooks")) return "react";
  if (combined.includes("backend") || combined.includes("node") || combined.includes("express") || combined.includes("mongodb") || combined.includes("api") || combined.includes("server")) return "backend";
  if (combined.includes("web") || combined.includes("html") || combined.includes("css") || combined.includes("javascript") || combined.includes("frontend") || combined.includes("mdn") || combined.includes("freecodecamp")) return "web";
  if (combined.includes("ai") || combined.includes("ml") || combined.includes("machine learning") || combined.includes("data science") || combined.includes("kaggle") || combined.includes("python") || combined.includes("pandas")) return "ai";
  if (combined.includes("aptitude") || combined.includes("reasoning") || combined.includes("verbal") || combined.includes("nqt") || combined.includes("placement test")) return "aptitude";
  if (combined.includes("paid") || combined.includes("udemy") || combined.includes("coursera") || combined.includes("course")) return "courses";

  return "web";
}

function customToResourceCard(item) {
  const fileLink = item?.fileUrl ? `${FILE_BASE}${item.fileUrl}` : "";
  const openUrl = item?.url || fileLink;

  return {
    custom: true,
    deleteId: item?._id || item?.id,
    sectionId: getCustomSectionId(item?.category, item),
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
        return { ...section, cards: sectionCustomCards };
      }

      return { ...section, cards: [...section.cards, ...sectionCustomCards] };
    });

    if (active === "all") return mergedSections.filter((section) => section.cards.length > 0);
    if (active === "custom") return [];
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
      setActive(getCustomSectionId(form.category, form));
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
                  <div className="pro-resource-card custom-resource-inline" key={`${card.title}-${card.deleteId}`}>
                    <div className="logo-wrap">
                      <img src={card.logo} alt={card.title} onError={(e) => { e.currentTarget.src = LOGOS.youtube; }} />
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
                  <a className="pro-resource-card" href={card.url} target="_blank" rel="noreferrer" key={card.title}>
                    <div className="logo-wrap">
                      <img src={card.logo} alt={card.title} onError={(e) => { e.currentTarget.src = LOGOS.youtube; }} />
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
              <p>Saved in MongoDB Atlas. Delete button se remove kar sakte ho.</p>
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
              <option>Practice Sheet</option>
              <option>Video Playlist</option>
              <option>Course</option>
              <option>Paid Course</option>
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
        </section>
      )}
    </div>
  );
}
