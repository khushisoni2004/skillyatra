import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Target } from "lucide-react";
import api from "../lib/api";

export default function ProfileSetup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    college: "",
    branch: "",
    year: "",
    skillLevel: "",
    targetGoal: "",
    targetCompanies: "",
    dailyStudyTime: "",
    preferredLanguage: "",
    weakAreas: "",
    strongAreas: ""
  });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function updateField(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  async function submitProfile(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      await api.post("/profile", form);

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Profile save failed. Please login again."
      );
    } finally {
      setSaving(false);
    }
  }

  function skipProfile() {
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
      <div className="w-full max-w-6xl rounded-2xl bg-white border border-slate-200 shadow-xl p-8">
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-4 py-2 text-indigo-700 font-black mb-4">
              <Target size={18} />
              Student Profile
            </div>

            <h1 className="text-4xl font-black text-slate-900">
              Complete Your Profile
            </h1>

            <p className="text-slate-500 font-bold mt-3">
              SkillYatra will use this information to personalize your roadmap,
              MCQs, DSA plan, and interview preparation.
            </p>
          </div>

          <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-indigo-600 to-teal-500 text-white flex items-center justify-center shadow-xl">
            <Target size={42} />
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-3xl bg-red-50 border border-red-200 text-red-700 p-5 font-black">
            {error}
          </div>
        )}

        <form onSubmit={submitProfile} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block font-black text-slate-700 mb-2">
                College
              </label>
              <input
                className="input"
                value={form.college}
                onChange={(e) => updateField("college", e.target.value)}
                placeholder="Example: SGSITS, Indore"
              />
            </div>

            <div>
              <label className="block font-black text-slate-700 mb-2">
                Branch
              </label>
              <input
                className="input"
                value={form.branch}
                onChange={(e) => updateField("branch", e.target.value)}
                placeholder="Example: Information Technology"
              />
            </div>

            <div>
              <label className="block font-black text-slate-700 mb-2">
                Year
              </label>
              <select
                className="input"
                value={form.year}
                onChange={(e) => updateField("year", e.target.value)}
              >
                <option value="">Select Year</option>
                <option>First Year</option>
                <option>Second Year</option>
                <option>Third Year</option>
                <option>Final Year</option>
                <option>Graduate</option>
              </select>
            </div>

            <div>
              <label className="block font-black text-slate-700 mb-2">
                Skill Level
              </label>
              <select
                className="input"
                value={form.skillLevel}
                onChange={(e) => updateField("skillLevel", e.target.value)}
              >
                <option value="">Select Skill Level</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>

            <div>
              <label className="block font-black text-slate-700 mb-2">
                Target Goal
              </label>
              <select
                className="input"
                value={form.targetGoal}
                onChange={(e) => updateField("targetGoal", e.target.value)}
              >
                <option value="">Select Goal</option>
                <option>Placement Preparation</option>
                <option>Internship Preparation</option>
                <option>DSA Improvement</option>
                <option>Interview Preparation</option>
                <option>Resume Improvement</option>
              </select>
            </div>

            <div>
              <label className="block font-black text-slate-700 mb-2">
                Target Companies
              </label>
              <input
                className="input"
                value={form.targetCompanies}
                onChange={(e) => updateField("targetCompanies", e.target.value)}
                placeholder="Example: TCS, Infosys, Accenture"
              />
            </div>

            <div>
              <label className="block font-black text-slate-700 mb-2">
                Daily Study Time
              </label>
              <select
                className="input"
                value={form.dailyStudyTime}
                onChange={(e) => updateField("dailyStudyTime", e.target.value)}
              >
                <option value="">Select Time</option>
                <option>1 hour</option>
                <option>2 hours</option>
                <option>3 hours</option>
                <option>4 hours</option>
                <option>5+ hours</option>
              </select>
            </div>

            <div>
              <label className="block font-black text-slate-700 mb-2">
                Preferred Language
              </label>
              <select
                className="input"
                value={form.preferredLanguage}
                onChange={(e) => updateField("preferredLanguage", e.target.value)}
              >
                <option value="">Select Language</option>
                <option>English</option>
                <option>Hindi</option>
                <option>English + Hinglish</option>
              </select>
            </div>

            <div>
              <label className="block font-black text-slate-700 mb-2">
                Weak Areas
              </label>
              <input
                className="input"
                value={form.weakAreas}
                onChange={(e) => updateField("weakAreas", e.target.value)}
                placeholder="Example: Aptitude, DSA, Interview"
              />
            </div>

            <div>
              <label className="block font-black text-slate-700 mb-2">
                Strong Areas
              </label>
              <input
                className="input"
                value={form.strongAreas}
                onChange={(e) => updateField("strongAreas", e.target.value)}
                placeholder="Example: React, DBMS, Python"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="btn bg-green-600 hover:bg-green-700 justify-center px-7 py-4"
            >
              <CheckCircle2 size={22} />
              {saving ? "Saving..." : "Save Profile & Continue"}
            </button>

            <button
              type="button"
              onClick={skipProfile}
              className="px-7 py-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 font-black text-slate-700"
            >
              Skip for Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
