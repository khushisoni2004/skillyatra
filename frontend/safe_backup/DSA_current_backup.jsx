import { useMemo, useState } from "react";

const TOPICS = [
  "Arrays",
  "Strings",
  "Linked List",
  "Stack",
  "Queue",
  "Recursion",
  "Sorting",
  "Searching",
  "Hashing",
  "Two Pointers",
  "Sliding Window",
  "Binary Tree",
  "BST",
  "Heap",
  "Greedy",
  "Dynamic Programming",
  "Graph",
  "Backtracking"
];

const BASE = {
  Arrays: [
    "Two Sum", "Maximum Subarray", "Best Time to Buy and Sell Stock", "Move Zeroes", "Rotate Array",
    "Missing Number", "Majority Element", "Kadane Algorithm", "Merge Sorted Array", "Product of Array Except Self"
  ],
  Strings: [
    "Reverse a String", "Valid Palindrome", "Valid Anagram", "Longest Common Prefix", "First Unique Character",
    "Implement strStr", "Roman to Integer", "String Compression", "Longest Palindromic Substring", "Group Anagrams"
  ],
  "Linked List": [
    "Reverse a Linked List", "Middle of the Linked List", "Detect Loop in Linked List", "Merge Two Sorted Lists", "Remove Nth Node From End",
    "Palindrome Linked List", "Intersection of Two Linked Lists", "Add Two Numbers", "Sort a Linked List", "Flattening a Linked List"
  ],
  Stack: [
    "Valid Parentheses", "Min Stack", "Next Greater Element", "Daily Temperatures", "Largest Rectangle in Histogram",
    "Remove K Digits", "Evaluate Reverse Polish Notation", "Decode String", "Asteroid Collision", "Stock Span Problem"
  ],
  Queue: [
    "Implement Queue using Stacks", "Implement Stack using Queues", "Circular Queue", "First Non-Repeating Character in Stream", "Rotten Oranges",
    "Sliding Window Maximum", "Generate Binary Numbers", "LRU Cache", "Queue Reconstruction", "Task Scheduler"
  ],
  Recursion: [
    "Print 1 to N Without Loop", "Factorial Using Recursion", "Fibonacci Number", "Power of Numbers", "Subsets",
    "Permutations", "Combination Sum", "Generate Parentheses", "N-Queens", "Rat in a Maze"
  ],
  Sorting: [
    "Sort Colors", "Merge Intervals", "Kth Largest Element", "Chocolate Distribution", "Insertion Sort List",
    "Sort an Array", "Find All Duplicates", "Largest Number", "Meeting Rooms", "Minimum Platforms"
  ],
  Searching: [
    "Binary Search", "Search Insert Position", "First Bad Version", "Search in Rotated Sorted Array", "Find First and Last Position",
    "Find Peak Element", "Square Root of Number", "Median of Two Sorted Arrays", "Allocate Minimum Pages", "Aggressive Cows"
  ],
  Hashing: [
    "Contains Duplicate", "Two Sum using HashMap", "Subarray Sum Equals K", "Longest Consecutive Sequence", "Intersection of Arrays",
    "Top K Frequent Elements", "Isomorphic Strings", "Happy Number", "Ransom Note", "Find Duplicate Subtrees"
  ],
  "Two Pointers": [
    "Container With Most Water", "3Sum", "Remove Duplicates from Sorted Array", "Sort Array by Parity", "Trapping Rain Water",
    "Pair Sum in Sorted Array", "Valid Palindrome II", "Squares of Sorted Array", "Move Zeroes using Two Pointers", "Partition Labels"
  ],
  "Sliding Window": [
    "Maximum Sum Subarray of Size K", "Longest Substring Without Repeating Characters", "Minimum Window Substring", "Permutation in String", "Longest Repeating Character Replacement",
    "Fruit Into Baskets", "Max Consecutive Ones III", "Subarray Product Less Than K", "Count Anagrams", "Smallest Subarray With Given Sum"
  ],
  "Binary Tree": [
    "Inorder Traversal", "Preorder Traversal", "Postorder Traversal", "Level Order Traversal", "Maximum Depth of Binary Tree",
    "Diameter of Binary Tree", "Balanced Binary Tree", "Lowest Common Ancestor", "Path Sum", "Serialize and Deserialize Binary Tree"
  ],
  BST: [
    "Validate Binary Search Tree", "Search in BST", "Insert into BST", "Delete Node in BST", "Kth Smallest Element in BST",
    "Lowest Common Ancestor in BST", "Convert Sorted Array to BST", "Two Sum IV BST", "Recover BST", "BST Iterator"
  ],
  Heap: [
    "Kth Largest Element in Array", "Top K Frequent Elements", "Merge K Sorted Lists", "Find Median from Data Stream", "K Closest Points to Origin",
    "Last Stone Weight", "Task Scheduler", "Smallest Range Covering K Lists", "Reorganize String", "Connect Ropes"
  ],
  Greedy: [
    "N Meetings in One Room", "Activity Selection", "Fractional Knapsack", "Job Sequencing Problem", "Jump Game",
    "Jump Game II", "Gas Station", "Candy", "Assign Cookies", "Minimum Number of Platforms"
  ],
  "Dynamic Programming": [
    "Climbing Stairs", "House Robber", "Coin Change", "Longest Increasing Subsequence", "Longest Common Subsequence",
    "0/1 Knapsack", "Edit Distance", "Unique Paths", "Maximum Product Subarray", "Palindrome Partitioning"
  ],
  Graph: [
    "BFS Traversal", "DFS Traversal", "Number of Islands", "Clone Graph", "Course Schedule",
    "Detect Cycle in Directed Graph", "Detect Cycle in Undirected Graph", "Dijkstra Algorithm", "Topological Sort", "Minimum Spanning Tree"
  ],
  Backtracking: [
    "N-Queens", "Sudoku Solver", "Word Search", "Combination Sum", "Subsets",
    "Permutations", "Palindrome Partitioning", "Rat in a Maze", "Letter Combinations", "M-Coloring Problem"
  ]
};

