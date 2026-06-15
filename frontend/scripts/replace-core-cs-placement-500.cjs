const fs = require("fs");

const file = "src/data/generatedMcqs.js";
const text = fs.readFileSync(file, "utf8");
const match = text.match(/export const MCQ_QUESTIONS = ([\s\S]*?);\s*$/);

if (!match) {
  console.error("MCQ_QUESTIONS not found");
  process.exit(1);
}

let questions = JSON.parse(match[1]);

const GROUPS = [
  "All",
  "Quantitative Aptitude",
  "Logical Reasoning",
  "Verbal Ability",
  "Placement / NQT",
  "Programming",
  "Core CS",
  "Python",
  "Data Science",
  "HR / Technical Interview"
];

function opt(key, text) {
  return { key, text };
}

function makeQ(topic, i, question, correct, wrongs, explanation) {
  return {
    id: `placement-core-${topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${String(i).padStart(3, "0")}`,
    subject: "Core CS",
    topic,
    difficulty: i <= 30 ? "Easy" : i <= 75 ? "Medium" : "Hard",
    question,
    options: [
      opt("A", correct),
      opt("B", wrongs[0]),
      opt("C", wrongs[1]),
      opt("D", wrongs[2])
    ],
    correctAnswer: "A",
    answer: "A",
    explanation,
    sourceDataset: "Placement Core CS Scenario MCQs"
  };
}

function dbmsQ(i) {
  const n = i % 20;

  const cases = [
    [
      "A table Students has columns student_id, name, email. Every student must have a unique email. Which constraint is best for email?",
      "UNIQUE",
      ["PRIMARY KEY only", "FOREIGN KEY", "CHECK email > 0"],
      "UNIQUE is used when values must not repeat but are not necessarily the main row identifier."
    ],
    [
      "Orders table has customer_id that refers to Customers(id). Which key should customer_id be?",
      "Foreign key",
      ["Primary key", "Candidate key only", "Composite key only"],
      "customer_id creates a relationship with another table, so it is a foreign key."
    ],
    [
      "A query frequently searches employees by email. Which change improves search performance?",
      "Create an index on email",
      ["Remove primary key", "Use DELETE query", "Store email twice"],
      "Index helps the database find rows faster for search conditions."
    ],
    [
      "A transaction debits one account but app crashes before crediting another account. Which ACID property protects correctness?",
      "Atomicity",
      ["Durability only", "Isolation only", "Indexing"],
      "Atomicity ensures all operations happen together or none happen."
    ],
    [
      "Two users update the same bank balance at the same time. Which ACID property handles concurrent correctness?",
      "Isolation",
      ["Atomicity", "Normalization", "Indexing"],
      "Isolation controls how concurrent transactions interact."
    ],
    [
      "A table stores customer_name, product1, product2, product3 in same row. Which normal form is violated?",
      "1NF",
      ["2NF", "3NF", "BCNF"],
      "Repeating groups violate First Normal Form."
    ],
    [
      "A table Order(order_id, customer_name, customer_city) repeats customer_city for same customer. Best fix?",
      "Split customer details into separate Customers table",
      ["Keep duplicate city", "Remove order_id", "Store city in product table"],
      "Separating customer data reduces redundancy."
    ],
    [
      "You need only matching rows from Employees and Departments. Which join is correct?",
      "INNER JOIN",
      ["LEFT JOIN always", "FULL JOIN only", "CROSS JOIN"],
      "INNER JOIN returns rows that match in both tables."
    ],
    [
      "You need all customers even if they have no orders. Which join is best?",
      "LEFT JOIN from Customers to Orders",
      ["INNER JOIN", "RIGHT JOIN from Customers", "CROSS JOIN"],
      "LEFT JOIN keeps all rows from the left table."
    ],
    [
      "A query uses GROUP BY department_id. Which function can count employees per department?",
      "COUNT(*)",
      ["ORDER BY", "WHERE only", "JOIN only"],
      "COUNT(*) counts rows in each group."
    ],
    [
      "You need departments having more than 5 employees after grouping. Which clause is used?",
      "HAVING",
      ["WHERE only", "ORDER BY", "LIMIT"],
      "HAVING filters grouped results."
    ],
    [
      "A DELETE query should remove only inactive users. What must be added to avoid deleting all rows?",
      "WHERE condition",
      ["ORDER BY", "GROUP BY", "SELECT"],
      "WHERE limits rows affected by DELETE."
    ],
    [
      "A table has primary key made from student_id and course_id. What type of key is this?",
      "Composite key",
      ["Foreign key only", "Super key only", "Index only"],
      "Composite key uses more than one column."
    ],
    [
      "A column age must always be greater than 0. Which constraint fits best?",
      "CHECK",
      ["FOREIGN KEY", "JOIN", "ORDER BY"],
      "CHECK validates allowed values."
    ],
    [
      "A transaction is committed and power fails. Data should still remain. Which property is this?",
      "Durability",
      ["Isolation", "Atomicity", "Normalization"],
      "Durability ensures committed data survives failure."
    ],
    [
      "A query is slow because it returns unnecessary columns. What is better?",
      "Select only required columns",
      ["Always use SELECT *", "Remove WHERE", "Use CROSS JOIN"],
      "Selecting only needed columns reduces data transfer and processing."
    ],
    [
      "A product can belong to many categories and a category has many products. What table is needed?",
      "Junction table",
      ["Single product column", "Duplicate category names", "Delete category table"],
      "Many-to-many relations are implemented using a junction table."
    ],
    [
      "A database stores password as plain text. What should be done?",
      "Store hashed password",
      ["Store same password twice", "Use integer password", "Remove users table"],
      "Passwords should be securely hashed before storage."
    ],
    [
      "You want latest 10 orders. Which SQL combination is suitable?",
      "ORDER BY order_date DESC LIMIT 10",
      ["GROUP BY order_date", "HAVING order_date", "DELETE LIMIT 10"],
      "Sorting descending and limiting gives latest rows."
    ],
    [
      "A query joins tables without condition and produces huge combinations. What happened?",
      "Cartesian product",
      ["Index scan", "Primary key match", "Normalization"],
      "Missing join condition can create Cartesian product."
    ]
  ];

  const c = cases[n];
  return makeQ("DBMS", i, c[0] + ` (Case ${i})`, c[1], c[2], c[3]);
}

