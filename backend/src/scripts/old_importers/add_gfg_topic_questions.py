import json
import re
from pathlib import Path

BANK = Path("src/data/dsaCodingQuestions.json")

TOPIC_QUESTIONS = {
  "Arrays": [
    "Two Sum", "Maximum Subarray", "Best Time To Buy And Sell Stock", "Move Zeroes",
    "Rotate Array", "Missing Number", "Majority Element", "Product Of Array Except Self",
    "Merge Sorted Array", "Find Duplicate Number"
  ],
  "Strings": [
    "Reverse A String", "Valid Palindrome", "Valid Anagram", "Longest Common Prefix",
    "First Unique Character In A String", "Implement Strstr", "Roman To Integer",
    "String Compression", "Longest Palindromic Substring", "Group Anagrams"
  ],
  "Linked List": [
    "Reverse A Linked List", "Middle Of The Linked List", "Detect Loop In Linked List",
    "Merge Two Sorted Lists", "Remove Nth Node From End Of List", "Palindrome Linked List",
    "Intersection Of Two Linked Lists", "Add Two Numbers", "Sort A Linked List",
    "Flattening A Linked List"
  ],
  "Stack": [
    "Valid Parentheses", "Min Stack", "Next Greater Element", "Daily Temperatures",
    "Largest Rectangle In Histogram", "Stock Span Problem", "Evaluate Reverse Polish Notation",
    "Decode String", "Asteroid Collision", "Celebrity Problem"
  ],
  "Queue": [
    "Implement Queue Using Stacks", "Implement Stack Using Queues", "Circular Queue",
    "First Non Repeating Character In A Stream", "Rotten Oranges", "Sliding Window Maximum",
    "Generate Binary Numbers", "LRU Cache", "Task Scheduler", "Queue Reversal"
  ],
  "Trees": [
    "Binary Tree Inorder Traversal", "Binary Tree Preorder Traversal", "Binary Tree Postorder Traversal",
    "Level Order Traversal", "Maximum Depth Of Binary Tree", "Diameter Of Binary Tree",
    "Balanced Binary Tree", "Lowest Common Ancestor Of Binary Tree", "Path Sum",
    "Serialize And Deserialize Binary Tree"
  ],
  "Binary Search Tree": [
    "Validate Binary Search Tree", "Search In A Binary Search Tree", "Insert Into A Binary Search Tree",
    "Delete Node In A BST", "Kth Smallest Element In A BST", "Lowest Common Ancestor In A BST",
    "Convert Sorted Array To BST", "Two Sum IV Input Is A BST", "Recover Binary Search Tree",
    "BST Iterator"
  ],
  "Graphs": [
    "Breadth First Search Of Graph", "Depth First Search Of Graph", "Number Of Islands",
    "Clone Graph", "Course Schedule", "Detect Cycle In Directed Graph",
    "Detect Cycle In Undirected Graph", "Dijkstra Algorithm", "Topological Sort",
    "Minimum Spanning Tree"
  ],
  "Dynamic Programming": [
    "Climbing Stairs", "House Robber", "Coin Change", "Longest Increasing Subsequence",
    "Longest Common Subsequence", "0 1 Knapsack Problem", "Edit Distance", "Unique Paths",
    "Maximum Product Subarray", "Partition Equal Subset Sum"
  ],
  "Greedy": [
    "N Meetings In One Room", "Activity Selection Problem", "Fractional Knapsack",
    "Job Sequencing Problem", "Jump Game", "Jump Game II", "Gas Station", "Candy",
    "Assign Cookies", "Minimum Platforms"
  ],
  "Recursion": [
    "Print 1 To N Without Loop", "Factorial Using Recursion", "Fibonacci Number",
    "Power Of Numbers", "Subsets", "Permutations", "Combination Sum",
    "Generate Parentheses", "Tower Of Hanoi", "Josephus Problem"
  ],
  "Backtracking": [
    "N Queens", "Sudoku Solver", "Word Search", "Combination Sum", "Subsets",
    "Permutations", "Palindrome Partitioning", "Rat In A Maze", "Letter Combinations Of Phone Number",
    "M Coloring Problem"
  ],
  "Searching": [
    "Binary Search", "Search Insert Position", "First Bad Version", "Search In Rotated Sorted Array",
    "Find First And Last Position Of Element", "Find Peak Element", "Square Root Of Number",
    "Median Of Two Sorted Arrays", "Allocate Minimum Pages", "Aggressive Cows"
  ],
  "Sorting": [
    "Sort Colors", "Merge Intervals", "Kth Largest Element In An Array", "Chocolate Distribution Problem",
    "Insertion Sort List", "Sort An Array", "Find All Duplicates In An Array", "Largest Number",
    "Count Inversions", "Quick Sort"
  ],
  "Hashing": [
    "Contains Duplicate", "Two Sum Using Hash Map", "Subarray Sum Equals K",
    "Longest Consecutive Sequence", "Intersection Of Two Arrays", "Top K Frequent Elements",
    "Isomorphic Strings", "Happy Number", "Ransom Note", "Valid Sudoku"
  ],
  "Heap / Priority Queue": [
    "Kth Largest Element In An Array", "Top K Frequent Elements", "Merge K Sorted Lists",
    "Find Median From Data Stream", "K Closest Points To Origin", "Last Stone Weight",
    "Task Scheduler", "Smallest Range Covering K Lists", "Reorganize String",
    "Minimum Cost To Connect Ropes"
  ],
  "Sliding Window": [
    "Maximum Sum Subarray Of Size K", "Longest Substring Without Repeating Characters",
    "Minimum Window Substring", "Permutation In String", "Longest Repeating Character Replacement",
    "Fruit Into Baskets", "Max Consecutive Ones III", "Subarray Product Less Than K",
    "Count Occurrences Of Anagrams", "Smallest Subarray With Given Sum"
  ],
  "Two Pointers": [
    "Container With Most Water", "3Sum", "Remove Duplicates From Sorted Array",
    "Sort Array By Parity", "Trapping Rain Water", "Pair Sum In Sorted Array",
    "Valid Palindrome II", "Squares Of A Sorted Array", "Move Zeroes",
    "Boats To Save People"
  ],
  "Bit Manipulation": [
    "Single Number", "Number Of 1 Bits", "Counting Bits", "Power Of Two",
    "Missing Number Using XOR", "Reverse Bits", "Bitwise AND Of Numbers Range",
    "Subsets Using Bits", "Find Two Non Repeating Numbers", "XOR Queries Of A Subarray"
  ],
  "Math / Number Theory": [
    "Prime Number", "Count Primes", "GCD Of Two Numbers", "LCM Of Two Numbers",
    "Sieve Of Eratosthenes", "Power Of Numbers", "Factorial Of Large Number",
    "Modular Exponentiation", "Trailing Zeroes In Factorial", "Nth Fibonacci Number"
  ]
}

