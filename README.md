# SkillYatra — Placement GPS for Indian Students

SkillYatra is a full-stack placement preparation platform built for Indian college students. It works like a personal **Placement GPS** by combining DSA tracking, company-wise preparation, practice MCQs, resume guidance, interview preparation, progress tracking, and daily study planning in one clean dashboard.

Live Project: https://skillyatra.vercel.app  
Backend API: https://skillyatra-backend.onrender.com  
GitHub Repository: https://github.com/khushisoni2004/skillyatra

---

## Overview

SkillYatra helps students prepare for placements in a structured way instead of randomly switching between different websites. The platform gives students a readiness-focused workflow where they can track DSA progress, practice role-based questions, prepare for companies, improve resumes, and revise important topics before interviews.

The project uses real datasets for DSA questions, company/job-market preparation, and placement-focused practice content. DSA questions open on original coding platforms such as LeetCode, GeeksForGeeks, Codeforces, and CodeChef, while SkillYatra tracks progress through its own dashboard.

---

## Key Features

### Placement Dashboard
- Placement readiness score
- Daily study plan
- Progress overview
- Weak area tracking
- Streak and revision tracking

### DSA Tracker
- Topic-wise DSA questions
- Platform filters for LeetCode, GeeksForGeeks, Codeforces, and CodeChef
- Difficulty-based filtering
- Search support
- Mark Done tracking
- Page-wise question loading from backend dataset

### Practice MCQs
- Placement-focused MCQ practice
- Aptitude, core CS, programming, DSA, HR, and technical question support
- Role-based practice flow
- Backend dataset-driven question loading

### Company Preparation
- Company-wise preparation pages
- Company search and suggestions
- Role-wise preparation guidance
- Roadmap and preparation insights based on job-market data

### Resume Coach
- Resume checklist
- ATS-focused improvement guidance
- Company and role-based resume preparation support

### Interview Coach
- Technical and HR interview preparation
- Company/role-focused question practice
- Structured answer preparation support

### Resources Hub
- Curated placement resources
- Learning links
- Revision material
- Preparation guidance

---

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Recharts
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- dotenv
- cors
- adm-zip
- xlsx

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

---

## Project Structure

```txt
skillyatra/
├── backend/
│   ├── scripts/
│   ├── src/
│   │   ├── data/
│   │   │   └── datasets/
│   │   ├── routes/
│   │   └── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── lib/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
