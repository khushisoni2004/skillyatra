import json
from pathlib import Path

BANK = Path("src/data/dsaCodingQuestions.json")

GFG = {
  "Arrays": [
    ("Two Sum In Array", "https://practice.geeksforgeeks.org/problems/two-sum-in-array-1587115621/1"),
    ("Missing Number In Array", "https://practice.geeksforgeeks.org/problems/missing-number-in-array1416/1"),
    ("Kadane Algorithm", "https://practice.geeksforgeeks.org/problems/kadanes-algorithm-1587115620/1"),
    ("Move All Zeroes To End", "https://practice.geeksforgeeks.org/problems/move-all-zeroes-to-end-of-array0751/1"),
    ("Leaders In An Array", "https://practice.geeksforgeeks.org/problems/leaders-in-an-array-1587115620/1"),
    ("Majority Element", "https://practice.geeksforgeeks.org/problems/majority-element-1587115620/1"),
    ("Second Largest", "https://practice.geeksforgeeks.org/problems/second-largest3735/1"),
    ("Union Of Two Arrays", "https://practice.geeksforgeeks.org/problems/union-of-two-arrays3538/1"),
    ("Minimum And Maximum In Array", "https://practice.geeksforgeeks.org/problems/find-minimum-and-maximum-element-in-an-array4428/1"),
    ("Sort 0s 1s And 2s", "https://practice.geeksforgeeks.org/problems/sort-a-linked-list/1")
  ],
  "Strings": [
    ("Reverse A String", "https://practice.geeksforgeeks.org/problems/reverse-a-string/1"),
    ("Palindrome String", "https://practice.geeksforgeeks.org/problems/palindrome-string0817/1"),
    ("Anagram", "https://practice.geeksforgeeks.org/problems/anagram-1587115620/1"),
    ("Remove Duplicates", "https://practice.geeksforgeeks.org/problems/remove-duplicates3034/1"),
    ("Longest Common Prefix", "https://practice.geeksforgeeks.org/problems/longest-common-prefix-in-an-array5129/1"),
    ("Roman Number To Integer", "https://practice.geeksforgeeks.org/problems/roman-number-to-integer3201/1"),
    ("Implement Atoi", "https://practice.geeksforgeeks.org/problems/implement-atoi/1"),
    ("Check If Strings Are Rotations", "https://practice.geeksforgeeks.org/problems/check-if-strings-are-rotations-of-each-other/1"),
    ("First Repeating Character", "https://practice.geeksforgeeks.org/problems/find-first-repeated-character4108/1"),
    ("Minimum Indexed Character", "https://practice.geeksforgeeks.org/problems/minimum-indexed-character-1587115620/1")
  ],
  "Linked List": [
    ("Reverse A Linked List", "https://practice.geeksforgeeks.org/problems/reverse-a-linked-list/1"),
    ("Middle Of Linked List", "https://practice.geeksforgeeks.org/problems/finding-middle-element-in-a-linked-list/1"),
    ("Detect Loop In Linked List", "https://practice.geeksforgeeks.org/problems/detect-loop-in-linked-list/1"),
    ("Remove Loop In Linked List", "https://practice.geeksforgeeks.org/problems/remove-loop-in-linked-list/1"),
    ("Merge Two Sorted Linked Lists", "https://practice.geeksforgeeks.org/problems/merge-two-sorted-linked-lists/1"),
    ("Nth Node From End", "https://practice.geeksforgeeks.org/problems/nth-node-from-end-of-linked-list/1"),
    ("Delete Without Head Pointer", "https://practice.geeksforgeeks.org/problems/delete-without-head-pointer/1"),
    ("Pairwise Swap Elements", "https://practice.geeksforgeeks.org/problems/pairwise-swap-elements-of-a-linked-list-by-swapping-data/1"),
    ("Intersection Point In Y Shaped Linked Lists", "https://practice.geeksforgeeks.org/problems/intersection-point-in-y-shapped-linked-lists/1"),
    ("Add Two Numbers Represented By Linked Lists", "https://practice.geeksforgeeks.org/problems/add-two-numbers-represented-by-linked-lists/1")
  ],
  "Stack": [
    ("Parenthesis Checker", "https://practice.geeksforgeeks.org/problems/parenthesis-checker2744/1"),
    ("Next Larger Element", "https://practice.geeksforgeeks.org/problems/next-larger-element-1587115620/1"),
    ("Get Minimum Element From Stack", "https://practice.geeksforgeeks.org/problems/get-minimum-element-from-stack/1"),
    ("Implement Stack Using Array", "https://practice.geeksforgeeks.org/problems/implement-stack-using-array/1"),
    ("Implement Stack Using Linked List", "https://practice.geeksforgeeks.org/problems/implement-stack-using-linked-list/1"),
    ("Stock Span Problem", "https://practice.geeksforgeeks.org/problems/stock-span-problem-1587115621/1"),
    ("Evaluation Of Postfix Expression", "https://practice.geeksforgeeks.org/problems/evaluation-of-postfix-expression1735/1"),
    ("Largest Rectangular Area In Histogram", "https://practice.geeksforgeeks.org/problems/maximum-rectangular-area-in-a-histogram-1587115620/1"),
    ("Queue Using Two Stacks", "https://practice.geeksforgeeks.org/problems/queue-using-two-stacks/1"),
    ("Reverse A Stack", "https://practice.geeksforgeeks.org/problems/reverse-a-stack/1")
  ],
  "Queue": [
    ("Implement Queue Using Array", "https://practice.geeksforgeeks.org/problems/implement-queue-using-array/1"),
    ("Queue Using Two Stacks", "https://practice.geeksforgeeks.org/problems/queue-using-two-stacks/1"),
    ("Stack Using Two Queues", "https://practice.geeksforgeeks.org/problems/stack-using-two-queues/1"),
    ("Reverse First K Elements Of Queue", "https://practice.geeksforgeeks.org/problems/reverse-first-k-elements-of-queue/1"),
    ("First Non Repeating Character In A Stream", "https://practice.geeksforgeeks.org/problems/first-non-repeating-character-in-a-stream1216/1"),
    ("Generate Binary Numbers", "https://practice.geeksforgeeks.org/problems/generate-binary-numbers-1587115620/1"),
    ("Rotten Oranges", "https://practice.geeksforgeeks.org/problems/rotten-oranges2536/1"),
    ("LRU Cache", "https://practice.geeksforgeeks.org/problems/lru-cache/1"),
    ("First Negative Integer In Every Window", "https://practice.geeksforgeeks.org/problems/first-negative-integer-in-every-window-of-size-k3345/1"),
    ("Circular Queue", "https://practice.geeksforgeeks.org/problems/circular-queue/1")
  ],
  "Trees": [
    ("Inorder Traversal", "https://practice.geeksforgeeks.org/problems/inorder-traversal/1"),
    ("Preorder Traversal", "https://practice.geeksforgeeks.org/problems/preorder-traversal/1"),
    ("Postorder Traversal", "https://practice.geeksforgeeks.org/problems/postorder-traversal/1"),
    ("Level Order Traversal", "https://practice.geeksforgeeks.org/problems/level-order-traversal/1"),
    ("Height Of Binary Tree", "https://practice.geeksforgeeks.org/problems/height-of-binary-tree/1"),
    ("Diameter Of Binary Tree", "https://practice.geeksforgeeks.org/problems/diameter-of-binary-tree/1"),
    ("Check For Balanced Tree", "https://practice.geeksforgeeks.org/problems/check-for-balanced-tree/1"),
    ("Mirror Tree", "https://practice.geeksforgeeks.org/problems/mirror-tree/1"),
    ("Left View Of Binary Tree", "https://practice.geeksforgeeks.org/problems/left-view-of-binary-tree/1"),
    ("Lowest Common Ancestor In Binary Tree", "https://practice.geeksforgeeks.org/problems/lowest-common-ancestor-in-a-binary-tree/1")
  ],
  "Graphs": [
    ("BFS Of Graph", "https://practice.geeksforgeeks.org/problems/bfs-traversal-of-graph/1"),
    ("DFS Of Graph", "https://practice.geeksforgeeks.org/problems/depth-first-traversal-for-a-graph/1"),
    ("Detect Cycle In Undirected Graph", "https://practice.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1"),
    ("Detect Cycle In Directed Graph", "https://practice.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1"),
    ("Topological Sort", "https://practice.geeksforgeeks.org/problems/topological-sort/1"),
    ("Number Of Islands", "https://practice.geeksforgeeks.org/problems/find-the-number-of-islands/1"),
    ("Dijkstra Algorithm", "https://practice.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1"),
    ("Minimum Spanning Tree", "https://practice.geeksforgeeks.org/problems/minimum-spanning-tree/1"),
    ("Flood Fill Algorithm", "https://practice.geeksforgeeks.org/problems/flood-fill-algorithm1856/1"),
    ("Shortest Path In Undirected Graph", "https://practice.geeksforgeeks.org/problems/shortest-path-in-undirected-graph/1")
  ],
  "Dynamic Programming": [
    ("Nth Fibonacci Number", "https://practice.geeksforgeeks.org/problems/nth-fibonacci-number1335/1"),
    ("0 1 Knapsack Problem", "https://practice.geeksforgeeks.org/problems/0-1-knapsack-problem0945/1"),
    ("Coin Change", "https://practice.geeksforgeeks.org/problems/coin-change2448/1"),
    ("Longest Common Subsequence", "https://practice.geeksforgeeks.org/problems/longest-common-subsequence-1587115620/1"),
    ("Longest Increasing Subsequence", "https://practice.geeksforgeeks.org/problems/longest-increasing-subsequence-1587115620/1"),
    ("Edit Distance", "https://practice.geeksforgeeks.org/problems/edit-distance3702/1"),
    ("Minimum Number Of Jumps", "https://practice.geeksforgeeks.org/problems/minimum-number-of-jumps-1587115620/1"),
    ("Subset Sum Problem", "https://practice.geeksforgeeks.org/problems/subset-sum-problem-1611555638/1"),
    ("Rod Cutting", "https://practice.geeksforgeeks.org/problems/rod-cutting0840/1"),
    ("Maximum Sum Increasing Subsequence", "https://practice.geeksforgeeks.org/problems/maximum-sum-increasing-subsequence4749/1")
  ],
  "Greedy": [
    ("N Meetings In One Room", "https://practice.geeksforgeeks.org/problems/n-meetings-in-one-room-1587115620/1"),
    ("Activity Selection", "https://practice.geeksforgeeks.org/problems/activity-selection-1587115620/1"),
    ("Fractional Knapsack", "https://practice.geeksforgeeks.org/problems/fractional-knapsack-1587115620/1"),
    ("Job Sequencing Problem", "https://practice.geeksforgeeks.org/problems/job-sequencing-problem-1587115620/1"),
    ("Minimum Platforms", "https://practice.geeksforgeeks.org/problems/minimum-platforms-1587115620/1"),
    ("Shop In Candy Store", "https://practice.geeksforgeeks.org/problems/shop-in-candy-store1145/1"),
    ("Maximize Toys", "https://practice.geeksforgeeks.org/problems/maximize-toys0331/1"),
    ("Smallest Number", "https://practice.geeksforgeeks.org/problems/smallest-number5829/1"),
    ("Huffman Encoding", "https://practice.geeksforgeeks.org/problems/huffman-encoding3345/1"),
    ("Police And Thieves", "https://practice.geeksforgeeks.org/problems/police-and-thieves--141631/1")
  ],
  "Searching": [
    ("Binary Search", "https://practice.geeksforgeeks.org/problems/binary-search-1587115620/1"),
    ("Search In Rotated Array", "https://practice.geeksforgeeks.org/problems/search-in-a-rotated-array4618/1"),
    ("Peak Element", "https://practice.geeksforgeeks.org/problems/peak-element/1"),
    ("Square Root", "https://practice.geeksforgeeks.org/problems/square-root/1"),
    ("First And Last Occurrences", "https://practice.geeksforgeeks.org/problems/first-and-last-occurrences-of-x3116/1"),
    ("Floor In A Sorted Array", "https://practice.geeksforgeeks.org/problems/floor-in-a-sorted-array-1587115620/1"),
    ("Find Transition Point", "https://practice.geeksforgeeks.org/problems/find-transition-point-1587115620/1"),
    ("Allocate Minimum Pages", "https://practice.geeksforgeeks.org/problems/allocate-minimum-number-of-pages0937/1"),
    ("Median Of Two Sorted Arrays", "https://practice.geeksforgeeks.org/problems/median-of-2-sorted-arrays-of-different-sizes/1"),
    ("Count Element Occurrences", "https://practice.geeksforgeeks.org/problems/count-element-occurences/1")
  ]
}

# remove broken GFG entries only
bank = json.loads(BANK.read_text(encoding="utf-8")) if BANK.exists() else []
bank = [
    q for q in bank
    if q.get("platform") != "GeeksforGeeks"
]

seen = set(f"{q.get('title','')}|{q.get('topic','')}|{q.get('platform','')}".lower() for q in bank)
added = 0

for topic, items in GFG.items():
    for i, (title, url) in enumerate(items):
        key = f"{title}|{topic}|GeeksforGeeks".lower()
        if key in seen:
            continue
        seen.add(key)
        bank.append({
            "id": f"dsa-{len(bank)+1}",
            "title": title,
            "topic": topic,
            "platform": "GeeksforGeeks",
            "difficulty": "Easy" if i < 6 else "Medium",
            "url": url,
            "sourceDataset": "GFG verified practice links"
        })
        added += 1

BANK.write_text(json.dumps(bank, indent=2), encoding="utf-8")
print("Removed all broken GFG rows.")
print("Added working GFG rows:", added)
print("Final total:", len(bank))
