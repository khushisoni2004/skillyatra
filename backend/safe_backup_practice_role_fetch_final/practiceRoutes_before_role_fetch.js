const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const DATASET_INDEX = path.join(__dirname, "../data/mcqQuestionIndex.json");
const PROGRESS_FILE = path.join(__dirname, "../data/progressStore.json");

function q(subject, topic, question, options, answer) {
  return { subject, topic, question, options, answer };
}

const MANUAL_BANK = [
  q("Quantitative Aptitude", "Percentage", "What percentage is 75 of 300?", ["25%", "20%", "30%", "15%"], "A"),
  q("Quantitative Aptitude", "Percentage", "If 40% of a number is 80, what is the number?", ["160", "180", "200", "220"], "C"),
  q("Quantitative Aptitude", "Profit and Loss", "A shopkeeper buys an item for 500 and sells it for 600. Find profit percentage.", ["10%", "15%", "20%", "25%"], "C"),
  q("Quantitative Aptitude", "Average", "Average of 10, 20, 30 and 40 is:", ["20", "25", "30", "35"], "B"),
  q("Quantitative Aptitude", "Ratio", "Ratio of 20 to 50 is:", ["2:5", "5:2", "1:5", "4:5"], "A"),
  q("Quantitative Aptitude", "Speed Distance", "A train covers 120 km in 2 hours. What is the speed?", ["40 km/h", "50 km/h", "60 km/h", "70 km/h"], "C"),
  q("Quantitative Aptitude", "Interest", "Simple interest on 1000 at 10% for 2 years is:", ["100", "150", "200", "250"], "C"),
  q("Quantitative Aptitude", "Time and Work", "A can complete a work in 10 days and B in 20 days. Together they complete it in:", ["5.67 days", "6.67 days", "7.67 days", "8.67 days"], "B"),
  q("Quantitative Aptitude", "Mensuration", "Area of rectangle with length 12 and breadth 5 is:", ["17", "34", "60", "120"], "C"),
  q("Quantitative Aptitude", "Probability", "Probability of getting head when one coin is tossed is:", ["1/4", "1/2", "1", "0"], "B"),

  q("Logical Reasoning", "Series", "Find the next number: 2, 4, 8, 16, ?", ["24", "30", "32", "36"], "C"),
  q("Logical Reasoning", "Series", "Find the next number: 3, 6, 12, 24, ?", ["36", "42", "48", "54"], "C"),
  q("Logical Reasoning", "Coding Decoding", "If CAT is coded as DBU, then DOG is coded as:", ["EPH", "EOG", "FQI", "CPH"], "A"),
  q("Logical Reasoning", "Coding Decoding", "If BOOK is coded as CPPL, then PEN is coded as:", ["QFO", "QEN", "PDO", "RFO"], "A"),
  q("Logical Reasoning", "Coding Decoding", "If ROAD is coded as URDG, then LAMP is coded as:", ["ODPS", "MBNQ", "KZLO", "NCOQ"], "A"),
  q("Logical Reasoning", "Coding Decoding", "If TABLE is coded as ELBAT, then CHAIR is coded as:", ["RIAHC", "CHAIR", "RIHAC", "RAIHC"], "A"),
  q("Logical Reasoning", "Coding Decoding", "If A = 1, B = 2, C = 3, then code value of CAB is:", ["6", "7", "5", "8"], "A"),
  q("Logical Reasoning", "Coding Decoding", "In a code, MONDAY is written as NPOEBZ. How is SUNDAY written?", ["TVOEBZ", "RTOCZX", "TVOECZ", "TVPEBZ"], "A"),
  q("Logical Reasoning", "Coding Decoding", "If FISH is coded as GJTI, then BIRD is coded as:", ["CJSE", "CJRD", "AJQC", "DKTF"], "A"),
  q("Logical Reasoning", "Coding Decoding", "If SKY is coded as 19-11-25, then SUN is coded as:", ["19-21-14", "18-20-13", "20-22-15", "19-20-14"], "A"),
  q("Logical Reasoning", "Direction Sense", "A person walks north, then turns right. Which direction is he facing?", ["North", "South", "East", "West"], "C"),
  q("Logical Reasoning", "Blood Relation", "A is B's father. B is C's sister. A is C's:", ["Brother", "Father", "Uncle", "Son"], "B"),
  q("Logical Reasoning", "Clock", "At 3:00, angle between hour and minute hand is:", ["60°", "75°", "90°", "120°"], "C"),
  q("Logical Reasoning", "Calendar", "If today is Monday, what day will it be after 10 days?", ["Wednesday", "Thursday", "Friday", "Saturday"], "B"),

  q("Verbal Ability", "Grammar", "Choose the correct sentence.", ["He go to school", "He goes to school", "He going school", "He gone school"], "B"),
  q("Verbal Ability", "Synonym", "Synonym of happy is:", ["Sad", "Joyful", "Angry", "Weak"], "B"),
  q("Verbal Ability", "Antonym", "Antonym of strong is:", ["Powerful", "Weak", "Hard", "Tough"], "B"),
  q("Verbal Ability", "Vocabulary", "Choose the correctly spelled word.", ["Definately", "Definitely", "Definetly", "Definatly"], "B"),
  q("Verbal Ability", "Grammar", "Fill in the blank: She ____ going to college.", ["is", "are", "am", "were"], "A"),

  q("Programming", "DSA", "Which data structure follows LIFO?", ["Queue", "Stack", "Array", "Graph"], "B"),
  q("Programming", "DSA", "Which data structure follows FIFO?", ["Stack", "Queue", "Tree", "Heap"], "B"),
  q("Programming", "Complexity", "Time complexity of binary search is:", ["O(n)", "O(log n)", "O(n²)", "O(1)"], "B"),
  q("Programming", "OOPs", "Which OOP concept allows same function name with different behavior?", ["Inheritance", "Polymorphism", "Encapsulation", "Abstraction"], "B"),
  q("Programming", "Python", "Which Python data type stores key-value pairs?", ["List", "Tuple", "Dictionary", "Set"], "C"),
  q("Programming", "JavaScript", "Which keyword declares a block-scoped variable in JavaScript?", ["var", "let", "define", "int"], "B"),
  q("Programming", "Recursion", "Recursion means:", ["Function calling itself", "Loop only", "Database query", "CSS styling"], "A"),
  q("Programming", "C++", "Which keyword is used to create a class in C++?", ["object", "class", "struct only", "define"], "B"),

  q("React", "React", "Which hook is used to manage state in React?", ["useState", "useEffect", "useMemo", "useRef"], "A"),
  q("React", "React", "Which hook is used for side effects in React?", ["useState", "useEffect", "useRef", "useCallback"], "B"),
  q("React", "React", "Props in React are used to:", ["Pass data to component", "Store database", "Start server", "Compile CSS"], "A"),
  q("React", "React", "React uses Virtual DOM mainly to:", ["Improve UI update efficiency", "Store passwords", "Create database", "Run backend"], "A"),

  q("Backend", "Backend", "What is the main purpose of REST API?", ["Client-server communication using HTTP", "Styling web pages", "Compiling Java", "Creating images"], "A"),
  q("Backend", "Backend", "Which HTTP method is used to fetch data?", ["GET", "POST", "PUT", "DELETE"], "A"),
  q("Backend", "Backend", "Which HTTP method is used to create a resource?", ["GET", "POST", "PATCH", "DELETE"], "B"),
  q("Backend", "Backend", "Which package is commonly used to create a Node.js server?", ["Express.js", "React", "Tailwind", "NumPy"], "A"),
  q("Backend", "Backend", "JWT is mainly used for:", ["Authentication", "Styling", "Image compression", "Database indexing only"], "A"),
  q("Backend", "Backend", "MongoDB stores data mainly in:", ["Documents", "Rows only", "CSS files", "Binary trees only"], "A"),
  q("Backend", "Backend", "CORS is used to:", ["Control cross-origin requests", "Create schema", "Encrypt password", "Render component"], "A"),
  q("Backend", "Backend", "bcrypt is used for:", ["Password hashing", "CSS styling", "Image rendering", "Sorting array"], "A"),
  q("Backend", "Backend", "CRUD stands for:", ["Create Read Update Delete", "Compile Run Upload Deploy", "Cache Route Use Delete", "Create Render Update Debug"], "A"),
  q("Backend", "Backend", "Status code 404 means:", ["Resource not found", "Success", "Server error", "Unauthorized"], "A"),


  q("Core CS", "OS", "What is an operating system?", ["System software that manages hardware and software resources", "Application software", "Database software", "Network cable"], "A"),
  q("Core CS", "OS", "Which scheduling algorithm gives each process a fixed time quantum?", ["Round Robin", "FCFS", "SJF", "Priority Scheduling"], "A"),
  q("Core CS", "OS", "What is context switching?", ["Switching CPU from one process to another", "Changing database", "Changing password", "Changing IP address"], "A"),
  q("Core CS", "OS", "Which memory management technique divides memory into fixed-size pages?", ["Paging", "Segmentation", "Hashing", "Indexing"], "A"),
  q("Core CS", "OS", "What is virtual memory?", ["Technique that gives illusion of larger memory using disk", "Only RAM", "Only cache", "Only ROM"], "A"),
  q("Core CS", "OS", "What is a semaphore?", ["Synchronization tool used to control access to shared resources", "File type", "Network device", "Database table"], "A"),
  q("Core CS", "OS", "What is mutual exclusion?", ["Only one process enters critical section at a time", "All processes run together", "No process runs", "Memory allocation"], "A"),
  q("Core CS", "OS", "Which condition is necessary for deadlock?", ["Mutual exclusion", "Compilation", "Indexing", "Routing"], "A"),
  q("Core CS", "OS", "What is starvation in OS?", ["A process waits for a long time due to resource allocation issues", "CPU stops forever", "RAM becomes empty", "Disk is formatted"], "A"),
  q("Core CS", "OS", "What is thrashing?", ["Excessive paging causing low CPU utilization", "High network speed", "Fast compilation", "Database backup"], "A"),
  q("Core CS", "OS", "What is FCFS scheduling?", ["First Come First Serve scheduling", "Fast CPU Fast Scheduling", "File Control File System", "First Cache First Serve"], "A"),
  q("Core CS", "OS", "What is SJF scheduling?", ["Shortest Job First scheduling", "Simple Job Format", "System Job File", "Shortest Java Function"], "A"),
  q("Core CS", "OS", "What is a critical section?", ["Code section where shared resources are accessed", "Compiler section", "Database section", "Network section"], "A"),
  q("Core CS", "OS", "What is process synchronization?", ["Coordination of processes accessing shared resources", "Changing process name", "Deleting process", "Creating database"], "A"),
  q("Core CS", "OS", "What is segmentation?", ["Memory management technique dividing process into variable-size segments", "Sorting technique", "Routing method", "Hash function"], "A"),
  q("Core CS", "OS", "What is a system call?", ["Interface through which a program requests OS service", "Database call", "API styling call", "Frontend function"], "A"),
  q("Core CS", "OS", "What is kernel in operating system?", ["Core part of OS that manages system resources", "Machine learning function", "CSS class", "Database row"], "A"),
  q("Core CS", "OS", "What is ready queue?", ["Queue of processes waiting for CPU allocation", "Queue of database rows", "Queue of files", "Queue of routers"], "A"),
  q("Core CS", "OS", "What is demand paging?", ["Loading pages into memory only when required", "Loading all files", "Deleting pages", "Sorting pages"], "A"),
  q("Core CS", "OS", "What is interrupt?", ["Signal that temporarily stops CPU execution to handle an event", "Database error", "CSS property", "Network cable"], "A"),

  q("Core CS", "OS", "What is a process?", ["Program in execution", "Only a file", "Database row", "Network cable"], "A"),
  q("Core CS", "OS", "What is a thread?", ["Lightweight execution unit", "Hard disk", "Compiler", "Database"], "A"),
  q("Core CS", "OS", "Deadlock occurs when:", ["Processes wait forever for resources", "CPU becomes faster", "Memory empty", "Network starts"], "A"),
  q("Core CS", "OS", "Round Robin scheduling uses:", ["Time quantum", "Stack pointer", "IP address", "Primary key"], "A"),
  q("Core CS", "OS", "Paging is used for:", ["Memory management", "Password hashing", "API routing", "CSS loading"], "A"),

  q("Core CS", "DBMS", "What does DBMS stand for?", ["Database Management System", "Data Backup System", "Digital Binary System", "Database Machine Software"], "A"),
  q("Core CS", "DBMS", "Which key uniquely identifies a row?", ["Primary key", "Foreign key", "Index only", "Candidate value"], "A"),
  q("Core CS", "DBMS", "Foreign key is used to:", ["Create relationship between tables", "Encrypt table", "Delete all rows", "Create frontend route"], "A"),
  q("Core CS", "DBMS", "Normalization is used to:", ["Reduce redundancy", "Increase duplicate data", "Create UI", "Compile SQL"], "A"),
  q("Core CS", "DBMS", "ACID stands for:", ["Atomicity Consistency Isolation Durability", "Accuracy Control Index Data", "Array Code Insert Delete", "Atomic Class Integer Data"], "A"),

  q("Core CS", "Computer Network", "How many layers are there in OSI model?", ["7", "5", "4", "6"], "A"),
  q("Core CS", "Computer Network", "TCP is a:", ["Connection-oriented protocol", "Connectionless protocol", "Database protocol", "Encryption protocol"], "A"),
  q("Core CS", "Computer Network", "DNS is used to:", ["Convert domain names to IP addresses", "Encrypt passwords", "Create tables", "Compile code"], "A"),
  q("Core CS", "Computer Network", "Router is used to:", ["Forward packets between networks", "Store rows", "Run hooks", "Hash passwords"], "A"),

  q("Core CS", "Computer Architecture", "Which unit performs arithmetic and logical operations in CPU?", ["ALU", "RAM", "Cache", "Bus"], "A"),
  q("Core CS", "Computer Architecture", "What is cache memory used for?", ["Fast access to frequently used data", "Permanent file storage", "Routing packets", "User authentication"], "A"),
  q("Core CS", "Computer Architecture", "What is pipelining?", ["Overlapping instruction execution stages", "Creating database tables", "Routing packets", "Styling web pages"], "A"),
  q("Core CS", "Computer Architecture", "RISC architecture mainly uses:", ["Simple fixed-length instructions", "Complex variable instructions only", "No registers", "Only memory operations"], "A")
,

  q("Core CS", "Computer Network", "What is the main function of DNS?", ["Converts domain names into IP addresses", "Encrypts passwords", "Stores files", "Runs programs"], "A"),
  q("Core CS", "Computer Network", "Which layer of OSI model handles routing?", ["Network Layer", "Transport Layer", "Session Layer", "Application Layer"], "A"),
  q("Core CS", "Computer Network", "TCP stands for:", ["Transmission Control Protocol", "Transfer Control Process", "Terminal Control Protocol", "Transmission Code Protocol"], "A"),
  q("Core CS", "Computer Network", "UDP is mainly used when:", ["Speed is more important than reliability", "Reliability is always required", "Only files are transferred", "Only emails are sent"], "A"),
  q("Core CS", "Computer Network", "What is an IP address?", ["Logical address used to identify a device on a network", "Physical CPU address", "Database key", "Password"], "A"),
  q("Core CS", "Computer Network", "What does a router do?", ["Forwards packets between different networks", "Stores database rows", "Compiles code", "Displays web pages"], "A"),
  q("Core CS", "Computer Network", "What does a switch do?", ["Connects devices within a LAN using MAC addresses", "Connects different databases", "Encrypts files", "Runs operating system"], "A"),
  q("Core CS", "Computer Network", "Which protocol is used to automatically assign IP addresses?", ["DHCP", "DNS", "FTP", "SMTP"], "A"),
  q("Core CS", "Computer Network", "HTTP mainly works at which OSI layer?", ["Application Layer", "Physical Layer", "Data Link Layer", "Network Layer"], "A"),
  q("Core CS", "Computer Network", "HTTPS is secure because it uses:", ["TLS/SSL encryption", "Only DNS", "Only UDP", "Only ARP"], "A"),
  q("Core CS", "Computer Network", "What is the purpose of ARP?", ["Maps IP address to MAC address", "Maps domain to IP", "Encrypts packets", "Compresses files"], "A"),
  q("Core CS", "Computer Network", "ICMP is commonly used by:", ["ping command", "SQL query", "CSS styling", "React rendering"], "A"),
  q("Core CS", "Computer Network", "What is subnetting?", ["Dividing a network into smaller logical networks", "Joining two databases", "Deleting packets", "Encrypting data"], "A"),
  q("Core CS", "Computer Network", "Which protocol is used for sending emails?", ["SMTP", "FTP", "HTTP", "ARP"], "A"),
  q("Core CS", "Computer Network", "Which protocol is used for file transfer?", ["FTP", "SMTP", "DNS", "ICMP"], "A"),
  q("Core CS", "Computer Network", "What is NAT used for?", ["Translating private IP addresses to public IP addresses", "Creating files", "Running CPU", "Managing memory"], "A"),
  q("Core CS", "Computer Network", "What is bandwidth?", ["Maximum data transfer capacity of a network link", "Delay in CPU", "Database size", "Memory speed"], "A"),
  q("Core CS", "Computer Network", "What is latency?", ["Delay in data transmission", "Storage capacity", "CPU frequency", "File size"], "A"),
  q("Core CS", "Computer Network", "TCP connection establishment uses:", ["Three-way handshake", "Two-way encryption", "One-way routing", "Four-way DNS"], "A"),
  q("Core CS", "Computer Network", "What is a MAC address?", ["Physical address of a network interface", "Logical IP address", "Database address", "Memory address"], "A"),
  q("Core CS", "Computer Network", "Which device works mainly at Data Link Layer?", ["Switch", "Router", "Gateway", "Proxy Server"], "A"),
  q("Core CS", "Computer Network", "Which device works mainly at Network Layer?", ["Router", "Hub", "Switch only", "Repeater only"], "A"),
  q("Core CS", "Computer Network", "What is a firewall?", ["Security system that filters network traffic", "Database system", "Compiler tool", "Memory manager"], "A"),
  q("Core CS", "Computer Network", "LAN stands for:", ["Local Area Network", "Large Area Node", "Logical Access Network", "Local Access Number"], "A"),
  q("Core CS", "Computer Network", "WAN stands for:", ["Wide Area Network", "Wireless Access Node", "Web Area Number", "Wide Access Name"], "A"),
  q("Core CS", "Computer Network", "What is packet switching?", ["Data is divided into packets and sent independently", "Data is sent only as one file", "Data is deleted", "Data is stored in RAM"], "A"),

];

