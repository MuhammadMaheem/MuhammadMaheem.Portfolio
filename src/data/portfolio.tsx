import React from 'react';
import { FileText, Building2, User, Gamepad2, Hospital, Brain, Briefcase, Building, Bot, Stars, Palette, Lightbulb, TrendingUp } from 'lucide-react';

export const personalInfo = {
  name: "Muhammad Maheem",
  title: "AI Developer & ML Engineer",
  location: "Lahore, Pakistan",
  age: 21,
  status: "4th Semester AI Student at Superior University",
  tagline: "Building intelligent systems that learn, adapt, and evolve",
  github: "https://github.com/MuhammadMaheem",
  linkedin: "https://www.linkedin.com/in/muhammad-maheem-453369245/",
  email: "mirza.muhammad.maheem@gmail.com",
  phone: "+92 300-8714141",
};

export interface Project {
  id: number;
  title: string;
  shortDesc: string;
  fullDesc: string;
  technologies: string[];
  category: string;
  icon: React.ReactElement;
  features: string[];
  gradient: string;
  images: string[];
  challenges: string;
  impact: string;
}

export const projects: Project[] = [
  {
    id: 1,
    title: "RAG-Based PDF Chatbot",
    shortDesc: "Production-ready Agentic RAG system",
    fullDesc: "A production-ready Agentic RAG system with full-stack architecture that demonstrates my expertise in building enterprise-grade AI applications. Built with Next.js 14 frontend and FastAPI backend, this system uses PostgreSQL with pgvector for efficient semantic search and Groq's Llama 3.3 70B model for intelligent responses. Users can upload PDF documents, create multiple chat sessions with JWT authentication, and receive real-time streaming responses with token-by-token delivery. The system implements advanced RAG techniques including multi-query generation for improved retrieval accuracy, context window management to maintain conversation history, and background PDF processing for optimal user experience. Deployed with Docker and managed database migrations using Alembic, showcasing production-ready engineering practices.",
    technologies: ["Python", "FastAPI", "Next.js 14", "PostgreSQL", "pgvector", "Groq API", "sentence-transformers", "Alembic", "Docker"],
    category: "NLP",
    icon: <FileText className="w-6 h-6" />,
    features: [
      "JWT-based user authentication and session management",
      "Real-time token-by-token response streaming",
      "Multi-query generation for enhanced retrieval accuracy",
      "Context window management (last 10 messages)",
      "Background PDF processing with status tracking",
      "PostgreSQL with pgvector for semantic similarity search",
      "Full-stack architecture with separate frontend/backend",
      "Docker deployment with Alembic database migrations",
      "Zustand state management with shadcn/ui components"
    ],
    gradient: "from-cyan-500 to-blue-600",
    images: [
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80"
    ],
    challenges: "Implementing efficient chunking strategies while managing PostgreSQL vector operations, ensuring low-latency streaming responses, and coordinating real-time updates between frontend and backend with proper authentication flow.",
    impact: "This production-ready system demonstrates enterprise-level AI application development, suitable for businesses needing intelligent document processing with user management and scalable architecture."
  },
  {
    id: 2,
    title: "Hadith Chatbot",
    shortDesc: "39,038 authentic Hadiths assistant",
    fullDesc: "A specialized RAG-powered chatbot designed for Hadith-related queries, featuring a comprehensive database of 39,038 authenticated Hadiths from six canonical collections: Sahih Bukhari, Sahih Muslim, Abu Daud, Ibn Majah, Al-Nasa'i, and Jami' at-Tirmidhi. This project combines my passion for AI with Islamic knowledge, creating a tool that helps users explore and understand Hadith literature with precision. Built with Flask and powered by Groq's Llama 3.3 70B model, the system uses FAISS vector database for lightning-fast semantic search and sentence-transformers for generating embeddings. It processes natural language questions in both English and Arabic, providing bilingual responses with precise source attribution including book name, chapter, and Hadith number.",
    technologies: ["Python", "Flask", "FAISS", "sentence-transformers", "Groq API", "Pandas", "NumPy"],
    category: "NLP",
    icon: <Building2 className="w-6 h-6" />,
    features: [
      "39,038 authenticated Hadiths from 6 canonical collections",
      "FAISS vector database for fast semantic search",
      "Bilingual display with English and Arabic text",
      "Two response modes: Concise (top 3) and Detailed (top 5)",
      "Islamic-themed professional UI design",
      "Precise source attribution with book/chapter references",
      "Natural language understanding for Arabic & English",
      "Health check endpoint for monitoring"
    ],
    gradient: "from-emerald-500 to-teal-600",
    images: [
      "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&q=80",
      "https://images.unsplash.com/photo-1585036156171-384164a8c675?w=800&q=80",
      "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&q=80"
    ],
    challenges: "Ensuring accuracy and authenticity of Hadith citations while handling the complexity of Arabic text processing, transliteration variations, and optimizing FAISS search across nearly 40,000 entries for sub-second response times.",
    impact: "Helps Muslims and researchers instantly find authentic Hadith references from canonical collections, promoting accurate Islamic knowledge dissemination with verifiable sources."
  },
  {
    id: 3,
    title: "Face Recognition Attendance",
    shortDesc: "Real-time facial recognition with anti-spoofing",
    fullDesc: "A comprehensive attendance tracking system built using advanced computer vision techniques with anti-spoofing security. This project showcases my skills in image processing and deep learning for face recognition. The system captures faces in real-time through a webcam, encodes facial features into 128-dimensional vectors using dlib's face recognition model, and matches them against a database of known faces. A key security feature is the Eye Aspect Ratio (EAR) based blink detection that ensures attendance is only marked for live individuals, preventing photo or video attacks. During registration, users capture multiple expressions (neutral, smile, left turn, right turn) to improve recognition accuracy across different facial states. When a match is found and liveliness is confirmed, attendance is automatically logged to JSON files with precise timestamps.",
    technologies: ["Python", "OpenCV", "Dlib", "NumPy", "scipy"],
    category: "Computer Vision",
    icon: <User className="w-6 h-6" />,
    features: [
      "Anti-spoofing with Eye Aspect Ratio (EAR) blink detection",
      "Multi-expression registration (neutral, smile, left/right turns)",
      "Real-time face detection with HOG/CNN algorithms",
      "128-dimension face encoding for high accuracy",
      "Liveliness verification before attendance marking",
      "JSON-based attendance logging with timestamps",
      "Multi-face detection in single frame",
      "dlib's 68 facial landmarks for precise tracking"
    ],
    gradient: "from-violet-500 to-purple-600",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80"
    ],
    challenges: "Handling varying lighting conditions, camera angles, implementing robust blink detection to prevent false positives/negatives, and ensuring the system works with different ethnicities and age groups with equal accuracy while preventing spoofing attacks.",
    impact: "Reduces attendance marking time from minutes to seconds, eliminates proxy attendance through liveliness detection, and provides secure, accurate attendance records for institutions while preventing photo/video-based fraud."
  },
  {
    id: 4,
    title: "Tic-Tac-Toe AI",
    shortDesc: "DQN agent with 100k episode training",
    fullDesc: "An intelligent Tic-Tac-Toe agent implemented using Deep Q-Network (DQN) with sophisticated training methodology that learns to play optimally through reinforcement learning. This project demonstrates my understanding of neural networks, reinforcement learning concepts, and game theory. Trained over 100,000 episodes with a balanced strategy (50% random moves, 50% optimal play) and randomized starting positions (30% mid-game scenarios), the AI learns robust strategies applicable to any board state. The agent undergoes bidirectional learning by playing as both X and O, facing diverse opponents including 60% self-play and 40% smart opponents. The DQN architecture uses experience replay (100k buffer) and epsilon-greedy exploration (decaying to 0.05) to stabilize training. A Flask web interface provides real-time gameplay with score tracking, making the AI accessible for interactive demonstrations.",
    technologies: ["Python", "PyTorch", "Flask", "NumPy", "DQN"],
    category: "Reinforcement Learning",
    icon: <Gamepad2 className="w-6 h-6" />,
    features: [
      "Flask web interface with real-time gameplay",
      "100,000 episode training with balanced strategy (50% random/50% optimal)",
      "Randomized starting positions (30% mid-game) for robust learning",
      "Bidirectional learning (plays as both X and O)",
      "Diverse opponent training (60% self-play, 40% smart opponents)",
      "Experience replay buffer (100k capacity) for stable learning",
      "Epsilon-greedy exploration (decays from 1.0 to 0.05)",
      "Score tracking and performance metrics"
    ],
    gradient: "from-orange-500 to-red-600",
    images: [
      "https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=800&q=80",
      "https://images.unsplash.com/photo-1552820728-8b83bb6b2b0c?w=800&q=80",
      "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800&q=80"
    ],
    challenges: "Balancing exploration vs exploitation during training, preventing overfitting to specific board positions, and ensuring the agent learns generalizable strategies across all possible game states through sophisticated training curriculum.",
    impact: "Provides a clear, interactive demonstration of how reinforcement learning agents learn through trial and error with a web interface, showcasing advanced training techniques that prevent overfitting and scale to more complex games."
  },
  {
    id: 5,
    title: "CKD Prediction Model",
    shortDesc: "96% accurate medical diagnosis using ML",
    fullDesc: "A machine learning model for predicting Chronic Kidney Disease (CKD) achieving 96% accuracy across various classification algorithms. This healthcare AI project analyzes comprehensive medical data from 1,659 patients with 39+ clinical features including demographic information, lifestyle factors, vital signs, blood tests, and urine analysis. Through rigorous feature selection using feature importance analysis, the model identifies 12 key clinical indicators that provide the strongest predictive power. The system compares multiple algorithms including Random Forest, SVM, and XGBoost to find the optimal performer, using StandardScaler for feature normalization and K-fold cross-validation for robust evaluation. Deployed as an interactive Streamlit web application, it provides medical professionals with an accessible interface for early detection and risk assessment.",
    technologies: ["Python", "Scikit-learn", "Streamlit", "Pandas", "Matplotlib", "Seaborn", "XGBoost"],
    category: "Healthcare AI",
    icon: <Hospital className="w-6 h-6" />,
    features: [
      "Interactive Streamlit web dashboard for clinical use",
      "Dataset: 1,659 patients with 39+ clinical features",
      "Feature selection: 12 key indicators from 39+ features",
      "96% accuracy achieved with cross-validation",
      "StandardScaler for feature normalization",
      "Multiple algorithm comparison (Random Forest, SVM, XGBoost)",
      "Feature importance visualization for medical insights",
      "Prediction confidence scores and probabilities",
      "Data preprocessing and missing value imputation"
    ],
    gradient: "from-pink-500 to-rose-600",
    images: [
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&q=80",
      "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80",
      "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80"
    ],
    challenges: "Handling imbalanced medical datasets with 1,659 patient records, reducing 39+ features to 12 optimal indicators while maintaining 96% accuracy, dealing with missing values in clinical data, and ensuring model interpretability for medical decision-making.",
    impact: "Early detection of CKD with 96% accuracy can help patients get timely treatment, potentially saving lives and reducing healthcare costs through preventive care. The interactive Streamlit interface makes the tool accessible to healthcare professionals without technical expertise."
  },
  {
    id: 6,
    title: "Personality Prediction",
    shortDesc: "Introvert/Extrovert classification with SVM",
    fullDesc: "A machine learning model that predicts personality orientation (Introvert or Extrovert) based on behavioral patterns and lifestyle data. This project explores the intersection of psychology and AI using Support Vector Machine (SVM) classification with an object-oriented design approach. The model analyzes various behavioral indicators including time spent alone, stage fear, social event preferences, and other personality-related features from a structured dataset. Built with modular OOP principles for maintainability, the system uses StandardScaler for feature normalization and an 80/20 train-test split for evaluation. Users interact through a console-based interface where they input their behavioral characteristics, and the trained SVM model (saved as Personality.pkl) predicts their personality type with accompanying data visualizations to explain the classification.",
    technologies: ["Python", "Scikit-learn", "SVM", "Pandas", "Seaborn", "Matplotlib", "Pickle"],
    category: "ML",
    icon: <Brain className="w-6 h-6" />,
    features: [
      "Binary personality classification (Introvert/Extrovert)",
      "Support Vector Machine (SVM) classifier",
      "Console-based interactive input interface",
      "Object-Oriented design for modularity",
      "StandardScaler for feature normalization",
      "80/20 train-test split for model evaluation",
      "Model persistence with Pickle (Personality.pkl)",
      "Data visualization with Seaborn and Matplotlib",
      "Behavioral pattern analysis from lifestyle data"
    ],
    gradient: "from-indigo-500 to-blue-600",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80"
    ],
    challenges: "Creating a balanced dataset for binary classification, selecting optimal SVM kernel and hyperparameters, and designing meaningful behavioral features that accurately correlate with introversion/extroversion while avoiding overfitting.",
    impact: "Helps individuals gain self-awareness about their personality orientation (Introvert vs Extrovert) through data-driven analysis, useful for personal development, career counseling, and understanding social preferences."
  },
  {
    id: 7,
    title: "SaaS Management App",
    shortDesc: "Full-stack dashboard with NextAuth",
    fullDesc: "A production-ready Software as a Service management platform built with Next.js 15 and React 19, integrating modern full-stack technologies. This project showcases my ability to build enterprise-grade applications with secure authentication, external API integration, and comprehensive data management. The application uses NextAuth.js for JWT-based authentication, TanStack React Query for optimized data fetching with caching, and Material-UI components for a polished, professional interface. It features complete CRUD operations for multiple entities (Users, Projects, Inventory, Staff, Clients) with Axios interceptors handling API communication to an external backend. Forms are validated using Zod schemas with React Hook Form, ensuring type-safe data handling. The application includes data visualization with Material-UI Charts, Docker deployment configuration with multi-stage builds, and follows modern architectural patterns with reusable generic components.",
    technologies: ["Next.js 15", "React 19", "TypeScript", "Material-UI", "TanStack React Query", "NextAuth.js", "Axios", "Zod", "React Hook Form", "Tailwind CSS", "Docker"],
    category: "Web Development",
    icon: <Briefcase className="w-6 h-6" />,
    features: [
      "JWT-based authentication with NextAuth.js",
      "Multi-entity CRUD operations (Users, Projects, Inventory, Staff, Clients)",
      "TanStack React Query for optimized data fetching and caching",
      "External API integration with Axios interceptors",
      "Type-safe form validation with Zod and React Hook Form",
      "Material-UI components for professional design",
      "Data visualization with Material-UI Charts",
      "Docker deployment with multi-stage builds",
      "Fully responsive dashboard design",
      "Reusable generic components architecture"
    ],
    gradient: "from-amber-500 to-orange-600",
    images: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80"
    ],
    challenges: "Implementing secure JWT authentication flow across server and client components, coordinating React Query cache invalidation with CRUD operations, creating type-safe API integrations with Zod validation, and optimizing performance with Next.js 15's App Router.",
    impact: "Provides businesses with a production-ready, enterprise-grade platform to manage multiple business entities with secure authentication, comprehensive data visualization, and scalable architecture ready for Docker deployment."
  },
  {
    id: 8,
    title: "Bank Management System",
    shortDesc: "OOP-based finance app with dual dashboards",
    fullDesc: "A full-featured banking management application showcasing Object-Oriented Programming principles through a well-architected class hierarchy. This FinTech project demonstrates my mastery of OOP concepts including Inheritance (Person base class with Admin and Customer subclasses), Encapsulation (private attributes with getters/setters), Polymorphism (method overriding), and Abstraction. Built with Streamlit for an intuitive GUI, the system features dual role-based dashboards: an Admin dashboard for system oversight and a Customer dashboard for personal banking operations. The application handles all core banking functions including account creation, deposits, withdrawals, transfers, and statement generation. Data persistence is managed through file-based storage using structured text files (admin.txt, user.txt, customer.txt, accounts.txt, transaction.txt), demonstrating file I/O operations and data serialization concepts.",
    technologies: ["Python", "Streamlit", "OOP", "Pandas", "Plotly", "File I/O"],
    category: "FinTech",
    icon: <Building className="w-6 h-6" />,
    features: [
      "Object-Oriented design demonstrating all OOP pillars",
      "Class hierarchy: Person (base) → Admin & Customer subclasses",
      "Dual-role system: Admin and Customer dashboards",
      "File-based data persistence (txt files)",
      "Inheritance, Encapsulation, Polymorphism, Abstraction",
      "Account creation and management",
      "Secure transaction processing",
      "Monthly statement generation (PDF)",
      "Transaction history visualization with Plotly charts",
      "Multi-account transfer support"
    ],
    gradient: "from-green-500 to-emerald-600",
    images: [
      "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=800&q=80",
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80"
    ],
    challenges: "Implementing proper OOP design patterns with clean class hierarchies, ensuring data consistency across file-based storage operations, creating role-based access control for Admin vs Customer dashboards, and handling transaction integrity without a traditional database.",
    impact: "Provides an excellent educational template for learning OOP principles in Python while building practical financial applications. Demonstrates that complex banking systems can be built with accessible tools and clear architectural patterns."
  },
  {
    id: 9,
    title: "Value Notes",
    shortDesc: "Chrome extension with Firebase sync",
    fullDesc: "A professional productivity Chrome extension for managing notes, links, and code snippets with beautiful animations and optional cloud synchronization. Built with React 18 and TypeScript as a Manifest V3 extension, this project demonstrates my skills in browser extension development and modern frontend architecture. The extension features a local-first approach using Chrome's Storage API for instant access, with optional Firebase Authentication and Firestore integration for cloud sync across devices. Users can organize content with custom tags and favorites, search instantly across all items with real-time filtering, and backup/restore their data as JSON files. The interface showcases modern web development with Tailwind CSS for responsive styling and Framer Motion for smooth, delightful animations. Code snippets include syntax highlighting for multiple programming languages, making it a comprehensive tool for developers and professionals.",
    technologies: ["React 18", "TypeScript", "Tailwind CSS", "Framer Motion", "Firebase Auth", "Firebase Firestore", "Vite", "Chrome Extension API"],
    category: "Web Development",
    icon: <Lightbulb className="w-6 h-6" />,
    features: [
      "Chrome extension (Manifest V3) for browser integration",
      "Notes, Links, and Code Snippets with syntax highlighting",
      "Local-first storage with Chrome Storage API",
      "Optional Firebase cloud sync across devices",
      "Firebase Authentication for secure access",
      "Instant search across all content with real-time filtering",
      "Favorites and custom tags for organization",
      "JSON backup/restore functionality",
      "Beautiful UI with Framer Motion animations",
      "Built with Vite for optimized production builds"
    ],
    gradient: "from-yellow-500 to-amber-600",
    images: [
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80"
    ],
    challenges: "Implementing Chrome Extension Manifest V3 requirements, coordinating local Chrome Storage with optional Firebase sync, optimizing bundle size for extension constraints, handling real-time search performance across large datasets, and creating smooth animations within browser extension limitations.",
    impact: "Empowers developers and professionals to capture notes, save links, and organize code snippets directly from their browser with optional cloud backup, boosting productivity with instant access to frequently referenced information across all devices."
  },
  {
    id: 10,
    title: "Heart Attack Prediction",
    shortDesc: "99% accurate cardiovascular risk model",
    fullDesc: "A machine learning model achieving 99% accuracy in predicting heart attack risk using clinical data from Zheen Hospital in Erbil, Iraq (January-May 2019). This healthcare AI project demonstrates my skills in medical data analysis and predictive modeling for life-saving applications. The model analyzes 9 critical clinical features including Age, Gender, Heart Rate, Blood Pressure (Systolic/Diastolic), Blood Sugar levels, CK-MB enzyme levels, and Troponin levels to provide binary classification (heart attack or none). Through rigorous evaluation of multiple classification algorithms including Random Forest, Gradient Boosting, and Support Vector Machines, the system identifies the most accurate predictor for this critical medical application. The model provides real-time risk assessment with confidence scores, helping healthcare professionals make data-driven decisions for early intervention and preventive care.",
    technologies: ["Python", "Scikit-learn", "Pandas", "Seaborn", "Matplotlib", "NumPy"],
    category: "Healthcare AI",
    icon: <Hospital className="w-6 h-6" />,
    features: [
      "99% prediction accuracy achieved",
      "Real-world dataset from Zheen Hospital, Erbil, Iraq (Jan-May 2019)",
      "9 clinical features: Age, Gender, Heart Rate, BP, Blood Sugar, CK-MB, Troponin",
      "Binary classification (heart attack or none)",
      "Multi-algorithm comparison for optimal performance",
      "Feature importance analysis for medical insights",
      "Real-time risk scoring with confidence intervals",
      "Interactive visualizations of patient data",
      "Model interpretability for clinical decision-making"
    ],
    gradient: "from-red-500 to-pink-600",
    images: [
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80",
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
      "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&q=80"
    ],
    challenges: "Achieving 99% accuracy while maintaining model interpretability for clinical use, managing class imbalance in real-world hospital data, validating predictions against actual patient outcomes, and ensuring the model generalizes beyond the specific hospital dataset.",
    impact: "Enables early detection of heart attack risk with 99% accuracy, potentially saving lives through timely medical interventions. Helps healthcare professionals at Zheen Hospital and similar facilities prioritize high-risk patients and allocate resources effectively for preventive cardiac care."
  }
];

