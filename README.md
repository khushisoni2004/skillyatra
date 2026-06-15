# SkillYatra - Placement GPS

SkillYatra is a free all-in-one learning and placement preparation website for Indian college students. It works like a personal Placement GPS with a readiness score, DSA progress tracker, MCQ practice hub, company preparation, resume checklist, interview practice, and daily study plan.

## Features
- Placement Readiness Score
- Weak Area Detector
- What Should I Study Today?
- Skip for Now Engine
- Target Company Track
- 7-Day Company Crash Plan
- 30/60/90 Day Roadmap
- Resume ATS Checklist
- Interview Answer Coach
- Revision Radar and streak tracking
- SkillDNA Profile
- DSA Dataset Import System
- Real Platform Question Tracker
- Duplicate Link Validator
- Practice MCQ Hub with weak-topic and company-wise modes

## Tech Stack
Frontend: React, Vite, Tailwind CSS, React Router, Axios, Recharts, Lucide React.  
Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, dotenv, cors, nodemon, PapaParse, adm-zip.

## Folder Structure
The project has one top-level folder: `skillyatra`, with `backend` and `frontend` inside it.

## Run Commands
```bash
cd skillyatra/backend
npm install
cp .env.example .env
npm run seed
npm run import:all
npm run dev
```

New terminal:
```bash
cd skillyatra/frontend
npm install
npm run dev
```

Open: `http://localhost:5173`

Backend URL: `http://localhost:5001/api`  
Frontend URL: `http://localhost:5173`

## Demo Login
Student: `student@skillyatra.in` / `password123`  
Admin: `admin@skillyatra.in` / `admin123`

## Dataset Usage
Place the downloaded ZIP datasets inside `backend/src/data/datasets/` using the same names shown in this project. Then run:

```bash
npm run import:all
```

The importer extracts CSV/JSON files from ZIPs and normalizes DSA questions and MCQs into MongoDB.

## Important DSA Behavior
DSA links open original coding platforms directly. SkillYatra intentionally does not use an internal fake coding editor. Students solve DSA on LeetCode, HackerRank, CodeChef, or GFG, then return to SkillYatra and click **Mark Done** to track progress.

## Practice MCQ Hub
The Practice section is separate from DSA. Students solve MCQs inside SkillYatra using aptitude, core CS, programming language, DSA concept, placement, HR, and technical interview datasets.

## Dataset Note
This generated ZIP includes valid placeholder ZIP files with the requested dataset names so the structure is correct. Replace those placeholder ZIP files with your real downloaded datasets before running `npm run import:all` to load your full data.
