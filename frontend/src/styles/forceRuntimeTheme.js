const STYLE_ID = "skillyatra-final-runtime-theme";

const css = `
* {
  box-sizing: border-box !important;
}

html,
body,
#root {
  margin: 0 !important;
  width: 100% !important;
  min-height: 100% !important;
  overflow-x: hidden !important;
  background: #f6f8fc !important;
  color: #0f172a !important;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
}

/* FULL WEBSITE CUT FIX */
#root,
.app,
.App,
.layout,
.app-layout,
.dashboard-layout,
.main-layout,
.page-layout,
.content-layout,
.main-content,
.content,
.page-content,
main {
  max-width: 100% !important;
  min-width: 0 !important;
  overflow-x: hidden !important;
}

/* SAME PAGE BASE FROM HOME TO PROGRESS */
.home-page,
.landing-page,
.auth-page,
.login-page,
.signup-page,
.dashboard-page,
.today-page,
.roadmaps-page,
.dsa-page,
.practice-page,
.resources-page,
.companies-page,
.resume-page,
.interview-page,
.progress-page,
.profile-page,
.admin-page,
.role-practice-page,
.company-detail-page,
.role-detail-page,
[class*="-page"] {
  width: 100% !important;
  max-width: 100% !important;
  min-height: 100vh !important;
  padding: clamp(14px, 2vw, 28px) !important;
  background:
    radial-gradient(circle at top left, rgba(79,70,229,0.08), transparent 34%),
    radial-gradient(circle at top right, rgba(14,165,233,0.07), transparent 30%),
    #f6f8fc !important;
  color: #0f172a !important;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
  overflow-x: hidden !important;
}

/* SAME PROFESSIONAL HEADER BOX FOR ALL PAGES */
.hero,
.home-hero,
.auth-hero,
.dashboard-hero,
.page-hero,
.page-header,
.section-header,
.today-header,
.roadmaps-header,
.dsa-header,
.practice-header,
.resources-hero,
.resources-header,
.companies-header,
.resume-header,
.interview-header,
.progress-header,
.profile-header,
.admin-header,
.role-header,
.company-header,
[class*="hero"],
[class*="header"] {
  position: relative !important;
  width: 100% !important;
  max-width: 100% !important;
  min-height: clamp(170px, 20vw, 235px) !important;
  border-radius: clamp(22px, 3vw, 34px) !important;
  padding: clamp(28px, 4vw, 48px) !important;
  margin: 0 0 clamp(20px, 2vw, 30px) 0 !important;
  background:
    radial-gradient(circle at 86% 18%, rgba(255,255,255,0.18), transparent 25%),
    linear-gradient(125deg, #4f46e5 0%, #6d28d9 42%, #172554 100%) !important;
  color: #ffffff !important;
  border: 1px solid rgba(255,255,255,0.14) !important;
  box-shadow: 0 22px 58px rgba(15,23,42,0.15) !important;
  overflow: hidden !important;
}

.hero::after,
.home-hero::after,
.auth-hero::after,
.dashboard-hero::after,
.page-hero::after,
.page-header::after,
.section-header::after,
.today-header::after,
.roadmaps-header::after,
.dsa-header::after,
.practice-header::after,
.resources-hero::after,
.resources-header::after,
.companies-header::after,
.resume-header::after,
.interview-header::after,
.progress-header::after,
.profile-header::after,
.admin-header::after,
.role-header::after,
.company-header::after {
  content: "" !important;
  position: absolute !important;
  right: -70px !important;
  bottom: -85px !important;
  width: clamp(180px, 22vw, 300px) !important;
  height: clamp(180px, 22vw, 300px) !important;
  border-radius: 999px !important;
  background: rgba(255,255,255,0.10) !important;
  animation: syFloat 6s ease-in-out infinite alternate !important;
  pointer-events: none !important;
}

@keyframes syFloat {
  from { transform: translateY(0) scale(1); }
  to { transform: translateY(-16px) scale(1.08); }
}

/* HEADER TEXT VISIBLE WHITE */
.hero *,
.home-hero *,
.auth-hero *,
.dashboard-hero *,
.page-hero *,
.page-header *,
.section-header *,
.today-header *,
.roadmaps-header *,
.dsa-header *,
.practice-header *,
.resources-hero *,
.resources-header *,
.companies-header *,
.resume-header *,
.interview-header *,
.progress-header *,
.profile-header *,
.admin-header *,
.role-header *,
.company-header *,
[class*="hero"] *,
[class*="header"] * {
  color: #ffffff !important;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
}

.hero h1,
.home-hero h1,
.auth-hero h1,
.dashboard-hero h1,
.page-hero h1,
.page-header h1,
.section-header h1,
.today-header h1,
.roadmaps-header h1,
.dsa-header h1,
.practice-header h1,
.resources-hero h1,
.resources-header h1,
.companies-header h1,
.resume-header h1,
.interview-header h1,
.progress-header h1,
.profile-header h1,
.admin-header h1,
.role-header h1,
.company-header h1,
[class*="hero"] h1,
[class*="header"] h1 {
  color: #ffffff !important;
  font-size: clamp(32px, 4.7vw, 62px) !important;
  line-height: 1.04 !important;
  font-weight: 950 !important;
  letter-spacing: -0.05em !important;
}

.hero p,
.home-hero p,
.auth-hero p,
.dashboard-hero p,
.page-hero p,
.page-header p,
.section-header p,
.today-header p,
.roadmaps-header p,
.dsa-header p,
.practice-header p,
.resources-hero p,
.resources-header p,
.companies-header p,
.resume-header p,
.interview-header p,
.progress-header p,
.profile-header p,
.admin-header p,
.role-header p,
.company-header p,
[class*="hero"] p,
[class*="header"] p {
  color: rgba(255,255,255,0.80) !important;
  font-weight: 700 !important;
  line-height: 1.65 !important;
}

/* ALL CARDS SAME PROFESSIONAL */
.card,
.stat-card,
.feature-card,
.roadmap-card,
.company-card,
.resource-card,
.question-card,
.practice-card,
.progress-card,
.resume-card,
.interview-card,
.admin-card,
.dsa-stat-card,
.dsa-filter-card,
.dsa-question-card,
.custom-card,
[class*="card"] {
  max-width: 100% !important;
  min-width: 0 !important;
  background: rgba(255,255,255,0.96) !important;
  color: #0f172a !important;
  border: 1px solid #dbe4f3 !important;
  border-radius: 26px !important;
  box-shadow: 0 18px 45px rgba(15,23,42,0.07) !important;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
  transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease !important;
  overflow: hidden !important;
}

.card:hover,
.feature-card:hover,
.roadmap-card:hover,
.company-card:hover,
.resource-card:hover,
.question-card:hover,
.practice-card:hover,
.progress-card:hover,
.resume-card:hover,
.interview-card:hover,
.admin-card:hover,
.dsa-question-card:hover,
.pro-resource-card:hover {
  transform: translateY(-5px) !important;
  box-shadow: 0 26px 64px rgba(15,23,42,0.13) !important;
  border-color: rgba(79,70,229,0.25) !important;
}

/* INSIDE CARD TEXT */
.card h1,
.card h2,
.card h3,
.stat-card h1,
.stat-card h2,
.stat-card h3,
.feature-card h1,
.feature-card h2,
.feature-card h3,
.roadmap-card h1,
.roadmap-card h2,
.roadmap-card h3,
.company-card h1,
.company-card h2,
.company-card h3,
.resource-card h1,
.resource-card h2,
.resource-card h3,
.question-card h1,
.question-card h2,
.question-card h3,
.practice-card h1,
.practice-card h2,
.practice-card h3,
.progress-card h1,
.progress-card h2,
.progress-card h3,
.resume-card h1,
.resume-card h2,
.resume-card h3,
.interview-card h1,
.interview-card h2,
.interview-card h3,
.admin-card h1,
.admin-card h2,
.admin-card h3,
[class*="card"] h1,
[class*="card"] h2,
[class*="card"] h3 {
  color: #0f172a !important;
  font-weight: 950 !important;
  letter-spacing: -0.03em !important;
}

.card p,
.stat-card p,
.feature-card p,
.roadmap-card p,
.company-card p,
.resource-card p,
.question-card p,
.practice-card p,
.progress-card p,
.resume-card p,
.interview-card p,
.admin-card p,
[class*="card"] p {
  color: #64748b !important;
  font-weight: 680 !important;
}

/* FORM/DROPDOWN SAME, CONNECTION SAME */
input,
select,
textarea {
  width: 100% !important;
  max-width: 100% !important;
  background: #ffffff !important;
  color: #0f172a !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 16px !important;
  padding: 12px 14px !important;
  font-family: Inter, ui-sans-serif, system-ui !important;
  outline: none !important;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #4f46e5 !important;
  box-shadow: 0 0 0 4px rgba(79,70,229,0.12) !important;
}

button,
.btn,
.primary-btn,
.secondary-btn,
.action-btn,
.refresh-btn,
.dsa-refresh-btn,
.dsa-open-btn,
.dsa-done-btn,
.dsa-page-btn,
a[class*="btn"] {
  max-width: 100% !important;
  border-radius: 16px !important;
  font-family: Inter, ui-sans-serif, system-ui !important;
  font-weight: 900 !important;
  transition: transform 0.22s ease, box-shadow 0.22s ease !important;
}

button:hover:not(:disabled),
.btn:hover,
.primary-btn:hover,
.secondary-btn:hover,
.action-btn:hover,
.refresh-btn:hover,
.dsa-refresh-btn:hover,
.dsa-open-btn:hover,
.dsa-done-btn:hover,
.dsa-page-btn:hover {
  transform: translateY(-2px) !important;
}

/* IMAGES SAFE */
img,
video,
canvas,
svg {
  max-width: 100% !important;
}

/* RESOURCES PAGE COLORFUL ONLY */
.resources-grid {
  display: grid !important;
  gap: 26px !important;
}

.resource-section,
.custom-resource-panel {
  width: 100% !important;
  background: rgba(255,255,255,0.96) !important;
  border: 1px solid #dbe4f3 !important;
  border-radius: 34px !important;
  padding: clamp(20px,2.4vw,34px) !important;
  box-shadow: 0 18px 45px rgba(15,23,42,0.06) !important;
  overflow: hidden !important;
}

.section-title-row {
  display: flex !important;
  align-items: flex-start !important;
  gap: 18px !important;
  margin-bottom: 24px !important;
}

.section-title-row > span {
  display: inline-flex !important;
  min-width: fit-content !important;
  color: #6d28d9 !important;
  background: #ede9fe !important;
  border: 1px solid #ddd6fe !important;
  font-size: 12px !important;
  font-weight: 950 !important;
  letter-spacing: 0.16em !important;
  border-radius: 999px !important;
  padding: 8px 12px !important;
}

.section-title-row h2 {
  margin: 0 0 8px !important;
  color: #0f172a !important;
  font-size: clamp(24px,2.5vw,36px) !important;
  line-height: 1.08 !important;
  font-weight: 950 !important;
}

.section-title-row p {
  margin: 0 !important;
  color: #64748b !important;
  font-weight: 720 !important;
}

.resource-card-grid {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0,1fr)) !important;
  gap: 24px !important;
  width: 100% !important;
}

.pro-resource-card {
  position: relative !important;
  min-height: 310px !important;
  display: flex !important;
  flex-direction: column !important;
  text-decoration: none !important;
  color: #0f172a !important;
  background:
    radial-gradient(circle at top right, rgba(109,40,217,0.10), transparent 34%),
    linear-gradient(180deg,#ffffff 0%,#f8fafc 100%) !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 34px !important;
  padding: clamp(22px,2vw,30px) !important;
  overflow: hidden !important;
  transition: 0.25s ease !important;
}

.pro-resource-card:nth-child(4n+1) {
  background:
    radial-gradient(circle at top right, rgba(79,70,229,0.14), transparent 34%),
    linear-gradient(180deg,#ffffff 0%,#f8fafc 100%) !important;
}

.pro-resource-card:nth-child(4n+2) {
  background:
    radial-gradient(circle at top right, rgba(14,165,233,0.14), transparent 34%),
    linear-gradient(180deg,#ffffff 0%,#f8fafc 100%) !important;
}

.pro-resource-card:nth-child(4n+3) {
  background:
    radial-gradient(circle at top right, rgba(34,197,94,0.13), transparent 34%),
    linear-gradient(180deg,#ffffff 0%,#f8fafc 100%) !important;
}

.pro-resource-card:nth-child(4n+4) {
  background:
    radial-gradient(circle at top right, rgba(249,115,22,0.14), transparent 34%),
    linear-gradient(180deg,#ffffff 0%,#f8fafc 100%) !important;
}

.logo-wrap {
  width: 86px !important;
  height: 86px !important;
  border-radius: 26px !important;
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  display: grid !important;
  place-items: center !important;
  margin-bottom: 20px !important;
  box-shadow: 0 18px 36px rgba(15,23,42,0.10), inset 0 0 0 7px #f8fafc !important;
  transition: 0.25s ease !important;
}

.pro-resource-card:hover .logo-wrap {
  transform: scale(1.08) rotate(-2deg) !important;
}

.logo-wrap img {
  width: 68px !important;
  height: 68px !important;
  object-fit: contain !important;
  border-radius: 15px !important;
}

.pro-resource-card span {
  width: fit-content !important;
  color: #4f46e5 !important;
  background: #eef2ff !important;
  border: 1px solid #dbeafe !important;
  border-radius: 999px !important;
  padding: 7px 11px !important;
  font-size: 12px !important;
  font-weight: 950 !important;
  margin-bottom: 14px !important;
}

.pro-resource-card h3 {
  margin: 0 0 10px !important;
  color: #0f172a !important;
  font-size: clamp(22px,1.8vw,27px) !important;
  line-height: 1.12 !important;
  font-weight: 950 !important;
}

.pro-resource-card p {
  color: #64748b !important;
  font-size: 15px !important;
  line-height: 1.6 !important;
  font-weight: 720 !important;
}

.pro-resource-card b {
  margin-top: auto !important;
  padding-top: 22px !important;
  color: #6d28d9 !important;
  font-size: 15px !important;
  font-weight: 950 !important;
}

.resource-form,
.custom-list {
  display: grid !important;
  grid-template-columns: repeat(2,minmax(0,1fr)) !important;
  gap: 14px !important;
}

.resource-form textarea {
  grid-column: 1 / -1 !important;
}

/* STRICT RESPONSIVE NO CUT */
@media (max-width: 980px) {
  .resource-card-grid,
  .resource-form,
  .custom-list {
    grid-template-columns: 1fr !important;
  }

  .section-title-row {
    flex-direction: column !important;
  }

  .resources-tabs {
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
  }
}

@media (max-width: 680px) {
  .home-page,
  .landing-page,
  .auth-page,
  .login-page,
  .signup-page,
  .dashboard-page,
  .today-page,
  .roadmaps-page,
  .dsa-page,
  .practice-page,
  .resources-page,
  .companies-page,
  .resume-page,
  .interview-page,
  .progress-page,
  [class*="-page"] {
    padding: 14px !important;
  }

  .hero,
  .home-hero,
  .auth-hero,
  .dashboard-hero,
  .page-hero,
  .page-header,
  .section-header,
  .today-header,
  .roadmaps-header,
  .dsa-header,
  .practice-header,
  .resources-hero,
  .resources-header,
  .companies-header,
  .resume-header,
  .interview-header,
  .progress-header,
  [class*="hero"],
  [class*="header"] {
    min-height: 175px !important;
    padding: 28px 22px !important;
    border-radius: 26px !important;
  }

  .hero h1,
  .home-hero h1,
  .auth-hero h1,
  .dashboard-hero h1,
  .page-hero h1,
  .page-header h1,
  .section-header h1,
  .today-header h1,
  .roadmaps-header h1,
  .dsa-header h1,
  .practice-header h1,
  .resources-hero h1,
  .resources-header h1,
  .companies-header h1,
  .resume-header h1,
  .interview-header h1,
  .progress-header h1,
  [class*="hero"] h1,
  [class*="header"] h1 {
    font-size: 34px !important;
  }

  .pro-resource-card {
    min-height: auto !important;
    padding: 24px !important;
    border-radius: 28px !important;
  }

  .logo-wrap {
    width: 76px !important;
    height: 76px !important;
  }

  .logo-wrap img {
    width: 60px !important;
    height: 60px !important;
  }
}
`;

function injectTheme() {
  const old = document.getElementById(STYLE_ID);
  if (old) old.remove();

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = css;
  document.head.appendChild(style);
}

injectTheme();

window.addEventListener("load", () => {
  injectTheme();
  setTimeout(injectTheme, 300);
  setTimeout(injectTheme, 1000);
});
