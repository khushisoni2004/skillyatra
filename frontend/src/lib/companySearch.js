const CACHE_KEYS = [
  "skillyatra_companies_cache_v7",
  "skillyatra_companies_cache_v6",
  "skillyatra_companies_cache_v5",
  "skillyatra_companies_cache_v2",
  "skillyatra_interview_companies_cache_v3",
  "skillyatra_interview_companies_cache_v7",
  "skillyatra_resume_companies_cache_v3"
];

export const EXTRA_COMPANIES = [
  { companyName: "Google", totalJobCount: 75 },
  { companyName: "Amazon", totalJobCount: 248 },
  { companyName: "Microsoft", totalJobCount: 80 },
  { companyName: "Infosys", totalJobCount: 120 },
  { companyName: "TCS", totalJobCount: 150 },
  { companyName: "Wipro", totalJobCount: 110 },
  { companyName: "Accenture", totalJobCount: 130 },
  { companyName: "Capgemini", totalJobCount: 95 },
  { companyName: "Cognizant", totalJobCount: 100 },
  { companyName: "IBM", totalJobCount: 90 },
  { companyName: "Flipkart", totalJobCount: 60 },
  { companyName: "Deloitte", totalJobCount: 85 },
  { companyName: "HCL", totalJobCount: 70 },
  { companyName: "Tech Mahindra", totalJobCount: 75 },
  { companyName: "LTIMindtree", totalJobCount: 65 },
  { companyName: "Mastercard", totalJobCount: 40 },
  { companyName: "Oracle", totalJobCount: 55 },
  { companyName: "Adobe", totalJobCount: 45 },
  { companyName: "Paytm", totalJobCount: 35 },
  { companyName: "PhonePe", totalJobCount: 38 },
  { companyName: "Zomato", totalJobCount: 34 },
  { companyName: "Swiggy", totalJobCount: 32 },
  { companyName: "Reliance Jio", totalJobCount: 45 },
  { companyName: "JPMorgan Chase", totalJobCount: 40 },
  { companyName: "Goldman Sachs", totalJobCount: 35 },
  { companyName: "Morgan Stanley", totalJobCount: 30 },
  { companyName: "EY", totalJobCount: 55 },
  { companyName: "KPMG", totalJobCount: 45 },
  { companyName: "PwC", totalJobCount: 50 }
];

const ALIASES = {
  ibm: ["international business machines", "ibm india"],
  flipkart: ["flip kart", "flipkart internet"],
  deloitte: ["deloitte usi", "deloitte india", "deloitte consulting", "deloitree", "deloitee", "deloittee"],
  tcs: ["tata consultancy services", "tata consultancy service"],
  capgemini: ["cap gemini"],
  cognizant: ["cts", "cognizant technology solutions"],
  hcl: ["hcltech", "hcl technologies"],
  techmahindra: ["tech mahindra"],
  ltimindtree: ["lti", "mindtree", "lti mindtree"],
  mastercard: ["master card"],
  phonepe: ["phone pe"],
  ey: ["ernst young", "ernst and young"],
  pwc: ["pricewaterhousecoopers", "price waterhouse coopers"],
  jpmorganchase: ["jp morgan", "jpmorgan", "jp morgan chase"]
};

