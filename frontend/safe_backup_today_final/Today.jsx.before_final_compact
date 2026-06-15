import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Plus,
  RotateCcw,
  Sparkles,
  Target,
  Trash2
} from "lucide-react";

function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

function displayDate(date) {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function dayName(date) {
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem("skillyatra_today_tasks") || "{}");
  } catch {
    return {};
  }
}

function saveTasks(data) {
  localStorage.setItem("skillyatra_today_tasks", JSON.stringify(data));
}

export default function TodayPlan() {
  const now = new Date();
  const [selectedDate, setSelectedDate] = useState(dateKey(now));
  const [taskText, setTaskText] = useState("");
  const [tasksByDate, setTasksByDate] = useState(loadTasks());

  const selected = new Date(selectedDate);
  const tasks = tasksByDate[selectedDate] || [];

  const completed = tasks.filter((task) => task.done).length;
  const pending = tasks.length - completed;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  const weekDays = useMemo(() => {
    const base = new Date();

    return Array.from({ length: 7 }, (_, index) => {
      const d = new Date(base);
      d.setDate(base.getDate() + index - 1);

      const key = dateKey(d);
      const dayTasks = tasksByDate[key] || [];
      const done = dayTasks.filter((task) => task.done).length;

      return {
        key,
        date: d,
        total: dayTasks.length,
        done
      };
    });
  }, [tasksByDate]);

  const updateAll = (next) => {
    setTasksByDate(next);
    saveTasks(next);
  };

  const addTask = () => {
    const text = taskText.trim();
    if (!text) return;

    const next = {
      ...tasksByDate,
      [selectedDate]: [
        ...(tasksByDate[selectedDate] || []),
        {
          id: Date.now(),
          text,
          done: false,
          category: "Study",
          priority: "Medium"
        }
      ]
    };

    updateAll(next);
    setTaskText("");
  };

  const toggleTask = (id) => {
    const next = {
      ...tasksByDate,
      [selectedDate]: tasks.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    };

    updateAll(next);
  };

  const deleteTask = (id) => {
    const next = {
      ...tasksByDate,
      [selectedDate]: tasks.filter((task) => task.id !== id)
    };

    updateAll(next);
  };

  const clearDate = () => {
    const next = { ...tasksByDate };
    delete next[selectedDate];
    updateAll(next);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[radial-gradient(circle_at_15%_5%,rgba(14,165,233,0.16),transparent_30%),radial-gradient(circle_at_90%_8%,rgba(125,211,252,0.25),transparent_32%),linear-gradient(180deg,#ffffff_0%,#f5fcff_48%,#ffffff_100%)] px-5 py-6 font-sans text-slate-950 sm:px-8 lg:px-10">
      <div className="pointer-events-none fixed right-[7%] top-[12%] h-28 w-28 animate-pulse rounded-full border border-sky-100 bg-sky-200/30 blur-[1px]" />
      <div className="pointer-events-none fixed bottom-[14%] right-[5%] h-16 w-16 animate-bounce rounded-full border border-sky-100 bg-cyan-200/30 blur-[1px]" />

      <main className="relative z-10 mx-auto max-w-[1420px]">
        <section className="overflow-hidden rounded-[2rem] border border-sky-100 bg-gradient-to-br from-sky-600 via-sky-400 to-cyan-300 p-6 text-white shadow-[0_34px_90px_rgba(14,165,233,0.22)] sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Personal Study Todo Planner
              </div>

              <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.02] tracking-[-1.4px] text-white sm:text-5xl lg:text-6xl">
                What do you want to study today?
              </h1>

              <p className="mt-4 max-w-3xl text-sm font-bold leading-7 text-white/90 sm:text-base">
                Add your own tasks date-wise. Your todo list stays saved while moving between sections.
              </p>
            </div>

            <div className="rounded-[1.8rem] border border-white/60 bg-white/90 p-6 text-slate-950 shadow-2xl shadow-sky-700/10">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <h2 className="text-5xl font-black tracking-[-1.5px]">{progress}%</h2>
                  <p className="mt-2 text-sm font-extrabold text-slate-500">
                    {completed} of {tasks.length} completed
                  </p>
                </div>

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-sky-200 bg-sky-50 text-sky-600">
                  <Target className="h-8 w-8" />
                </div>
              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-sky-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-7 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-sky-100 bg-white/95 p-6 shadow-[0_20px_50px_rgba(2,132,199,0.08)] backdrop-blur">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-sky-200 bg-sky-50 text-sky-600">
                <CalendarDays className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-black tracking-[-0.5px] text-slate-950">Select Date</h2>
            </div>

            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="mt-5 h-14 w-full rounded-2xl border border-sky-200 bg-white px-4 text-sm font-extrabold text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            />

            <div className="mt-5 rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-5">
              <p className="text-sm font-black text-sky-700">{dayName(selected)}</p>

              <h3 className="mt-2 text-2xl font-black tracking-[-0.6px] text-slate-950">
                {displayDate(selected)}
              </h3>

              <p className="mt-2 text-sm font-bold leading-6 text-slate-600">
                {tasks.length} task{tasks.length === 1 ? "" : "s"} added for this date.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-sky-100 bg-white/95 p-6 shadow-[0_20px_50px_rgba(2,132,199,0.08)] backdrop-blur">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-sky-200 bg-sky-50 text-sky-600">
                <Plus className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-black tracking-[-0.5px] text-slate-950">Add New Todo</h2>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                value={taskText}
                onChange={(event) => setTaskText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") addTask();
                }}
                placeholder="I want to do today..."
                className="h-14 w-full rounded-2xl border border-sky-200 bg-white px-4 text-sm font-extrabold text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              />

              <button
                type="button"
                onClick={addTask}
                className="inline-flex h-14 min-w-[128px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 px-6 text-sm font-black text-white shadow-lg shadow-sky-200 transition hover:-translate-y-1"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>

            <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
              Example: OS revision, JavaScript practice, DBMS joins, 5 DSA problems.
            </p>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-sky-200 bg-sky-50 text-sky-600">
              <CalendarDays className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-black tracking-[-0.5px] text-slate-950">Weekly View</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
            {weekDays.map((day) => {
              const active = day.key === selectedDate;

              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => setSelectedDate(day.key)}
                  className={`rounded-3xl border p-5 text-left shadow-[0_16px_34px_rgba(2,132,199,0.06)] transition hover:-translate-y-1 ${
                    active
                      ? "border-sky-500 bg-gradient-to-br from-sky-500 to-cyan-300 text-white"
                      : "border-sky-100 bg-white text-slate-950 hover:border-sky-300"
                  }`}
                >
                  <p className="text-sm font-black">{dayName(day.date)}</p>

                  <p className={`mt-1 text-sm font-bold ${active ? "text-white/85" : "text-slate-600"}`}>
                    {displayDate(day.date)}
                  </p>

                  <p className="mt-3 text-xs font-black">
                    {day.done}/{day.total} done
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Total Tasks", tasks.length, "text-slate-950"],
            ["Completed", completed, "text-emerald-600"],
            ["Pending", pending, "text-orange-500"],
            ["Progress", `${progress}%`, "text-sky-600"]
          ].map(([label, value, color]) => (
            <div key={label} className="rounded-3xl border border-sky-100 bg-white p-5 shadow-[0_16px_34px_rgba(2,132,199,0.06)]">
              <p className="text-sm font-black text-slate-500">{label}</p>
              <h3 className={`mt-2 text-3xl font-black tracking-[-0.7px] ${color}`}>{value}</h3>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-[2rem] border border-sky-100 bg-white/95 p-6 shadow-[0_20px_50px_rgba(2,132,199,0.08)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-[-0.5px] text-slate-950">
                My Todo List - {dayName(selected)}
              </h2>

              <p className="mt-1 text-sm font-bold text-slate-500">
                {completed} of {tasks.length} completed for {displayDate(selected)}.
              </p>
            </div>

            {tasks.length > 0 && (
              <button
                type="button"
                onClick={clearDate}
                className="inline-flex h-11 items-center gap-2 rounded-2xl bg-red-50 px-4 text-sm font-black text-red-600 transition hover:-translate-y-1 hover:bg-red-100"
              >
                <RotateCcw className="h-4 w-4" />
                Clear This Date
              </button>
            )}
          </div>

          <div className="mt-6 space-y-4">
            {tasks.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-sky-200 bg-gradient-to-br from-white to-sky-50 p-10 text-center">
                <Clock className="mx-auto h-10 w-10 text-slate-400" />

                <h3 className="mt-4 text-lg font-black text-slate-800">
                  No task added for this date
                </h3>

                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Add a task from the input above to start tracking.
                </p>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex flex-col gap-4 rounded-3xl border p-5 transition hover:-translate-y-1 hover:shadow-[0_24px_52px_rgba(2,132,199,0.10)] md:flex-row md:items-center md:justify-between ${
                    task.done
                      ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-sky-50"
                      : "border-sky-100 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${
                        task.done
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-sky-200 bg-white text-transparent"
                      }`}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </button>

                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">
                          Study
                        </span>

                        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
                          Medium
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${
                            task.done
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {task.done ? "Completed" : "Pending"}
                        </span>
                      </div>

                      <h3
                        className={`mt-3 text-lg font-black ${
                          task.done ? "text-slate-500 line-through" : "text-slate-950"
                        }`}
                      >
                        {task.text}
                      </h3>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      className={`rounded-2xl px-4 py-2 text-sm font-black transition hover:-translate-y-1 ${
                        task.done
                          ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                    >
                      {task.done ? "Undo" : "Mark Done"}
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteTask(task.id)}
                      className="rounded-2xl bg-red-50 px-4 py-2 text-sm font-black text-red-600 transition hover:-translate-y-1 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
