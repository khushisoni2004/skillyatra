const fs = require("fs");

const file = "src/data/generatedMcqs.js";
const text = fs.readFileSync(file, "utf8");

const match = text.match(/export const MCQ_QUESTIONS = ([\s\S]*?);\s*$/);
if (!match) {
  console.error("MCQ_QUESTIONS not found");
  process.exit(1);
}

let questions = JSON.parse(match[1]);

const GROUPS = [
  "All",
  "Quantitative Aptitude",
  "Logical Reasoning",
  "Verbal Ability",
  "Placement / NQT",
  "Programming",
  "Core CS",
  "Python",
  "Data Science",
  "HR / Technical Interview"
];

function opt(key, text) {
  return { key, text };
}

function makeQ(i, topic, question, correct, wrongs, explanation) {
  return {
    id: `manual-hr-tech-${String(i).padStart(3, "0")}`,
    subject: "HR / Technical Interview",
    topic,
    difficulty: i <= 35 ? "Easy" : i <= 75 ? "Medium" : "Hard",
    question,
    options: [
      opt("A", correct),
      opt("B", wrongs[0]),
      opt("C", wrongs[1]),
      opt("D", wrongs[2])
    ],
    correctAnswer: "A",
    answer: "A",
    explanation,
    sourceDataset: "Manual HR Technical Interview 100"
  };
}

