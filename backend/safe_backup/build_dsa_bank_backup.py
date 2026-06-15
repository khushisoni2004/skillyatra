import csv
import json
import re
import zipfile
from pathlib import Path

ROOT = Path.cwd()
DATASETS = ROOT / "src" / "data" / "datasets"
OUT = ROOT / "src" / "data" / "dsaCodingQuestions.json"

TOPIC_ORDER = [
    "Arrays",
    "Strings",
    "Linked List",
    "Stack",
    "Queue",
    "Trees",
    "Binary Search Tree",
    "Graphs",
    "Dynamic Programming",
    "Greedy",
    "Recursion",
    "Backtracking",
    "Searching",
    "Sorting",
    "Hashing",
    "Heap / Priority Queue",
    "Sliding Window",
    "Two Pointers",
    "Bit Manipulation",
    "Math / Number Theory"
]

PLATFORM_DATASETS = [
    "leetcode",
    "leet code",
    "codechef",
    "code chef",
    "codeforces",
    "code forces",
    "gfg",
    "geeksforgeeks",
    "geeks for geeks"
]

BLOCKED_DATASETS = [
    "prepmaster",
    "placement",
    "hr",
    "job market",
    "theory",
    "qa dataset",
    "aptitude",
    "interview questions hr",
    "computer science theory"
]

BAD_QUESTION_WORDS = [
    "complete the analogy",
    "analogy",
    "preposition",
    "grammar",
    "synonym",
    "antonym",
    "aptitude",
    "profit",
    "loss",
    "percentage",
    "probability",
    "people sit",
    "sit in a row",
    "coin is tossed",
    "committee",
    "kg",
    "grams",
    "json.dumps",
    "json.loads",
    "os.path",
    "git status",
    "git diff",
    "git checkout",
    "cloud region",
    "google cloud",
    "new relic",
    "tls",
    "cdn",
    "random forest",
    "k means",
    "knn algorithm",
    "machine learning",
    "classifier",
    "regression",
    "backend",
    "jwt",
    "cors",
    "bcrypt",
    "rest api",
    "microservice",
    "authentication",
    "authorization",
    "react",
    "redux",
    "usestate",
    "useeffect",
    "hook",
    "sap",
    "hana",
    "billing",
    "valuation",
    "foreign currency",
    "database challenge",
    "oop concepts challenge",
    "sql injection",
    "solid principles",
    "blockchain",
    "compiler for a new programming language",
    "quantum algorithm",
    "ai that can play",
    "messaging system"
]

CODING_SIGNALS = [
    "array",
    "string",
    "linked list",
    "stack",
    "queue",
    "tree",
    "binary tree",
    "bst",
    "graph",
    "heap",
    "priority queue",
    "greedy",
    "recursion",
    "backtracking",
    "dynamic programming",
    "binary search",
    "sorting",
    "searching",
    "hashing",
    "sliding window",
    "two pointer",
    "bit manipulation",
    "two sum",
    "maximum subarray",
    "minimum jumps",
    "minimize the heights",
    "count inversions",
    "kth largest",
    "merge intervals",
    "valid parentheses",
    "next greater",
    "largest rectangle",
    "rotate array",
    "missing number",
    "majority element",
    "product of array",
    "palindrome",
    "anagram",
    "substring",
    "reverse linked",
    "detect loop",
    "merge two sorted",
    "remove nth",
    "bfs",
    "dfs",
    "dijkstra",
    "number of islands",
    "coin change",
    "knapsack",
    "longest common subsequence",
    "longest increasing subsequence",
    "climbing stairs",
    "house robber",
    "edit distance",
    "jump game",
    "activity selection",
    "job sequencing",
    "n queens",
    "n-queens",
    "sudoku",
    "rat in a maze",
    "subsets",
    "permutations",
    "combination sum",
    "quick sort",
    "merge sort",
    "trie",
    "xor",
    "prime",
    "gcd",
    "lcm"
]

def lower(x):
    return str(x or "").lower()

