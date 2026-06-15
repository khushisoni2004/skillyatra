import React, { useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Layers,
  PlayCircle,
  Sparkles,
  Target
} from "lucide-react";
import { Link } from "react-router-dom";

const ROLE_ROADMAPS = {
  "Software Developer": {
    resource: "https://www.youtube.com/results?search_query=software+developer+complete+roadmap+hinglish+apna+college+love+babbar",
    tasks: [
      ["Programming Basics Revision", "Revise variables, loops, functions, arrays and basic problem-solving."],
      ["OOP Concepts", "Revise class, object, inheritance, polymorphism, abstraction and encapsulation."],
      ["Arrays Practice", "Solve array-based problems like max/min, prefix sum and subarray basics."],
      ["Strings Practice", "Practice palindrome, anagram, frequency map and string manipulation."],
      ["Linked List Basics", "Understand traversal, insertion, deletion and reversal."],
      ["Stack and Queue", "Practice stack/queue applications like balanced brackets and next greater element."],
      ["Searching and Sorting", "Revise binary search, merge sort, quick sort and sorting-based questions."],
      ["Hashing", "Practice hash map and set problems for duplicates, pairs and frequency count."],
      ["Recursion Basics", "Practice recursion tree, subsequences and simple backtracking."],
      ["Trees Basics", "Revise binary tree traversal, height, diameter and level order."],
      ["Graphs Basics", "Learn BFS, DFS, connected components and graph representation."],
      ["Dynamic Programming Intro", "Practice memoization and tabulation using basic patterns."],
      ["Greedy Basics", "Practice activity selection, meeting rooms and minimum platforms."],
      ["DBMS SQL", "Revise joins, group by, subqueries, indexes and normalization."],
      ["Operating System", "Revise process, threads, deadlock, scheduling and memory management."],
      ["Computer Networks", "Revise OSI, TCP/IP, HTTP, DNS, IP and routing basics."],
      ["Core Language Revision", "Revise Java/C++/Python concepts based on your target language."],
      ["API and Backend Basics", "Understand REST API, request-response, status codes and JSON."],
      ["Frontend Basics", "Revise HTML, CSS, React basics and component thinking."],
      ["Project Explanation", "Prepare your best project architecture, features, APIs and database explanation."],
      ["Resume Keywords", "Improve resume keywords based on software developer roles."],
      ["Coding Mock Test", "Attempt a timed coding test with 2 easy and 1 medium problem."],
      ["Technical Interview Practice", "Practice DBMS, OS, CN, OOP and project-based questions."],
      ["HR Interview Practice", "Prepare intro, strengths, weakness, teamwork and career goals."],
      ["Final Revision", "Revise mistakes, SQL queries, project explanation and common interview questions."]
    ]
  },

  "Frontend Developer": {
    resource: "https://www.youtube.com/results?search_query=frontend+developer+complete+roadmap+react+javascript+hinglish",
    tasks: [
      ["HTML Semantics", "Revise semantic tags, forms, tables, inputs and accessibility basics."],
      ["CSS Box Model", "Practice display, position, margin, padding and specificity."],
      ["Flexbox Layout", "Build responsive navbar, cards and alignment using flexbox."],
      ["CSS Grid Layout", "Practice grid-based dashboard and card layouts."],
      ["Responsive Design", "Use media queries and mobile-first approach for responsive pages."],
      ["JavaScript Basics", "Revise variables, functions, arrays, objects and loops."],
      ["DOM Manipulation", "Practice events, query selectors, forms and dynamic UI updates."],
      ["ES6 Features", "Revise destructuring, spread, map, filter, reduce and promises."],
      ["Async JavaScript", "Practice fetch, async/await, error handling and loading states."],
      ["React Components", "Build reusable components with props and clean structure."],
      ["React State", "Practice useState with forms, counters, filters and todo apps."],
      ["React Effects", "Use useEffect for API calls, localStorage and lifecycle logic."],
      ["React Router", "Practice routes, nested routes, dynamic pages and navigation."],
      ["API Integration", "Connect frontend with backend APIs and handle errors properly."],
      ["Tailwind CSS", "Build professional cards, buttons, forms and responsive sections."],
      ["Form Validation", "Add validation for login, signup and user input forms."],
      ["Context API", "Understand shared state, auth context and reusable hooks."],
      ["Frontend Performance", "Learn lazy loading, memoization and component optimization."],
      ["Browser Basics", "Revise storage, cookies, rendering, events and basic web security."],
      ["Portfolio Project UI", "Build one clean responsive dashboard page."],
      ["Resume Frontend Keywords", "Add React, API integration, responsive design and deployment keywords."],
      ["Frontend Interview Questions", "Practice JS, React, CSS and browser questions."],
      ["Machine Coding Round", "Build todo/search/filter UI within a time limit."],
      ["Deployment", "Deploy React app on Vercel/Netlify and test routes."],
      ["Final Revision", "Revise JS, React hooks, CSS layout and project explanation."]
    ]
  },

  "Backend Developer": {
    resource: "https://www.youtube.com/results?search_query=backend+developer+node+express+mongodb+roadmap+hinglish",
    tasks: [
      ["Backend Fundamentals", "Understand client-server architecture, request-response and API flow."],
      ["Node.js Basics", "Revise modules, npm, package.json, callbacks and event loop basics."],
      ["Express.js Setup", "Create routes, controllers, middleware and server structure."],
      ["REST API Design", "Learn GET, POST, PUT, PATCH, DELETE and status codes."],
      ["Request Validation", "Validate body, params, query and handle bad requests properly."],
      ["MongoDB Basics", "Understand collections, documents, schema and CRUD operations."],
      ["Mongoose Models", "Create schemas, models, relations and validations."],
      ["SQL Basics", "Revise tables, joins, indexes, group by and transactions."],
      ["Authentication", "Implement register, login, password hashing and JWT token."],
      ["Authorization", "Protect private routes using middleware and role-based access."],
      ["Error Handling", "Create global error handler and consistent API responses."],
      ["File Uploads", "Handle PDF/image uploads using multer and validate file types."],
      ["Pagination and Search", "Add search, filters, sorting and pagination APIs."],
      ["Security Basics", "Use CORS, helmet, rate limiting, password hashing and env variables."],
      ["Logging and Debugging", "Debug API issues using Postman, console logs and status codes."],
      ["API Documentation", "Document endpoints, request body, response and error formats."],
      ["Database Indexing", "Understand indexes and query performance basics."],
      ["Caching Basics", "Learn simple caching and avoid repeated database calls."],
      ["Testing APIs", "Practice API testing with Postman and basic automated tests."],
      ["Backend Deployment", "Deploy backend on Render/Railway and configure environment variables."],
      ["Backend Structure", "Organize routes, controllers, models, utils and middleware."],
      ["Resume Backend Keywords", "Add REST API, authentication, database, deployment and optimization."],
      ["Backend Interview Questions", "Practice Node, Express, DBMS, OS and API design questions."],
      ["Mini Backend Project", "Build one complete CRUD + auth backend module."],
      ["Final Revision", "Revise auth, APIs, DB queries, deployment and project explanation."]
    ]
  },

  "MERN Stack Developer": {
    resource: "https://www.youtube.com/results?search_query=mern+stack+complete+course+project+roadmap+hinglish",
    tasks: [
      ["MERN Architecture", "Understand how MongoDB, Express, React and Node work together."],
      ["React UI Setup", "Create frontend routes, layout and reusable components."],
      ["Node Express Setup", "Create backend server, routes and middleware structure."],
      ["MongoDB Connection", "Connect backend with MongoDB and test database connection."],
      ["Mongoose Models", "Create user, task, product or project schema."],
      ["REST API CRUD", "Build create, read, update and delete APIs."],
      ["Frontend API Calls", "Use fetch/axios to connect React with backend APIs."],
      ["Authentication UI", "Create login/signup pages and store token safely."],
      ["JWT Backend Auth", "Implement JWT generation, verification and protected routes."],
      ["User Dashboard", "Build dashboard using authenticated user data."],
      ["Form Handling", "Handle forms, validation, loading and error states."],
      ["Search and Filters", "Add search, filter and sort functionality."],
      ["File Upload Feature", "Add resume/image/file upload flow with backend storage."],
      ["Role-Based Feature", "Add user/admin or candidate/company role-based sections."],
      ["State Management", "Use Context API or custom hooks for shared state."],
      ["Responsive Design", "Make app responsive for laptop and mobile screens."],
      ["Error Handling", "Show proper error messages for failed API/database calls."],
      ["Frontend Deployment", "Deploy frontend on Vercel and test routes."],
      ["Backend Deployment", "Deploy backend on Render and configure CORS/env."],
      ["MongoDB Atlas Setup", "Connect deployed backend with MongoDB Atlas."],
      ["Full Stack Testing", "Test auth, CRUD, reload, protected pages and API failures."],
      ["Project README", "Write setup, features, tech stack and screenshots."],
      ["Resume MERN Keywords", "Add React, Node, Express, MongoDB, JWT and deployment."],
      ["Mock Interview", "Practice MERN architecture and project questions."],
      ["Final Polish", "Fix UI, bugs, responsiveness and demo flow."]
    ]
  },

  "Data Science Engineer": {
    resource: "https://www.youtube.com/results?search_query=data+science+complete+roadmap+python+machine+learning+hinglish",
    tasks: [
      ["Python for Data Science", "Revise Python syntax, functions, lists, dictionaries and file handling."],
      ["NumPy Foundations", "Practice arrays, indexing, broadcasting and vectorized operations."],
      ["Pandas Basics", "Load CSV files, inspect data, filter rows and select columns."],
      ["Data Cleaning", "Handle missing values, duplicates, outliers and wrong data types."],
      ["Exploratory Data Analysis", "Analyze distributions, correlations, groups and business patterns."],
      ["Data Visualization", "Create bar, line, scatter, histogram and heatmap-style visual insights."],
      ["Statistics Basics", "Revise mean, median, variance, standard deviation and percentiles."],
      ["Probability Basics", "Understand probability, conditional probability and distributions."],
      ["Feature Engineering", "Create useful features, encode categories and scale numerical columns."],
      ["Train-Test Split", "Understand data splitting, validation and leakage prevention."],
      ["Regression Models", "Learn linear regression, metrics and error analysis."],
      ["Classification Models", "Practice logistic regression, decision tree and random forest basics."],
      ["Model Evaluation", "Use accuracy, precision, recall, F1, confusion matrix and ROC idea."],
      ["Clustering Basics", "Learn K-Means and basic unsupervised learning workflow."],
      ["SQL for Data Science", "Practice joins, group by, window basics and business queries."],
      ["ML Pipeline", "Build a clean preprocessing + model training pipeline."],
      ["Model Tuning", "Learn cross-validation, hyperparameters and overfitting control."],
      ["Data Science Project", "Build one end-to-end dataset analysis and prediction project."],
      ["Notebook Presentation", "Write clean markdown, insights and conclusion in Jupyter notebook."],
      ["Business Interpretation", "Convert model result into actionable business explanation."],
      ["Dashboard Basics", "Create simple Power BI/Tableau or Python dashboard summary."],
      ["Resume DS Keywords", "Add Python, Pandas, EDA, ML models, SQL and visualization keywords."],
      ["DS Interview Questions", "Practice statistics, ML, SQL and project explanation questions."],
      ["Portfolio Polish", "Upload notebook, README, charts and final insights to GitHub."],
      ["Final Revision", "Revise EDA steps, ML metrics, SQL queries and project story."]
    ]
  },

  "AI/ML Developer": {
    resource: "https://www.youtube.com/results?search_query=ai+ml+developer+roadmap+machine+learning+deep+learning+hinglish",
    tasks: [
      ["Python ML Revision", "Revise Python, functions, classes, NumPy and Pandas basics."],
      ["Math for ML", "Revise linear algebra, probability, statistics and calculus basics."],
      ["Data Preprocessing", "Handle missing values, encoding, scaling and train-test split."],
      ["Supervised Learning", "Understand regression and classification problem setup."],
      ["Linear Regression", "Learn cost function, gradient descent and evaluation metrics."],
      ["Logistic Regression", "Understand binary classification and decision boundary."],
      ["Decision Trees", "Learn splitting, entropy/gini and overfitting control."],
      ["Random Forest", "Understand bagging, ensemble learning and feature importance."],
      ["SVM Basics", "Learn margin, kernel idea and classification intuition."],
      ["KNN Algorithm", "Understand distance-based learning and k selection."],
      ["Naive Bayes", "Practice probabilistic classification and text examples."],
      ["Clustering", "Learn K-Means and evaluate clusters visually."],
      ["Model Evaluation", "Practice confusion matrix, precision, recall, F1 and ROC basics."],
      ["Cross Validation", "Understand K-fold validation and hyperparameter tuning."],
      ["Neural Networks Basics", "Learn perceptron, activation functions and backprop intuition."],
      ["Deep Learning Intro", "Practice basic TensorFlow/PyTorch model workflow."],
      ["NLP Basics", "Understand tokenization, text cleaning and embeddings idea."],
      ["Computer Vision Basics", "Learn image preprocessing, CNN intuition and classification."],
      ["Model Deployment", "Create simple Flask/FastAPI model prediction API."],
      ["AI Project Build", "Build one AI/ML project with dataset, model and UI/API."],
      ["Experiment Tracking", "Save metrics, compare models and document observations."],
      ["Resume AI/ML Keywords", "Add ML algorithms, model evaluation, Python and deployment keywords."],
      ["ML Interview Questions", "Practice algorithms, metrics, overfitting and project explanation."],
      ["GitHub Portfolio", "Upload code, dataset notes, screenshots and README."],
      ["Final Revision", "Revise ML workflow, metrics, algorithms and deployment explanation."]
    ]
  },

  "Python Developer": {
    resource: "https://www.youtube.com/results?search_query=python+developer+complete+course+roadmap+hinglish",
    tasks: [
      ["Python Syntax Revision", "Revise variables, data types, input-output and operators."],
      ["Control Flow", "Practice if-else, loops, break, continue and nested loops."],
      ["Functions", "Revise arguments, return values, scope, lambda and recursion basics."],
      ["Data Structures", "Practice lists, tuples, sets and dictionaries deeply."],
      ["String Handling", "Practice string methods, slicing, formatting and parsing."],
      ["File Handling", "Read/write text, CSV and JSON files with error handling."],
      ["Exception Handling", "Use try-except-finally and create clean error messages."],
      ["OOP in Python", "Learn classes, objects, inheritance, encapsulation and dunder methods."],
      ["Modules and Packages", "Use imports, virtual environment, pip and package structure."],
      ["Comprehensions", "Practice list, dict and set comprehensions for clean code."],
      ["Iterators and Generators", "Understand yield, generator expressions and memory efficiency."],
      ["Decorators", "Learn function decorators and practical use cases."],
      ["Regular Expressions", "Practice validation, extraction and text pattern matching."],
      ["Python Testing", "Write unit tests using unittest or pytest basics."],
      ["API Basics", "Use requests library to call APIs and parse JSON response."],
      ["Flask/FastAPI Intro", "Build simple backend APIs using Python framework."],
      ["Database with Python", "Connect Python with SQLite/PostgreSQL/MongoDB basics."],
      ["Automation Scripts", "Create file organizer, data cleaner or report generator script."],
      ["Web Scraping Basics", "Learn BeautifulSoup/request basics and ethical scraping rules."],
      ["Data Handling", "Use Pandas for CSV cleaning and report generation."],
      ["Mini Python Project", "Build one CLI or web API project with proper structure."],
      ["GitHub README", "Document setup, commands, features and screenshots."],
      ["Resume Python Keywords", "Add Python, OOP, API, automation, testing and database keywords."],
      ["Python Interview Practice", "Practice coding, OOP, exceptions, generators and project questions."],
      ["Final Revision", "Revise syntax, OOP, APIs, testing and project explanation."]
    ]
  }
};

