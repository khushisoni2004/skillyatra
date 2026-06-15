import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles
} from "lucide-react";

const ROLE_QUESTIONS = {
  "Software Developer": [
    ["Programming Basics", "Which concept allows a function to call itself?", ["Encapsulation", "Recursion", "Compilation", "Indexing"], "Recursion"],
    ["OOP", "Which OOP concept hides internal implementation details?", ["Inheritance", "Abstraction", "Polymorphism", "Looping"], "Abstraction"],
    ["Arrays", "What is the time complexity of accessing an array element by index?", ["O(1)", "O(n)", "O(log n)", "O(n log n)"], "O(1)"],
    ["Strings", "Which data structure is commonly used for character frequency counting?", ["Queue", "Hash Map", "Stack", "Tree"], "Hash Map"],
    ["Linked List", "What does the last node of a singly linked list point to?", ["Head", "Null", "Previous node", "Random node"], "Null"],
    ["Stack", "Which principle does a stack follow?", ["FIFO", "LIFO", "Random", "Sorted"], "LIFO"],
    ["Queue", "Which principle does a queue follow?", ["LIFO", "FIFO", "Binary", "Hashing"], "FIFO"],
    ["Searching", "Binary search works efficiently on which type of data?", ["Unsorted data", "Sorted data", "Encrypted data", "Random data"], "Sorted data"],
    ["Sorting", "Which sorting algorithm uses divide and conquer?", ["Bubble Sort", "Merge Sort", "Selection Sort", "Insertion Sort"], "Merge Sort"],
    ["Hashing", "What is the average lookup time in a hash map?", ["O(1)", "O(n)", "O(n²)", "O(log n)"], "O(1)"],
    ["Recursion", "What is required to stop infinite recursion?", ["Base case", "Loop", "Object", "Pointer"], "Base case"],
    ["Trees", "Which traversal visits left, root, and right?", ["Preorder", "Inorder", "Postorder", "Level order"], "Inorder"],
    ["Graphs", "Which algorithm is commonly used for shortest path in an unweighted graph?", ["DFS", "BFS", "Merge Sort", "Binary Search"], "BFS"],
    ["Dynamic Programming", "DP is mainly used when problems have overlapping subproblems and what else?", ["Sorting only", "Optimal substructure", "No recursion", "Only strings"], "Optimal substructure"],
    ["Greedy", "Greedy algorithms make which type of choice at every step?", ["Random choice", "Local best choice", "Last choice", "Backtracking choice"], "Local best choice"],
    ["DBMS", "Which SQL command is used to retrieve data?", ["INSERT", "UPDATE", "SELECT", "DELETE"], "SELECT"],
    ["Operating System", "Which condition may occur when processes wait forever for resources?", ["Paging", "Deadlock", "Indexing", "Caching"], "Deadlock"],
    ["Computer Networks", "HTTP works mainly at which layer?", ["Application layer", "Physical layer", "Data link layer", "Network layer"], "Application layer"],
    ["API", "REST APIs commonly exchange data in which format?", ["JPEG", "JSON", "MP3", "EXE"], "JSON"],
    ["Git", "Which command is used to save staged changes?", ["git push", "git commit", "git clone", "git init"], "git commit"],
    ["Complexity", "Which notation describes worst-case complexity?", ["Big-O", "Big-M", "Small-X", "Fast-O"], "Big-O"],
    ["Testing", "Unit testing checks which part of software?", ["Whole company", "Small individual units", "Only UI", "Only database"], "Small individual units"],
    ["Debugging", "A breakpoint is used to do what?", ["Stop execution at a point", "Delete code", "Compile CSS", "Create database"], "Stop execution at a point"],
    ["Project", "In project explanation, what should be clearly explained?", ["Only color", "Architecture and features", "Only logo", "Only font"], "Architecture and features"],
    ["Resume", "For software roles, resume should highlight what?", ["Random hobbies only", "Projects and technical skills", "Only address", "Only school name"], "Projects and technical skills"],
    ["Interview", "Which subject is commonly asked in software developer interviews?", ["DBMS", "Painting", "Cooking", "Singing"], "DBMS"],
    ["Coding", "Two pointer technique is commonly used on which structures?", ["Arrays and strings", "Images only", "Audio only", "Files only"], "Arrays and strings"],
    ["System Design", "Scalability means the system can handle what?", ["More load/users", "Only one user", "No data", "Only offline work"], "More load/users"],
    ["Security", "Passwords should be stored using what?", ["Plain text", "Hashing", "Screenshot", "Local image"], "Hashing"],
    ["Deployment", "A deployed web app is accessible through what?", ["Public URL", "Only notebook", "Only terminal", "Only zip file"], "Public URL"]
  ],

  "Frontend Developer": [
    ["HTML", "Which tag is used for navigation links?", ["nav", "section", "footer", "aside"], "nav"],
    ["HTML Forms", "Which input type is used for email validation?", ["text", "email", "password", "number"], "email"],
    ["CSS", "Which property controls spacing inside an element?", ["margin", "padding", "border-radius", "opacity"], "padding"],
    ["CSS", "Which property controls spacing outside an element?", ["padding", "margin", "display", "color"], "margin"],
    ["Flexbox", "Which CSS value enables flex layout?", ["display: flex", "position: flex", "grid: flex", "align: flex"], "display: flex"],
    ["Grid", "Which CSS layout is best for two-dimensional layouts?", ["Flexbox", "Grid", "Float", "Inline"], "Grid"],
    ["Responsive", "Which CSS rule is used for responsive breakpoints?", ["@media", "@route", "@state", "@render"], "@media"],
    ["JavaScript", "Which keyword declares a block-scoped variable?", ["var", "let", "global", "fixed"], "let"],
    ["JavaScript", "Which method transforms every array item?", ["map", "push", "pop", "shift"], "map"],
    ["JavaScript", "Which method filters array elements?", ["filter", "join", "split", "slice"], "filter"],
    ["DOM", "Which method selects an element by CSS selector?", ["querySelector", "map", "fetch", "parseInt"], "querySelector"],
    ["Events", "Which event fires when a button is clicked?", ["onClick", "onLoadOnly", "onPush", "onBuild"], "onClick"],
    ["Async JS", "Which syntax is used to wait for a promise?", ["await", "pause", "sleep", "delay"], "await"],
    ["Fetch", "Which function is commonly used to call APIs in browser JS?", ["fetch", "scan", "read", "open"], "fetch"],
    ["React", "React UI is built using what?", ["Components", "Tables only", "Images only", "SQL only"], "Components"],
    ["React Props", "Props are used to pass what?", ["Data to components", "Database password", "CSS file only", "Server port"], "Data to components"],
    ["React State", "Which hook manages component state?", ["useState", "useFetch", "useClass", "useRoute"], "useState"],
    ["React Effects", "Which hook runs side effects?", ["useEffect", "useStyle", "useHTML", "useSQL"], "useEffect"],
    ["React Router", "Which component creates navigation links?", ["Link", "ButtonOnly", "AnchorMap", "RouteStyle"], "Link"],
    ["Tailwind", "Tailwind CSS mainly uses what?", ["Utility classes", "Only IDs", "Only images", "Only tables"], "Utility classes"],
    ["Forms", "Controlled input value is usually stored in what?", ["React state", "CSS file", "HTML comment", "Image folder"], "React state"],
    ["Validation", "Frontend validation improves what?", ["User input quality", "Computer RAM only", "Keyboard size", "Monitor color"], "User input quality"],
    ["Performance", "Lazy loading helps improve what?", ["Initial loading speed", "Font spelling", "Database schema", "Logo size"], "Initial loading speed"],
    ["Accessibility", "Alt text is used for what?", ["Image accessibility", "API security", "Database backup", "Sorting"], "Image accessibility"],
    ["Browser", "localStorage stores data where?", ["Browser", "MongoDB only", "CSS file", "Router only"], "Browser"],
    ["Deployment", "React frontend is commonly deployed on which platform?", ["Vercel", "Mongo shell", "Postman", "Excel"], "Vercel"],
    ["UI", "A consistent color system improves what?", ["User experience", "CPU voltage", "Hard disk format", "API port"], "User experience"],
    ["Debugging", "Browser developer tools help inspect what?", ["HTML/CSS/console", "Only food", "Only hardware", "Only keyboard"], "HTML/CSS/console"],
    ["Interview", "Which topic is very important for frontend interviews?", ["JavaScript", "Plumbing", "Drawing", "Farming"], "JavaScript"],
    ["Project", "Frontend project should show what clearly?", ["Responsive UI and API integration", "Only file size", "Only zip name", "Only random text"], "Responsive UI and API integration"]
  ],

  "Backend Developer": [
    ["Backend Basics", "Backend mainly handles what?", ["Server logic", "Only button color", "Only font", "Only image crop"], "Server logic"],
    ["Node.js", "Node.js is built on which engine?", ["V8", "React", "Mongo", "Tailwind"], "V8"],
    ["Express", "Express is mainly used to build what?", ["APIs", "Images", "Fonts", "Spreadsheets"], "APIs"],
    ["REST", "Which HTTP method is used to create data?", ["POST", "GET", "DELETE", "PATCH"], "POST"],
    ["REST", "Which HTTP method is used to read data?", ["GET", "POST", "PUT", "DROP"], "GET"],
    ["Middleware", "Middleware runs when?", ["Between request and response", "After laptop shutdown", "Only in CSS", "Only in HTML"], "Between request and response"],
    ["MongoDB", "MongoDB stores data as what?", ["Documents", "Rows only", "Slides", "Images only"], "Documents"],
    ["Mongoose", "Mongoose schemas define what?", ["Data structure", "Button size", "Screen brightness", "Git branch"], "Data structure"],
    ["Validation", "Request validation checks what?", ["Input data", "Logo color", "RAM speed", "Folder icon"], "Input data"],
    ["Auth", "JWT is commonly used for what?", ["Authentication", "Image editing", "CSS animation", "File compression"], "Authentication"],
    ["Security", "Passwords should be hashed using what?", ["bcrypt", "plain text", "console.log", "HTML"], "bcrypt"],
    ["CORS", "CORS controls what?", ["Cross-origin requests", "Database indexes", "CSS colors", "File names"], "Cross-origin requests"],
    ["Env", "Secrets should be stored in which file?", [".env", "README only", "index.html", "style.css"], ".env"],
    ["Status Code", "Which status code means success?", ["200", "404", "500", "301"], "200"],
    ["Status Code", "Which status code means not found?", ["404", "200", "201", "100"], "404"],
    ["Error Handling", "Global error handler gives what?", ["Consistent error response", "Font size", "Button shadow", "Image filter"], "Consistent error response"],
    ["Pagination", "Pagination helps by reducing what?", ["Large response load", "Page color", "File extension", "Keyboard input"], "Large response load"],
    ["Search", "Backend search commonly uses what?", ["Query parameters", "CSS only", "Image alt text", "HTML tag only"], "Query parameters"],
    ["Indexing", "Database index improves what?", ["Query speed", "Button color", "Screen size", "Logo height"], "Query speed"],
    ["Caching", "Caching helps avoid what?", ["Repeated heavy calls", "HTML rendering", "CSS styling", "Keyboard typing"], "Repeated heavy calls"],
    ["File Upload", "Multer is used for what?", ["File uploads", "Routing links", "CSS grid", "Database backup only"], "File uploads"],
    ["Testing", "Postman is used to test what?", ["APIs", "Photos", "Fonts", "Songs"], "APIs"],
    ["Deployment", "Backend can be deployed on which platform?", ["Render", "Canva", "Notepad", "Preview"], "Render"],
    ["Database", "A collection belongs to which database type here?", ["MongoDB", "Photoshop", "CSS", "Vite"], "MongoDB"],
    ["Architecture", "Routes, controllers, models improve what?", ["Code organization", "Laptop battery", "Screen brightness", "Mouse speed"], "Code organization"],
    ["Rate Limit", "Rate limiting protects from what?", ["Too many requests", "Slow CSS", "Wrong font", "Image blur"], "Too many requests"],
    ["API Docs", "API documentation should include what?", ["Endpoint and request/response", "Only screenshot", "Only logo", "Only color"], "Endpoint and request/response"],
    ["Logging", "Logs are useful for what?", ["Debugging", "Cooking", "Painting", "Typing speed"], "Debugging"],
    ["Interview", "Which topic is common in backend interviews?", ["Authentication", "Makeup", "Drawing", "Music"], "Authentication"],
    ["Project", "Backend project should clearly show what?", ["APIs, auth, database", "Only home page", "Only image", "Only text"], "APIs, auth, database"]
  ],

  "MERN Stack Developer": [
    ["MERN", "MERN stands for MongoDB, Express, React and what?", ["Node", "Next only", "NumPy", "Nginx only"], "Node"],
    ["MongoDB", "MongoDB is used as which layer?", ["Database", "CSS", "UI library", "Browser extension"], "Database"],
    ["Express", "Express handles which part?", ["Backend routes", "React state", "CSS colors", "Images only"], "Backend routes"],
    ["React", "React handles which part?", ["Frontend UI", "Mongo indexes", "Server port", "Password hash"], "Frontend UI"],
    ["Node", "Node.js runs JavaScript where?", ["Server", "Only CSS", "Only HTML", "Only image"], "Server"],
    ["API", "Frontend talks to backend using what?", ["API calls", "Only image path", "Only CSS", "Only comments"], "API calls"],
    ["Auth", "JWT token is usually stored after what?", ["Login", "Logout only", "CSS build", "Image upload only"], "Login"],
    ["CRUD", "CRUD includes Create, Read, Update and what?", ["Delete", "Design", "Deploy", "Debug only"], "Delete"],
    ["Schema", "Mongoose schema defines what?", ["Document structure", "Button style", "React route", "HTML title"], "Document structure"],
    ["React State", "Which hook manages form data?", ["useState", "usePort", "useDB", "useMongo"], "useState"],
    ["React Effect", "API call is commonly placed inside which hook?", ["useEffect", "useColor", "useStyle", "useImage"], "useEffect"],
    ["Routing", "React Router is used for what?", ["Page navigation", "Database query", "Password hashing", "Server hosting"], "Page navigation"],
    ["Backend Route", "Express router helps separate what?", ["API endpoints", "CSS shadows", "Images", "Fonts"], "API endpoints"],
    ["CORS", "CORS is needed when frontend and backend are on what?", ["Different origins", "Same function", "Same image", "Same CSS class"], "Different origins"],
    ["Env", "Mongo URI should be stored in what?", [".env", "App.jsx", "index.css", "README screenshot"], ".env"],
    ["Deployment", "Frontend is commonly deployed on what?", ["Vercel", "Mongo shell", "Atlas only", "Postman"], "Vercel"],
    ["Deployment", "Backend is commonly deployed on what?", ["Render", "Figma only", "Canva", "VS Code theme"], "Render"],
    ["Atlas", "MongoDB Atlas is used for what?", ["Cloud database", "UI animation", "Video editing", "Image compression"], "Cloud database"],
    ["Protected Route", "Protected route checks what?", ["User authentication", "CSS border", "Image size", "Screen color"], "User authentication"],
    ["Full Stack", "Full-stack testing checks what?", ["Frontend + backend flow", "Only icon", "Only border", "Only title"], "Frontend + backend flow"],
    ["Search", "Search feature often uses what?", ["Query parameter", "Font weight", "Image filter", "CSS margin"], "Query parameter"],
    ["Pagination", "Pagination helps display what?", ["Large data in pages", "Only one button", "Only logo", "Only background"], "Large data in pages"],
    ["Error UI", "Frontend should show what when API fails?", ["User-friendly error", "Blank page", "Hidden text", "Only console"], "User-friendly error"],
    ["Loading UI", "Loading state is used while what happens?", ["Data is fetching", "CSS is deleted", "Image is printed", "Laptop shuts down"], "Data is fetching"],
    ["README", "Project README should include what?", ["Setup and features", "Only emoji", "Only password", "Only node_modules"], "Setup and features"],
    ["GitHub", "Code should not include what publicly?", ["Secret keys", "Component names", "README", "Screenshots"], "Secret keys"],
    ["Resume", "MERN resume should highlight what?", ["React, Node, Express, MongoDB", "Only MS Word", "Only typing", "Only drawing"], "React, Node, Express, MongoDB"],
    ["Interview", "MERN interview often asks about what?", ["API integration", "Cooking", "Painting", "Driving"], "API integration"],
    ["Project", "A good MERN project includes what?", ["Auth + CRUD + deployment", "Only one image", "Only static text", "Only CSS"], "Auth + CRUD + deployment"],
    ["Debugging", "Network tab helps debug what?", ["API requests", "Keyboard", "Mousepad", "Screen size"], "API requests"]
  ],

  "Data Science Engineer": [
    ["Python", "Which Python library is used for data frames?", ["Pandas", "React", "Express", "Tailwind"], "Pandas"],
    ["NumPy", "NumPy is mainly used for what?", ["Numerical arrays", "API routes", "CSS design", "HTML forms"], "Numerical arrays"],
    ["Pandas", "Which function reads CSV files?", ["read_csv", "fetch", "useState", "findOne"], "read_csv"],
    ["Cleaning", "Missing values are commonly handled using what?", ["Imputation", "Routing", "Hashing", "Flexbox"], "Imputation"],
    ["EDA", "EDA stands for what?", ["Exploratory Data Analysis", "External Data API", "Easy Design App", "Exact Database Auth"], "Exploratory Data Analysis"],
    ["Visualization", "Histogram is used to show what?", ["Distribution", "API status", "HTML tags", "JWT token"], "Distribution"],
    ["Statistics", "Mean represents what?", ["Average", "Maximum only", "Minimum only", "Index"], "Average"],
    ["Statistics", "Standard deviation measures what?", ["Spread", "Color", "Password", "Route"], "Spread"],
    ["Probability", "Probability value lies between what?", ["0 and 1", "10 and 20", "-5 and -1", "100 and 200"], "0 and 1"],
    ["Feature Engineering", "Feature engineering creates what?", ["Useful input variables", "Only CSS", "Only logos", "Only ports"], "Useful input variables"],
    ["Encoding", "Categorical variables are converted using what?", ["Encoding", "Hash routing", "CSS grid", "Image crop"], "Encoding"],
    ["Scaling", "Scaling is used to normalize what?", ["Numerical features", "HTML tags", "Icons", "Routes"], "Numerical features"],
    ["Train Test", "Train-test split is used to check what?", ["Model generalization", "Button color", "Logo size", "CSS spacing"], "Model generalization"],
    ["Regression", "Linear regression predicts what type of output?", ["Continuous value", "Only image", "Only route", "Only category always"], "Continuous value"],
    ["Classification", "Classification predicts what?", ["Class labels", "CSS margin", "Database URL", "Font"], "Class labels"],
    ["Evaluation", "Accuracy is used for which task?", ["Classification", "CSS design", "Routing", "HTML parsing only"], "Classification"],
    ["Confusion Matrix", "Confusion matrix compares what?", ["Actual vs predicted", "Color vs font", "Route vs link", "Image vs icon"], "Actual vs predicted"],
    ["Clustering", "K-Means is which type of learning?", ["Unsupervised", "Only frontend", "Only backend", "Manual CSS"], "Unsupervised"],
    ["SQL", "GROUP BY is used for what?", ["Aggregation", "Login", "Routing", "Styling"], "Aggregation"],
    ["Correlation", "Correlation measures what?", ["Relationship between variables", "Page width", "API port", "Token length"], "Relationship between variables"],
    ["Outliers", "Outliers are what?", ["Extreme values", "Normal CSS", "Database names", "File imports"], "Extreme values"],
    ["Dashboard", "Dashboard helps present what?", ["Insights", "Password", "Only code", "Only icons"], "Insights"],
    ["Notebook", "Jupyter notebook is used for what?", ["Data analysis", "CSS build only", "API hosting", "Image compression"], "Data analysis"],
    ["Model", "Overfitting means model performs well on train but poorly on what?", ["Test data", "CSS", "HTML", "Git"], "Test data"],
    ["Cross Validation", "Cross validation helps evaluate model how?", ["More reliably", "By changing color", "By deleting data", "By compressing files"], "More reliably"],
    ["Business", "Business interpretation converts results into what?", ["Actionable insights", "Only source code", "Only icons", "Only text color"], "Actionable insights"],
    ["Portfolio", "Data science portfolio should include what?", ["Notebook, charts, insights", "Only GIF", "Only CSS", "Only audio"], "Notebook, charts, insights"],
    ["Interview", "Common DS interview area is what?", ["Statistics", "Singing", "Painting", "Driving"], "Statistics"],
    ["Data Leakage", "Data leakage happens when test info enters what?", ["Training process", "CSS file", "Image folder", "Git branch"], "Training process"],
    ["Pipeline", "ML pipeline organizes what?", ["Preprocessing and model steps", "Only navbar", "Only shadow", "Only font"], "Preprocessing and model steps"]
  ],

  "AI/ML Developer": [
    ["ML Basics", "Machine learning allows systems to learn from what?", ["Data", "Only CSS", "Only images", "Only routes"], "Data"],
    ["Supervised", "Supervised learning uses what?", ["Labeled data", "No data", "Only colors", "Only icons"], "Labeled data"],
    ["Unsupervised", "Unsupervised learning works with what?", ["Unlabeled data", "Only labels", "Only passwords", "Only JSX"], "Unlabeled data"],
    ["Regression", "Regression predicts what?", ["Continuous values", "Only classes", "Only routes", "Only colors"], "Continuous values"],
    ["Classification", "Classification predicts what?", ["Categories", "Screen width", "Font size", "CSS"], "Categories"],
    ["Linear Regression", "Linear regression minimizes which function?", ["Loss function", "CSS function", "HTML tag", "Route function"], "Loss function"],
    ["Logistic Regression", "Logistic regression is mainly used for what?", ["Classification", "Image storage", "Routing", "Styling"], "Classification"],
    ["Decision Tree", "Decision tree splits data using what?", ["Feature conditions", "CSS classes", "HTML icons", "Server ports"], "Feature conditions"],
    ["Random Forest", "Random forest is an ensemble of what?", ["Decision trees", "CSS grids", "HTML tables", "APIs only"], "Decision trees"],
    ["SVM", "SVM tries to maximize what?", ["Margin", "Font", "Padding", "Image size"], "Margin"],
    ["KNN", "KNN classifies based on what?", ["Nearest neighbors", "Random ports", "CSS selectors", "JWT"], "Nearest neighbors"],
    ["Naive Bayes", "Naive Bayes is based on what?", ["Probability", "Flexbox", "Routing", "Hashing"], "Probability"],
    ["Clustering", "Which algorithm is commonly used for clustering?", ["K-Means", "React Router", "Express", "JWT"], "K-Means"],
    ["Evaluation", "F1-score combines precision and what?", ["Recall", "Font", "Route", "Padding"], "Recall"],
    ["Overfitting", "Overfitting means model memorizes what?", ["Training data", "CSS only", "HTML tags", "Image path"], "Training data"],
    ["Regularization", "Regularization helps reduce what?", ["Overfitting", "Routing", "CSS color", "File size only"], "Overfitting"],
    ["Neural Network", "A neuron applies weights and what?", ["Activation", "CSS", "HTML", "Route"], "Activation"],
    ["Activation", "ReLU is an example of what?", ["Activation function", "Database", "API", "CSS layout"], "Activation function"],
    ["Deep Learning", "Deep learning uses many layers of what?", ["Neural networks", "CSS files", "HTML forms", "Mongo collections"], "Neural networks"],
    ["CNN", "CNN is commonly used for what?", ["Computer vision", "API routing", "SQL joins", "CSS grid"], "Computer vision"],
    ["NLP", "NLP deals with what?", ["Text/language data", "Only images", "Only CSS", "Only ports"], "Text/language data"],
    ["Embeddings", "Embeddings convert text into what?", ["Vectors", "Images", "Routes", "Tables only"], "Vectors"],
    ["Training", "Epoch means one full pass over what?", ["Training data", "CSS file", "HTML page", "Git log"], "Training data"],
    ["Gradient Descent", "Gradient descent updates what?", ["Model parameters", "Button color", "Route path", "Image name"], "Model parameters"],
    ["Deployment", "ML model can be served through what?", ["API", "CSS", "HTML comment", "Git branch only"], "API"],
    ["Dataset", "A good dataset should be what?", ["Clean and relevant", "Only large", "Only colorful", "Only zipped"], "Clean and relevant"],
    ["Metrics", "Precision focuses on correctness among what?", ["Predicted positives", "All CSS", "Routes", "Images"], "Predicted positives"],
    ["Pipeline", "ML pipeline includes preprocessing and what?", ["Model training", "CSS animation", "Login button", "Navbar"], "Model training"],
    ["Portfolio", "AI/ML portfolio should show what?", ["Model, metrics, explanation", "Only image", "Only logo", "Only color"], "Model, metrics, explanation"],
    ["Interview", "Common AI/ML interview topic is what?", ["Overfitting", "Flexbox only", "Navbar only", "Git theme"], "Overfitting"]
  ],

  "Python Developer": [
    ["Syntax", "Which keyword defines a function in Python?", ["def", "func", "function", "define"], "def"],
    ["Variables", "Python is which type of language?", ["Dynamically typed", "Only HTML", "Only CSS", "Manually typed only"], "Dynamically typed"],
    ["List", "Which data type is mutable?", ["List", "Tuple", "String", "Integer"], "List"],
    ["Tuple", "Which data type is immutable?", ["Tuple", "List", "Dictionary", "Set"], "Tuple"],
    ["Dictionary", "Dictionary stores data in which format?", ["Key-value", "Only index", "Only string", "Only number"], "Key-value"],
    ["Set", "Set stores what type of values?", ["Unique values", "Duplicate only", "Sorted always", "Indexed always"], "Unique values"],
    ["String", "Which operation extracts part of a string?", ["Slicing", "Hashing", "Routing", "Rendering"], "Slicing"],
    ["Loop", "Which loop is used to iterate over a list?", ["for", "switch", "repeat only", "html"], "for"],
    ["Function", "Which statement returns a value from function?", ["return", "break", "yield only", "print"], "return"],
    ["Lambda", "Lambda creates what?", ["Anonymous function", "Class only", "File only", "Module only"], "Anonymous function"],
    ["Recursion", "Recursive function needs what?", ["Base case", "Only print", "Only import", "Only class"], "Base case"],
    ["File", "Which mode opens file for reading?", ["r", "w", "a", "x"], "r"],
    ["JSON", "Which module handles JSON in Python?", ["json", "react", "express", "tailwind"], "json"],
    ["Exception", "Which block catches exceptions?", ["except", "catchOnly", "error", "handle"], "except"],
    ["OOP", "Which keyword defines a class?", ["class", "object", "define", "struct"], "class"],
    ["Inheritance", "Inheritance allows class to reuse what?", ["Parent class features", "CSS", "HTML", "Database"], "Parent class features"],
    ["Module", "Which keyword imports a module?", ["import", "include", "require only", "loadcss"], "import"],
    ["Package", "pip is used to install what?", ["Python packages", "CSS files", "Mongo documents", "Images only"], "Python packages"],
    ["Virtual Env", "Virtual environment isolates what?", ["Project dependencies", "Monitor", "Keyboard", "Image"], "Project dependencies"],
    ["Comprehension", "List comprehension creates what?", ["List", "Route", "Database", "CSS"], "List"],
    ["Generator", "Which keyword is used in generators?", ["yield", "return only", "break", "continue"], "yield"],
    ["Decorator", "Decorator modifies what?", ["Function behavior", "Image color", "Database name", "HTML tag"], "Function behavior"],
    ["Regex", "Regex is used for what?", ["Pattern matching", "Image editing", "Route styling", "DB backup"], "Pattern matching"],
    ["Testing", "pytest is used for what?", ["Testing", "Styling", "Routing", "Hosting"], "Testing"],
    ["API", "Which library is used to call HTTP APIs?", ["requests", "pandas only", "numpy only", "tkinter"], "requests"],
    ["Flask", "Flask is used to build what?", ["Web APIs", "Images only", "CSS only", "Excel only"], "Web APIs"],
    ["Database", "Python can connect with database using what?", ["Drivers/libraries", "Only CSS", "Only HTML", "Only PNG"], "Drivers/libraries"],
    ["Automation", "Python is commonly used for what?", ["Automation scripts", "Only UI colors", "Only browser tabs", "Only CSS"], "Automation scripts"],
    ["Pandas", "Pandas is useful for what?", ["Data handling", "Button design", "Routing", "Icons"], "Data handling"],
    ["Interview", "Common Python interview topic is what?", ["OOP and data structures", "Only colors", "Only logos", "Only screen size"], "OOP and data structures"]
  ]
};