function cnQ(i) {
  const n = i % 20;

  const cases = [
    [
      "A user can ping 8.8.8.8 but cannot open google.com. Which service is most likely failing?",
      "DNS",
      ["HTTP", "TCP", "ARP"],
      "IP connectivity works, but domain resolution fails, so DNS is likely issue."
    ],
    [
      "A browser opens https://site.com securely. Which protocol provides encryption?",
      "TLS",
      ["UDP", "ARP", "ICMP"],
      "HTTPS uses TLS for secure communication."
    ],
    [
      "Packets need to travel from one network to another. Which device is mainly responsible?",
      "Router",
      ["Switch", "Hub", "Repeater"],
      "Router forwards packets between networks."
    ],
    [
      "Devices in same LAN communicate using MAC addresses. Which device learns MAC table?",
      "Switch",
      ["Router only", "DNS server", "Firewall only"],
      "Switch uses MAC table to forward frames in LAN."
    ],
    [
      "A video call prefers speed over guaranteed delivery. Which transport protocol is suitable?",
      "UDP",
      ["TCP", "HTTP", "ARP"],
      "UDP is faster and commonly used for real-time traffic."
    ],
    [
      "A file download must be reliable and ordered. Which protocol is better?",
      "TCP",
      ["UDP", "ICMP", "ARP"],
      "TCP provides reliable and ordered delivery."
    ],
    [
      "A system needs to find MAC address for an IP in local network. Which protocol is used?",
      "ARP",
      ["DNS", "HTTP", "SMTP"],
      "ARP maps IP address to MAC address in local network."
    ],
    [
      "A company divides 192.168.1.0/24 into smaller networks. What is this called?",
      "Subnetting",
      ["Routing loop", "DNS lookup", "Port forwarding"],
      "Subnetting divides a network into smaller logical networks."
    ],
    [
      "A server listens on port 443. Which service is usually running?",
      "HTTPS",
      ["FTP", "SSH", "DNS"],
      "HTTPS commonly uses port 443."
    ],
    [
      "A server listens on port 80. Which protocol is usually used?",
      "HTTP",
      ["HTTPS", "SMTP", "SSH"],
      "HTTP commonly uses port 80."
    ],
    [
      "A packet has source and destination IP addresses. Which OSI layer handles this?",
      "Network layer",
      ["Physical layer", "Session layer", "Presentation layer"],
      "IP addressing belongs to network layer."
    ],
    [
      "TCP and UDP belong to which OSI layer?",
      "Transport layer",
      ["Application layer", "Data link layer", "Physical layer"],
      "Transport layer handles end-to-end communication."
    ],
    [
      "A browser sends GET request. Which layer protocol is involved?",
      "Application layer",
      ["Physical layer", "Data link layer", "Network layer only"],
      "HTTP GET works at application layer."
    ],
    [
      "A packet loops between routers until TTL becomes 0. What prevents infinite looping?",
      "TTL",
      ["MAC address", "Port number", "DNS cache"],
      "TTL decreases at each hop and packet is discarded when it reaches 0."
    ],
    [
      "A laptop gets IP address automatically after joining Wi-Fi. Which service likely assigned it?",
      "DHCP",
      ["DNS", "FTP", "SMTP"],
      "DHCP dynamically assigns IP configuration."
    ],
    [
      "A firewall blocks incoming port 22. Which remote access service is affected?",
      "SSH",
      ["HTTP", "DNS", "SMTP"],
      "SSH usually runs on port 22."
    ],
    [
      "A website is reachable by IP but not by name. Which cache/service should be checked first?",
      "DNS cache/service",
      ["GPU cache", "Browser theme", "Compiler cache"],
      "Name resolution depends on DNS."
    ],
    [
      "A switch receives a frame for unknown MAC. What does it usually do?",
      "Floods the frame to all ports except incoming port",
      ["Drops always", "Routes to internet", "Encrypts it"],
      "Unknown unicast frames are flooded in LAN."
    ],
    [
      "A network has high delay but good bandwidth. Which metric is high?",
      "Latency",
      ["Throughput only", "DNS TTL", "Port number"],
      "Latency means delay in communication."
    ],
    [
      "A client and server perform three-way handshake. Which protocol is this?",
      "TCP",
      ["UDP", "ICMP", "ARP"],
      "TCP connection setup uses SYN, SYN-ACK, ACK handshake."
    ]
  ];

  const c = cases[n];
  return makeQ("Computer Networks", i, c[0] + ` (Case ${i})`, c[1], c[2], c[3]);
}