const dayOptions = [5, 10, 15, 20, 25];

function getRoadmap(roleName, days) {
  const role = ROLE_ROADMAPS[roleName] || ROLE_ROADMAPS["Software Developer"];
  return role.tasks.slice(0, days).map(([title, description], index) => ({
    day: index + 1,
    title,
    description,
    type:
      (index + 1) % 5 === 0
        ? "Revision"
        : (index + 1) % 4 === 0
          ? "Practice"
          : "Learning"
  }));
}

export default function Roadmaps() {
  const [selectedRole, setSelectedRole] = useState("Software Developer");
  const [days, setDays] = useState(25);
  const [generated, setGenerated] = useState(false);
  const [completed, setCompleted] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("skillyatra_roadmap_done") || "{}");
    } catch {
      return {};
    }
  });

  const role = ROLE_ROADMAPS[selectedRole] || ROLE_ROADMAPS["Software Developer"];
  const plan = generated ? getRoadmap(selectedRole, Number(days)) : [];

  const doneCount = plan.filter((item) => completed[`${selectedRole}-${days}-${item.day}`]).length;
  const progress = plan.length ? Math.round((doneCount / plan.length) * 100) : 0;

  const toggleDone = (day) => {
    const key = `${selectedRole}-${days}-${day}`;
    const next = {
      ...completed,
      [key]: !completed[key]
    };

    setCompleted(next);
    localStorage.setItem("skillyatra_roadmap_done", JSON.stringify(next));
  };

  return (
    <div className="sy-page-theme sy-roadmap-theme min-h-screen bg-[#eef4fb] px-8 py-8">
      <section className="rounded-[2rem] bg-gradient-to-r from-fuchsia-700 via-purple-600 to-slate-950 p-8 text-white shadow-xl">
        <div className="grid gap-8 lg:grid-cols-[1fr_230px] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-purple-100">
              Role Based Roadmap
            </p>

            <h1 className="mt-4 text-4xl font-black leading-tight">
              Placement Roadmap
            </h1>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={role.resource}
                target="_blank"
                rel="noreferrer"
                className="roadmap-resource-btn inline-flex h-12 items-center gap-2 rounded-xl px-5 text-sm font-black text-white shadow-lg"
              >
                <PlayCircle className="h-5 w-5" />
                Open YouTube Resource
              </a>

              <Link
                to={`/role-practice/${encodeURIComponent(selectedRole)}`}
                className="roadmap-practice-btn inline-flex h-12 items-center gap-2 rounded-xl px-5 text-sm font-black shadow-lg"
              >
                <BookOpen className="h-5 w-5" />
                Practice Related Questions
              </Link>
            </div>
          </div>

          <div className="rounded-[1.6rem] bg-white/10 p-6 ring-1 ring-white/20">
            <h2 className="text-5xl font-black">{progress}%</h2>
            <p className="mt-1 text-sm font-black text-purple-100">
              {doneCount} of {plan.length} tasks done
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

      <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-5 xl:grid-cols-[1fr_220px_180px] xl:items-end">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <Target className="h-6 w-6 text-purple-600" />
              <h2 className="text-2xl font-black text-slate-950">Choose Roadmap</h2>
            </div>

            <select
              value={selectedRole}
              onChange={(event) => {
                setSelectedRole(event.target.value);
                setGenerated(false);
              }}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-50"
            >
              {Object.keys(ROLE_ROADMAPS).map((roleName) => (
                <option key={roleName} value={roleName}>
                  {roleName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-3">
              <CalendarDays className="h-6 w-6 text-purple-600" />
              <h2 className="text-2xl font-black text-slate-950">Days</h2>
            </div>

            <select
              value={days}
              onChange={(event) => {
                setDays(Number(event.target.value));
                setGenerated(false);
              }}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-50"
            >
              {dayOptions.map((item) => (
                <option key={item} value={item}>
                  {item} Days
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setGenerated(true)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 text-sm font-black text-white shadow-lg shadow-purple-100 hover:bg-purple-700"
          >
            <Sparkles className="h-5 w-5" />
            Generate Plan
          </button>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-black text-slate-500">Selected Role</p>
          <h3 className="mt-2 text-2xl font-black text-slate-950">{selectedRole}</h3>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-black text-slate-500">Plan Duration</p>
          <h3 className="mt-2 text-3xl font-black text-purple-600">{days}</h3>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-black text-slate-500">Completed</p>
          <h3 className="mt-2 text-3xl font-black text-emerald-600">{progress}%</h3>
        </div>
      </section>

      {!generated ? (
        <section className="mt-8 rounded-[2rem] bg-white p-14 text-center shadow-sm ring-1 ring-slate-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
            <Layers className="h-9 w-9" />
          </div>

          <h2 className="mt-5 text-2xl font-black text-slate-950">
            No roadmap generated yet
          </h2>

          <p className="mt-2 text-sm font-semibold text-slate-500">
            Choose role and days, then click Generate Plan.
          </p>
        </section>
      ) : (
        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-600">
                Generated Plan
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950">
                {selectedRole} - {days} Day Roadmap
              </h2>
            </div>

            <a
              href={role.resource}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-50 px-4 text-sm font-black text-red-600 hover:bg-red-100"
            >
              <ExternalLink className="h-4 w-4" />
              Resource
            </a>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {plan.map((item) => {
              const key = `${selectedRole}-${days}-${item.day}`;
              const done = !!completed[key];

              return (
                <article
                  key={item.day}
                  className={`rounded-2xl border p-5 ${
                    done
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-black text-purple-700">
                          Day {item.day}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                          {item.type}
                        </span>
                      </div>

                      <h3 className="mt-4 text-lg font-black text-slate-950">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                        {item.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleDone(item.day)}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        done
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleDone(item.day)}
                    className={`mt-5 rounded-xl px-4 py-2 text-sm font-black ${
                      done
                        ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    {done ? "Undo" : "Mark Done"}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
