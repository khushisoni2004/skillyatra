import csv
import json
import re
import zipfile
from collections import Counter
from pathlib import Path

ROOT = Path.cwd()
ZIP_PATH = ROOT / "src/data/datasets/1.3M LinkedIn Jobs & Skills 2024.zip"
OUT_FILE = ROOT / "src/data/companyRoleIndex.json"

TOP_COMPANY_LIMIT = None
MAX_ROLES_PER_COMPANY = 10
MAX_SKILLS = 6
MAX_KEYWORDS = 5
MAX_LOCATIONS = 3
MAX_LINKS = 1
MAX_OVERVIEWS = 1

SKILL_WORDS = [
    "python","java","javascript","typescript","react","node","express","mongodb","mysql","sql",
    "postgresql","html","css","tailwind","aws","azure","gcp","docker","kubernetes","git",
    "github","linux","api","rest","graphql","django","flask","spring","machine learning",
    "deep learning","tensorflow","pytorch","pandas","numpy","scikit-learn","excel","power bi",
    "tableau","spark","hadoop","data analysis","data science","nlp","computer vision","devops",
    "ci/cd","testing","selenium","jira","agile","communication","leadership","problem solving",
    "oop","dsa","dbms","operating system","networking","security"
]

STOPWORDS = {
    "the","and","for","with","you","our","are","will","this","that","from","your","have","has",
    "job","role","work","team","company","experience","skills","ability","candidate","including",
    "using","about","into","their","they","them","than","then","there","where","when","what",
    "who","how","can","may","must","should","responsibilities","requirements","required","preferred",
    "years","linkedin","apply","full","time","part","new"
}

def clean_key(s):
    return re.sub(r"[^a-z0-9]", "", str(s or "").lower())

def norm(s):
    return re.sub(r"\s+", " ", str(s or "").lower()).strip()

def pick(row, names):
    mp = {clean_key(k): k for k in row.keys()}
    for name in names:
        key = clean_key(name)
        if key in mp and str(row.get(mp[key], "")).strip():
            return str(row.get(mp[key], "")).strip()
    return ""

def parse_skills(text):
    if not text:
        return []
    return [
        x.strip()
        for x in re.split(r"[,;|/]", str(text))
        if 2 <= len(x.strip()) <= 45
    ][:60]

def known_skills(text):
    low = norm(text)
    return [s for s in SKILL_WORDS if s in low]

def keywords(text, limit=MAX_KEYWORDS):
    words = re.sub(r"[^a-z0-9+#. ]", " ", str(text or "").lower()).split()
    c = Counter(w for w in words if len(w) >= 3 and w not in STOPWORDS)
    return [w for w, _ in c.most_common(limit)]

def top(counter, limit):
    return [{"name": k, "count": v} for k, v in counter.most_common(limit)]

def open_csv(z, name):
    return csv.DictReader((line.decode("utf-8", errors="ignore") for line in z.open(name)))

def detect_files(z):
    files = [n for n in z.namelist() if n.lower().endswith(".csv")]
    found = {"jobs": None, "skills": None, "summary": None, "columns": []}

    for name in files:
        reader = open_csv(z, name)
        headers = reader.fieldnames or []
        clean = "|".join(clean_key(h) for h in headers)

        ftype = "other"
        if "company" in clean and ("jobtitle" in clean or "title" in clean):
            ftype = "jobs"
            found["jobs"] = name
        elif "jobskills" in clean or "skills" in clean:
            ftype = "skills"
            found["skills"] = name
        elif "jobsummary" in clean or "summary" in clean or "description" in clean:
            ftype = "summary"
            found["summary"] = name

        found["columns"].append({
            "file": name,
            "type": ftype,
            "columns": headers
        })

    return found

def new_company(company):
    return {
        "companyName": company,
        "totalJobCount": 0,
        "roleCounts": Counter(),
        "skillCounts": Counter(),
        "locationCounts": Counter(),
        "roles": {}
    }

def new_role(role):
    return {
        "roleName": role,
        "postCount": 0,
        "skillCounts": Counter(),
        "keywordCounts": Counter(),
        "locationCounts": Counter(),
        "workTypeCounts": Counter(),
        "overview": [],
        "jobLinks": [],
        "dates": []
    }