function clean(v) {
  return String(v || "").replace(/\s+/g, " ").trim();
}

function low(v) {
  return clean(v).toLowerCase();
}

function hasAny(text, words) {
  return words.some((word) => text.includes(word));
}

function normalizeAnswer(raw, options) {
  const a = low(raw);

  if (["a", "1", "option a"].includes(a)) return "A";
  if (["b", "2", "option b"].includes(a)) return "B";
  if (["c", "3", "option c"].includes(a)) return "C";
  if (["d", "4", "option d"].includes(a)) return "D";

  const found = options.find((o) => low(o.text) === a);
  return found ? found.key : "";
}

function normalizeManual(item, index) {
  return {
    id: `manual-${index + 1}`,
    subject: item.subject,
    topic: item.topic,
    question: item.question,
    options: item.options.map((text, i) => ({
      key: ["A", "B", "C", "D"][i],
      text
    })),
    answer: item.answer,
    explanation: "",
    sourceDataset: "Manual Placement Bank"
  };
}

function classifySubject(question) {
  const text = low(question);

  if (hasAny(text, ["react", "jsx", "usestate", "useeffect", "usememo", "useref", "props", "component", "virtual dom", "react router", "redux"])) return "React";

  if (hasAny(text, ["node.js", "node js", "express", "rest api", "api endpoint", "jwt", "bcrypt", "cors", "middleware", "mongodb", "mongoose", "http method", "status code", "crud", "stateless service", "stateful service", "serverless", "load balancer", "microservice"])) return "Backend";

  if (hasAny(text, [
    "percentage", "percent", "profit", "loss", "ratio", "average",
    "simple interest", "compound interest", "time and work", "speed",
    "distance", "train", "area", "volume", "probability", "cost price",
    "selling price", "marked price", "discount", "mixture", "pipe",
    "tank", "angles", "triangle", "rectangle", "square", "semicircle",
    "sum of digits", "sum of ap", "larger", "net change", "increased by",
    "decreased by", "litres", "km/h", "work in", "together"
  ])) return "Quantitative Aptitude";

  if (hasAny(text, [
    "series", "find the next", "blood relation", "direction",
    "coded as", "coding decoding", "syllogism", "clock", "calendar",
    "seating arrangement", "arrangement", "queue", "ranking",
    "opposite", "circle", "sit in a circle"
  ])) return "Logical Reasoning";

  if (hasAny(text, ["grammar", "synonym", "antonym", "vocabulary", "sentence", "opposite in meaning", "comprehension"])) return "Verbal Ability";

  if (hasAny(text, ["python", "java ", "c++", "javascript", "array", "string", "loop", "function", "recursion", "oops", "class", "inheritance", "polymorphism", "lambda", "dataclass", "decorator"])) return "Programming";

  if (hasAny(text, ["operating system", "process", "thread", "deadlock", "paging", "kernel", "dbms", "primary key", "foreign key", "normalization", "tcp", "osi", "network", "compiler", "data structure", "algorithm", "random forest", "svm", "knn", "machine learning", "cache memory", "alu", "pipelining", "risc"])) return "Core CS";

  return "Placement / NQT";
}

