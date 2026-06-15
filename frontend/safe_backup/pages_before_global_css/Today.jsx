import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Plus,
  RotateCcw,
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
    <div className="min-h-screen bg-[#eef4fb] px-8 py-8">
      <section className="rounded-[2rem] bg-gradient-to-r from-violet-700 via-purple-600 to-slate-950 p-8 text-white shadow-xl">
        <div className="grid gap-8 lg:grid-cols-[1fr_230px] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-purple-100">
              Personal Study Todo Planner
            </p>

            <h1 className="mt-4 text-4xl font-black leading-tight">
              What Do You Want To Study Today?
            </h1>

            <p className="mt-3 max-w-3xl text-sm font-semibold text-purple-100">
              Add your own tasks date-wise. Your todo list stays saved while moving between sections.
            </p>
          </div>

          <div className="rounded-[1.6rem] bg-white/10 p-6 ring-1 ring-white/20">
            <h2 className="text-5xl font-black">{progress}%</h2>
            <p className="mt-1 text-sm font-black text-purple-100">
              {completed} of {tasks.length} completed
            </p>
          </div>
        </div>

        <div className="mt-7 h-3 rounded-full bg-white/20">
          <div
            className="h-3 rounded-full bg-white transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-indigo-600" />
            <h2 className="text-2xl font-black text-slate-950">Select Date</h2>
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="mt-5 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
          />

          <div className="mt-5 rounded-2xl bg-indigo-50 p-5 ring-1 ring-indigo-100">
            <p className="text-sm font-black text-indigo-700">{dayName(selected)}</p>

            <h3 className="mt-2 text-2xl font-black text-slate-950">
              {displayDate(selected)}
            </h3>

            <p className="mt-2 text-sm font-bold text-slate-600">
              {tasks.length} task{tasks.length === 1 ? "" : "s"} added for this date.
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center gap-3">
            <Plus className="h-6 w-6 text-indigo-600" />
            <h2 className="text-2xl font-black text-slate-950">Add New Todo</h2>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              value={taskText}
              onChange={(event) => setTaskText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") addTask();
              }}
              placeholder="I want to do today..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
            />

            <button
              type="button"
              onClick={addTask}
              className="inline-flex h-12 min-w-[120px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-black text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>

          <p className="mt-3 text-sm font-semibold text-slate-500">
            Example: OS revision, JavaScript practice, DBMS joins, 5 DSA problems.
          </p>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-5 flex items-center gap-3">
          <CalendarDays className="h-6 w-6 text-indigo-600" />
          <h2 className="text-2xl font-black text-slate-950">Weekly View</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
          {weekDays.map((day) => {
            const active = day.key === selectedDate;

            return (
              <button
                key={day.key}
                type="button"
                onClick={() => setSelectedDate(day.key)}
                className={`rounded-2xl p-5 text-left shadow-sm ring-1 transition ${
                  active
                    ? "bg-indigo-600 text-white ring-indigo-600"
                    : "bg-white text-slate-950 ring-slate-200 hover:bg-indigo-50"
                }`}
              >
                <p className="text-sm font-black">{dayName(day.date)}</p>

                <p className={`mt-1 text-sm font-bold ${active ? "text-indigo-100" : "text-slate-600"}`}>
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
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-black text-slate-500">Total Tasks</p>
          <h3 className="mt-2 text-3xl font-black text-slate-950">{tasks.length}</h3>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-black text-slate-500">Completed</p>
          <h3 className="mt-2 text-3xl font-black text-emerald-600">{completed}</h3>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-black text-slate-500">Pending</p>
          <h3 className="mt-2 text-3xl font-black text-orange-500">{pending}</h3>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-black text-slate-500">Progress</p>
          <h3 className="mt-2 text-3xl font-black text-indigo-600">{progress}%</h3>
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-950">
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
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-50 px-4 text-sm font-black text-red-600 hover:bg-red-100"
            >
              <RotateCcw className="h-4 w-4" />
              Clear This Date
            </button>
          )}
        </div>

        <div className="mt-6 space-y-4">
          {tasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
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
                className={`flex flex-col gap-4 rounded-2xl border p-5 md:flex-row md:items-center md:justify-between ${
                  task.done
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                      task.done
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-300 bg-white text-transparent"
                    }`}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </button>

                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
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
                    className={`rounded-xl px-4 py-2 text-sm font-black ${
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
                    className="rounded-xl bg-red-50 px-4 py-2 text-sm font-black text-red-600 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