const QUESTIONS_PER_PAGE = 15;

const bubblePositions = [
  { width: 90, height: 90, left: "4%", top: "12%", duration: "10s", delay: "0s" },
  { width: 40, height: 40, left: "18%", top: "72%", duration: "8s", delay: "1s" },
  { width: 64, height: 64, left: "76%", top: "14%", duration: "11s", delay: "2s" },
  { width: 34, height: 34, left: "88%", top: "58%", duration: "7.8s", delay: "1.4s" },
  { width: 120, height: 120, left: "44%", top: "8%", duration: "12s", delay: "2.5s" },
  { width: 58, height: 58, left: "64%", top: "82%", duration: "9.3s", delay: "0.8s" },
  { width: 28, height: 28, left: "28%", top: "38%", duration: "7.5s", delay: "2.2s" },
  { width: 46, height: 46, left: "92%", top: "26%", duration: "9.5s", delay: "1.7s" }
];

export default function RolePractice() {
  const { role } = useParams();
  const selectedRole = decodeURIComponent(role || "Software Developer");

  const [page, setPage] = useState(1);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showAnswers, setShowAnswers] = useState({});

  const questions = useMemo(() => {
    return ROLE_QUESTIONS[selectedRole] || ROLE_QUESTIONS["Software Developer"];
  }, [selectedRole]);

  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const start = (page - 1) * QUESTIONS_PER_PAGE;
  const currentQuestions = questions.slice(start, start + QUESTIONS_PER_PAGE);

  useEffect(() => {
    setPage(1);
    setSelectedAnswers({});
    setShowAnswers({});
  }, [selectedRole]);

  const handleAnswer = (questionKey, option) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionKey]: option
    }));

    setShowAnswers((prev) => ({
      ...prev,
      [questionKey]: true
    }));
  };

  const resetAnswers = () => {
    setSelectedAnswers({});
    setShowAnswers({});
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#f7fcff] px-8 py-8 text-slate-950">
      <style>{`
        @keyframes bubbleFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.18;
          }
          50% {
            transform: translate3d(16px, -42px, 0) scale(1.08);
            opacity: 0.42;
          }
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_10%_6%,rgba(125,211,252,0.24),transparent_32%),radial-gradient(circle_at_88%_10%,rgba(186,230,253,0.34),transparent_30%),linear-gradient(180deg,#F7FCFF_0%,#EEF8FF_45%,#FFFFFF_100%)]" />

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {bubblePositions.map((bubble, index) => (
          <span
            key={index}
            className="absolute rounded-full border border-sky-200/60"
            style={{
              width: `${bubble.width}px`,
              height: `${bubble.height}px`,
              left: bubble.left,
              top: bubble.top,
              background:
                "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.95), rgba(186,230,253,0.45) 45%, rgba(125,211,252,0.12) 75%)",
              boxShadow:
                "inset 0 0 18px rgba(255,255,255,0.85), 0 18px 45px rgba(125,211,252,0.16)",
              animation: `bubbleFloat ${bubble.duration} ease-in-out infinite`,
              animationDelay: bubble.delay
            }}
          />
        ))}
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/roadmaps"
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-sky-700 shadow-sm ring-1 ring-sky-100 hover:bg-sky-50"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Roadmaps
        </Link>

        <button
          type="button"
          onClick={resetAnswers}
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-sky-700 shadow-sm ring-1 ring-sky-100 hover:bg-sky-50"
        >
          <RotateCcw className="h-5 w-5" />
          Reset Answers
        </button>
      </div>

      <section className="rounded-[2rem] border border-sky-100 bg-white/90 p-8 shadow-xl backdrop-blur">
        <div className="grid gap-8 lg:grid-cols-[1fr_230px] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-600">
              Role Based Practice
            </p>

            <h1 className="mt-4 text-4xl font-black leading-tight text-slate-950">
              {selectedRole} MCQ Questions
            </h1>

            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
              30 unique role-wise MCQ questions. Each page shows 15 questions.
            </p>
          </div>

          <div className="rounded-[1.6rem] bg-sky-50 p-6 ring-1 ring-sky-100">
            <h2 className="text-5xl font-black text-sky-600">{questions.length}</h2>
            <p className="mt-1 text-sm font-black text-slate-500">
              Questions ready
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-sky-100">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-600">
              Practice Set
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Page {page} of {totalPages}
            </h2>
          </div>

          <div className="rounded-xl bg-sky-50 px-4 py-3 text-sm font-black text-sky-700">
            Showing {currentQuestions.length} Questions
          </div>
        </div>

        <div className="grid gap-5">
          {currentQuestions.map(([topic, question, options, answer], index) => {
            const realIndex = start + index + 1;
            const questionKey = `${selectedRole}-${realIndex}`;
            const selected = selectedAnswers[questionKey];
            const visible = showAnswers[questionKey];

            return (
              <article
                key={questionKey}
                className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">
                    Q{realIndex}
                  </span>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                    {topic}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-black leading-7 text-slate-950">
                  {question}
                </h3>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {options.map((option, optionIndex) => {
                    const isSelected = selected === option;
                    const isCorrect = visible && option === answer;
                    const isWrong = visible && isSelected && option !== answer;

                    return (
                      <button
                        key={`${questionKey}-${optionIndex}`}
                        type="button"
                        onClick={() => handleAnswer(questionKey, option)}
                        className={`rounded-xl border px-4 py-3 text-left text-sm font-bold transition ${
                          isCorrect
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                            : isWrong
                              ? "border-red-300 bg-red-50 text-red-700"
                              : isSelected
                                ? "border-sky-300 bg-sky-50 text-sky-700"
                                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-sky-50"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {visible && (
                  <div className="mt-4 rounded-xl bg-slate-50 p-4">
                    <p className="flex items-center gap-2 text-sm font-black text-slate-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Correct Answer: {answer}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            className="inline-flex h-14 items-center gap-3 rounded-[1.7rem] bg-gradient-to-r from-sky-500 via-sky-400 to-emerald-400 px-7 text-base font-black text-white shadow-[0_18px_40px_rgba(56,189,248,0.26)] ring-1 ring-white/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(56,189,248,0.32)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-5 w-5" />
            Previous
          </button>

          <div className="rounded-xl bg-sky-50 px-5 py-3 text-sm font-black text-sky-700">
            {page} / {totalPages}
          </div>

          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            className="inline-flex h-14 items-center gap-3 rounded-[1.7rem] bg-gradient-to-r from-sky-500 via-sky-400 to-emerald-400 px-7 text-base font-black text-white shadow-[0_18px_40px_rgba(56,189,248,0.26)] ring-1 ring-white/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(56,189,248,0.32)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Sparkles className="h-5 w-5 text-sky-100" />
            Next
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