function classifyTopic(question, subject) {
  const text = low(question);

  if (subject === "Core CS") {
    if (hasAny(text, ["random forest", "svm", "knn", "machine learning", "neural network", "softmax", "naive bayes", "classifier", "pca"])) return "Machine Learning";
    if (hasAny(text, ["dbms", "database", "primary key", "foreign key", "normalization", "acid"])) return "DBMS";
    if (hasAny(text, ["operating system", "what is a process", "what is a thread", "deadlock", "paging", "round robin", "scheduling", "context switching", "virtual memory", "semaphore", "critical section", "thrashing", "system call", "kernel in operating system"])) return "OS";
    if (hasAny(text, ["tcp", "osi", "network", "subnet", "dns", "router", "ip address"])) return "Computer Network";
    if (hasAny(text, ["architecture", "cache", "alu", "pipelining", "risc", "register"])) return "Computer Architecture";
    if (hasAny(text, ["data structure", "algorithm", "binary tree", "balanced tree"])) return "DSA";
    return "Core CS";
  }

  if (subject === "Logical Reasoning") {
    if (hasAny(text, ["coded as", "coding"])) return "Coding Decoding";
    if (hasAny(text, ["series", "find the next"])) return "Series";
    if (hasAny(text, ["blood"])) return "Blood Relation";
    if (hasAny(text, ["direction"])) return "Direction Sense";
    if (hasAny(text, ["clock"])) return "Clock";
    if (hasAny(text, ["calendar"])) return "Calendar";
    return "Logical Reasoning";
  }

  return subject;
}