export function normalizeCompanyName(value = "") {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function aliasesFor(name = "") {
  return ALIASES[normalizeCompanyName(name)] || [];
}

export function uniqueCompanyList(list = []) {
  const map = new Map();

  list.forEach((item) => {
    if (!item?.companyName) return;

    const key = normalizeCompanyName(item.companyName);
    const old = map.get(key);

    if (!old) {
      map.set(key, item);
    } else {
      map.set(key, {
        ...old,
        ...item,
        roles: Array.isArray(item.roles) && item.roles.length ? item.roles : old.roles,
        totalJobCount:
          Number(item.totalJobCount || 0) > Number(old.totalJobCount || 0)
            ? item.totalJobCount
            : old.totalJobCount
      });
    }
  });

  return Array.from(map.values()).sort((a, b) =>
    String(a.companyName || "").localeCompare(String(b.companyName || ""))
  );
}

export function getAllCompanyPool() {
  const all = [...EXTRA_COMPANIES];

  try {
    CACHE_KEYS.forEach((key) => {
      const raw = sessionStorage.getItem(key);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      const list =
        parsed?.companies ||
        parsed?.data?.companies ||
        parsed?.data?.data?.companies ||
        [];

      if (Array.isArray(list)) all.push(...list);
    });
  } catch {}

  return uniqueCompanyList(all);
}

export function saveCompanyPoolToCache(companies = []) {
  const finalList = uniqueCompanyList(companies);

  try {
    sessionStorage.setItem(
      "skillyatra_companies_cache_v7",
      JSON.stringify({
        time: Date.now(),
        data: {
          companies: finalList,
          totalCompanies: finalList.length,
          totalJobRows: 0
        }
      })
    );

    sessionStorage.setItem(
      "skillyatra_interview_companies_cache_v7",
      JSON.stringify({
        time: Date.now(),
        companies: finalList
      })
    );

    sessionStorage.setItem(
      "skillyatra_resume_companies_cache_v3",
      JSON.stringify({
        time: Date.now(),
        companies: finalList
      })
    );
  } catch {}

  return finalList;
}

export function mergeCompanyLists(oldList = [], newList = []) {
  return saveCompanyPoolToCache([...(oldList || []), ...(newList || []), ...EXTRA_COMPANIES]);
}

function typoScore(a = "", b = "") {
  const q = normalizeCompanyName(a);
  const name = normalizeCompanyName(b);

  if (!q || !name) return 0;

  let same = 0;
  const min = Math.min(q.length, name.length);

  for (let i = 0; i < min; i += 1) {
    if (q[i] === name[i]) same += 1;
  }

  return same / Math.max(q.length, name.length);
}

function companyScore(company, query) {
  const q = normalizeCompanyName(query);
  if (!q) return 0;

  const name = normalizeCompanyName(company?.companyName || "");
  const all = [name, ...aliasesFor(company?.companyName || "").map(normalizeCompanyName)].filter(Boolean);

  if (all.some((x) => x === q)) return 100;
  if (all.some((x) => x.startsWith(q))) return 95;
  if (all.some((x) => x.includes(q))) return 88;

  let best = 0;
  all.forEach((x) => {
    const score = typoScore(q, x);
    if (score >= 0.54) best = Math.max(best, Math.round(score * 75));
  });

  return best;
}

export function rankCompanies(companies = [], query = "", limit = 300) {
  const q = String(query || "").trim();
  const base = uniqueCompanyList([...(companies || []), ...getAllCompanyPool()]);

  if (!q) return base.slice(0, limit);

  return base
    .map((company) => ({
      company,
      score: companyScore(company, q)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return String(a.company.companyName || "").localeCompare(String(b.company.companyName || ""));
    })
    .map((item) => item.company)
    .slice(0, limit);
}

export function fallbackRolesForCompany(companyName = "Company") {
  return [
    {
      roleName: "Software Engineer",
      jobCount: 4,
      expectedPackage: "Not disclosed",
      expectedExperience: "Freshers / Entry Level",
      skills: ["DSA", "Java", "Python", "SQL"]
    },
    {
      roleName: "Associate Software Engineer",
      jobCount: 3,
      expectedPackage: "Not disclosed",
      expectedExperience: "0-2 years",
      skills: ["Programming", "OOPs", "DBMS", "Aptitude"]
    },
    {
      roleName: "Data Analyst",
      jobCount: 3,
      expectedPackage: "Not disclosed",
      expectedExperience: "Freshers",
      skills: ["Excel", "SQL", "Python", "Data Analysis"]
    },
    {
      roleName: `${companyName} Interview Preparation`,
      jobCount: 1,
      expectedPackage: "Not disclosed",
      expectedExperience: "Role based",
      skills: ["Projects", "HR Questions", "Communication"]
    }
  ];
}