const bank = [
  ["HR Basics", "In an interview, what is the best way to answer “Tell me about yourself” as a fresher?", "Give a short structured answer: education, skills, projects, and career goal", ["Tell full family history", "Say only your name", "Say you do not know"], "A fresher answer should be short, confident, and relevant to the job."],
  ["HR Basics", "What should you focus on when answering “Why should we hire you?”", "Match your skills, projects, learning ability, and role requirements", ["Only ask about salary", "Say you need any job", "Criticize other candidates"], "The answer should connect your strengths with the company’s requirement."],
  ["HR Basics", "How should you answer “What are your strengths?”", "Mention real strengths with a short example", ["Say I have no strengths", "Give fake overconfident claims", "Talk only about marks"], "Interviewers prefer strengths backed by examples."],
  ["HR Basics", "How should you answer “What is your weakness?”", "Mention a genuine improvement area and how you are working on it", ["Say I have no weakness", "Mention a critical weakness with no solution", "Blame others"], "A safe weakness answer shows self-awareness and improvement."],
  ["HR Basics", "What is the best answer style for “Why do you want to join our company?”", "Mention role fit, learning opportunity, company work, and contribution", ["Say only for salary", "Say because friends applied", "Say randomly"], "The answer should show research and genuine interest."],
  ["HR Basics", "What should you avoid in HR interviews?", "Negative comments about college, teachers, previous teams, or companies", ["Clear examples", "Honest communication", "Role-related answers"], "Negative tone can reduce selection chances."],
  ["HR Basics", "If asked about salary expectations as a fresher, what is a good response?", "Say you are open to company standards and role-based compensation", ["Demand very high salary without reason", "Refuse to answer rudely", "Say salary does not matter at all"], "Freshers should sound flexible and professional."],
  ["HR Basics", "How should you answer relocation availability?", "Answer honestly and mention flexibility if possible", ["Lie without intention", "Say never without explanation", "Avoid the question"], "Relocation answer should be clear and truthful."],
  ["HR Basics", "What should you do if you do not know an interview answer?", "Accept politely and explain how you would approach learning it", ["Guess confidently without logic", "Stay silent", "Argue with interviewer"], "Honesty with learning attitude is better than fake answers."],
  ["HR Basics", "What is the best closing question to ask interviewer?", "Ask about role responsibilities, team, learning path, or next steps", ["Ask only about leaves first", "Ask personal questions", "Ask if you are selected forcefully"], "Good questions show interest in the role."],

  ["Project Interview", "When explaining a project, what order is best?", "Problem, solution, tech stack, features, your contribution, result", ["Only UI color discussion", "Only GitHub link", "Only team member names"], "Structured project explanation helps interviewer understand your work."],
  ["Project Interview", "If interviewer asks your role in team project, what should you do?", "Clearly explain your own contribution with modules/tasks", ["Take credit for everything", "Say team did everything", "Avoid details"], "Interviewers check actual involvement."],
  ["Project Interview", "What should you include while explaining tech stack?", "Frontend, backend, database, APIs, deployment/tools used", ["Only project title", "Only screenshots", "Only college name"], "Tech stack shows technical understanding."],
  ["Project Interview", "If asked about project challenges, what is the best answer?", "Explain one real issue, debugging approach, and final solution", ["Say no challenge ever happened", "Blame teammate", "Say I forgot"], "Challenges show problem-solving ability."],
  ["Project Interview", "If asked why you chose a technology, what should you answer?", "Mention suitability, simplicity, performance, ecosystem, or project need", ["Say because everyone used it", "Say randomly", "Say no reason"], "Technology choice should have logic."],
  ["Project Interview", "What is the best way to explain database design in a project?", "Explain main tables/collections, relationships, and why data is stored that way", ["Say database stores everything", "Avoid database part", "Only say MongoDB"], "Database explanation shows backend clarity."],
  ["Project Interview", "If project has authentication, what should you explain?", "Login flow, password handling, token/session, protected routes", ["Only login button color", "Only username field", "Only CSS"], "Authentication is a common technical interview topic."],
  ["Project Interview", "What should you mention about deployment?", "Where frontend/backend are hosted and how environment variables are used", ["Only local folder path", "Only laptop name", "Nothing"], "Deployment knowledge shows project completeness."],
  ["Project Interview", "If interviewer asks future scope of project, what is a good answer?", "Mention practical improvements like scaling, security, analytics, and better UX", ["Say no future scope", "Say project is already perfect", "Say unrelated features"], "Future scope should be realistic."],
  ["Project Interview", "What should you avoid while explaining your project?", "Reading memorized lines without understanding", ["Clear architecture", "Honest contribution", "Demo flow"], "Interviewers can detect memorized answers easily."],

  ["Technical Interview", "In technical interview, what is a good way to explain an algorithm?", "Explain approach, data structure, steps, complexity, and edge cases", ["Only write final answer", "Only say it is easy", "Skip complexity always"], "Structured explanation is important in coding interviews."],
  ["Technical Interview", "If asked time complexity, what should you explain?", "How runtime grows with input size", ["Exact running time in seconds", "Only memory usage", "Only CPU brand"], "Time complexity measures growth rate."],
  ["Technical Interview", "If asked space complexity, what should you explain?", "Extra memory used by the algorithm", ["Internet speed", "Database size only", "Screen resolution"], "Space complexity is about memory usage."],
  ["Technical Interview", "What should you do before coding in an interview?", "Clarify input, output, constraints, and edge cases", ["Start coding blindly", "Ask salary", "Ignore constraints"], "Clarifying requirements avoids wrong solutions."],
  ["Technical Interview", "What is an edge case?", "Special input condition that may break normal logic", ["Only average input", "Only largest salary", "Only UI bug"], "Edge cases test robustness."],
  ["Technical Interview", "If your code fails a test case, what is the best response?", "Debug calmly and trace with sample input", ["Panic and stop", "Blame compiler", "Delete code"], "Debugging attitude matters."],
  ["Technical Interview", "What is a dry run?", "Manually tracing code step by step with input", ["Running code in browser only", "Deleting code", "Formatting code"], "Dry run helps verify logic."],
  ["Technical Interview", "What should you mention after solving a coding question?", "Complexity and possible optimization", ["Only say done", "Close interview", "Change topic"], "Optimization discussion shows deeper understanding."],
  ["Technical Interview", "What is brute force approach?", "Simple direct approach that may not be optimized", ["Always fastest approach", "Database-only method", "UI-only method"], "Brute force is often first solution before optimization."],
  ["Technical Interview", "What should you do if interviewer gives a hint?", "Use it positively and continue improving solution", ["Ignore it", "Argue", "Stop solving"], "Hints are part of interview collaboration."],

  ["Behavioral", "How should you answer a team conflict question?", "Explain situation, your action, communication, and positive result", ["Blame teammate", "Say I never work in teams", "Avoid answer"], "Behavioral answers should be mature and example-based."],
  ["Behavioral", "What is the STAR method?", "Situation, Task, Action, Result", ["Start, Test, Apply, Run", "Skill, Time, Aim, Role", "System, Tool, API, Result"], "STAR helps structure behavioral answers."],
  ["Behavioral", "If you missed a deadline, what should you explain?", "Reason, communication, corrective action, and learning", ["Hide the mistake", "Blame everyone", "Say deadlines do not matter"], "Accountability is important."],
  ["Behavioral", "How should you answer leadership experience as fresher?", "Mention college project/team event where you coordinated or took responsibility", ["Say leadership means bossing", "Say no if not manager", "Talk unrelated"], "Freshers can show leadership through small responsibilities."],
  ["Behavioral", "How should you answer pressure-handling questions?", "Give example of planning, prioritizing, and staying calm", ["Say you panic always", "Say pressure never happens", "Blame workload"], "Interviewers check stability under pressure."],
  ["Behavioral", "What is a professional way to handle feedback?", "Listen, understand, improve, and apply it", ["Argue immediately", "Ignore feedback", "Take it personally always"], "Feedback handling shows growth mindset."],
  ["Behavioral", "If a teammate is not contributing, what should you do first?", "Communicate politely and understand the problem", ["Complain directly without talking", "Do nothing", "Fight"], "Professional communication is the first step."],
  ["Behavioral", "How should you show learning attitude?", "Give examples of self-learning, projects, practice, or certifications", ["Only say I learn fast", "Say I know everything", "Avoid examples"], "Examples make learning attitude credible."],
  ["Behavioral", "What is ownership in workplace?", "Taking responsibility for task completion and quality", ["Only doing assigned work carelessly", "Blaming others", "Ignoring deadlines"], "Ownership is valued in teams."],
  ["Behavioral", "How should you answer failure question?", "Explain what happened, what you learned, and how you improved", ["Hide all failures", "Blame others", "Say failure is impossible"], "Good failure answers show maturity."],

  ["Resume Interview", "If interviewer asks about a resume skill, what should you be ready for?", "Basic concepts and practical questions on that skill", ["Only spelling of skill", "Only certificate name", "Nothing"], "Every resume skill can be questioned."],
  ["Resume Interview", "What should you not add in resume?", "Skills/projects you cannot explain", ["Relevant projects", "Correct education", "Contact details"], "Fake skills create problems in interview."],
  ["Resume Interview", "If asked about GitHub project, what should you explain?", "Repository structure, features, setup, and your commits/contribution", ["Only star count", "Only profile photo", "Nothing"], "GitHub discussion checks real work."],
  ["Resume Interview", "What is a good project bullet in resume?", "Action + technology + result/impact", ["Long paragraph only", "Only project name", "Only team size"], "Strong bullets clearly show work."],
  ["Resume Interview", "If there is a gap or low CGPA, how should you answer?", "Be honest and redirect to skills, projects, and improvement", ["Lie", "Blame college", "Argue"], "Honest and improvement-focused answer is safest."],
  ["Resume Interview", "What should portfolio or project demo show?", "Working features and clear user flow", ["Only background music", "Only logo", "Only color theme"], "Demo should prove functionality."],
  ["Resume Interview", "What should you prepare for each resume project?", "Problem statement, tech stack, architecture, challenges, and results", ["Only title", "Only screenshots", "Only team names"], "Project preparation must be complete."],
  ["Resume Interview", "What is the risk of copying resume content?", "You may fail when asked detailed questions", ["It improves selection always", "No risk", "It guarantees job"], "Interviewers verify resume claims."],
  ["Resume Interview", "How should certifications be discussed?", "Mention what you learned and where you applied it", ["Only certificate ID", "Only platform name", "Say forgot"], "Certification value increases when linked to learning."],
  ["Resume Interview", "What should a fresher highlight most?", "Projects, skills, internships/training, problem-solving, and learning ability", ["Only hobbies", "Only family background", "Only marks"], "Freshers should highlight practical readiness."],

  ["Technical Communication", "How should you explain a bug you fixed?", "Issue, root cause, debugging process, fix, and result", ["Only say fixed", "Blame library", "Skip root cause"], "Good bug explanation shows debugging ability."],
  ["Technical Communication", "How should you explain API integration?", "Endpoint, request, response, error handling, and UI usage", ["Only button click", "Only CSS", "Only database name"], "API explanation needs both frontend and backend clarity."],
  ["Technical Communication", "How should you explain frontend-backend flow?", "User action → API call → backend logic → database → response → UI update", ["Only frontend screen", "Only server start", "Only package.json"], "Flow explanation shows full-stack understanding."],
  ["Technical Communication", "If asked about database CRUD, what should you explain?", "Create, Read, Update, Delete operations with examples", ["Only create", "Only delete", "Only table name"], "CRUD is basic backend interview topic."],
  ["Technical Communication", "How should you explain authentication token?", "Token verifies logged-in user for protected requests", ["Token is CSS file", "Token is image", "Token is database row only"], "Token-based auth is common in web apps."],
  ["Technical Communication", "What should you explain about error handling?", "How errors are detected, shown to user, and logged/debugged", ["Ignore all errors", "Only reload page", "Hide errors always"], "Error handling shows production thinking."],
  ["Technical Communication", "How should you answer “Explain your code”?", "Explain purpose, inputs, logic, output, and edge cases", ["Read line numbers only", "Say it works", "Skip logic"], "Code explanation should show understanding."],
  ["Technical Communication", "What should you do if interviewer interrupts your explanation?", "Pause, listen, answer directly, then continue if needed", ["Speak louder", "Ignore interviewer", "Stop answering"], "Interview communication should be respectful and focused."],
  ["Technical Communication", "How should you explain optimization?", "Mention bottleneck, improved approach, and complexity/performance benefit", ["Only say faster", "Avoid details", "Delete features"], "Optimization needs reason and measurable benefit."],
  ["Technical Communication", "How should you explain learning a new technology?", "Mention resources, small practice, implementation, and result", ["Say magic happened", "Say someone else did it", "Avoid answer"], "This shows adaptability."],

  ["Placement Scenario", "You are selected but waiting for another result. What is professional behavior?", "Respond honestly and respectfully within timeline", ["Ignore emails", "Lie to both companies", "Delay without communication"], "Professional communication matters during offers."],
  ["Placement Scenario", "If you receive an interview mail, what should you check first?", "Role, date/time, mode, requirements, and documents", ["Only company logo", "Only font", "Only sender photo"], "Interview readiness starts with checking details."],
  ["Placement Scenario", "What should you carry/keep ready for interview?", "Resume, ID, project links, certificates if needed, and internet/device setup", ["Only phone charger", "Only notebook", "Nothing"], "Preparation avoids last-minute issues."],
  ["Placement Scenario", "In online interview, what should be checked before joining?", "Internet, camera, microphone, environment, and resume/projects", ["Only wallpaper", "Only chair color", "Only social media"], "Technical setup affects interview quality."],
  ["Placement Scenario", "If interviewer asks expected joining date, what should you answer?", "Give realistic availability based on college/exam constraints", ["Give fake immediate date", "Say never", "Avoid answer"], "Joining date must be practical and honest."],
  ["Placement Scenario", "If asked “Are you comfortable with bond/service agreement?”, what should you do?", "Ask/understand terms clearly and answer honestly", ["Sign blindly", "Reject rudely", "Ignore"], "Bond-related decisions require clarity."],
  ["Placement Scenario", "If asked about location preference, what is best?", "State preference but show flexibility if possible", ["Say any location then refuse later", "Argue", "Avoid"], "Flexibility helps, but honesty is important."],
  ["Placement Scenario", "What should you do after interview?", "Send thanks if appropriate and wait for official update", ["Spam interviewer", "Post private details", "Call repeatedly"], "Professional follow-up should be polite."],
  ["Placement Scenario", "How should you handle rejection?", "Analyze feedback, improve skills, and apply again", ["Stop preparing", "Blame company publicly", "Delete resume"], "Rejection is part of placement process."],
  ["Placement Scenario", "What should you do before accepting offer?", "Understand role, CTC breakup, location, joining date, bond, and policies", ["Accept without reading", "Only see company logo", "Ignore details"], "Offer details should be checked carefully."],

  ["Technical Interview", "If interviewer asks difference between frontend and backend, what is correct?", "Frontend handles UI; backend handles server logic, APIs, database interaction", ["Both are same", "Frontend is only database", "Backend is only CSS"], "This is a common full-stack interview question."],
  ["Technical Interview", "If interviewer asks what an API is, what should you answer?", "A contract/interface for communication between software systems", ["Only a database", "Only a button", "Only a CSS file"], "API enables systems to exchange data."],
  ["Technical Interview", "If asked about REST API, what should you mention?", "Resources, HTTP methods, endpoints, status codes, request/response", ["Only HTML", "Only images", "Only database tables"], "REST API uses HTTP-based resource communication."],
  ["Technical Interview", "What does HTTP 404 mean?", "Resource not found", ["Server success", "Unauthorized always", "Bad gateway"], "404 means requested resource does not exist."],
  ["Technical Interview", "What does HTTP 500 mean?", "Internal server error", ["Success", "Redirect", "Client cache"], "500 indicates server-side failure."],
  ["Technical Interview", "What is validation in forms?", "Checking input correctness before processing", ["Changing colors only", "Deleting form", "Ignoring input"], "Validation prevents bad data."],
  ["Technical Interview", "What is version control used for?", "Tracking code changes and collaboration", ["Only designing UI", "Only running server", "Only deleting files"], "Git/version control manages code history."],
  ["Technical Interview", "Why is environment variable used?", "To store configuration/secrets outside source code", ["To style page", "To write HTML", "To store images only"], "Environment variables protect config and secrets."],
  ["Technical Interview", "What is deployment?", "Making application available for users on a server/platform", ["Only coding locally", "Only writing README", "Only making logo"], "Deployment makes project accessible."],
  ["Technical Interview", "What is debugging?", "Finding and fixing errors in code", ["Writing resume", "Changing theme", "Installing browser"], "Debugging is core developer skill."]
];