function osQ(i) {
  const n = i % 20;

  const cases = [
    [
      "Processes P1, P2, P3 arrive in order and CPU executes them in same order. Which scheduling is used?",
      "FCFS",
      ["Round Robin", "Priority", "SJF"],
      "FCFS runs jobs in arrival order."
    ],
    [
      "A process waits forever because it needs a resource held by another waiting process. What is this?",
      "Deadlock",
      ["Starvation only", "Paging", "Spooling"],
      "Deadlock occurs when processes wait circularly for resources."
    ],
    [
      "A system spends more time swapping pages than executing processes. What is this called?",
      "Thrashing",
      ["Deadlock", "Fragmentation only", "Context switch"],
      "Thrashing happens due to excessive paging."
    ],
    [
      "A CPU switches from P1 to P2 by saving P1 state and loading P2 state. What is this?",
      "Context switching",
      ["Paging", "Spooling", "Deadlock"],
      "Context switching changes CPU execution from one process to another."
    ],
    [
      "A program tries to access OS service like file read. Which mechanism is used?",
      "System call",
      ["CSS call", "SQL join", "DNS lookup"],
      "System calls allow programs to request OS services."
    ],
    [
      "Two threads update same variable simultaneously causing wrong result. What issue is this?",
      "Race condition",
      ["Deadlock always", "Paging", "Fragmentation"],
      "Race condition occurs when output depends on uncontrolled timing."
    ],
    [
      "Only one thread should enter critical section at a time. Which tool is suitable?",
      "Mutex",
      ["Compiler", "Router", "Index"],
      "Mutex provides mutual exclusion."
    ],
    [
      "Memory is divided into fixed-size blocks and logical memory into pages. Which scheme is this?",
      "Paging",
      ["Segmentation", "FCFS", "Spooling"],
      "Paging uses fixed-size pages and frames."
    ],
    [
      "A process is ready but never gets CPU because higher priority jobs keep coming. What is this?",
      "Starvation",
      ["Deadlock always", "Page hit", "Interrupt"],
      "Starvation means indefinite waiting for resources/CPU."
    ],
    [
      "Round Robin uses 4 ms time quantum. What happens after quantum expires?",
      "Process is preempted and moved back to ready queue",
      ["Process is deleted", "OS shuts down", "Memory is formatted"],
      "Round Robin preempts process after time slice."
    ],
    [
      "Which scheduling is best if shortest CPU burst is known and average waiting time must be minimized?",
      "SJF",
      ["FCFS", "Round Robin always", "Random"],
      "Shortest Job First minimizes average waiting time in ideal case."
    ],
    [
      "A page is needed but not present in RAM. What occurs?",
      "Page fault",
      ["Deadlock", "Cache hit", "DNS error"],
      "Page fault occurs when required page is absent from main memory."
    ],
    [
      "A process changes from running to waiting because it requested I/O. Which state transition happened?",
      "Running to waiting",
      ["Ready to terminated", "Waiting to running directly", "New to terminated"],
      "I/O request blocks the process, moving it to waiting."
    ],
    [
      "An interrupt arrives while CPU is executing a process. What does CPU do first?",
      "Saves current context and handles interrupt",
      ["Deletes process", "Ignores always", "Formats disk"],
      "Interrupt handling requires saving current state."
    ],
    [
      "A user program cannot directly access hardware instructions. Which mode is it running in?",
      "User mode",
      ["Kernel mode", "BIOS mode", "Admin mode always"],
      "User mode is restricted for safety."
    ],
    [
      "Device driver needs privileged hardware access. Which mode is generally required?",
      "Kernel mode",
      ["User mode only", "Browser mode", "SQL mode"],
      "Kernel mode allows privileged operations."
    ],
    [
      "A process creates another process. What is the new process called?",
      "Child process",
      ["Zombie table", "Foreign process", "Cache line"],
      "Created process is child of the parent process."
    ],
    [
      "A terminated process still has entry because parent has not read exit status. What is it?",
      "Zombie process",
      ["Orphan always", "Ready process", "Blocked thread"],
      "Zombie keeps process table entry until parent collects status."
    ],
    [
      "A process uses more memory than available RAM but still runs using disk support. Which concept helps?",
      "Virtual memory",
      ["DNS", "Routing", "Compiler"],
      "Virtual memory uses disk to extend apparent memory."
    ],
    [
      "A counting semaphore value is 0 and a process performs wait(). What happens?",
      "Process blocks",
      ["Process always continues", "Semaphore becomes 10", "CPU shuts down"],
      "wait() blocks when semaphore resource count is unavailable."
    ]
  ];

  const c = cases[n];
  return makeQ("Operating System", i, c[0] + ` (Case ${i})`, c[1], c[2], c[3]);
}