def main():
    if not ZIP_PATH.exists():
        print("ZIP not found:", ZIP_PATH)
        return

    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(ZIP_PATH) as z:
        detected = detect_files(z)

        print("ZIP found:", ZIP_PATH)
        print("Files inspected:")
        for item in detected["columns"]:
            print("-", item["file"], "|", item["type"], "|", ", ".join(item["columns"]))

        jobs_file = detected["jobs"]
        skills_file = detected["skills"]
        summary_file = detected["summary"]

        if not jobs_file:
            print("No jobs file found.")
            return

        print("\nPass 1: counting companies only...")
        company_counts = Counter()
        total_rows = 0

        for row in open_csv(z, jobs_file):
            company = pick(row, ["company_name", "company", "company name", "employer", "organization"])
            role = pick(row, ["job_title", "title", "job title", "role", "position"])
            if company and role:
                company_counts[company] += 1
                total_rows += 1

        top_companies = set(company_counts.keys()) if TOP_COMPANY_LIMIT is None else {name for name, _ in company_counts.most_common(TOP_COMPANY_LIMIT)}
        print("Total job rows:", total_rows)
        print("Companies kept:", len(top_companies))

        print("\nPass 2: building company + role data...")
        companies = {}
        link_to_role = {}

        for row in open_csv(z, jobs_file):
            company = pick(row, ["company_name", "company", "company name", "employer", "organization"])
            role = pick(row, ["job_title", "title", "job title", "role", "position"])

            if not company or not role or company not in top_companies:
                continue

            if company not in companies:
                companies[company] = new_company(company)

            comp = companies[company]
            comp["totalJobCount"] += 1
            comp["roleCounts"][role] += 1

            if role not in comp["roles"]:
                comp["roles"][role] = new_role(role)

            r = comp["roles"][role]
            r["postCount"] += 1

            link = pick(row, ["job_link", "job_url", "url", "link", "job posting url", "job_id", "id"])
            location = pick(row, ["job_location", "location", "city", "search_city", "search_country", "country"])
            work_type = pick(row, ["job_type", "work_type", "employment_type", "remote", "workplace_type"])
            date = pick(row, ["first_seen", "first seen", "date", "posted_date", "last_processed_time"])
            desc = pick(row, ["job_description", "description", "job_summary", "summary", "details"])

            if location:
                comp["locationCounts"][location] += 1
                r["locationCounts"][location] += 1

            if work_type:
                r["workTypeCounts"][work_type] += 1

            if date and len(r["dates"]) < MAX_OVERVIEWS:
                r["dates"].append(date)

            if link:
                link_to_role[link] = (company, role)
                if len(r["jobLinks"]) < MAX_LINKS:
                    r["jobLinks"].append(link)

            if desc and len(r["overview"]) < MAX_OVERVIEWS:
                r["overview"].append(desc[:450])

            for s in known_skills(role + " " + desc):
                comp["skillCounts"][s] += 1
                r["skillCounts"][s] += 1

            for k in keywords(role + " " + desc):
                r["keywordCounts"][k] += 1

        if skills_file:
            print("\nPass 3: reading skills file...")
            for row in open_csv(z, skills_file):
                link = pick(row, ["job_link", "job_url", "url", "link", "job posting url", "job_id", "id"])
                skill_text = pick(row, ["job_skills", "skills", "skill", "required_skills", "job skills"])

                if not link or link not in link_to_role or not skill_text:
                    continue

                company, role = link_to_role[link]
                comp = companies.get(company)
                r = comp["roles"].get(role) if comp else None
                if not comp or not r:
                    continue

                for s in parse_skills(skill_text):
                    comp["skillCounts"][s] += 1
                    r["skillCounts"][s] += 1

        if summary_file:
            print("\nPass 4: reading summary file...")
            for row in open_csv(z, summary_file):
                link = pick(row, ["job_link", "job_url", "url", "link", "job posting url", "job_id", "id"])
                desc = pick(row, ["job_summary", "summary", "description", "job_description", "details"])

                if not link or link not in link_to_role or not desc:
                    continue

                company, role = link_to_role[link]
                comp = companies.get(company)
                r = comp["roles"].get(role) if comp else None
                if not comp or not r:
                    continue

                if len(r["overview"]) < MAX_OVERVIEWS:
                    r["overview"].append(desc[:450])

                for s in known_skills(desc):
                    comp["skillCounts"][s] += 1
                    r["skillCounts"][s] += 1

                for k in keywords(desc):
                    r["keywordCounts"][k] += 1

        print("\nFinalizing compact index...")

        company_list = []

        for comp in sorted(companies.values(), key=lambda x: x["totalJobCount"], reverse=True):
            roles_out = []

            for r in sorted(comp["roles"].values(), key=lambda x: x["postCount"], reverse=True)[:MAX_ROLES_PER_COMPANY]:
                skills = top(r["skillCounts"], MAX_SKILLS)
                roles_out.append({
                    "roleName": r["roleName"],
                    "postCount": r["postCount"],
                    "topSkills": skills,
                    "commonKeywords": [x["name"] for x in top(r["keywordCounts"], MAX_KEYWORDS)],
                    "locations": [x["name"] for x in top(r["locationCounts"], MAX_LOCATIONS)],
                    "workTypes": [x["name"] for x in top(r["workTypeCounts"], MAX_LOCATIONS)],
                    "overview": r["overview"][:MAX_OVERVIEWS],
                    "jobLinks": r["jobLinks"][:MAX_LINKS],
                    "dates": r["dates"][:MAX_OVERVIEWS],
                    "preparationFocus": [x["name"] for x in skills]
                })

            company_list.append({
                "companyName": comp["companyName"],
                "totalJobCount": comp["totalJobCount"],
                "topRoles": top(comp["roleCounts"], 6),
                "topSkills": top(comp["skillCounts"], 10),
                "locations": [x["name"] for x in top(comp["locationCounts"], MAX_LOCATIONS)],
                "roles": roles_out
            })

        output = {
            "datasetZip": str(ZIP_PATH),
            "totalCompanies": len(company_list),
            "totalJobRows": total_rows,
            "columns": detected["columns"],
            "companies": company_list,
            "disclaimer": "Data is generated from the uploaded public job posting dataset. Students should verify the latest official company career page before applying."
        }

        temp = OUT_FILE.with_suffix(".json.tmp")
        temp.write_text(json.dumps(output, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        temp.replace(OUT_FILE)

        print("\nIndex created:", OUT_FILE)
        print("Total companies:", len(company_list))
        print("Total job rows:", total_rows)
        print("Index size:", round(OUT_FILE.stat().st_size / 1024 / 1024, 2), "MB")
        print("Top companies:")
        for c in company_list[:10]:
            print("-", c["companyName"], c["totalJobCount"])

if __name__ == "__main__":
    main()
