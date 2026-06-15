import csv, json, re, zipfile
from pathlib import Path

ROOT = Path.cwd()
DATASETS = ROOT / "src" / "data" / "datasets"
OUT = ROOT / "src" / "data" / "dsaCodingQuestions.json"

TOPIC_ORDER = [
    "Arrays","Strings","Linked List","Stack","Queue","Trees","Binary Search Tree",
    "Graphs","Dynamic Programming","Greedy","Recursion","Backtracking","Searching",
    "Sorting","Hashing","Heap / Priority Queue","Sliding Window","Two Pointers",
    "Bit Manipulation","Math / Number Theory"
]

PLATFORM_FILES = ["leetcode", "codechef", "codeforces", "gfg", "gfg problem", "geeksforgeeks", "geeks for geeks", "problem statements"]

BAD = [
    "analogy","preposition","grammar","synonym","antonym","aptitude","profit","loss",
    "percentage","kg","grams","jwt","cors","bcrypt","rest api","microservice","react",
    "redux","hook","sap","hana","foreign currency","valuation","machine learning",
    "random forest","k means","json.dumps","json.loads","git status","cloud region"
]

def low(x): return str(x or "").lower()

def title_clean(x):
    s = str(x or "").strip()
    s = re.sub(r"^problem\s*\d+\s*:\s*", "", s, flags=re.I)
    s = re.sub(r"[_]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s.title()

def slugify(x):
    s = low(x)
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    s = re.sub(r"\s+", "-", s)
    return re.sub(r"-+", "-", s).strip("-")

def pick(row, names):
    if not isinstance(row, dict): return ""
    keys = list(row.keys())
    for n in names:
        for k in keys:
            if low(k).strip() == low(n).strip() and row.get(k):
                return str(row.get(k))
    for n in names:
        for k in keys:
            if low(n).strip() in low(k).strip() and row.get(k):
                return str(row.get(k))
    return ""

def read_csv(text):
    try:
        return [dict(r) for r in csv.DictReader(text.splitlines())]
    except Exception:
        return []

def read_json(text):
    try:
        data = json.loads(text)
        if isinstance(data, list): return data
        if isinstance(data, dict):
            for k in ["data","questions","rows","problems","items","results"]:
                if isinstance(data.get(k), list): return data[k]
    except Exception:
        pass
    return []

def read_file(path):
    rows = []
    if path.suffix.lower() == ".zip":
        try:
            with zipfile.ZipFile(path) as z:
                for m in z.namelist():
                    ml = m.lower()
                    if not (ml.endswith(".csv") or ml.endswith(".json")):
                        continue
                    text = z.read(m).decode("utf-8", errors="ignore")
                    part = read_csv(text) if ml.endswith(".csv") else read_json(text)
                    for r in part:
                        if isinstance(r, dict):
                            r["_source_file"] = path.name
                            r["_inner_file"] = m
                            rows.append(r)
        except Exception as e:
            print("ZIP read failed:", path.name, e)
        return rows

    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
        part = read_csv(text) if path.suffix.lower() == ".csv" else read_json(text)
        for r in part:
            if isinstance(r, dict):
                r["_source_file"] = path.name
                rows.append(r)
    except Exception as e:
        print("Read failed:", path.name, e)
    return rows

def platform_from_file(path, row, title):
    raw = " ".join([
        path.name, pick(row, ["platform","site","source","judge"]),
        pick(row, ["url","link","problem_link","problem url","question link"]),
        title
    ]).lower()
    if "leetcode" in raw: return "LeetCode"
    if "codechef" in raw or "code chef" in raw: return "CodeChef"
    if "codeforces" in raw or "code forces" in raw: return "Codeforces"
    if "gfg" in raw or "geeksforgeeks" in raw or "geeks for geeks" in raw: return "GeeksforGeeks"
    return "GeeksforGeeks"

def difficulty(row, i):
    raw = low(pick(row, ["difficulty","level","difficulty_level"]))
    if "easy" in raw: return "Easy"
    if "hard" in raw: return "Hard"
    if "medium" in raw: return "Medium"
    return ["Easy","Medium","Medium","Hard"][i % 4]

def topic(row, title):
    raw = " " + re.sub(r"[-_/]+", " ", " ".join([
        title,
        pick(row, ["topic","topics","tag","tags","category","subtopic","pattern"]),
        pick(row, ["url","link","problem_link"])
    ]).lower()) + " "

    checks = [
        ("Sliding Window", ["sliding window","minimum window","longest substring","window maximum"]),
        ("Two Pointers", ["two pointer","two pointers","3sum","three sum","4sum","container with most water"]),
        ("Linked List", ["linked list","listnode","list node","reverse list","merge list","cycle in linked"]),
        ("Binary Search Tree", ["binary search tree","bst"]),
        ("Trees", ["binary tree","tree","traversal","inorder","preorder","postorder","level order","diameter"]),
        ("Heap / Priority Queue", ["heap","priority queue","top k","kth largest","kth smallest"]),
        ("Dynamic Programming", ["dynamic programming"," dp ","memoization","tabulation","knapsack","coin change","lis","lcs","edit distance","house robber","climbing stairs"]),
        ("Graphs", ["graph","bfs","dfs","dijkstra","bellman","floyd","topological","island","course schedule","union find"]),
        ("Backtracking", ["backtracking","n queen","n-queen","sudoku","rat in a maze","word search","combination sum","permutation","subsets"]),
        ("Recursion", ["recursion","recursive","tower of hanoi"]),
        ("Greedy", ["greedy","activity selection","job sequencing","jump game","gas station","candy"]),
        ("Searching", ["binary search","search insert","rotated sorted","peak element","first and last"]),
        ("Sorting", ["sort","sorting","merge sort","quick sort","count inversions","merge intervals"]),
        ("Hashing", ["hash","hashmap","hash map","duplicate","anagram","two sum"]),
        ("Stack", ["stack","parentheses","bracket","next greater","histogram","min stack"]),
        ("Queue", ["queue","deque","circular queue","rotten oranges"]),
        ("Strings", ["string","substring","palindrome","anagram","prefix","suffix","roman"]),
        ("Bit Manipulation", ["bit","xor","single number","power of two"]),
        ("Math / Number Theory", ["math","prime","gcd","lcm","sieve","factorial"]),
        ("Arrays", ["array","subarray","matrix","two sum","maximum subarray","rotate array","missing number"])
    ]
    for t, words in checks:
        if any(w in raw for w in words):
            return t
    return "Arrays"

def direct_url(row, title, plat):
    direct = pick(row, ["url","URL","link","Link","problem_link","problem_url","Problem Link","question link","Question Link","Problem URL"])
    if direct.startswith("http"):
        return direct

    code = pick(row, ["code","problem_code","problem code","contest_code","slug","titleSlug","title_slug","problem_slug"]).strip()
    contest = pick(row, ["contestId","contest_id","contest"]).strip()
    idx = pick(row, ["index","problemIndex","problem_index"]).strip()
    s = slugify(code or title)

    if plat == "LeetCode":
        return f"https://leetcode.com/problems/{s}/"
    if plat == "CodeChef":
        if code and " " not in code and len(code) <= 40:
            return f"https://www.codechef.com/problems/{code.upper()}"
        return f"https://www.codechef.com/practice?search={slugify(title)}"
    if plat == "Codeforces":
        if contest and idx:
            return f"https://codeforces.com/problemset/problem/{contest}/{idx}"
        return f"https://codeforces.com/problemset?search={title.replace(' ', '+')}"
    if plat == "GeeksforGeeks":
        return f"https://www.geeksforgeeks.org/search/{title.replace(' ', '%20')}/"
    return f"https://www.google.com/search?q={title.replace(' ', '+')}+DSA+problem"

def acceptable_title(title, row, source):
    raw = low(title + " " + json.dumps(row, ensure_ascii=False) + " " + source)
    if any(b in raw for b in BAD):
        return False
    if len(title) < 3:
        return False
    # Platform datasets are already coding datasets; keep broad but remove obvious theory prompts.
    if low(title).startswith(("what is ", "what are ", "explain ", "describe ", "discuss ", "define ", "choose ")):
        known = ["two sum","valid parentheses","coin change","merge intervals","number of islands"]
        return any(k in raw for k in known)
    return True

files = []
for base in [DATASETS, ROOT/"src"/"data", ROOT/"data"]:
    if base.exists():
        for p in base.rglob("*"):
            if p.is_file() and p.suffix.lower() in [".zip",".csv",".json"]:
                n = p.name.lower()
                if any(x in n for x in PLATFORM_FILES):
                    files.append(p)

files = sorted(set(files))
seen = set()
out = []

print("Used files:")
for f in files:
    print("-", f.name)

for file in files:
    rows = read_file(file)
    print(f"Rows from {file.name}: {len(rows)}")

    for i, row in enumerate(rows):
        raw_title = pick(row, [
            "title","Title","problem","problem_name","problem name","Problem Name",
            "problem_title","Problem Title","question_title","question","Question",
            "name","Name","titleSlug","title_slug","slug","problem_name","Problem Name","problem_title","Problem Title","problemName","problemTitle"
        ])

        title = title_clean(raw_title)
        if not acceptable_title(title, row, file.name):
            continue

        plat = platform_from_file(file, row, title)
        top = topic(row, title)
        diff = difficulty(row, i)
        url = direct_url(row, title, plat)

        key = f"{title}|{plat}|{top}".lower()
        if key in seen:
            continue
        seen.add(key)

        out.append({
            "id": f"dsa-{len(out)+1}",
            "title": title,
            "topic": top,
            "platform": plat,
            "difficulty": diff,
            "url": url,
            "sourceDataset": file.name
        })

topic_index = {t:i for i,t in enumerate(TOPIC_ORDER)}
diff_index = {"Easy":1,"Medium":2,"Hard":3}

out.sort(key=lambda x: (
    topic_index.get(x["topic"], 999),
    x["platform"],
    diff_index.get(x["difficulty"], 2),
    x["title"]
))

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(out, indent=2), encoding="utf-8")

print(f"DSA coding bank created: {len(out)} questions")
print(f"Saved to: {OUT}")