const manual = [];
for (let i = 1; i <= 100; i++) {
  const row = bank[(i - 1) % bank.length];
  manual.push(makeQ(i, row[0], row[1], row[2], row[3], row[4]));
}

// remove old manual HR tech questions to keep strict 100
questions = questions.filter((q) => q.sourceDataset !== "Manual HR Technical Interview 100");

// move any real HR-like old questions into HR group
questions = questions.map((q) => {
  const text = String([q.question, q.topic, q.sourceDataset].join(" ")).toLowerCase();

  if (
    text.includes("tell me about yourself") ||
    text.includes("why should we hire you") ||
    text.includes("salary expectation") ||
    text.includes("strength") ||
    text.includes("weakness") ||
    text.includes("interview") ||
    text.includes("resume")
  ) {
    return { ...q, subject: "HR / Technical Interview" };
  }

  return q;
});

const merged = [...questions, ...manual];

const counts = {};
for (const g of GROUPS) {
  counts[g] = g === "All" ? merged.length : merged.filter((q) => q.subject === g).length;
}

const output = `export const MCQ_GROUPS = ${JSON.stringify(GROUPS, null, 2)};

export const MCQ_COUNTS = ${JSON.stringify(counts, null, 2)};

export const MCQ_QUESTIONS = ${JSON.stringify(merged, null, 2)};
`;

fs.writeFileSync(file, output);

console.log("✅ Added strict HR / Technical Interview 100 questions.");
console.log(counts);