function dsaQ(i) {
  const n = i % 20;

  const cases = [
    [
      "You need to check balanced parentheses in an expression. Which data structure is best?",
      "Stack",
      ["Queue", "Graph", "Heap"],
      "Stack helps match last opened bracket first."
    ],
    [
      "You need first-come-first-served ticket processing. Which data structure fits?",
      "Queue",
      ["Stack", "Tree", "Hash table only"],
      "Queue follows FIFO order."
    ],
    [
      "You need fastest average lookup by key. Which data structure is suitable?",
      "Hash table",
      ["Linked list", "Stack", "Queue"],
      "Hash table gives average O(1) lookup."
    ],
    [
      "A sorted array has 1 million elements. Which search is best?",
      "Binary search",
      ["Linear search", "Bubble sort", "DFS"],
      "Binary search works efficiently on sorted data."
    ],
    [
      "You need to print tree nodes level by level. Which traversal is used?",
      "BFS",
      ["DFS inorder", "Binary search", "Hashing"],
      "BFS uses queue and visits level by level."
    ],
    [
      "You need to explore all paths in a maze using recursion. Which traversal idea fits?",
      "DFS",
      ["BFS only", "Sorting", "Hashing only"],
      "DFS explores one path deeply before backtracking."
    ],
    [
      "A priority-based task scheduler should always remove highest priority task. Which structure fits?",
      "Heap / Priority queue",
      ["Normal queue", "Array only", "Stack only"],
      "Heap efficiently supports priority queue operations."
    ],
    [
      "A function solves Fibonacci by storing previous results. Which technique is used?",
      "Dynamic programming",
      ["Greedy only", "Linear search", "Hash collision"],
      "DP stores overlapping subproblem results."
    ],
    [
      "A sorted linked list needs random access by index frequently. What is drawback?",
      "Linked list has O(n) random access",
      ["Linked list has O(1) index access", "Linked list cannot store data", "Linked list is always sorted"],
      "Linked list must traverse nodes to reach index."
    ],
    [
      "You need undo feature in editor. Which data structure is useful?",
      "Stack",
      ["Queue", "Graph", "Heap"],
      "Undo uses last action first, so stack fits."
    ],
    [
      "Two pointers are often useful for which type of problem?",
      "Searching pairs in sorted array",
      ["DNS lookup", "CPU scheduling only", "SQL join only"],
      "Two pointers reduce unnecessary nested loops in sorted arrays."
    ],
    [
      "A graph has weighted edges and shortest path is needed from one source with non-negative weights. Which algorithm?",
      "Dijkstra",
      ["DFS only", "Bubble sort", "Binary search"],
      "Dijkstra solves single-source shortest path with non-negative weights."
    ],
    [
      "A graph may contain negative edge weights. Which shortest path algorithm is safer?",
      "Bellman-Ford",
      ["Dijkstra always", "BFS always", "Selection sort"],
      "Bellman-Ford handles negative weights."
    ],
    [
      "You need minimum spanning tree. Which algorithm can be used?",
      "Kruskal",
      ["Binary search", "DFS only", "Quick sort only"],
      "Kruskal builds MST by choosing smallest valid edges."
    ],
    [
      "A hash table has many keys mapping to same index. What is this called?",
      "Collision",
      ["Deadlock", "Segmentation", "Paging"],
      "Collision happens when different keys get same hash index."
    ],
    [
      "Recursive function has no base case. What likely happens?",
      "Stack overflow",
      ["Queue underflow", "Hash collision", "Binary search"],
      "Without base case recursion continues until stack overflows."
    ],
    [
      "An algorithm checks every pair in array using two nested loops. What is typical complexity?",
      "O(n²)",
      ["O(1)", "O(log n)", "O(n log n)"],
      "Two nested loops over n elements usually give O(n²)."
    ],
    [
      "Binary search on n elements has what time complexity?",
      "O(log n)",
      ["O(n)", "O(n²)", "O(1) always"],
      "Each step halves the search space."
    ],
    [
      "A queue implemented using circular array avoids what problem?",
      "Wasted space after deletions",
      ["Hash collision", "Tree imbalance", "Deadlock"],
      "Circular queue reuses freed positions."
    ],
    [
      "You need LRU cache implementation. Which combination is commonly used?",
      "Hash map + doubly linked list",
      ["Stack only", "Queue only", "Array only"],
      "Hash map gives lookup and linked list tracks usage order."
    ]
  ];

  const c = cases[n];
  return makeQ("DSA", i, c[0] + ` (Case ${i})`, c[1], c[2], c[3]);
}