function isCleanQuestion(question, subject, topic) {
  const text = low(question);

  const badEverywhere = [
    "hana",
    "sap",
    "abap",
    "cvss",
    "jotai",
    "jest",
    "rtl",
    "k8s",
    "kubernetes",
    "terraform",
    "workload class",
    "material valuation",
    "partner function",
    "function group",
    "remote function call",
    "rfc",
    "j2ee",
    "netweaver",
    "class-balanced",
    "object detection",
    "kernel density estimation",
    "data preprocessing",
    "stratified k-fold",
    "data leakage",
    "missing value imputation",
    "type casting",
    "cosign",
    "aws graviton",
    "process costing",
    "dialog work process",
    "update work process",
    "design a distributed",
    "develop a machine learning model",
    "implement google",
    "hard",
    "sapui5",
    "openui5",
    "fiori",
    "transaction ",
    "sales order",
    "delivery document",
    "billing document",
    "purchase organization",
    "warehouse",
    "vendor",
    "material",
    "cloudwatch",
    "azure monitor",
    "vault agent",
    "prometheus",
    "grafana",
    "thanos",
    "velero",
    "kubectl",
    "docker-compose",
    "github actions",
    "pipeline",
    "deployment",
    "canary",
    "gitops",
    "apm",
    "slo",
    "sla",
    "sre",
    "finops",
    "oauth",
    "xss",
    "session fixation",
    "cookie",
    "seo",
    "foreign currency",
    "foreign currency revaluation",
    "evaluated receipt settlement",
    "ers",
    "fifo valuation",
    "lifo valuation",
    "inventory valuation",
    "goods receipt",
    "vendor invoice",
    "revaluation",
    "stock overview",
    "material valuation",
    "sales area",
    "sales document",
    "delivery priority",
    "pricing procedure",
    "shipping point",
    "billing",
    "warehouse",
    "purchase order",
    "procurement",
    "sap kernel",
    "rolling kernel switch",
    "convolutional layer",
    "gamma parameter",
    "rbf kernel"
  ];

  if (hasAny(text, badEverywhere)) return false;

  if (subject === "Programming") {
    const allowed = ["python", "java ", "c++", "javascript", "closure", "this keyword", "lambda function", "decorator", "dataclass", "virtual environment", "garbage collection", "module", "f-string", "recursion", "oops", "class", "inheritance", "polymorphism"];
    const bad = ["aws lambda", "softmax", "sigmoid", "naive bayes", "classifier", "classification", "class weight", "machine learning", "react", "hook", "usestate", "useeffect", "usecallback", "usereducer", "weakens the argument", "find the odd one", "binary tree", "balanced tree", "kth largest"];
    return hasAny(text, allowed) && !hasAny(text, bad);
  }

  if (subject === "Backend") {
    const bad = ["random forest", "isolation forest", "svm", "knn", "nearest centroid", "pca", "machine learning", "react route", "nested route", "layout route", "userouteerror"];
    return !hasAny(text, bad);
  }

  if (subject === "Computer Network" || topic === "Computer Network") {
    return hasAny(text, ["tcp", "osi", "network", "subnet", "dns", "router", "ip address"]);
  }

  if (topic === "OS") {
    return hasAny(text, [
      "operating system",
      "what is a process",
      "what is a thread",
      "deadlock",
      "paging",
      "round robin",
      "scheduling",
      "context switching",
      "virtual memory",
      "semaphore",
      "mutual exclusion",
      "critical section",
      "starvation",
      "thrashing",
      "segmentation",
      "system call",
      "ready queue",
      "demand paging",
      "interrupt",
      "kernel in operating system",
      "core part of os"
    ]);
  }

  if (subject === "Core CS") {
    if (topic === "DBMS") {
      return hasAny(text, ["dbms", "database", "primary key", "foreign key", "normalization", "acid", "sql", "join"]);
    }

    if (topic === "Computer Network") {
      return hasAny(text, ["tcp", "osi", "network", "subnet", "dns", "router", "ip address", "packet"]);
    }

    if (topic === "Computer Architecture") {
      return hasAny(text, ["architecture", "cache memory", "cache", "alu", "pipelining", "risc", "cisc", "register", "instruction"]);
    }

    if (topic === "Machine Learning") {
      return hasAny(text, ["auc", "roc", "svm", "knn", "random forest", "neural network", "pca", "classifier", "classification", "silhouette", "cluster"]);
    }

    if (topic === "DSA") {
      return hasAny(text, ["binary tree", "balanced tree", "heap", "dynamic programming", "big o", "algorithm", "data structure", "time complexity"]);
    }

    return false;
  }

  return true;
}