export const skills = {
  languages: [
    { name: "Python", level: 90 },
    { name: "JavaScript", level: 80 },
    { name: "TypeScript", level: 75 }
  ],
  frameworks: [
    { name: "React", level: 85 },
    { name: "Next.js", level: 80 },
    { name: "FastAPI", level: 85 },
    { name: "PyTorch", level: 75 },
    { name: "Streamlit", level: 90 }
  ],
  aiMl: [
    { name: "Machine Learning", level: 85 },
    { name: "Computer Vision", level: 80 },
    { name: "RAG Systems", level: 85 },
    { name: "Deep Learning", level: 75 },
    { name: "NLP", level: 80 }
  ],
  tools: [
    { name: "Git & GitHub", level: 85 },
    { name: "ChromaDB", level: 80 },
    { name: "OpenCV", level: 80 },
    { name: "Dlib", level: 75 }
  ]
};

export interface Interest {
  name: string;
  icon: React.ReactElement;
}

export const interests: Interest[] = [
  { name: "Artificial Intelligence", icon: <Bot className="w-6 h-6" /> },
  { name: "Astronomy", icon: <Stars className="w-6 h-6" /> },
  { name: "Drawing & Sketching", icon: <Palette className="w-6 h-6" /> },
  { name: "Gaming", icon: <Gamepad2 className="w-6 h-6" /> },
  { name: "New Technologies", icon: <Lightbulb className="w-6 h-6" /> },
  { name: "SEO", icon: <TrendingUp className="w-6 h-6" /> }
];

export const softSkills = [
  "Problem-solving",
  "Self-learning",
  "Adaptability",
  "Technical Communication",
  "Curiosity & Exploration"
];
