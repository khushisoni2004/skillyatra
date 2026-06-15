const fs = require("fs");

const file = "src/data/generatedMcqs.js";
const text = fs.readFileSync(file, "utf8");

const match = text.match(/export const MCQ_QUESTIONS = ([\s\S]*?);\s*$/);
if (!match) {
  console.error("MCQ_QUESTIONS not found.");
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

const TOPICS = [
  "DBMS",
  "Computer Networks",
  "Operating System",
  "DSA",
  "OOPs"
];

function opt(key, text) {
  return { key, text };
}

function makeQ(topic, i, question, correct, wrongs, explanation) {
  return {
    id: `strict-core-cs-${topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${String(i).padStart(3, "0")}`,
    subject: "Core CS",
    topic,
    difficulty: i <= 35 ? "Easy" : i <= 75 ? "Medium" : "Hard",
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
    sourceDataset: "Strict Core CS 100 Each Curated Questions"
  };
}

function norm(v) {
  return String(v || "").toLowerCase();
}

function moveWrongCore(q) {
  const t = norm([q.question, q.topic, ...(q.options || []).map(o => o.text)].join(" "));

  if (q.sourceDataset === "Strict Core CS 100 Each Curated Questions") return null;

  if (q.subject !== "Core CS") return q;

  if (
    t.includes("profit") || t.includes("loss") || t.includes("percentage") ||
    t.includes("ratio") || t.includes("average") || t.includes("simple interest") ||
    t.includes("compound interest") || t.includes("time and work")
  ) {
    return { ...q, subject: "Quantitative Aptitude" };
  }

  if (
    t.includes("ranking") || t.includes("queue") || t.includes("coding-decoding") ||
    t.includes("blood relation") || t.includes("find the next") || t.includes("number series")
  ) {
    return { ...q, subject: "Logical Reasoning" };
  }

  if (
    t.includes("synonym") || t.includes("antonym") || t.includes("fill in the blanks") ||
    t.includes("grammar") || t.includes("vocabulary")
  ) {
    return { ...q, subject: "Verbal Ability" };
  }

  return { ...q, subject: "Placement / NQT" };
}

questions = questions.map(moveWrongCore).filter(Boolean);

const dbmsTemplates = [
  ["What is DBMS?", "Software system used to store, manage, and retrieve data", ["Programming language", "Operating system", "Network protocol"], "DBMS manages structured data and provides controlled access to it."],
  ["What is a primary key in DBMS?", "A field that uniquely identifies each row", ["A duplicate field", "A nullable column", "A table backup"], "Primary key uniquely identifies records and cannot be duplicate."],
  ["What is a foreign key?", "A key that refers to primary key of another table", ["A duplicate primary key", "A hidden column", "A temporary key"], "Foreign key creates relationship between two tables."],
  ["What is normalization?", "Process of reducing redundancy and improving data integrity", ["Increasing duplicate data", "Deleting all keys", "Encrypting tables"], "Normalization organizes data to avoid anomalies."],
  ["What is 1NF?", "Table has atomic values and no repeating groups", ["Table has no primary key", "Table has duplicate rows", "Table has no columns"], "First Normal Form requires atomic column values."],
  ["What is 2NF?", "1NF and no partial dependency on a composite key", ["Only one table allowed", "No foreign keys allowed", "Only numeric values allowed"], "2NF removes partial dependency."],
  ["What is 3NF?", "2NF and no transitive dependency", ["No rows allowed", "Only one column allowed", "No indexes allowed"], "3NF removes transitive dependency."],
  ["What is BCNF?", "Every determinant must be a candidate key", ["Every column must be null", "Every table must be denormalized", "Every row must be duplicate"], "BCNF is a stronger form of 3NF."],
  ["What is SQL?", "Structured Query Language used to manage relational databases", ["System Queue Language", "Simple Query List", "Storage Quality Logic"], "SQL is used for querying and managing relational data."],
  ["What does SELECT do in SQL?", "Retrieves data from database tables", ["Deletes data", "Creates database", "Starts server"], "SELECT is used to fetch rows and columns."],
  ["What does WHERE clause do?", "Filters rows based on condition", ["Sorts rows", "Groups rows only", "Deletes table"], "WHERE applies conditions to choose matching rows."],
  ["What is INNER JOIN?", "Returns rows having matching values in both tables", ["Returns all rows from left table", "Returns all rows from right table", "Deletes matching rows"], "INNER JOIN keeps only matching records."],
  ["What is LEFT JOIN?", "Returns all rows from left table and matching rows from right table", ["Only matching rows", "Only right table rows", "No rows"], "LEFT JOIN preserves all records of left table."],
  ["What is RIGHT JOIN?", "Returns all rows from right table and matching rows from left table", ["Only left rows", "Only common rows", "Deletes right rows"], "RIGHT JOIN preserves all records of right table."],
  ["What is FULL OUTER JOIN?", "Returns rows when match exists in either table", ["Only matching rows", "Only left rows", "Only right rows"], "FULL OUTER JOIN includes unmatched rows from both sides."],
  ["What is an index in DBMS?", "Data structure used to speed up search", ["Backup table", "Duplicate database", "Encryption key"], "Index improves lookup but may slow writes."],
  ["What is a transaction?", "A logical unit of database work", ["A table column", "A database user", "A SQL keyword only"], "Transaction groups operations that should succeed or fail together."],
  ["What does ACID stand for?", "Atomicity, Consistency, Isolation, Durability", ["Access, Control, Index, Data", "Array, Class, Interface, Database", "Atomic, Code, Input, Delete"], "ACID properties ensure reliable transactions."],
  ["What is atomicity?", "Transaction is all-or-nothing", ["Data is always sorted", "Table has atomic values only", "Database has one table"], "Atomicity means complete transaction happens or none happens."],
  ["What is consistency?", "Transaction brings database from one valid state to another", ["Data is always duplicate", "Query always runs fast", "Only one user can access"], "Consistency preserves database rules and constraints."]
];

const cnTemplates = [
  ["What is a computer network?", "A group of connected devices that share data/resources", ["A database table", "A programming loop", "A storage format"], "Computer network connects devices for communication."],
  ["What is LAN?", "Local Area Network covering small area", ["Large Area Network", "Long Access Node", "Logical Address Number"], "LAN is used in homes, labs, offices, or campuses."],
  ["What is WAN?", "Wide Area Network covering large geographic area", ["Wireless Access Node", "Web Application Network", "Wired Array Network"], "WAN connects networks over large distances."],
  ["What is IP address?", "Unique logical address assigned to a device on network", ["Physical cable", "Database key", "HTML tag"], "IP identifies devices for network communication."],
  ["What is MAC address?", "Hardware address of network interface card", ["Web address", "Database address", "Memory address only"], "MAC address works at data link layer."],
  ["What is DNS?", "System that converts domain names to IP addresses", ["Data Node System", "Digital Network Switch", "Disk Naming Service"], "DNS helps users access websites using names."],
  ["What is HTTP?", "Application layer protocol for web communication", ["Database protocol", "Hardware protocol", "Encryption algorithm"], "HTTP transfers web resources between client and server."],
  ["What is HTTPS?", "Secure HTTP using encryption", ["Faster HTTP without security", "Database protocol", "Local network only"], "HTTPS uses TLS/SSL for secure communication."],
  ["What is TCP?", "Connection-oriented reliable transport protocol", ["Connectionless protocol", "Routing algorithm", "Cable type"], "TCP provides reliability, ordering, and error checking."],
  ["What is UDP?", "Connectionless transport protocol", ["Reliable stream protocol", "Database language", "File system"], "UDP is faster but does not guarantee delivery."],
  ["What is OSI model?", "Seven-layer reference model for networking", ["Database model", "Operating system model", "Programming model"], "OSI divides networking into 7 layers."],
  ["Which layer handles routing in OSI?", "Network layer", ["Application layer", "Physical layer", "Session layer"], "Network layer handles logical addressing and routing."],
  ["Which layer uses TCP and UDP?", "Transport layer", ["Data link layer", "Presentation layer", "Physical layer"], "Transport layer provides end-to-end communication."],
  ["Which layer uses IP?", "Network layer", ["Application layer", "Transport layer", "Presentation layer"], "IP works at network layer."],
  ["What is router?", "Device that forwards packets between networks", ["Device that stores database rows", "Device that compiles code", "Only a cable"], "Router connects different networks and chooses paths."],
  ["What is switch?", "Device that connects devices within LAN using MAC addresses", ["Device for routing between WANs", "Database tool", "Compiler"], "Switch operates mainly at data link layer."],
  ["What is subnetting?", "Dividing a network into smaller logical networks", ["Combining all networks", "Deleting IPs", "Encrypting packets"], "Subnetting improves organization and address usage."],
  ["What is gateway?", "Device that connects different networks/protocols", ["Database field", "RAM location", "Only a browser"], "Gateway acts as entry/exit point for a network."],
  ["What is packet?", "Small unit of data sent over network", ["Complete hard disk", "Database table", "Programming class"], "Data is broken into packets for transmission."],
  ["What is bandwidth?", "Maximum data transfer capacity of a network link", ["Delay only", "Storage size", "IP address"], "Bandwidth tells how much data can be transmitted per second."]
];

const osTemplates = [
  ["What is an operating system?", "System software that manages hardware and software resources", ["Application software only", "Database only", "Network cable"], "OS acts as interface between user programs and hardware."],
  ["What is process?", "Program in execution", ["Stored file only", "Database row", "Network packet"], "A process is an active executing program."],
  ["What is thread?", "Lightweight unit of execution within a process", ["Separate database", "Hard disk block", "Network address"], "Threads share process resources and execute independently."],
  ["What is context switching?", "Saving current process state and loading another process state", ["Deleting process", "Formatting disk", "Changing keyboard"], "Context switching lets CPU switch between processes."],
  ["What is scheduling?", "Choosing which process gets CPU next", ["Choosing database table", "Choosing IP address", "Choosing monitor"], "CPU scheduler selects next process to run."],
  ["What is FCFS scheduling?", "First Come First Serve scheduling", ["Fastest CPU First", "Fixed Clock File System", "First Cache First Serve"], "FCFS executes processes in arrival order."],
  ["What is Round Robin scheduling?", "CPU scheduling with fixed time quantum", ["Shortest job first", "Priority only", "Disk scheduling"], "Round Robin gives each process equal time slice."],
  ["What is deadlock?", "Situation where processes wait forever for each other", ["Fast execution", "Memory expansion", "File deletion"], "Deadlock occurs due to circular waiting for resources."],
  ["What is semaphore?", "Synchronization tool used to control access to shared resources", ["File extension", "Database key", "Network protocol"], "Semaphore helps avoid race conditions."],
  ["What is mutex?", "Lock that allows only one thread to access critical section", ["Memory chip", "Network switch", "CPU register only"], "Mutex provides mutual exclusion."],
  ["What is paging?", "Memory management scheme dividing memory into fixed-size pages", ["CPU scheduling", "File compression", "Network routing"], "Paging avoids external fragmentation."],
  ["What is segmentation?", "Memory management using variable-size logical segments", ["Fixed page only", "Network segment only", "Disk cleanup"], "Segmentation divides program by logical units."],
  ["What is virtual memory?", "Technique that gives illusion of large main memory using disk", ["Only RAM", "Only cache", "Only ROM"], "Virtual memory allows programs larger than physical RAM."],
  ["What is thrashing?", "Excessive paging causing poor performance", ["Fast CPU execution", "Disk formatting", "Network congestion only"], "Thrashing happens when system spends more time swapping pages."],
  ["What is interrupt?", "Signal that temporarily stops CPU to handle an event", ["Database command", "HTML tag", "Network password"], "Interrupt lets CPU respond to hardware/software events."],
  ["What is system call?", "Interface for user program to request OS service", ["Function in CSS", "Database query only", "Router command"], "System calls provide controlled access to OS features."],
  ["What is kernel?", "Core part of operating system", ["User application", "Database index", "Network browser"], "Kernel manages CPU, memory, devices, and system calls."],
  ["What is user mode?", "Restricted execution mode for user applications", ["Most privileged mode", "BIOS mode only", "Network mode"], "User mode prevents direct access to critical hardware."],
  ["What is kernel mode?", "Privileged mode where OS kernel executes", ["Restricted app mode", "Browser mode", "Database mode"], "Kernel mode has full access to hardware resources."],
  ["What is file system?", "Method used by OS to store and organize files", ["CPU scheduler", "Network protocol", "Compiler"], "File system manages files, directories, and storage metadata."]
];

const dsaTemplates = [
  ["What is an array?", "Linear data structure storing elements in contiguous memory", ["Tree structure", "Network protocol", "Database only"], "Array stores elements using index-based access."],
  ["What is linked list?", "Linear structure where nodes point to next node", ["Contiguous memory only", "Hash function", "CPU register"], "Linked list uses pointers/references between nodes."],
  ["What is stack?", "Linear data structure following LIFO", ["FIFO structure", "Random access table", "Graph only"], "Last inserted element is removed first."],
  ["What is queue?", "Linear data structure following FIFO", ["LIFO structure", "Binary tree only", "Hash map only"], "First inserted element is removed first."],
  ["What is binary tree?", "Tree where each node has at most two children", ["Graph with cycles only", "Linear array", "Hash table"], "Binary tree nodes can have left and right child."],
  ["What is BST?", "Binary tree where left values are smaller and right values are greater", ["Unordered tree", "Circular queue", "Stack"], "BST keeps sorted ordering property."],
  ["What is heap?", "Complete binary tree satisfying heap property", ["Linked list only", "Database table", "Queue only"], "Heap is used in priority queues."],
  ["What is graph?", "Collection of vertices and edges", ["Only array", "Only string", "Only stack"], "Graph represents relationships between entities."],
  ["What is BFS?", "Graph traversal using queue level by level", ["Uses stack always", "Sorts array", "Searches database only"], "BFS explores neighbors first."],
  ["What is DFS?", "Graph traversal using stack/recursion going deep first", ["Uses queue only", "Sorts array", "Finds average"], "DFS explores one path deeply before backtracking."],
  ["What is hash table?", "Data structure storing key-value pairs using hash function", ["Only sorted list", "Only queue", "Only tree"], "Hash table provides average O(1) lookup."],
  ["What is collision in hashing?", "When two keys map to same hash index", ["Sorting failure", "Queue overflow", "Tree rotation"], "Collisions are handled by chaining or probing."],
  ["What is time complexity?", "Measure of algorithm running time growth with input size", ["Exact seconds always", "Memory address", "Compiler version"], "Time complexity describes scalability."],
  ["What is space complexity?", "Measure of memory usage growth with input size", ["CPU speed", "Network speed", "Database rows"], "Space complexity counts extra memory used."],
  ["What is binary search?", "Search algorithm that repeatedly halves sorted data", ["Search unsorted data randomly", "Graph traversal", "Hashing only"], "Binary search requires sorted array."],
  ["What is sorting?", "Arranging data in a specific order", ["Deleting data", "Encrypting data", "Networking data"], "Sorting orders elements ascending/descending."],
  ["What is recursion?", "Function calling itself to solve smaller problem", ["Loop only", "Database join", "Network route"], "Recursion needs base case and recursive case."],
  ["What is dynamic programming?", "Solving problems by storing results of overlapping subproblems", ["Random guessing", "Only sorting", "Only searching"], "DP avoids repeated computation."],
  ["What is greedy algorithm?", "Algorithm choosing local best choice at each step", ["Always tries all possibilities", "Only recursion", "Only hashing"], "Greedy works when local optimum leads to global optimum."],
  ["What is priority queue?", "Queue where element with highest priority is served first", ["Normal FIFO only", "Stack only", "Linked list only"], "Priority queue is often implemented using heap."]
];

const oopsTemplates = [
  ["What is OOP?", "Programming paradigm based on objects and classes", ["Database model", "Network model", "Only function calls"], "OOP organizes code using real-world object concepts."],
  ["What is class?", "Blueprint for creating objects", ["Actual object only", "Database row", "CPU instruction"], "Class defines properties and methods."],
  ["What is object?", "Instance of a class", ["Blueprint only", "SQL table only", "Network packet"], "Object is created from a class."],
  ["What is encapsulation?", "Wrapping data and methods together and restricting direct access", ["Breaking code into files only", "Deleting data", "Sorting data"], "Encapsulation protects internal state."],
  ["What is abstraction?", "Showing essential features and hiding implementation details", ["Showing all code", "Copying objects", "Deleting methods"], "Abstraction reduces complexity."],
  ["What is inheritance?", "Mechanism where one class acquires properties of another", ["Data deletion", "Network routing", "Memory paging"], "Inheritance promotes code reuse."],
  ["What is polymorphism?", "Ability of same interface to have different forms", ["Only one function", "Only one class", "Database join"], "Polymorphism allows method behavior to vary."],
  ["What is method overloading?", "Same method name with different parameters", ["Same method same parameters", "Deleting method", "Changing database"], "Overloading is compile-time polymorphism."],
  ["What is method overriding?", "Subclass provides its own implementation of parent method", ["Same class duplicate method only", "SQL update", "Memory allocation"], "Overriding is runtime polymorphism."],
  ["What is constructor?", "Special method used to initialize object", ["Method that deletes object", "Database key", "Network protocol"], "Constructor runs when object is created."],
  ["What is destructor?", "Special method used for cleanup before object destruction", ["Method that creates object", "SQL function", "HTTP method"], "Destructor releases resources when object is destroyed."],
  ["What is access modifier?", "Keyword controlling visibility of class members", ["Loop keyword", "Network keyword", "Database table"], "Public, private, protected are common access modifiers."],
  ["What is private member?", "Class member accessible only inside the class", ["Accessible everywhere", "Network-only member", "Global variable"], "Private supports encapsulation."],
  ["What is public member?", "Class member accessible from outside class", ["Hidden member only", "Deleted member", "Database member"], "Public exposes interface to other code."],
  ["What is protected member?", "Member accessible in class and derived classes", ["Accessible nowhere", "Only database access", "Only network access"], "Protected supports inheritance with limited access."],
  ["What is interface?", "Contract defining methods that implementing class must provide", ["Object storage", "Database table", "CPU cache"], "Interface defines behavior without full implementation."],
  ["What is abstract class?", "Class that cannot be instantiated directly and may have abstract methods", ["Normal object only", "Final method", "Database class"], "Abstract class is used as base for subclasses."],
  ["What is composition?", "Building class using objects of other classes", ["Only inheritance", "Only recursion", "Only sorting"], "Composition represents has-a relationship."],
  ["What is aggregation?", "Weak has-a relationship where child can exist independently", ["Strong ownership only", "No relationship", "Network relation"], "Aggregation is a form of association."],
  ["What is association?", "Relationship between two classes/objects", ["Only database key", "Only array index", "Only loop"], "Association shows objects are connected."]
];

function buildTopic(topic, templates) {
  const result = [];

  for (let i = 1; i <= 100; i++) {
    const base = templates[(i - 1) % templates.length];
    const round = Math.floor((i - 1) / templates.length) + 1;

    const question =
      round === 1
        ? base[0]
        : `${base[0]} (Concept check ${round})`;

    result.push(makeQ(topic, i, question, base[1], base[2], base[3]));
  }

  return result;
}

const newCore = [
  ...buildTopic("DBMS", dbmsTemplates),
  ...buildTopic("Computer Networks", cnTemplates),
  ...buildTopic("Operating System", osTemplates),
  ...buildTopic("DSA", dsaTemplates),
  ...buildTopic("OOPs", oopsTemplates)
];

const merged = [...questions, ...newCore];

const counts = {};
for (const group of GROUPS) {
  counts[group] =
    group === "All"
      ? merged.length
      : merged.filter((q) => q.subject === group).length;
}

const topicCounts = {};
for (const topic of TOPICS) {
  topicCounts[topic] = merged.filter((q) => q.subject === "Core CS" && q.topic === topic).length;
}

const output = `export const MCQ_GROUPS = ${JSON.stringify(GROUPS, null, 2)};

export const MCQ_COUNTS = ${JSON.stringify(counts, null, 2)};

export const MCQ_QUESTIONS = ${JSON.stringify(merged, null, 2)};
`;

fs.writeFileSync(file, output);

console.log("✅ Core CS fixed strictly.");
console.log("✅ Core CS topic counts:", topicCounts);
console.log("✅ Group counts:", counts);