function strictSubject(question, fallbackSubject) {
  const text = low(question);
  const padded = " " + text.replace(/[^a-z0-9+#.]/g, " ") + " ";

  // React / frontend UI questions
  if (hasAny(text, [
    "react", "jsx", "usestate", "useeffect", "usememo", "useref",
    "usecallback", "usereducer", "usedeferredvalue", "useimperativehandle",
    "hook dependency", "dependency array", "hook would you use",
    "props", "component", "virtual dom", "react router", "redux",
    "render()", "render function", "rendering", "forwardref",
    "controlled component", "uncontrolled component"
  ])) return "React";

  // Backend / server / security / API
  if (hasAny(text, [
    "aws lambda", "serverless", "stateless service", "stateful service",
    "microservice", "load balancer", "api gateway", "restful api",
    "rest api", "web server", "apache", "nginx", "cookie", "oauth",
    "xss", "csrf", "session fixation", "authentication", "authorization",
    "jwt", "bcrypt", "cors", "middleware", "mongodb", "mongoose",
    "express", "node.js", "node js", "http request", "http response",
    "status code", "crud"
  ])) return "Backend";

  // Logical reasoning
  if (hasAny(text, [
    "weakens the argument", "strengthens the argument", "assumption",
    "conclusion follows", "find the odd one", "odd one out",
    "number series", "letter series", "find the next", "blood relation",
    "direction", "coded as", "coding decoding", "syllogism", "clock",
    "calendar", "seating arrangement", "ranking", "queue"
  ])) return "Logical Reasoning";

  // Verbal
  if (hasAny(text, [
    "grammar", "synonym", "antonym", "vocabulary", "opposite in meaning",
    "similar in meaning", "sentence correction", "reading comprehension",
    "idiom", "phrase"
  ])) return "Verbal Ability";

  // Quantitative aptitude - avoid ratio inside saturation
  if (
    hasAny(text, [
      "percentage", "percent", "profit", "loss", "average",
      "simple interest", "compound interest", "time and work",
      "speed", "distance", "train", "area of", "volume of",
      "cost price", "selling price", "marked price", "discount",
      "mixture", "litres", "km/h", "work in", "together they",
      "sum of ap", "sum of digits", "net change", "increased by",
      "decreased by", "depreciated", "original price", "value after",
      "find the value of", "value of x", "x²", "log₂", "diagonal",
      "row sums", "matrix values", "equal roots", "quadratic",
      "data sufficiency"
    ]) ||
    padded.includes(" ratio ") ||
    padded.includes(" probability ") ||
    padded.includes(" triangle ") ||
    padded.includes(" rectangle ") ||
    padded.includes(" square ")
  ) return "Quantitative Aptitude";

  // Core CS / ML / DSA
  if (hasAny(text, [
    "sigmoid", "softmax", "naive bayes", "classifier", "classification",
    "class weight", "class-balanced", "machine learning", "random forest",
    "isolation forest", "svm", "knn", "nearest centroid", "neural network",
    "pca", "gradient descent", "binary tree", "balanced tree",
    "kth largest", "heap", "dynamic programming", "big o notation",
    "time complexity", "data structure", "algorithm", "operating system",
    "process", "thread", "deadlock", "paging", "kernel", "dbms",
    "primary key", "foreign key", "normalization", "tcp", "osi",
    "dns", "router", "subnet", "computer architecture", "cache memory",
    "alu", "pipelining", "risc", "cisc"
  ])) return "Core CS";

  // Programming language only
  if (hasAny(text, [
    "python", "java ", "javascript", "c++", "closure", "this keyword",
    "lambda function", "decorator", "dataclass", "virtual environment",
    "garbage collection", "module", "f-string", "str() function",
    "int() function", "pass in python", "class in c++", "polymorphism",
    "inheritance", "recursion", "function to check"
  ])) return "Programming";

  return fallbackSubject || "Placement / NQT";
}

function strictTopic(question, subject, fallbackTopic) {
  const text = low(question);

  if (subject === "Core CS") {
    if (hasAny(text, [
      "sigmoid", "softmax", "naive bayes", "classifier", "classification",
      "class weight", "machine learning", "random forest", "isolation forest",
      "svm", "knn", "nearest centroid", "neural network", "pca"
    ])) return "Machine Learning";

    if (hasAny(text, [
      "binary tree", "balanced tree", "kth largest", "heap",
      "dynamic programming", "big o notation", "data structure",
      "algorithm", "time complexity"
    ])) return "DSA";

    if (hasAny(text, ["dbms", "database", "primary key", "foreign key", "normalization", "acid", "sql"])) return "DBMS";
    if (hasAny(text, ["operating system", "what is a process", "what is a thread", "deadlock", "paging", "round robin", "scheduling", "context switching", "virtual memory", "semaphore", "critical section", "thrashing", "system call", "kernel in operating system"])) return "OS";
    if (hasAny(text, ["tcp", "osi", "network", "subnet", "dns", "router", "ip address"])) return "Computer Network";
    if (hasAny(text, ["architecture", "cache", "alu", "pipelining", "risc", "cisc", "register"])) return "Computer Architecture";

    return "Core CS";
  }

  if (subject === "Logical Reasoning") {
    if (hasAny(text, ["coded as", "coding decoding"])) return "Coding Decoding";
    if (hasAny(text, ["series", "find the next"])) return "Series";
    if (hasAny(text, ["blood"])) return "Blood Relation";
    if (hasAny(text, ["direction"])) return "Direction Sense";
    if (hasAny(text, ["clock"])) return "Clock";
    if (hasAny(text, ["calendar"])) return "Calendar";
    return "Logical Reasoning";
  }

  if (subject === "Programming") {
    if (hasAny(text, ["python", "lambda", "decorator", "dataclass", "f-string", "module", "virtual environment"])) return "Python";
    if (hasAny(text, ["javascript", "closure", "this keyword"])) return "JavaScript";
    if (hasAny(text, ["c++"])) return "C++";
    if (hasAny(text, ["polymorphism", "inheritance", "class"])) return "OOPs";
    return "Programming";
  }

  return fallbackTopic || subject;
}

function readDatasetQuestions() {
  try {
    if (!fs.existsSync(DATASET_INDEX)) return [];

    const data = JSON.parse(fs.readFileSync(DATASET_INDEX, "utf8"));
    const rows = Array.isArray(data.questions) ? data.questions : [];

    return rows.map((row, index) => {
      const question = clean(row.question || row.Question || row.prompt || row.title);
      if (!question || question.length < 8) return null;

      let options = row.options || [];
      if (!Array.isArray(options)) return null;

      options = options.map((opt, i) => {
        if (typeof opt === "string") return { key: ["A", "B", "C", "D"][i], text: clean(opt) };
        return {
          key: clean(opt.key || ["A", "B", "C", "D"][i]).toUpperCase(),
          text: clean(opt.text || opt.value || opt.label)
        };
      }).filter((o) => o.key && o.text).slice(0, 4);

      if (options.length < 4) return null;

      const answer = normalizeAnswer(row.answer || row.correctAnswer || row.correct_answer || row.correct, options);
      if (!answer) return null;

      const subject = strictSubject(question, classifySubject(question));
      const topic = strictTopic(question, subject, classifyTopic(question, subject));

      if (!isCleanQuestion(question, subject, topic)) return null;

      return {
        id: clean(row.id || `dataset-${index + 1}`),
        subject,
        topic,
        question,
        options,
        answer,
        explanation: clean(row.explanation || ""),
        sourceDataset: clean(row.sourceDataset || row.source || "Dataset")
      };
    }).filter(Boolean);
  } catch {
    return [];
  }
}

function allQuestions() {
  const dataset = readDatasetQuestions();
  const manual = MANUAL_BANK.map(normalizeManual);
  const seen = new Set();

  return [...dataset, ...manual].filter((q) => {
    const key = low(q.question);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function publicQuestion(q) {
  return {
    id: q.id,
    subject: q.subject,
    topic: q.topic,
    question: q.question,
    options: q.options,
    sourceDataset: q.sourceDataset
  };
}


function isStrictCoreCSOnly(q) {
  const t = low((q.question || "") + " " + (q.topic || "") + " " + (q.subject || ""));

  const bad = [
    "depreciated", "original price", "value after", "data sufficiency",
    "value of x", "find value of", "find the value", "x²", "log₂",
    "quadratic", "equal roots", "row sums", "matrix values",
    "useferredvalue", "usedeferredvalue", "useref", "usememo",
    "usecallback", "hook", "react", "jsx", "component",
    "foreign currency", "revaluation", "ers", "evaluated receipt settlement",
    "fifo", "lifo", "valuation", "goods receipt", "vendor invoice",
    "sap", "hana", "fiori", "sales", "billing", "warehouse", "material"
  ];

  if (hasAny(t, bad)) return false;

  const good = [
    "operating system", "process", "thread", "deadlock", "paging",
    "scheduling", "round robin", "semaphore", "critical section",
    "virtual memory", "system call", "interrupt", "cache memory",
    "computer architecture", "pipelining", "risc", "cisc", "register",
    "alu", "dbms", "database", "normalization", "primary key",
    "foreign key", "sql", "join", "acid", "computer network",
    "tcp", "udp", "osi", "dns", "router", "ip address", "subnet",
    "data structure", "algorithm", "big o", "time complexity",
    "stack", "queue", "tree", "graph", "heap", "dynamic programming"
  ];

  if (String(q.sourceDataset || "").toLowerCase().includes("manual")) return true;
  return hasAny(t, good);
}


function isStrictComputerNetworkOnly(q) {
  const t = low((q.question || "") + " " + (q.topic || "") + " " + (q.subject || ""));

  const bad = [
    "seating", "sit in a circle", "opposite faces", "dice", "die placed",
    "coded as", "shift cipher", "preposition", "choose the correct",
    "cosine annealing", "cosine similarity", "false positive", "p-value",
    "auc", "roc", "kernel", "sap", "hana", "sales", "billing",
    "foreign currency", "valuation", "fifo", "lifo", "ers"
  ];
  if (hasAny(t, bad)) return false;

  const good = [
    "computer network", "network", "tcp", "udp", "ip", "ipv4", "ipv6",
    "osi", "dns", "router", "switch", "hub", "subnet", "subnetting",
    "packet", "frame", "mac address", "arp", "icmp", "http", "https",
    "ftp", "smtp", "dhcp", "nat", "port number", "bandwidth",
    "latency", "congestion", "three-way handshake", "firewall",
    "gateway", "topology", "lan", "wan", "vpn"
  ];

  if (String(q.sourceDataset || "").toLowerCase().includes("manual")) return true;
  return hasAny(t, good);
}

function isStrictCoreCSOnlyFinal(q) {
  const t = low((q.question || "") + " " + (q.topic || "") + " " + (q.subject || ""));

  const bad = [
    "seating", "sit in a circle", "opposite faces", "dice", "die placed",
    "coded as", "shift cipher", "choose the correct preposition",
    "preposition", "grammar", "synonym", "antonym", "cosine annealing",
    "cosine similarity", "false positive", "p-value", "design a scalable",
    "optimize a global", "satellite communication", "notification system",
    "foreign currency", "valuation", "fifo", "lifo", "ers", "sap", "hana",
    "sales", "billing", "warehouse", "material", "procurement",
    "depreciated", "original price", "value after", "value of x",
    "find value", "log₂", "matrix values", "row sums"
  ];

  if (hasAny(t, bad)) return false;

  const good = [
    "operating system", "process", "thread", "deadlock", "paging",
    "scheduling", "round robin", "semaphore", "critical section",
    "virtual memory", "system call", "interrupt",
    "dbms", "database", "normalization", "primary key", "foreign key",
    "sql", "join", "acid",
    "computer architecture", "cache memory", "pipelining", "risc", "cisc",
    "register", "alu", "instruction",
    "computer network", "tcp", "udp", "osi", "dns", "router", "subnet",
    "data structure", "algorithm", "big o", "time complexity",
    "stack", "queue", "tree", "graph", "heap", "dynamic programming"
  ];

  if (String(q.sourceDataset || "").toLowerCase().includes("manual")) return true;
  return hasAny(t, good);
}

router.get("/questions", (req, res) => {
  const group = clean(req.query.group || "All");
  const search = low(req.query.search || "");
  const limit = Number(req.query.limit || 0);

  const all = allQuestions();
  let questions = [...all];

  if (group !== "All") {
    questions = questions.filter((q) => q.subject === group || q.topic === group);
  }

  if (search) {
    questions = questions.filter((q) =>
      low(q.question).includes(search) ||
      low(q.subject).includes(search) ||
      low(q.topic).includes(search)
    );
  }

  
  if (group === "Computer Network") {
    questions = questions.filter(isStrictComputerNetworkOnly);
  }

if (group === "Core CS") {
    questions = questions.filter(isStrictCoreCSOnlyFinal);
  }


  const fixedGroups = [
    "All",
    "Quantitative Aptitude",
    "Logical Reasoning",
    "Coding Decoding",
    "Verbal Ability",
    "Placement / NQT",
    "Programming",
    "React",
    "Backend",
    "Core CS",
    "OS",
    "DBMS",
    "Computer Network",
    "Computer Architecture",
    "Machine Learning",
    "DSA"
  ];

  const counts = {};
  for (const name of fixedGroups) {
    counts[name] = name === "All"
      ? all.length
      : all.filter((q) => q.subject === name || q.topic === name).length;
  }

  res.json({
    ok: true,
    total: all.length,
    groups: fixedGroups,
    counts,
    questions: (limit > 0 ? questions.slice(0, limit) : questions)
      .sort((a, b) =>
        String(a.subject).localeCompare(String(b.subject)) ||
        String(a.topic).localeCompare(String(b.topic)) ||
        String(a.question).localeCompare(String(b.question))
      )
      .map(publicQuestion)
  });
});

router.post("/answer", (req, res) => {
  const { id, selected } = req.body || {};
  const question = allQuestions().find((q) => String(q.id) === String(id));

  if (!question) {
    return res.status(404).json({ ok: false, message: "Question not found." });
  }

  const correctAnswer = clean(question.answer).toUpperCase();
  const selectedAnswer = clean(selected).toUpperCase();
  const isCorrect = selectedAnswer === correctAnswer;

  try {
    let store = { activities: [] };

    if (fs.existsSync(PROGRESS_FILE)) {
      store = JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf8"));
    }

    store.activities = [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        itemType: "MCQ Answer",
        section: "Practice MCQs",
        topic: question.subject,
        status: isCorrect ? "correct" : "wrong",
        score: isCorrect ? 1 : 0,
        total: 1,
        correct: isCorrect ? 1 : 0,
        createdAt: new Date().toISOString()
      },
      ...(store.activities || [])
    ].slice(0, 500);

    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(store, null, 2));
  } catch {}

  res.json({
    ok: true,
    id: question.id,
    selected: selectedAnswer,
    correctAnswer,
    isCorrect
  });
});

module.exports = router;
