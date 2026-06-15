import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Companies.css";

import { BACKEND_BASE } from "../lib/config";
const API_BASE = BACKEND_BASE;

export default function CompanyDetail() {
  const navigate = useNavigate();
  const { companyName } = useParams();

  const decodedCompanyName = decodeURIComponent(companyName || "");

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCompany = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE}/api/companies/${encodeURIComponent(decodedCompanyName)}`
      );
      const data = await res.json();
      setCompany(data.company || null);
    } catch (err) {
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompany();
  }, [decodedCompanyName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="rounded-3xl bg-white p-8 font-black text-indigo-700 shadow-sm ring-1 ring-slate-200">
          Loading company detail...
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="rounded-3xl bg-red-50 p-8 font-black text-red-700 ring-1 ring-red-100">
          Company not found in dataset.
        </div>
      </div>
    );
  }

  const info = company.companyInfo || {};
  const topLocations = info.topLocations || [];
  const topSkills = company.topSkills || [];
  const roles = company.roles || [];

  return (
    <div className="company-detail-theme-page min-h-screen">
      <button
        onClick={() => navigate("/companies")}
        className="mb-6 rounded-2xl bg-white px-5 py-3 font-black text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-indigo-50 hover:text-indigo-700"
      >
        ← Back to Companies
      </button>

      <section className="companies-theme-hero">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute -bottom-28 left-20 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative z-10">
          <p className="companies-theme-kicker">
            Company Detail
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
            {company.companyName}
          </h1>

          <p className="mt-4 max-w-4xl text-sm font-semibold leading-6 text-indigo-100">
            Company information, roles, package, experience and skills are generated only from your uploaded job market dataset.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-sm font-bold text-indigo-100">Job Rows</p>
              <h2 className="mt-2 text-4xl font-black">{company.totalJobCount}</h2>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-sm font-bold text-indigo-100">Roles</p>
              <h2 className="mt-2 text-4xl font-black">{roles.length}</h2>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-sm font-bold text-indigo-100">Rating</p>
              <h2 className="mt-2 text-4xl font-black">{info.rating || "NA"}</h2>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-sm font-bold text-indigo-100">Reviews</p>
              <h2 className="mt-2 text-4xl font-black">{info.reviewsCount || "NA"}</h2>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-black text-slate-900">Top Locations</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {topLocations.length ? (
              topLocations.map((item, index) => (
                <span
                  key={index}
                  className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-black text-indigo-700"
                >
                  {item.name} ({item.count})
                </span>
              ))
            ) : (
              <p className="font-semibold text-slate-500">
                No location data available.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-black text-slate-900">Top Skills</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {topSkills.length ? (
              topSkills.map((skill, index) => (
                <span
                  key={index}
                  className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-700"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="font-semibold text-slate-500">
                No skill data available.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-black text-slate-900">
          Roles in {company.companyName}
        </h2>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {roles.map((role, index) => (
            <div
              key={index}
              className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-100"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {role.roleName}
                  </h3>
                  <p className="mt-2 text-sm font-bold text-slate-500">
                    {(role.locations || []).slice(0, 3).join(", ") ||
                      "Location not specified"}
                  </p>
                </div>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                  {role.expectedPackage}
                </span>
              </div>

              <p className="mt-3 text-sm font-bold text-slate-500">
                Experience: {role.expectedExperience}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {(role.skills || []).slice(0, 8).map((skill, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-white px-3 py-1 text-xs font-black text-indigo-700 ring-1 ring-indigo-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <button
                onClick={() =>
                  navigate(
                    `/companies/${encodeURIComponent(company.companyName)}/roles/${index + 1}`
                  )
                }
                className="mt-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-100 transition hover:scale-[1.02]"
              >
                Open full role page →
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
