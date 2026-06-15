import "./Resources.css";

const resourceSections = [
  {
    title: "Web Development",
    desc: "HTML, CSS, JavaScript, React, Node.js and full-stack project learning.",
    items: [
      { name: "freeCodeCamp Web Development", type: "Free", link: "https://www.freecodecamp.org/learn/" },
      { name: "The Odin Project", type: "Free", link: "https://www.theodinproject.com/" },
      { name: "MDN Web Docs", type: "Free Docs", link: "https://developer.mozilla.org/en-US/" },
      { name: "React Official Docs", type: "Free Docs", link: "https://react.dev/learn" },
      { name: "Udemy Web Development Courses", type: "Paid Platform", link: "https://www.udemy.com/courses/development/web-development/" }
    ]
  },
  {
    title: "DSA & Competitive Programming",
    desc: "Topic-wise DSA, coding practice, problem-solving and interview patterns.",
    items: [
      { name: "LeetCode Practice", type: "Practice", link: "https://leetcode.com/problemset/" },
      { name: "GeeksforGeeks Practice", type: "Practice", link: "https://practice.geeksforgeeks.org/" },
      { name: "CodeChef Practice", type: "Practice", link: "https://www.codechef.com/practice" },
      { name: "Codeforces Problemset", type: "Practice", link: "https://codeforces.com/problemset" },
      { name: "Take U Forward DSA", type: "Free", link: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/" }
    ]
  },
  {
    title: "Data Science & Machine Learning",
    desc: "Python, NumPy, Pandas, ML models, projects and AI fundamentals.",
    items: [
      { name: "Kaggle Learn", type: "Free", link: "https://www.kaggle.com/learn" },
      { name: "Google Machine Learning Crash Course", type: "Free", link: "https://developers.google.com/machine-learning/crash-course" },
      { name: "Scikit-learn Docs", type: "Free Docs", link: "https://scikit-learn.org/stable/user_guide.html" },
      { name: "Coursera Machine Learning", type: "Paid/Free Audit", link: "https://www.coursera.org/learn/machine-learning" },
      { name: "Hugging Face Course", type: "Free", link: "https://huggingface.co/learn" }
    ]
  },
  {
    title: "Core CS Subjects",
    desc: "DBMS, OS, CN, OOP and Computer Science interview preparation.",
    items: [
      { name: "DBMS Notes - GeeksforGeeks", type: "Free", link: "https://www.geeksforgeeks.org/dbms/" },
      { name: "Operating System - GeeksforGeeks", type: "Free", link: "https://www.geeksforgeeks.org/operating-systems/" },
      { name: "Computer Networks - GeeksforGeeks", type: "Free", link: "https://www.geeksforgeeks.org/computer-network-tutorials/" },
      { name: "OOP Concepts - JavaTpoint", type: "Free", link: "https://www.javatpoint.com/java-oops-concepts" },
      { name: "Neso Academy CS Subjects", type: "Free Videos", link: "https://www.youtube.com/@nesoacademy" }
    ]
  },
  {
    title: "Aptitude & Reasoning",
    desc: "Quantitative aptitude, logical reasoning, verbal ability and placement tests.",
    items: [
      { name: "IndiaBIX Aptitude", type: "Free Practice", link: "https://www.indiabix.com/aptitude/questions-and-answers/" },
      { name: "IndiaBIX Logical Reasoning", type: "Free Practice", link: "https://www.indiabix.com/logical-reasoning/questions-and-answers/" },
      { name: "IndiaBIX Verbal Ability", type: "Free Practice", link: "https://www.indiabix.com/verbal-ability/questions-and-answers/" },
      { name: "Testbook Aptitude", type: "Free/Paid", link: "https://testbook.com/aptitude" },
      { name: "PrepInsta Placement Prep", type: "Free/Paid", link: "https://prepinsta.com/" }
    ]
  },
  {
    title: "Resume & Interview",
    desc: "Resume building, HR questions, technical interview and mock preparation.",
    items: [
      { name: "Overleaf Resume Templates", type: "Free", link: "https://www.overleaf.com/gallery/tagged/cv" },
      { name: "Canva Resume Builder", type: "Free/Paid", link: "https://www.canva.com/resumes/" },
      { name: "Pramp Mock Interviews", type: "Free/Paid", link: "https://www.pramp.com/" },
      { name: "InterviewBit Interview Prep", type: "Free", link: "https://www.interviewbit.com/" },
      { name: "LinkedIn Jobs", type: "Jobs", link: "https://www.linkedin.com/jobs/" }
    ]
  },
  {
    title: "Projects & GitHub",
    desc: "Build portfolio projects, learn GitHub, deployment and open-source workflow.",
    items: [
      { name: "GitHub Skills", type: "Free", link: "https://skills.github.com/" },
      { name: "Git Documentation", type: "Free Docs", link: "https://git-scm.com/doc" },
      { name: "Vercel Deployment", type: "Free/Paid", link: "https://vercel.com/docs" },
      { name: "Render Deployment", type: "Free/Paid", link: "https://render.com/docs" },
      { name: "GitHub Explore", type: "Open Source", link: "https://github.com/explore" }
    ]
  },
  {
    title: "Company Preparation",
    desc: "Company-wise coding, interview experiences and placement preparation.",
    items: [
      { name: "GeeksforGeeks Interview Experiences", type: "Free", link: "https://www.geeksforgeeks.org/company-interview-corner/" },
      { name: "LeetCode Discuss", type: "Free", link: "https://leetcode.com/discuss/" },
      { name: "Glassdoor Interview Reviews", type: "Free/Paid", link: "https://www.glassdoor.co.in/Interview/index.htm" },
      { name: "AmbitionBox Interview Questions", type: "Free", link: "https://www.ambitionbox.com/interviews" },
      { name: "Naukri Jobs", type: "Jobs", link: "https://www.naukri.com/" }
    ]
  }
];

export default function Resources() {
  return (
    <div className="resources-page sy-page">
      <section className="sy-page-hero resources-hero">
        <div>
          <span className="resources-kicker">RESOURCES</span>
          <h1>Placement Learning Hub</h1>
        </div>
      </section>

      <section className="resources-intro sy-card">
        <h2>Subject-wise courses and practice resources</h2>
        <p>
          Use this page for free and structured learning resources. DSA coding questions are still managed from the DSA Tracker page.
        </p>
      </section>

      <section className="resources-grid">
        {resourceSections.map((section) => (
          <div className="resource-card sy-card" key={section.title}>
            <div className="resource-card-head">
              <h3>{section.title}</h3>
              <p>{section.desc}</p>
            </div>

            <div className="resource-list">
              {section.items.map((item) => (
                <a
                  key={item.name}
                  className="resource-link"
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.type}</span>
                  </div>
                  <b>Open →</b>
                </a>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