def clean_title(value):
    s = str(value or "").strip()
    s = re.sub(r"^problem\s*\d+\s*:\s*", "", s, flags=re.I)
    s = re.sub(r"[_]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    s = re.sub(r"^solve\s+(an?|the)?\s*", "", s, flags=re.I)
    s = re.sub(r"\s+problem$", "", s, flags=re.I)
    return s.title()

def slugify(value):
    s = lower(value)
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    s = re.sub(r"\s+", "-", s)
    s = re.sub(r"-+", "-", s)
    return s.strip("-")

def pick(row, names):
    keys = list(row.keys())

    for name in names:
        for key in keys:
            if key.lower().strip() == name.lower().strip():
                val = row.get(key)
                if val not in [None, ""]:
                    return str(val)

    for name in names:
        for key in keys:
            if name.lower().strip() in key.lower().strip():
                val = row.get(key)
                if val not in [None, ""]:
                    return str(val)

    return ""

def read_csv_text(text):
    try:
        return [dict(r) for r in csv.DictReader(text.splitlines())]
    except Exception:
        return []

def read_json_text(text):
    try:
        data = json.loads(text)
        if isinstance(data, list):
            return data
        if isinstance(data, dict):
            for key in ["data", "questions", "rows", "problems", "items", "results"]:
                if isinstance(data.get(key), list):
                    return data[key]
    except Exception:
        return []
    return []

def read_dataset(path):
    rows = []

    if path.suffix.lower() == ".zip":
        try:
            with zipfile.ZipFile(path, "r") as z:
                for member in z.namelist():
                    ml = member.lower()
                    if not (ml.endswith(".csv") or ml.endswith(".json")):
                        continue

                    text = z.read(member).decode("utf-8", errors="ignore")
                    part = read_csv_text(text) if ml.endswith(".csv") else read_json_text(text)

                    for row in part:
                        if isinstance(row, dict):
                            row["_source_file"] = path.name
                            row["_inner_file"] = member
                            rows.append(row)
        except Exception:
            pass

        return rows

    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
        rows = read_csv_text(text) if path.suffix.lower() == ".csv" else read_json_text(text)
        for row in rows:
            if isinstance(row, dict):
                row["_source_file"] = path.name
        return [r for r in rows if isinstance(r, dict)]
    except Exception:
        return []

def allowed_dataset(path):
    name = path.name.lower()
    if any(x in name for x in BLOCKED_DATASETS):
        return False
    return any(x in name for x in PLATFORM_DATASETS)

def detect_platform(row, title):
    raw = " ".join([
        pick(row, ["platform", "site", "source", "judge", "company"]),
        pick(row, ["url", "link", "problem_link", "problem url", "question link"]),
        row.get("_source_file", ""),
        row.get("_inner_file", ""),
        title
    ]).lower()

    if "leetcode" in raw:
        return "LeetCode"
    if "codechef" in raw or "code chef" in raw:
        return "CodeChef"
    if "codeforces" in raw or "code forces" in raw:
        return "Codeforces"
    if "geeksforgeeks" in raw or "gfg" in raw:
        return "GeeksforGeeks"
    if "hackerrank" in raw:
        return "HackerRank"
    if "interviewbit" in raw:
        return "InterviewBit"

    src = lower(row.get("_source_file", ""))
    if "leetcode" in src:
        return "LeetCode"
    if "codechef" in src:
        return "CodeChef"
    if "codeforces" in src:
        return "Codeforces"
    if "gfg" in src or "geeksforgeeks" in src:
        return "GeeksforGeeks"

    return "GeeksforGeeks"

def detect_difficulty(row, idx):
    raw = " ".join([
        pick(row, ["difficulty", "level", "difficulty_level", "Difficulty"]),
        pick(row, ["tags", "topic", "category"])
    ]).lower()

    if "easy" in raw:
        return "Easy"
    if "hard" in raw:
        return "Hard"
    if "medium" in raw:
        return "Medium"

    return ["Easy", "Medium", "Medium", "Hard"][idx % 4]

def detect_topic(row, title):
    raw = " ".join([
        title,
        pick(row, ["topic", "topics", "tag", "tags", "category", "subtopic", "pattern"]),
        pick(row, ["url", "link", "problem_link", "problem url"])
    ]).lower()

    padded = " " + re.sub(r"[-_/]+", " ", raw) + " "

    checks = [
        ("Sliding Window", ["sliding window", "minimum window", "longest substring", "window maximum", "subarray with"]),
        ("Two Pointers", ["two pointer", "two pointers", "3sum", "three sum", "4sum", "container with most water"]),
        ("Linked List", ["linked list", "listnode", "list node", "reverse list", "merge list", "cycle in linked"]),
        ("Binary Search Tree", ["binary search tree", "bst", "kth smallest in bst"]),
        ("Trees", ["binary tree", "tree", "traversal", "inorder", "preorder", "postorder", "level order", "diameter"]),
        ("Heap / Priority Queue", ["heap", "priority queue", "top k", "kth largest", "kth smallest", "merge k"]),
        ("Dynamic Programming", ["dynamic programming", " dp ", "memoization", "tabulation", "knapsack", "coin change", "lis", "lcs", "edit distance", "house robber", "climbing stairs"]),
        ("Graphs", ["graph", "bfs", "dfs", "dijkstra", "bellman", "floyd", "topological", "island", "course schedule", "union find"]),
        ("Backtracking", ["backtracking", "n queen", "n-queen", "sudoku", "rat in a maze", "word search", "combination sum", "permutation", "subsets"]),
        ("Recursion", ["recursion", "recursive", "tower of hanoi"]),
        ("Greedy", ["greedy", "activity selection", "job sequencing", "jump game", "gas station", "candy", "fractional knapsack"]),
        ("Searching", ["binary search", "search insert", "rotated sorted", "peak element", "first and last"]),
        ("Sorting", ["sort", "sorting", "merge sort", "quick sort", "count inversions", "merge intervals"]),
        ("Hashing", ["hash", "hashmap", "hash map", "duplicate", "anagram", "two sum"]),
        ("Stack", ["stack", "parentheses", "bracket", "next greater", "histogram", "min stack"]),
        ("Queue", ["queue", "deque", "circular queue", "rotten oranges"]),
        ("Strings", ["string", "substring", "palindrome", "anagram", "prefix", "suffix", "roman"]),
        ("Bit Manipulation", ["bit", "xor", "single number", "power of two"]),
        ("Math / Number Theory", ["math", "prime", "gcd", "lcm", "sieve", "factorial", "number theory"]),
        ("Arrays", ["array", "subarray", "matrix", "two sum", "maximum subarray", "rotate array", "missing number"])
    ]

    for top, words in checks:
        if any(w in padded for w in words):
            return top

    return "Arrays"

def is_coding_question(row, title):
    raw = " ".join([
        title,
        json.dumps(row, ensure_ascii=False),
        row.get("_source_file", ""),
        row.get("_inner_file", "")
    ]).lower()

    if any(bad in raw for bad in BAD_QUESTION_WORDS):
        allow = ["valid parentheses", "two sum", "coin change", "merge intervals", "number of islands"]
        return any(x in raw for x in allow)

    if title.lower().startswith(("what is", "what are", "explain", "describe", "discuss", "define", "choose", "complete")):
        allow = ["valid parentheses", "two sum", "coin change", "merge intervals", "number of islands"]
        return any(x in raw for x in allow)

    return any(sig in raw for sig in CODING_SIGNALS)

def direct_url(row, title, plat):
    direct = pick(row, ["url", "link", "problem_link", "problem url", "question link"])
    if direct.startswith("http"):
        return direct

    code = pick(row, [
        "code", "problem_code", "problem code", "contest_code",
        "slug", "titleSlug", "title_slug", "problem_slug"
    ]).strip()

    contest = pick(row, ["contestId", "contest_id", "contest", "contest_id"]).strip()
    index = pick(row, ["index", "problemIndex", "problem_index"]).strip()

    title_slug = slugify(title)

    if plat == "LeetCode":
        if code:
            return f"https://leetcode.com/problems/{slugify(code)}/"
        return f"https://leetcode.com/problems/{title_slug}/"

    if plat == "CodeChef":
        if code and len(code) <= 40 and " " not in code:
            return f"https://www.codechef.com/problems/{code.upper()}"
        return f"https://www.codechef.com/practice?search={title_slug}"

    if plat == "Codeforces":
        if contest and index:
            return f"https://codeforces.com/problemset/problem/{contest}/{index}"
        if code:
            return f"https://codeforces.com/problemset?search={code}"
        return f"https://codeforces.com/problemset?search={title.replace(' ', '+')}"

    if plat == "GeeksforGeeks":
        return f"https://www.geeksforgeeks.org/problems/{title_slug}/1"

    if plat == "HackerRank":
        return f"https://www.hackerrank.com/search?term={title.replace(' ', '%20')}"

    if plat == "InterviewBit":
        return f"https://www.interviewbit.com/search/?q={title.replace(' ', '%20')}"

    return f"https://www.geeksforgeeks.org/problems/{title_slug}/1"

files = []
for base in [DATASETS, ROOT / "src" / "data", ROOT / "data"]:
    if base.exists():
        for p in base.rglob("*"):
            if p.is_file() and p.suffix.lower() in [".zip", ".csv", ".json"] and allowed_dataset(p):
                files.append(p)

files = sorted(set(files))
seen = set()
out = []

for file in files:
    rows = read_dataset(file)

    for idx, row in enumerate(rows):
        raw_title = pick(row, [
            "title", "Title", "problem", "problem_name", "problem name",
            "question_title", "question", "Question", "name", "Name",
            "titleSlug", "title_slug", "slug"
        ])

        title = clean_title(raw_title)

        if not title or len(title) < 3:
            continue

        if not is_coding_question(row, title):
            continue

        plat = detect_platform(row, title)
        top = detect_topic(row, title)
        diff = detect_difficulty(row, idx)
        url = direct_url(row, title, plat)

        key = f"{title}|{plat}|{top}".lower()
        if key in seen:
            continue
        seen.add(key)

        out.append({
            "id": f"dsa-{len(out) + 1}",
            "title": title,
            "topic": top,
            "platform": plat,
            "difficulty": diff,
            "url": url,
            "sourceDataset": row.get("_source_file", file.name)
        })

topic_index = {t: i for i, t in enumerate(TOPIC_ORDER)}
diff_index = {"Easy": 1, "Medium": 2, "Hard": 3}

out.sort(key=lambda x: (
    topic_index.get(x["topic"], 999),
    x["platform"],
    diff_index.get(x["difficulty"], 2),
    x["title"]
))

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(out, indent=2), encoding="utf-8")

print("Used files:")
for f in files:
    print("-", f.name)

print(f"DSA coding bank created: {len(out)} questions")
print(f"Saved to: {OUT}")