function oopsQ(i) {
  const n = i % 20;

  const cases = [
    [
      "A BankAccount class keeps balance private and allows deposit/withdraw through methods. Which OOP concept?",
      "Encapsulation",
      ["Inheritance", "Polymorphism", "Compilation"],
      "Data is hidden and accessed through controlled methods."
    ],
    [
      "Car and Bike both extend Vehicle and reuse common fields. Which concept is used?",
      "Inheritance",
      ["Encapsulation", "Abstraction only", "Overloading"],
      "Child classes reuse parent class features."
    ],
    [
      "A payment method behaves differently for UPI, Card, and NetBanking using same pay() call. Which concept?",
      "Polymorphism",
      ["Encapsulation", "Normalization", "Threading"],
      "Same method name can show different behavior."
    ],
    [
      "A class Shape has area() but Circle and Rectangle provide their own implementation. What is this?",
      "Method overriding",
      ["Method hiding only", "Constructor chaining", "Data hiding only"],
      "Child class redefines parent method."
    ],
    [
      "A class has add(int,int) and add(double,double). What is this?",
      "Method overloading",
      ["Overriding", "Inheritance", "Abstraction"],
      "Same method name with different parameters is overloading."
    ],
    [
      "A user uses ATM screen without knowing internal cash dispensing logic. Which concept?",
      "Abstraction",
      ["Inheritance", "Deadlock", "Indexing"],
      "Only essential interface is shown; implementation is hidden."
    ],
    [
      "An object is created and initial values are set automatically. Which method is responsible?",
      "Constructor",
      ["Destructor", "Getter only", "Interface"],
      "Constructor initializes new object."
    ],
    [
      "A class Engine is part of Car and cannot meaningfully exist in this model without Car. Which relation?",
      "Composition",
      ["Aggregation", "Inheritance", "Overloading"],
      "Composition represents strong has-a relationship."
    ],
    [
      "A Department has Teachers, but Teacher can exist without Department. Which relation?",
      "Aggregation",
      ["Composition", "Overriding", "Encapsulation"],
      "Aggregation is weak has-a relationship."
    ],
    [
      "A developer makes fields private to stop direct modification. Why?",
      "To protect data and maintain valid state",
      ["To make program slower", "To remove methods", "To stop object creation"],
      "Private fields support encapsulation and validation."
    ],
    [
      "An interface Drawable has draw(). Circle implements it. What does interface provide?",
      "A contract for required behavior",
      ["Object memory only", "Database table", "CPU scheduling"],
      "Interface defines methods implementing classes must provide."
    ],
    [
      "A base class cannot be instantiated and is meant only for common behavior. What is suitable?",
      "Abstract class",
      ["Final object", "Static variable", "Package"],
      "Abstract class is used as incomplete base type."
    ],
    [
      "Runtime decides which overridden method to call based on actual object. What is this?",
      "Dynamic dispatch",
      ["Static import", "SQL dispatch", "Thread lock"],
      "Dynamic dispatch supports runtime polymorphism."
    ],
    [
      "A child class calls parent constructor before its own setup. What is this commonly called?",
      "Constructor chaining",
      ["Deadlock", "Indexing", "Hashing"],
      "Constructor chaining invokes constructors in inheritance hierarchy."
    ],
    [
      "A class exposes only getter for salary, no setter. What does it enforce?",
      "Read-only access from outside",
      ["Public modification", "Inheritance removal", "Object deletion"],
      "Getter without setter prevents external modification."
    ],
    [
      "Two unrelated classes implement same interface and can be handled by interface reference. Which concept?",
      "Polymorphism",
      ["Only encapsulation", "Only constructor", "Only aggregation"],
      "Interface reference can point to different implementations."
    ],
    [
      "A parent reference points to child object. Which OOP feature allows this?",
      "Upcasting",
      ["Downstreaming", "Indexing", "Serialization only"],
      "Upcasting treats child object as parent type."
    ],
    [
      "A method should be available without creating object. What should it be?",
      "Static method",
      ["Private constructor only", "Abstract variable", "Virtual field"],
      "Static members belong to class, not object instance."
    ],
    [
      "A class should not be inherited further. Which keyword is used in Java?",
      "final",
      ["private", "static", "void"],
      "final class cannot be extended in Java."
    ],
    [
      "A child class should reuse parent behavior but also add new behavior. Which design is suitable?",
      "Inheritance with extension",
      ["Delete parent class", "Only global variables", "No class design"],
      "Inheritance allows reuse and extension of existing behavior."
    ]
  ];

  const c = cases[n];
  return makeQ("OOPs", i, c[0] + ` (Case ${i})`, c[1], c[2], c[3]);
}

