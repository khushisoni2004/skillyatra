import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function RoleDetail() {
  const navigate = useNavigate();
  const { companyName, roleId } = useParams();

  const decodedCompanyName = decodeURIComponent(companyName || "");

  const [company, setCompany] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadRole = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE}/api/companies/${encodeURIComponent(decodedCompanyName)}/roles/${encodeURIComponent(roleId)}`
      );

      const data = await res.json();

      setCompany(data.company || null);
      setRole(data.role || null);
    } catch (err) {
      setCompany(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRole();
  }, [decodedCompanyName, roleId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="rounded-2xl bg-white p-8 font-black text-indigo-700 shadow-sm">
          Loading role detail...
        </div>
      </div>
    );
  }

  if (!company || !role) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="rounded-2xl bg-red-50 p-8 font-black text-red-700">
          Role not found in dataset.
        </div>
      </div>
    );
  }

  const skills = role.skills || [];
  const plan = role.howToPrepare || [];
  const locations = role.locations || [];

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <button
        onClick={() => navigate("/companies")}
        className="mb-6 rounded-2xl bg-white px-5 py-3 font-black text-slate-700 shadow-sm ring-1 ring-slate-200"
      >
        ← Back to Companies
      </button>

      <section className="rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-900 to-violet-700 p-8 text-white shadow-xl">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-indigo-100">
          Role Detail
        </p>

        <h1 className="mt-3 text-4xl font-black md:text-5xl">
          {role.roleName}
        </h1>

        <p className="mt-3 text-xl font-bold text-indigo-100">
          {company.companyName}
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-5">
            <p className="text-sm font-bold text-indigo-100">Expected Package</p>
            <h2 className="mt-2 text-xl font-black">{role.expectedPackage}</h2>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-5">
            <p className="text-sm font-bold text-indigo-100">Experience</p>
            <h2 className="mt-2 text-xl font-black">{role.expectedExperience}</h2>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-5">
            <p className="text-sm font-bold text-indigo-100">Job Count</p>
            <h2 className="mt-2 text-4xl font-black">{role.jobCount || 0}</h2>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-5">
            <p className="text-sm font-bold text-indigo-100">Skills</p>
            <h2 className="mt-2 text-4xl font-black">{skills.length}</h2>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-black text-slate-900">Locations</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {locations.length ? (
                locations.map((location, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-black text-indigo-700"
                  >
                    {location}
                  </span>
                ))
              ) : (
                <p className="font-semibold text-slate-500">Location not specified.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-black text-slate-900">Unique Skills</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.length ? (
                skills.map((skill, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-green-50 px-3 py-1 text-sm font-black text-green-700"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="font-semibold text-slate-500">Skill data not available.</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-black text-slate-900">
            How to Prepare
          </h2>

          <div className="mt-5 space-y-3">
            {plan.length ? (
              plan.map((item, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="font-black text-slate-900">
                    Step {index + 1}
                  </p>
                  <p className="mt-1 font-semibold text-slate-700">
                    {item}
                  </p>
                </div>
              ))
            ) : (
              <p className="font-semibold text-slate-500">
                Preparation plan not available.
              </p>
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
            This role information is extracted from dataset rows only. Verify the latest package, eligibility and role details on the official career page before applying.
          </div>
        </div>
      </section>
    </div>
  );
}
