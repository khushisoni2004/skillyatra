import React, { useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock,
  Plus,
  RotateCcw,
  Sparkles,
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
    <div className="tpFinalRoot">
      <style>{`
        .tpFinalRoot {
          min-height: 100vh;
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
          position: relative;
          padding: 24px;
          color: #0f172a;
          background:
            radial-gradient(circle at 12% 6%, rgba(14,165,233,0.14), transparent 30%),
            radial-gradient(circle at 92% 12%, rgba(125,211,252,0.22), transparent 32%),
            linear-gradient(180deg, #ffffff 0%, #f6fcff 52%, #ffffff 100%);
        }

        .tpFinalRoot * {
          box-sizing: border-box;
        }

        .tpFinalRoot::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(14,165,233,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14,165,233,0.045) 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: linear-gradient(to bottom, black, transparent 82%);
          z-index: 0;
        }

        .tpFloat {
          position: fixed;
          border-radius: 999px;
          pointer-events: none;
          z-index: 0;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.96), rgba(125,211,252,0.30), rgba(14,165,233,0.10));
          border: 1px solid rgba(186,230,253,0.70);
          box-shadow: 0 18px 42px rgba(14,165,233,0.10);
          animation: tpFloat 8s ease-in-out infinite;
        }

        .tpFloat.one {
          width: 95px;
          height: 95px;
          top: 12%;
          right: 7%;
        }

        .tpFloat.two {
          width: 58px;
          height: 58px;
          bottom: 15%;
          right: 5%;
          animation-delay: 2s;
        }

        .tpFloat.three {
          width: 72px;
          height: 72px;
          top: 56%;
          left: 6%;
          animation-delay: 3.4s;
        }

        @keyframes tpFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.55;
          }
          50% {
            transform: translate3d(18px, -22px, 0) scale(1.08);
            opacity: 0.88;
          }
        }

        @keyframes tpFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .tpShell {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 980px;
          margin: 0 auto;
          animation: tpFadeUp 0.55s ease both;
        }

        .tpHero {
          width: 100%;
          border-radius: 28px;
          padding: 24px;
          color: white;
          overflow: hidden;
          background:
            radial-gradient(circle at 84% 18%, rgba(255,255,255,0.34), transparent 28%),
            linear-gradient(135deg, #0284c7 0%, #0ea5e9 56%, #7dd3fc 100%);
          border: 1px solid rgba(186,230,253,0.85);
          box-shadow: 0 28px 70px rgba(14,165,233,0.20);
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(240px, 300px);
          gap: 18px;
          align-items: center;
        }

        .tpTag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 999px;
          padding: 9px 15px;
          background: rgba(255,255,255,0.16);
          border: 1px solid rgba(255,255,255,0.32);
          font-size: 11px;
          font-weight: 950;
          letter-spacing: 2.2px;
          text-transform: uppercase;
        }

        .tpMainTitle {
          margin: 16px 0 0;
          color: white;
          font-size: clamp(34px, 4vw, 50px);
          line-height: 1.02;
          font-weight: 950;
          letter-spacing: -1.4px;
        }

        .tpAnalysis {
          border-radius: 24px;
          background: rgba(255,255,255,0.95);
          color: #0f172a;
          border: 1px solid rgba(255,255,255,0.76);
          padding: 18px;
          box-shadow: 0 18px 45px rgba(2,132,199,0.12);
          min-width: 0;
        }

        .tpAnalysisTop {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .tpAnalysisLabel {
          margin: 0;
          color: #64748b;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 1.2px;
          text-transform: uppercase;
        }

        .tpAnalysisValue {
          margin: 8px 0 0;
          font-size: 40px;
          line-height: 1;
          font-weight: 950;
          letter-spacing: -1px;
        }

        .tpAnalysisSub {
          margin: 8px 0 0;
          color: #64748b;
          font-size: 12.5px;
          font-weight: 800;
          line-height: 1.45;
        }

        .tpIcon {
          width: 50px;
          height: 50px;
          min-width: 50px;
          border-radius: 18px;
          background: #eaf7ff;
          border: 2px solid #b7e3ff;
          color: #0284c7;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tpTrack {
          margin-top: 15px;
          height: 10px;
          border-radius: 999px;
          background: #e0f2fe;
          overflow: hidden;
        }

        .tpFill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #0ea5e9, #22c55e);
          transition: width 0.35s ease;
        }

        .tpCompactGrid {
          margin-top: 20px;
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
          gap: 18px;
        }

        .tpCard,
        .tpWeekCard,
        .tpStat,
        .tpTodoPanel,
        .tpTodoItem {
          transition: border-color 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease;
        }

        .tpCard {
          min-width: 0;
          border-radius: 24px;
          background: rgba(255,255,255,0.98);
          border: 1px solid rgba(186,230,253,0.95);
          box-shadow: 0 18px 44px rgba(2,132,199,0.08);
          padding: 18px;
        }

        .tpCard:hover,
        .tpWeekCard:hover,
        .tpStat:hover,
        .tpTodoPanel:hover,
        .tpTodoItem:hover {
          border-color: #38bdf8;
          box-shadow: 0 20px 48px rgba(14,165,233,0.11);
          transform: translateY(-2px);
          background: rgba(255,255,255,0.99);
        }

        .tpHead {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .tpCardTitle,
        .tpSectionTitle,
        .tpTodoTitle {
          margin: 0;
          color: #0f172a;
          font-weight: 950;
          letter-spacing: -0.6px;
          line-height: 1.15;
        }

        .tpCardTitle {
          font-size: 21px;
        }

        .tpInput {
          width: 100%;
          height: 46px;
          margin-top: 15px;
          border-radius: 14px;
          border: 1px solid #bae6fd;
          background: white;
          padding: 0 13px;
          color: #0f172a;
          font-size: 14px;
          font-weight: 850;
          outline: none;
          min-width: 0;
        }

        .tpInput:focus {
          border-color: #0ea5e9;
          box-shadow: 0 0 0 5px rgba(14,165,233,0.12);
        }

        .tpDateBox {
          margin-top: 15px;
          border-radius: 18px;
          background: linear-gradient(135deg, #e0f2fe, #ffffff);
          border: 1px solid #bae6fd;
          padding: 15px;
        }

        .tpDay {
          margin: 0;
          color: #0284c7;
          font-size: 12.5px;
          font-weight: 950;
        }

        .tpDateMain {
          margin: 7px 0 0;
          color: #0f172a;
          font-size: 21px;
          line-height: 1.15;
          font-weight: 950;
          letter-spacing: -0.5px;
        }

        .tpSmall {
          margin: 8px 0 0;
          color: #64748b;
          font-size: 12.5px;
          line-height: 1.5;
          font-weight: 720;
        }

        .tpAddRow {
          margin-top: 15px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 96px;
          gap: 10px;
          align-items: center;
        }

        .tpAddRow .tpInput {
          margin-top: 0;
        }

        .tpAddBtn {
          height: 46px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg, #0ea5e9, #38bdf8);
          color: white;
          font-size: 14px;
          font-weight: 950;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 16px 34px rgba(14,165,233,0.22);
          white-space: nowrap;
        }

        .tpSectionHead {
          margin-top: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .tpSectionTitle {
          font-size: 23px;
        }

        .tpWeekGrid {
          margin-top: 14px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(118px, 1fr));
          gap: 10px;
          width: 100%;
        }

        .tpWeekCard {
          min-width: 0;
          border-radius: 18px;
          border: 1px solid #bae6fd;
          background: white;
          padding: 13px;
          text-align: left;
          color: #0f172a;
          cursor: pointer;
        }

        .tpWeekCard.active {
          background: #e0f2fe;
          border-color: #0ea5e9;
          color: #0284c7;
        }

        .tpWeekName {
          margin: 0;
          font-size: 12px;
          font-weight: 950;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tpWeekDate,
        .tpWeekDone {
          margin: 6px 0 0;
          color: inherit;
          opacity: 0.82;
          font-size: 11.5px;
          font-weight: 850;
        }

        .tpStats {
          margin-top: 20px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px;
        }

        .tpStat {
          min-width: 0;
          border-radius: 20px;
          background: white;
          border: 1px solid #bae6fd;
          box-shadow: 0 16px 34px rgba(2,132,199,0.06);
          padding: 15px;
        }

        .tpStatLabel {
          margin: 0;
          color: #64748b;
          font-size: 12.5px;
          font-weight: 950;
        }

        .tpStatValue {
          margin: 8px 0 0;
          font-size: 27px;
          line-height: 1.05;
          font-weight: 950;
          letter-spacing: -0.6px;
        }

        .tpTodoPanel {
          margin-top: 20px;
          border-radius: 24px;
          background: rgba(255,255,255,0.98);
          border: 1px solid rgba(186,230,253,0.95);
          box-shadow: 0 18px 44px rgba(2,132,199,0.08);
          padding: 18px;
        }

        .tpTodoHead {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .tpTodoTitle {
          font-size: 22px;
        }

        .tpClearBtn {
          height: 38px;
          border: none;
          border-radius: 13px;
          background: #fef2f2;
          color: #dc2626;
          padding: 0 12px;
          font-size: 12.5px;
          font-weight: 950;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          white-space: nowrap;
        }

        .tpEmpty {
          margin-top: 16px;
          border-radius: 20px;
          border: 1px dashed #bae6fd;
          background: linear-gradient(135deg, #ffffff, #f0f9ff);
          padding: 34px 16px;
          text-align: center;
        }

        .tpEmptyTitle {
          margin: 12px 0 0;
          color: #0f172a;
          font-size: 17px;
          font-weight: 950;
        }

        .tpTodoList {
          margin-top: 16px;
          display: grid;
          gap: 10px;
        }

        .tpTodoItem {
          width: 100%;
          min-width: 0;
          border-radius: 20px;
          border: 1px solid #bae6fd;
          background: white;
          padding: 14px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
        }

        .tpTodoItem.done {
          background: linear-gradient(135deg, #ecfdf5, #f0f9ff);
          border-color: #bbf7d0;
        }

        .tpTodoLeft {
          min-width: 0;
          display: flex;
          align-items: flex-start;
          gap: 11px;
        }

        .tpCheck {
          margin-top: 2px;
          width: 32px;
          height: 32px;
          min-width: 32px;
          border-radius: 999px;
          border: 2px solid #bae6fd;
          background: white;
          color: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .tpTodoItem.done .tpCheck {
          background: #22c55e;
          border-color: #22c55e;
          color: white;
        }

        .tpBadges {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .tpBadge {
          border-radius: 999px;
          padding: 5px 9px;
          font-size: 10.5px;
          font-weight: 950;
        }

        .tpBlue {
          background: #e0f2fe;
          color: #0284c7;
        }

        .tpOrange {
          background: #fff7ed;
          color: #ea580c;
        }

        .tpStatus {
          background: #f1f5f9;
          color: #475569;
        }

        .tpTodoItem.done .tpStatus {
          background: #dcfce7;
          color: #15803d;
        }

        .tpTodoText {
          margin: 9px 0 0;
          color: #0f172a;
          font-size: 16px;
          line-height: 1.35;
          font-weight: 950;
          word-break: break-word;
        }

        .tpTodoItem.done .tpTodoText {
          color: #64748b;
          text-decoration: line-through;
        }

        .tpActions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
        }

        .tpDoneBtn {
          height: 36px;
          border: none;
          border-radius: 12px;
          padding: 0 12px;
          background: #22c55e;
          color: white;
          font-size: 12.5px;
          font-weight: 950;
          cursor: pointer;
          white-space: nowrap;
        }

        .tpDoneBtn.undo {
          background: #f1f5f9;
          color: #334155;
        }

        .tpDeleteBtn {
          width: 36px;
          height: 36px;
          min-width: 36px;
          border: none;
          border-radius: 12px;
          background: #fef2f2;
          color: #dc2626;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        @media (max-width: 1000px) {
          .tpShell {
            max-width: 100%;
          }

          .tpHero,
          .tpCompactGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .tpFinalRoot {
            padding: 16px;
          }

          .tpHero,
          .tpCard,
          .tpTodoPanel {
            border-radius: 22px;
            padding: 16px;
          }

          .tpMainTitle {
            font-size: 34px;
            letter-spacing: -1px;
          }

          .tpAddRow,
          .tpTodoItem {
            grid-template-columns: 1fr;
          }

          .tpActions {
            justify-content: flex-start;
            flex-wrap: wrap;
          }
        }
      `}</style>

      <div className="tpFloat one" />
      <div className="tpFloat two" />
      <div className="tpFloat three" />

      <main className="tpShell">
        <section className="tpHero">
          <div>
            <div className="tpTag">
              <Sparkles size={15} />
              Today Plan
            </div>

            <h1 className="tpMainTitle">Today's Plan</h1>
          </div>

          <div className="tpAnalysis">
            <div className="tpAnalysisTop">
              <div>
                <p className="tpAnalysisLabel">Work Analysis</p>
                <h2 className="tpAnalysisValue">{progress}%</h2>
                <p className="tpAnalysisSub">
                  {completed} completed · {pending} pending · {tasks.length} total
                </p>
              </div>

              <div className="tpIcon">
                <BarChart3 size={25} strokeWidth={2.5} />
              </div>
            </div>

            <div className="tpTrack">
              <div className="tpFill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </section>

        <section className="tpCompactGrid">
          <div className="tpCard">
            <div className="tpHead">
              <div className="tpIcon">
                <CalendarDays size={23} strokeWidth={2.5} />
              </div>

              <h2 className="tpCardTitle">Select Date</h2>
            </div>

            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="tpInput"
            />

            <div className="tpDateBox">
              <p className="tpDay">{dayName(selected)}</p>

              <h3 className="tpDateMain">{displayDate(selected)}</h3>

              <p className="tpSmall">
                {tasks.length} task{tasks.length === 1 ? "" : "s"} added for this date.
              </p>
            </div>
          </div>

          <div className="tpCard">
            <div className="tpHead">
              <div className="tpIcon">
                <Plus size={23} strokeWidth={2.5} />
              </div>

              <h2 className="tpCardTitle">Add New Todo</h2>
            </div>

            <div className="tpAddRow">
              <input
                value={taskText}
                onChange={(event) => setTaskText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") addTask();
                }}
                placeholder="I want to do today..."
                className="tpInput"
              />

              <button type="button" onClick={addTask} className="tpAddBtn">
                <Plus size={16} />
                Add
              </button>
            </div>

            <p className="tpSmall">
              Example: OS revision, JavaScript practice, DBMS joins, 5 DSA problems.
            </p>
          </div>
        </section>

        <section>
          <div className="tpSectionHead">
            <div className="tpIcon">
              <CalendarDays size={23} strokeWidth={2.5} />
            </div>

            <h2 className="tpSectionTitle">Weekly View</h2>
          </div>

          <div className="tpWeekGrid">
            {weekDays.map((day) => {
              const active = day.key === selectedDate;

              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => setSelectedDate(day.key)}
                  className={active ? "tpWeekCard active" : "tpWeekCard"}
                >
                  <p className="tpWeekName">{dayName(day.date)}</p>

                  <p className="tpWeekDate">{displayDate(day.date)}</p>

                  <p className="tpWeekDone">{day.done}/{day.total} done</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="tpStats">
          <div className="tpStat">
            <p className="tpStatLabel">Total Tasks</p>
            <h3 className="tpStatValue">{tasks.length}</h3>
          </div>

          <div className="tpStat">
            <p className="tpStatLabel">Completed</p>
            <h3 className="tpStatValue" style={{ color: "#059669" }}>{completed}</h3>
          </div>

          <div className="tpStat">
            <p className="tpStatLabel">Pending</p>
            <h3 className="tpStatValue" style={{ color: "#ea580c" }}>{pending}</h3>
          </div>

          <div className="tpStat">
            <p className="tpStatLabel">Progress</p>
            <h3 className="tpStatValue" style={{ color: "#0284c7" }}>{progress}%</h3>
          </div>
        </section>

        <section className="tpTodoPanel">
          <div className="tpTodoHead">
            <div>
              <h2 className="tpTodoTitle">My Todo List - {dayName(selected)}</h2>

              <p className="tpSmall">
                {completed} of {tasks.length} completed for {displayDate(selected)}.
              </p>
            </div>

            {tasks.length > 0 && (
              <button type="button" onClick={clearDate} className="tpClearBtn">
                <RotateCcw size={15} />
                Clear This Date
              </button>
            )}
          </div>

          {tasks.length === 0 ? (
            <div className="tpEmpty">
              <Clock size={38} color="#94a3b8" />

              <h3 className="tpEmptyTitle">No task added for this date</h3>

              <p className="tpSmall">Add a task from the input above to start tracking.</p>
            </div>
          ) : (
            <div className="tpTodoList">
              {tasks.map((task) => (
                <div key={task.id} className={task.done ? "tpTodoItem done" : "tpTodoItem"}>
                  <div className="tpTodoLeft">
                    <button
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      className="tpCheck"
                    >
                      <CheckCircle2 size={19} />
                    </button>

                    <div style={{ minWidth: 0 }}>
                      <div className="tpBadges">
                        <span className="tpBadge tpBlue">Study</span>
                        <span className="tpBadge tpOrange">Medium</span>
                        <span className="tpBadge tpStatus">
                          {task.done ? "Completed" : "Pending"}
                        </span>
                      </div>

                      <h3 className="tpTodoText">{task.text}</h3>
                    </div>
                  </div>

                  <div className="tpActions">
                    <button
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      className={task.done ? "tpDoneBtn undo" : "tpDoneBtn"}
                    >
                      {task.done ? "Undo" : "Mark Done"}
                    </button>

                    <button type="button" onClick={() => deleteTask(task.id)} className="tpDeleteBtn">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