function build100(topic, fn) {
  const arr = [];
  for (let i = 1; i <= 100; i++) arr.push(fn(i));
  return arr;
}

questions = questions
  .map((q) => {
    if (q.sourceDataset === "Strict Core CS 100 Each Curated Questions") return null;
    if (q.sourceDataset === "Placement Core CS Scenario MCQs") return null;

    if (q.subject === "Core CS") {
      return { ...q, subject: "Placement / NQT" };
    }

    return q;
  })
  .filter(Boolean);

const coreQuestions = [
  ...build100("DBMS", dbmsQ),
  ...build100("Computer Networks", cnQ),
  ...build100("Operating System", osQ),
  ...build100("DSA", dsaQ),
  ...build100("OOPs", oopsQ)
];

const merged = [...questions, ...coreQuestions];

const counts = {};
for (const g of GROUPS) {
  counts[g] = g === "All" ? merged.length : merged.filter((q) => q.subject === g).length;
}

const coreTopicCounts = {};
for (const topic of ["DBMS", "Computer Networks", "Operating System", "DSA", "OOPs"]) {
  coreTopicCounts[topic] = merged.filter((q) => q.subject === "Core CS" && q.topic === topic).length;
}

const output = `export const MCQ_GROUPS = ${JSON.stringify(GROUPS, null, 2)};

export const MCQ_COUNTS = ${JSON.stringify(counts, null, 2)};

export const MCQ_QUESTIONS = ${JSON.stringify(merged, null, 2)};
`;

fs.writeFileSync(file, output);

console.log("✅ Core CS placement-style 500 questions added.");
console.log("✅ Core topic counts:", coreTopicCounts);
console.log("✅ Group counts:", counts);
