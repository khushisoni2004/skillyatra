import csv, json, re, zipfile
from pathlib import Path

ROOT = Path.cwd()
GFG_ZIP = ROOT / "src" / "data" / "datasets" / "GFG Problem Statements Dataset.zip"
BANK = ROOT / "src" / "data" / "dsaCodingQuestions.json"

TOPICS = [
    "Arrays","Strings","Linked List","Stack","Queue","Trees","Binary Search Tree",
    "Graphs","Dynamic Programming","Greedy","Recursion","Backtracking","Searching",
    "Sorting","Hashing","Heap / Priority Queue","Sliding Window","Two Pointers",
    "Bit Manipulation","Math / Number Theory"
]

BAD = [
    "analogy","preposition","grammar","synonym","antonym","aptitude",
    "profit","loss","percentage","jwt","cors","bcrypt","rest api",
    "react","redux","sap","hana","machine learning","random forest",
    "json.dumps","json.loads","git status","cloud region"
]

def low(x):
    return str(x or "").lower()

def clean_title(x):
    s = str(x or "").strip()
    s = re.sub(r"^problem\s*\d+\s*:\s*", "", s, flags=re.I)
    s = re.sub(r"[_\-]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s.title()

def slugify(x):
    s = low(x)
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    s = re.sub(r"\s+", "-", s)
    s = re.sub(r"-+", "-", s)
    return s.strip("-")

def pick(row, names):
    keys = list(row.keys())
    for name in names:
        for k in keys:
            if k.lower().strip() == name.lower().strip() and row.get(k):
                return str(row.get(k))
    for name in names:
        for k in keys:
            if name.lower().strip() in k.lower().strip() and row.get(k):
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
        if isinstance(data, list):
            return data
        if isinstance(data, dict):
            for k in ["data","questions","rows","problems","items","results"]:
                if isinstance(data.get(k), list):
                    return data[k]
    except Exception:
        pass
    return []

def read_gfg_zip():
    rows = []
    with zipfile.ZipFile(GFG_ZIP, "r") as z:
        print("GFG inner files:")
        for m in z.namelist():
            ml = m.lower()
            if not (ml.endswith(".csv") or ml.endswith(".json")):
                continue
            print("-", m)
            text = z.read(m).decode("utf-8", errors="ignore")
            part = read_csv(text) if ml.endswith(".csv") else read_json(text)
            for r in part:
                if isinstance(r, dict):
                    r["_source_file"] = GFG_ZIP.name
                    r["_inner_file"] = m
                    rows.append(r)
    return rows

def topic(title, row):
    raw = " " + re.sub(r"[-_/]+", " ", " ".join([
        title,
        pick(row, ["topic","topics","tag","tags","category","subtopic","pattern"]),
        pick(row, ["url","link","problem_link","problem_url"])
    ]).lower()) + " "

    checks = [
        ("Sliding Window", ["sliding window","minimum window","longest substring","window maximum"]),
        ("Two Pointers", ["two pointer","two pointers","3sum","three sum","4sum","container with most water"]),
        ("Linked List", ["linked list","listnode","list node","reverse list","merge list","cycle in linked"]),
        ("Binary Search Tree", ["binary search tree","bst"]),
        ("Trees", ["binary tree","tree","traversal","inorder","preorder","postorder","level order","diameter"]),
        ("Heap / Priority Queue", ["heap","priority queue","top k","kth largest","kth smallest"]),
        ("Dynamic Programming", ["dynamic programming"," dp ","knapsack","coin change","lis","lcs","edit distance","house robber","climbing stairs"]),
        ("Graphs", ["graph","bfs","dfs","dijkstra","topological","island","course schedule","union find"]),
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

def difficulty(row, i):
    raw = low(pick(row, ["difficulty","level","difficulty_level"]))
    if "easy" in raw:
        return "Easy"
    if "hard" in raw:
        return "Hard"
    if "medium" in raw:
        return "Medium"
    return ["Easy","Medium","Medium","Hard"][i % 4]

def is_valid(title, row):
    raw = low(title + " " + json.dumps(row, ensure_ascii=False))
    if any(b in raw for b in BAD):
        return False
    if not title or len(title) < 3:
        return False
    return True

def gfg_url(row, title):
    direct = pick(row, ["url","URL","link","Link","problem_link","problem_url","Problem Link","Question Link","question link"])
    if direct.startswith("http"):
        return direct
    return f"https://www.geeksforgeeks.org/problems/{slugify(title)}/1"

if not GFG_ZIP.exists():
    print("GFG zip not found:", GFG_ZIP)
    raise SystemExit(1)

bank = []
if BANK.exists():
    try:
        bank = json.loads(BANK.read_text(encoding="utf-8"))
        if not isinstance(bank, list):
            bank = []
    except Exception:
        bank = []

rows = read_gfg_zip()
print("GFG rows read:", len(rows))

seen = set(f"{q.get('title','')}|{q.get('platform','')}|{q.get('topic','')}".lower() for q in bank)
added = 0

for i, row in enumerate(rows):
    raw_title = pick(row, [
        "title","Title","problem","problem_name","problem name","Problem Name",
        "problem_title","Problem Title","question_title","question","Question",
        "name","Name","titleSlug","title_slug","slug"
    ])

    title = clean_title(raw_title)
    if not is_valid(title, row):
        continue

    item = {
        "id": f"dsa-{len(bank)+1}",
        "title": title,
        "topic": topic(title, row),
        "platform": "GeeksforGeeks",
        "difficulty": difficulty(row, i),
        "url": gfg_url(row, title),
        "sourceDataset": GFG_ZIP.name
    }

    key = f"{item['title']}|{item['platform']}|{item['topic']}".lower()
    if key in seen:
        continue

    seen.add(key)
    bank.append(item)
    added += 1

topic_index = {t:i for i,t in enumerate(TOPICS)}
diff_index = {"Easy":1,"Medium":2,"Hard":3}

bank.sort(key=lambda x: (
    topic_index.get(x.get("topic"), 999),
    x.get("platform",""),
    diff_index.get(x.get("difficulty"), 2),
    x.get("title","")
))

BANK.write_text(json.dumps(bank, indent=2), encoding="utf-8")

print("GFG added:", added)
print("Final DSA bank total:", len(bank))
