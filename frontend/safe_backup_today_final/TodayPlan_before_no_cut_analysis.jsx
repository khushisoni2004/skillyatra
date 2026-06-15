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
    <div className="todayPage">
      <style>{`
        .todayPage {
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
          padding: 28px;
          color: #0f172a;
          background:
            radial-gradient(circle at 14% 6%, rgba(14,165,233,0.14), transparent 30%),
            radial-gradient(circle at 90% 12%, rgba(125,211,252,0.24), transparent 34%),
            linear-gradient(180deg, #ffffff 0%, #f5fcff 52%, #ffffff 100%);
          position: relative;
        }

        .todayPage::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(14,165,233,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14,165,233,0.045) 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: linear-gradient(to bottom, black, transparent 78%);
          z-index: 0;
        }

        .todayBubble {
          position: fixed;
          border-radius: 999px;
          pointer-events: none;
          z-index: 0;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(125,211,252,0.32), rgba(14,165,233,0.10));
          border: 1px solid rgba(186,230,253,0.70);
          box-shadow: 0 18px 42px rgba(14,165,233,0.10);
          animation: floatBubble 8s ease-in-out infinite;
        }

        .b1 {
          width: 105px;
          height: 105px;
          top: 12%;
          right: 8%;
        }

        .b2 {
          width: 62px;
          height: 62px;
          bottom: 15%;
          right: 5%;
          animation-delay: 2s;
        }

        .b3 {
          width: 72px;
          height: 72px;
          top: 58%;
          left: 7%;
          animation-delay: 3.5s;
        }

        @keyframes floatBubble {
          0%, 100% {
            transform: translate3d(0,0,0) scale(1);
            opacity: 0.55;
          }
          50% {
            transform: translate3d(18px,-22px,0) scale(1.08);
            opacity: 0.86;
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .todayShell {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1160px;
          margin: 0 auto;
          animation: fadeUp 0.55s ease both;
        }

        .todayHero {
          border-radius: 30px;
          padding: 28px 30px;
          background:
            radial-gradient(circle at 84% 18%, rgba(255,255,255,0.34), transparent 28%),
            linear-gradient(135deg, #0284c7 0%, #0ea5e9 56%, #7dd3fc 100%);
          border: 1px solid rgba(186,230,253,0.75);
          box-shadow: 0 28px 70px rgba(14,165,233,0.20);
          color: white;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 210px;
          gap: 24px;
          align-items: center;
          overflow: hidden;
        }

        .heroTag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 999px;
          padding: 9px 15px;
          background: rgba(255,255,255,0.16);
          border: 1px solid rgba(255,255,255,0.30);
          font-size: 11px;
          font-weight: 950;
          letter-spacing: 2.4px;
          text-transform: uppercase;
        }

        .heroTitle {
          margin: 16px 0 0;
          font-size: clamp(38px, 4vw, 56px);
          line-height: 1.02;
          font-weight: 950;
          letter-spacing: -1.7px;
          color: white;
        }

        .progressBox {
          border-radius: 26px;
          background: rgba(255,255,255,0.93);
          color: #0f172a;
          border: 1px solid rgba(255,255,255,0.70);
          padding: 22px;
          box-shadow: 0 18px 45px rgba(2,132,199,0.12);
        }

        .progressTop {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
        }

        .progressValue {
          margin: 0;
          font-size: 42px;
          line-height: 1;
          font-weight: 950;
          letter-spacing: -1px;
        }

        .progressText {
          margin: 7px 0 0;
          color: #64748b;
          font-size: 13px;
          font-weight: 850;
        }

        .progressIcon,
        .iconBox {
          width: 56px;
          height: 56px;
          min-width: 56px;
          border-radius: 20px;
          background: #eaf7ff;
          border: 2px solid #b7e3ff;
          color: #0284c7;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .progressTrack {
          margin-top: 18px;
          height: 10px;
          background: #e0f2fe;
          border-radius: 999px;
          overflow: hidden;
        }

        .progressFill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #0ea5e9, #22c55e);
          transition: width 0.35s ease;
        }

        .topGrid {
          margin-top: 24px;
          display: grid;
          grid-template-columns: 0.92fr 1.08fr;
          gap: 22px;
        }

        .card {
          border-radius: 28px;
          background: rgba(255,255,255,0.97);
          border: 1px solid rgba(186,230,253,0.95);
          box-shadow: 0 18px 45px rgba(2,132,199,0.08);
          padding: 24px;
          backdrop-filter: blur(18px);
          transition: border-color 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease;
        }

        .card:hover,
        .weekCard:hover,
        .statCard:hover,
        .todoItem:hover {
          border-color: #38bdf8;
          box-shadow: 0 22px 50px rgba(14,165,233,0.12);
          transform: translateY(-3px);
          background: rgba(255,255,255,0.98);
        }

        .cardHead {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .cardTitle {
          margin: 0;
          color: #0f172a;
          font-size: 24px;
          line-height: 1.15;
          font-weight: 950;
          letter-spacing: -0.6px;
        }

        .input {
          margin-top: 20px;
          width: 100%;
          height: 52px;
          border-radius: 16px;
          border: 1px solid #bae6fd;
          background: #ffffff;
          padding: 0 16px;
          color: #0f172a;
          font-size: 14px;
          font-weight: 850;
          outline: none;
          transition: all 0.2s ease;
        }

        .input:focus {
          border-color: #0ea5e9;
          box-shadow: 0 0 0 5px rgba(14,165,233,0.12);
        }

        .selectedBox {
          margin-top: 18px;
          border-radius: 22px;
          background: linear-gradient(135deg, #e0f2fe, #ffffff);
          border: 1px solid #bae6fd;
          padding: 18px;
        }

        .selectedDay {
          margin: 0;
          color: #0284c7;
          font-size: 13px;
          font-weight: 950;
        }

        .selectedDate {
          margin: 7px 0 0;
          font-size: 24px;
          line-height: 1.15;
          font-weight: 950;
          letter-spacing: -0.6px;
        }

        .selectedSub,
        .hint,
        .todoSub {
          margin: 8px 0 0;
          color: #64748b;
          font-size: 13px;
          line-height: 1.6;
          font-weight: 720;
        }

        .addRow {
          margin-top: 20px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 12px;
        }

        .addBtn,
        .clearBtn,
        .doneBtn,
        .deleteBtn,
        .checkBtn,
        .weekCard {
          font-family: inherit;
          cursor: pointer;
        }

        .addBtn {
          height: 52px;
          min-width: 120px;
          border: none;
          border-radius: 16px;
          background: linear-gradient(135deg, #0ea5e9, #38bdf8);
          color: white;
          font-size: 14px;
          font-weight: 950;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 16px 34px rgba(14,165,233,0.22);
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }

        .addBtn:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 44px rgba(14,165,233,0.28);
        }

        .sectionHead {
          margin-top: 28px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .sectionTitle {
          margin: 0;
          font-size: 26px;
          line-height: 1.15;
          font-weight: 950;
          letter-spacing: -0.7px;
        }

        .weekGrid {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 12px;
        }

        .weekCard {
          min-width: 0;
          border-radius: 22px;
          border: 1px solid #bae6fd;
          background: #ffffff;
          padding: 15px;
          text-align: left;
          color: #0f172a;
          transition: all 0.22s ease;
        }

        .weekCard.active {
          background: #e0f2fe;
          border-color: #0ea5e9;
          color: #0284c7;
        }

        .weekName {
          margin: 0;
          font-size: 12px;
          font-weight: 950;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .weekDate,
        .weekDone {
          margin: 6px 0 0;
          font-size: 12px;
          font-weight: 850;
          color: inherit;
          opacity: 0.82;
        }

        .statsGrid {
          margin-top: 24px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .statCard {
          border-radius: 24px;
          background: #ffffff;
          border: 1px solid #bae6fd;
          box-shadow: 0 16px 34px rgba(2,132,199,0.06);
          padding: 20px;
          transition: all 0.22s ease;
        }

        .statLabel {
          margin: 0;
          color: #64748b;
          font-size: 13px;
          font-weight: 950;
        }

        .statValue {
          margin: 8px 0 0;
          font-size: 32px;
          line-height: 1.05;
          font-weight: 950;
          letter-spacing: -0.7px;
        }

        .todoPanel {
          margin-top: 24px;
          border-radius: 28px;
          background: rgba(255,255,255,0.97);
          border: 1px solid rgba(186,230,253,0.95);
          box-shadow: 0 18px 45px rgba(2,132,199,0.08);
          padding: 24px;
        }

        .todoPanelHead {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .todoTitle {
          margin: 0;
          font-size: 25px;
          line-height: 1.15;
          font-weight: 950;
          letter-spacing: -0.6px;
        }

        .clearBtn {
          height: 44px;
          border: none;
          border-radius: 15px;
          background: #fef2f2;
          color: #dc2626;
          padding: 0 15px;
          font-size: 13px;
          font-weight: 950;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .emptyBox {
          margin-top: 22px;
          border-radius: 24px;
          border: 1px dashed #bae6fd;
          background: linear-gradient(135deg, #ffffff, #f0f9ff);
          padding: 44px 22px;
          text-align: center;
        }

        .emptyTitle {
          margin: 14px 0 0;
          font-size: 18px;
          font-weight: 950;
        }

        .todoList {
          margin-top: 22px;
          display: grid;
          gap: 14px;
        }

        .todoItem {
          border-radius: 24px;
          border: 1px solid #bae6fd;
          background: #ffffff;
          padding: 18px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 16px;
          align-items: center;
          transition: all 0.22s ease;
        }

        .todoItem.done {
          background: linear-gradient(135deg, #ecfdf5, #f0f9ff);
          border-color: #bbf7d0;
        }

        .todoLeft {
          display: flex;
          gap: 13px;
          min-width: 0;
        }

        .checkBtn {
          margin-top: 2px;
          width: 34px;
          height: 34px;
          min-width: 34px;
          border-radius: 999px;
          border: 2px solid #bae6fd;
          background: white;
          color: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .todoItem.done .checkBtn {
          background: #22c55e;
          border-color: #22c55e;
          color: white;
        }

        .badgeRow {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .badge {
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 11px;
          font-weight: 950;
        }

        .blueBadge {
          background: #e0f2fe;
          color: #0284c7;
        }

        .orangeBadge {
          background: #fff7ed;
          color: #ea580c;
        }

        .statusBadge {
          background: #f1f5f9;
          color: #475569;
        }

        .todoItem.done .statusBadge {
          background: #dcfce7;
          color: #15803d;
        }

        .todoText {
          margin: 11px 0 0;
          font-size: 17px;
          line-height: 1.35;
          font-weight: 950;
          word-break: break-word;
        }

        .todoItem.done .todoText {
          color: #64748b;
          text-decoration: line-through;
        }

        .todoActions {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .doneBtn {
          height: 40px;
          border: none;
          border-radius: 14px;
          padding: 0 14px;
          background: #22c55e;
          color: white;
          font-size: 13px;
          font-weight: 950;
        }

        .doneBtn.undo {
          background: #f1f5f9;
          color: #334155;
        }

        .deleteBtn {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 14px;
          background: #fef2f2;
          color: #dc2626;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 1180px) {
          .todayShell {
            max-width: 100%;
          }

          .todayHero,
          .topGrid {
            grid-template-columns: 1fr;
          }

          .weekGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .statsGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .todayPage {
            padding: 16px;
          }

          .todayHero,
          .card,
          .todoPanel {
            border-radius: 24px;
            padding: 20px;
          }

          .heroTitle {
            font-size: 36px;
            letter-spacing: -1px;
          }

          .addRow,
          .todoItem {
            grid-template-columns: 1fr;
          }

          .weekGrid,
          .statsGrid {
            grid-template-columns: 1fr;
          }

          .todoActions {
            justify-content: flex-start;
            flex-wrap: wrap;
          }
        }
      `}</style>

      <div className="todayBubble b1" />
      <div className="todayBubble b2" />
      <div className="todayBubble b3" />

      <main className="todayShell">
        <section className="todayHero">
          <div>
            <div className="heroTag">
              <Sparkles size={15} />
              Today Plan
            </div>

            <h1 className="heroTitle">Today's Plan</h1>
          </div>

          <div className="progressBox">
            <div className="progressTop">
              <div>
                <h2 className="progressValue">{progress}%</h2>
                <p className="progressText">{completed} of {tasks.length} completed</p>
              </div>

              <div className="progressIcon">
                <Target size={28} strokeWidth={2.5} />
              </div>
            </div>

            <div className="progressTrack">
              <div className="progressFill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </section>

        <section className="topGrid">
          <div className="card">
            <div className="cardHead">
              <div className="iconBox">
                <CalendarDays size={25} strokeWidth={2.5} />
              </div>

              <h2 className="cardTitle">Select Date</h2>
            </div>

            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="input"
            />

            <div className="selectedBox">
              <p className="selectedDay">{dayName(selected)}</p>

              <h3 className="selectedDate">{displayDate(selected)}</h3>

              <p className="selectedSub">
                {tasks.length} task{tasks.length === 1 ? "" : "s"} added for this date.
              </p>
            </div>
          </div>

          <div className="card">
            <div className="cardHead">
              <div className="iconBox">
                <Plus size={25} strokeWidth={2.5} />
              </div>

              <h2 className="cardTitle">Add New Todo</h2>
            </div>

            <div className="addRow">
              <input
                value={taskText}
                onChange={(event) => setTaskText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") addTask();
                }}
                placeholder="I want to do today..."
                className="input"
              />

              <button type="button" onClick={addTask} className="addBtn">
                <Plus size={17} />
                Add
              </button>
            </div>

            <p className="hint">
              Example: OS revision, JavaScript practice, DBMS joins, 5 DSA problems.
            </p>
          </div>
        </section>

        <section>
          <div className="sectionHead">
            <div className="iconBox">
              <CalendarDays size={25} strokeWidth={2.5} />
            </div>
            <h2 className="sectionTitle">Weekly View</h2>
          </div>

          <div className="weekGrid">
            {weekDays.map((day) => {
              const active = day.key === selectedDate;

              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => setSelectedDate(day.key)}
                  className={active ? "weekCard active" : "weekCard"}
                >
                  <p className="weekName">{dayName(day.date)}</p>

                  <p className="weekDate">
                    {displayDate(day.date)}
                  </p>

                  <p className="weekDone">
                    {day.done}/{day.total} done
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="statsGrid">
          <div className="statCard">
            <p className="statLabel">Total Tasks</p>
            <h3 className="statValue">{tasks.length}</h3>
          </div>

          <div className="statCard">
            <p className="statLabel">Completed</p>
            <h3 className="statValue" style={{ color: "#059669" }}>{completed}</h3>
          </div>

          <div className="statCard">
            <p className="statLabel">Pending</p>
            <h3 className="statValue" style={{ color: "#ea580c" }}>{pending}</h3>
          </div>

          <div className="statCard">
            <p className="statLabel">Progress</p>
            <h3 className="statValue" style={{ color: "#0284c7" }}>{progress}%</h3>
          </div>
        </section>

        <section className="todoPanel">
          <div className="todoPanelHead">
            <div>
              <h2 className="todoTitle">My Todo List - {dayName(selected)}</h2>

              <p className="todoSub">
                {completed} of {tasks.length} completed for {displayDate(selected)}.
              </p>
            </div>

            {tasks.length > 0 && (
              <button type="button" onClick={clearDate} className="clearBtn">
                <RotateCcw size={16} />
                Clear This Date
              </button>
            )}
          </div>

          {tasks.length === 0 ? (
            <div className="emptyBox">
              <Clock size={40} color="#94a3b8" />

              <h3 className="emptyTitle">No task added for this date</h3>

              <p className="hint">Add a task from the input above to start tracking.</p>
            </div>
          ) : (
            <div className="todoList">
              {tasks.map((task) => (
                <div key={task.id} className={task.done ? "todoItem done" : "todoItem"}>
                  <div className="todoLeft">
                    <button
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      className="checkBtn"
                    >
                      <CheckCircle2 size={20} />
                    </button>

                    <div>
                      <div className="badgeRow">
                        <span className="badge blueBadge">Study</span>
                        <span className="badge orangeBadge">Medium</span>
                        <span className="badge statusBadge">
                          {task.done ? "Completed" : "Pending"}
                        </span>
                      </div>

                      <h3 className="todoText">{task.text}</h3>
                    </div>
                  </div>

                  <div className="todoActions">
                    <button
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      className={task.done ? "doneBtn undo" : "doneBtn"}
                    >
                      {task.done ? "Undo" : "Mark Done"}
                    </button>

                    <button type="button" onClick={() => deleteTask(task.id)} className="deleteBtn">
                      <Trash2 size={17} />
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
