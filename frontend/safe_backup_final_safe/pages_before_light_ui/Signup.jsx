import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail, User } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("Devendra");
  const [email, setEmail] = useState("dev@gmail.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);

  const saveAndEnter = (user = {}) => {
    localStorage.setItem(
      "skillyatra_user",
      JSON.stringify({
        name: user.name || name || "Devendra",
        email: user.email || email || "dev@gmail.com"
      })
    );

    navigate("/dashboard", { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        if (data.token) localStorage.setItem("skillyatra_token", data.token);
        saveAndEnter(data.user);
        return;
      }

      saveAndEnter({ name, email });
    } catch {
      saveAndEnter({ name, email });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef4fb] px-6 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-slate-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-emerald-500 text-3xl font-black text-white shadow-lg">
            S
          </div>

          <h2 className="mt-6 text-center text-3xl font-black text-slate-950">
            Create Account
          </h2>

          <p className="mt-2 text-center text-sm font-semibold text-slate-500">
            Start your placement preparation journey.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-black text-slate-700">Full Name</span>
              <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50">
                <User className="h-5 w-5 text-slate-400" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="h-full flex-1 border-none bg-transparent text-sm font-bold text-slate-900 outline-none"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-black text-slate-700">Email</span>
              <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50">
                <Mail className="h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="h-full flex-1 border-none bg-transparent text-sm font-bold text-slate-900 outline-none"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-black text-slate-700">Password</span>
              <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50">
                <Lock className="h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="h-full flex-1 border-none bg-transparent text-sm font-bold text-slate-900 outline-none"
                  required
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-black text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Sign Up"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-semibold text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-black text-indigo-600">
              Login
            </Link>
          </p>

          <Link
            to="/"
            className="mt-4 block text-center text-sm font-black text-slate-500 hover:text-indigo-600"
          >
            Back to Home
          </Link>
        </section>

        <section className="hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-indigo-900 to-blue-600 p-10 text-white shadow-2xl lg:block">
          <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-black">
            New Journey
          </div>

          <h1 className="mt-8 text-5xl font-black leading-tight">
            Build your placement profile step by step.
          </h1>

          <p className="mt-5 max-w-xl text-base font-semibold leading-7 text-indigo-100">
            Save your progress, track skill gaps, practice role-wise, and prepare confidently.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            {["Daily Planner", "DSA Tracker", "Mock Interview", "Resume Coach"].map((item) => (
              <div key={item} className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/20">
                <p className="text-sm font-black">{item}</p>
                <p className="mt-1 text-xs font-bold text-indigo-100">Included</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
