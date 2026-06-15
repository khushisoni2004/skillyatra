
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import api from "../lib/api";

const subjects = [
  "All",
  "DSA",
  "Web Development",
  "Programming",
  "AIML",
  "Data Science",
  "Core CS"
];

const coreTopics = ["All", "DBMS", "CN", "OS", "COA", "DSA"];

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [subject, setSubject] = useState("All");
  const [coreTopic, setCoreTopic] = useState("All");
  const [search, setSearch] = useState("");

  async function load() {
    const params = {};
    if (subject !== "All") params.subject = subject;
    if (subject === "Core CS" && coreTopic !== "All") params.topic = coreTopic;

    const { data } = await api.get("/resources", { params });
    setResources(data || []);
  }

  useEffect(() => {
    load();
  }, [subject, coreTopic]);

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const text = `${r.title} ${r.description} ${r.subject} ${r.topic} ${(r.tags || []).join(" ")}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [resources, search]);

  function openResource(url) {
    if (!url) return alert("Resource link missing");
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Resource Library</h1>
        <p className="text-slate-500">
          Open real lectures, playlists, documentation and core subject notes directly.
        </p>
      </div>

      <div className="card space-y-4">
        <div className="flex flex-wrap gap-2">
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => {
                setSubject(s);
                setCoreTopic("All");
              }}
              className={`px-4 py-2 rounded-xl font-bold border ${
                subject === s
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-700 border-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {subject === "Core CS" && (
          <div className="flex flex-wrap gap-2">
            {coreTopics.map((t) => (
              <button
                key={t}
                onClick={() => setCoreTopic(t)}
                className={`px-4 py-2 rounded-xl font-bold border ${
                  coreTopic === t
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-emerald-50 text-emerald-700 border-emerald-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            className="input pl-11"
            placeholder="Search React, Python, DBMS, OS, DSA, AIML..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((r) => (
          <div key={r._id} className="card hover:shadow-lg transition">
            <div className="flex justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">{r.title}</h2>
                <p className="text-slate-600 mt-1">{r.description}</p>
              </div>
              <span className="h-fit px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                {r.usefulnessScore || 80}%
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <span className="badge">{r.subject}</span>
              <span className="badge">{r.topic}</span>
              <span className="badge">{r.type}</span>
              <span className="badge">{r.level}</span>
              <span className="badge">{r.language}</span>
            </div>

            <button
              onClick={() => openResource(r.url)}
              className="btn mt-5 flex items-center gap-2"
            >
              <ExternalLink size={18} />
              Open Resource
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card text-center text-slate-500">
          No resources found. Run <b>npm run seed</b> again.
        </div>
      )}
    </div>
  );
}