def slugify(title):
    s = title.lower()
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    s = re.sub(r"\s+", "-", s)
    s = re.sub(r"-+", "-", s)
    return s.strip("-")

if BANK.exists():
    try:
        bank = json.loads(BANK.read_text(encoding="utf-8"))
        if not isinstance(bank, list):
            bank = []
    except Exception:
        bank = []
else:
    bank = []

seen = set(
    f"{q.get('title','')}|{q.get('topic','')}|{q.get('platform','')}".lower()
    for q in bank
)

added = 0

for topic, titles in TOPIC_QUESTIONS.items():
    for i, title in enumerate(titles):
        key = f"{title}|{topic}|GeeksforGeeks".lower()
        if key in seen:
            continue

        seen.add(key)
        bank.append({
            "id": f"dsa-{len(bank) + 1}",
            "title": title,
            "topic": topic,
            "platform": "GeeksforGeeks",
            "difficulty": "Easy" if i < 4 else "Medium" if i < 8 else "Hard",
            "url": f"https://www.geeksforgeeks.org/search/{title.replace(' ', '%20')}/",
            "sourceDataset": "GFG Problem Statements Dataset.zip"
        })
        added += 1

TOPIC_ORDER = list(TOPIC_QUESTIONS.keys())
topic_index = {t: i for i, t in enumerate(TOPIC_ORDER)}
diff_index = {"Easy": 1, "Medium": 2, "Hard": 3}

bank.sort(key=lambda q: (
    topic_index.get(q.get("topic"), 999),
    q.get("platform", ""),
    diff_index.get(q.get("difficulty"), 2),
    q.get("title", "")
))

BANK.write_text(json.dumps(bank, indent=2), encoding="utf-8")

print("GFG topic questions added:", added)
print("Final bank total:", len(bank))