function makeQuestions() {
  const rows = [];
  let id = 1;

  Object.entries(BASE).forEach(([topic, questions]) => {
    questions.forEach((title, index) => {
      const difficulty = index < 4 ? "Easy" : index < 8 ? "Medium" : "Hard";
      const platform = index % 3 === 0 ? "LeetCode" : index % 3 === 1 ? "GeeksforGeeks" : "InterviewBit";
      rows.push({
        id: `dsa-${id++}`,
        topic,
        title,
        difficulty,
        platform,
        url: `https://www.google.com/search?q=${encodeURIComponent(title + " DSA problem")}`
      });
    });
  });

  return rows;
}

const QUESTIONS = makeQuestions();
const STORAGE_KEY = "skillyatra_dsa_done_v2";

function readDone() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveDone(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data || {}));
  } catch {}
}

export default function DSA() {
  const [done, setDone] = useState(readDone);
  const [topic, setTopic] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const pageSize = 25;

  const filtered = useMemo(() => {
    let rows = QUESTIONS;

    if (topic !== "All") rows = rows.filter((q) => q.topic === topic);
    if (difficulty !== "All") rows = rows.filter((q) => q.difficulty === difficulty);

    const s = search.trim().toLowerCase();
    if (s) {
      rows = rows.filter(
        (q) =>
          q.title.toLowerCase().includes(s) ||
          q.topic.toLowerCase().includes(s) ||
          q.difficulty.toLowerCase().includes(s)
      );
    }

    return rows;
  }, [topic, difficulty, search]);

  const total = QUESTIONS.length;
  const completed = QUESTIONS.filter((q) => done[q.id]).length;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const currentRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  function toggleDone(id) {
    const next = { ...done, [id]: !done[id] };
    if (!next[id]) delete next[id];
    setDone(next);
    saveDone(next);
  }

  function resetFilters() {
    setTopic("All");
    setDifficulty("All");
    setSearch("");
    setPage(1);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-white p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[34px] bg-gradient-to-r from-indigo-700 via-violet-700 to-slate-950 p-8 text-white shadow-xl shadow-indigo-200">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-indigo-200">
            DSA Tracker
          </p>
          <h1 className="mt-3 text-4xl font-black">Topic-Wise DSA Practice</h1>
          <p className="mt-3 text-sm font-semibold text-indigo-100">
            Practice company-level DSA questions topic-wise, filter by difficulty, and track your completed problems.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[26px] bg-white p-5 shadow-lg shadow-indigo-50 ring-1 ring-indigo-100">
            <p className="text-sm font-black text-slate-500">Total Questions</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">{total}</h2>
          </div>
          <div className="rounded-[26px] bg-white p-5 shadow-lg shadow-indigo-50 ring-1 ring-indigo-100">
            <p className="text-sm font-black text-slate-500">Completed</p>
            <h2 className="mt-2 text-3xl font-black text-emerald-600">{completed}</h2>
          </div>
          <div className="rounded-[26px] bg-white p-5 shadow-lg shadow-indigo-50 ring-1 ring-indigo-100">
            <p className="text-sm font-black text-slate-500">Pending</p>
            <h2 className="mt-2 text-3xl font-black text-rose-600">{total - completed}</h2>
          </div>
          <div className="rounded-[26px] bg-white p-5 shadow-lg shadow-indigo-50 ring-1 ring-indigo-100">
            <p className="text-sm font-black text-slate-500">Progress</p>
            <h2 className="mt-2 text-3xl font-black text-indigo-600">{progress}%</h2>
          </div>
        </section>

        <section className="rounded-[30px] bg-white p-5 shadow-lg shadow-indigo-50 ring-1 ring-indigo-100">
          <div className="grid gap-3 md:grid-cols-[1fr_220px_180px_auto]">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search DSA question..."
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />

            <select
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                setPage(1);
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            >
              <option value="All">All Topics</option>
              {TOPICS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value);
                setPage(1);
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            >
              <option value="All">All Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <button
              onClick={resetFilters}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
            >
              Refresh
            </button>
          </div>
        </section>

        <section className="rounded-[30px] bg-white p-6 shadow-lg shadow-indigo-50 ring-1 ring-indigo-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Practice List</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {filtered.length} Questions Found • Page {page}/{totalPages}
              </p>
            </div>
            <p className="text-sm font-black text-indigo-600">Keep solving daily</p>
          </div>

          <div className="mt-6 space-y-4">
            {currentRows.map((q, index) => (
              <div
                key={q.id}
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700 ring-1 ring-indigo-100">
                      QUESTION {(page - 1) * pageSize + index + 1}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700 ring-1 ring-slate-200">
                      {q.topic}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${
                        q.difficulty === "Easy"
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                          : q.difficulty === "Medium"
                            ? "bg-amber-50 text-amber-700 ring-amber-100"
                            : "bg-rose-50 text-rose-700 ring-rose-100"
                      }`}
                    >
                      {q.difficulty}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500 ring-1 ring-slate-200">
                      {done[q.id] ? "Completed" : "Not Attempted"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={q.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl bg-white px-4 py-2 text-xs font-black text-indigo-700 ring-1 ring-indigo-100 hover:bg-indigo-50"
                    >
                      Open
                    </a>
                    <button
                      onClick={() => toggleDone(q.id)}
                      className={`rounded-2xl px-4 py-2 text-xs font-black ${
                        done[q.id]
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-900 text-white"
                      }`}
                    >
                      {done[q.id] ? "Done" : "Mark Done"}
                    </button>
                  </div>
                </div>

                <h3 className="mt-4 text-lg font-black text-slate-900">{q.title}</h3>
                <p className="mt-1 text-sm font-bold text-slate-500">{q.platform}</p>
              </div>
            ))}
          </div>

          {filtered.length > pageSize && (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-200">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200 hover:bg-indigo-50 disabled:opacity-40"
              >
                Previous Page
              </button>

              <span className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-40"
              >
                Next Page
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
