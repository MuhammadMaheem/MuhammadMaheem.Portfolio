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
  icon: string;
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
    shortDesc: "AI-powered document Q&A system",
    fullDesc: "An advanced document processing and question-answering system that uses Retrieval-Augmented Generation (RAG) technology. This project demonstrates my expertise in building intelligent systems that can understand and process complex documents. Users can upload any PDF document and ask natural language questions to get intelligent, context-aware responses powered by vector embeddings and Large Language Models (LLMs). The system breaks down documents into manageable chunks, creates semantic embeddings, stores them in a vector database, and retrieves the most relevant context to generate accurate answers.",
    technologies: ["Python", "LangChain", "ChromaDB", "OpenAI", "Streamlit"],
    category: "NLP",
    icon: "📄",
    features: [
      "PDF text extraction and intelligent chunking",
      "Vector embeddings with ChromaDB for semantic search",
      "Context-aware question answering with GPT",
      "Real-time conversational chat interface",
      "Document summarization capabilities",
      "Multi-document support and comparison"
    ],
    gradient: "from-cyan-500 to-blue-600",
    images: [
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80"
    ],
    challenges: "Implementing efficient document chunking strategies to maintain context while staying within token limits. Optimizing vector search for fast retrieval across large document sets.",
    impact: "This project can save hours of manual document reading, enabling professionals to quickly extract insights from lengthy PDFs, research papers, and reports."
  },
  {
    id: 2,
    title: "Hadith Chatbot",
    shortDesc: "Islamic knowledge assistant",
    fullDesc: "A specialized chatbot designed for Hadith-related queries that demonstrates advanced NLP capabilities. This project combines my passion for AI with Islamic knowledge, creating a tool that helps users explore and understand Hadith literature. The system processes natural language questions, searches through a curated database of authentic Hadith, and provides accurate responses with proper source citations. It uses semantic similarity to find relevant Hadith even when the user's query doesn't exactly match the text.",
    technologies: ["Python", "NLP", "RAG", "FastAPI", "LangChain"],
    category: "NLP",
    icon: "🕌",
    features: [
      "Specialized Hadith knowledge base integration",
      "Natural language understanding for Arabic & English",
      "Source citation and book/chapter verification",
      "Semantic search across authentic collections",
      "Context-aware response generation",
      "RESTful API for easy integration"
    ],
    gradient: "from-emerald-500 to-teal-600",
    images: [
      "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&q=80",
      "https://images.unsplash.com/photo-1585036156171-384164a8c675?w=800&q=80",
      "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&q=80"
    ],
    challenges: "Ensuring accuracy and authenticity of Hadith citations while handling the complexity of Arabic text processing and transliteration variations.",
    impact: "Helps Muslims and researchers quickly find authentic Hadith references, promoting accurate Islamic knowledge dissemination."
  },
  {
    id: 3,
    title: "Face Recognition Attendance",
    shortDesc: "Real-time facial recognition system",
    fullDesc: "A comprehensive attendance tracking system built using advanced computer vision techniques. This project showcases my skills in image processing and deep learning for face recognition. The system captures faces in real-time through a webcam, encodes facial features into 128-dimensional vectors using dlib's face recognition model, and matches them against a database of known faces. When a match is found, it automatically logs the attendance with timestamp, making traditional manual attendance obsolete.",
    technologies: ["Python", "OpenCV", "Dlib", "NumPy", "Pandas", "SQLite"],
    category: "Computer Vision",
    icon: "👤",
    features: [
      "Real-time face detection with HOG/CNN",
      "128-dimension face encoding for accuracy",
      "Automatic attendance logging with timestamps",
      "Excel/PDF report generation",
      "Multi-face detection in single frame",
      "Anti-spoofing measures for security"
    ],
    gradient: "from-violet-500 to-purple-600",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80"
    ],
    challenges: "Handling varying lighting conditions, camera angles, and ensuring the system works with different ethnicities and age groups with equal accuracy.",
    impact: "Reduces attendance marking time from minutes to seconds, eliminates proxy attendance, and provides accurate attendance records for institutions."
  },
  {
    id: 4,
    title: "Tic-Tac-Toe AI",
    shortDesc: "Deep Q-Network game agent",
    fullDesc: "An intelligent Tic-Tac-Toe agent implemented using Deep Q-Network (DQN) that learns to play optimally through reinforcement learning. This project demonstrates my understanding of neural networks, reinforcement learning concepts, and game theory. The AI starts with no knowledge of the game and learns through self-play, eventually discovering optimal strategies. The DQN architecture uses experience replay and target networks to stabilize training, showcasing fundamental concepts that scale to more complex games.",
    technologies: ["Python", "PyTorch", "DQN", "NumPy", "Matplotlib"],
    category: "Reinforcement Learning",
    icon: "🎮",
    features: [
      "Deep Q-Network architecture implementation",
      "Experience replay buffer for stable learning",
      "Epsilon-greedy exploration strategy",
      "Self-play training mechanism",
      "Training visualization and metrics",
      "Interactive play-against-AI mode"
    ],
    gradient: "from-orange-500 to-red-600",
    images: [
      "https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=800&q=80",
      "https://images.unsplash.com/photo-1552820728-8b83bb6b2b0c?w=800&q=80",
      "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800&q=80"
    ],
    challenges: "Balancing exploration vs exploitation during training and preventing the agent from getting stuck in suboptimal strategies.",
    impact: "Provides a clear, visual demonstration of how reinforcement learning agents learn through trial and error - a stepping stone to more complex game AI."
  },
  {
    id: 5,
    title: "CKD Prediction Model",
    shortDesc: "Medical diagnosis using ML",
    fullDesc: "A machine learning model for predicting Chronic Kidney Disease (CKD) using various classification algorithms. This healthcare AI project analyzes patient medical data including blood tests, urine tests, and patient history to provide early detection and risk assessment. The model compares multiple algorithms like Random Forest, SVM, and XGBoost to find the best performer. Feature importance analysis helps medical professionals understand which factors contribute most to CKD risk.",
    technologies: ["Python", "Scikit-learn", "Pandas", "Matplotlib", "Seaborn", "XGBoost"],
    category: "Healthcare AI",
    icon: "🏥",
    features: [
      "Multiple classification algorithm comparison",
      "Feature importance and selection analysis",
      "K-fold cross-validation for robust testing",
      "Prediction confidence scores and probabilities",
      "Data preprocessing and handling missing values",
      "Visualization of results and confusion matrices"
    ],
    gradient: "from-pink-500 to-rose-600",
    images: [
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&q=80",
      "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80",
      "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80"
    ],
    challenges: "Handling imbalanced medical datasets, dealing with missing values in patient records, and ensuring model interpretability for medical professionals.",
    impact: "Early detection of CKD can help patients get timely treatment, potentially saving lives and reducing healthcare costs through preventive care."
  },
  {
    id: 6,
    title: "Personality Prediction",
    shortDesc: "Behavioral analysis with ML",
    fullDesc: "A machine learning model trained to predict personality traits based on user responses and behavioral data. This project explores the intersection of psychology and AI, using the MBTI framework to categorize personality types. Users answer a series of questions, and the model analyzes patterns in their responses to predict their personality type. The system uses feature engineering to extract meaningful signals from text and numerical responses, applying various ML techniques for accurate classification.",
    technologies: ["Python", "Scikit-learn", "NLTK", "Streamlit", "Pandas"],
    category: "ML",
    icon: "🧠",
    features: [
      "MBTI personality type prediction",
      "Behavioral pattern analysis from responses",
      "Interactive web-based questionnaire",
      "Detailed personality reports and insights",
      "Text analysis for personality indicators",
      "Comparison with population statistics"
    ],
    gradient: "from-indigo-500 to-blue-600",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80"
    ],
    challenges: "Creating a balanced dataset across all personality types and validating predictions against self-reported types while avoiding confirmation bias.",
    impact: "Helps individuals gain self-awareness about their personality traits, useful for career counseling, team building, and personal development."
  },
  {
    id: 7,
    title: "SaaS Management App",
    shortDesc: "Modern frontend application",
    fullDesc: "A comprehensive Software as a Service management platform built with modern frontend technologies. This project showcases my web development skills and ability to create clean, responsive user interfaces. The application features a sleek dashboard for managing subscriptions, users, and business operations. Built with React and Next.js, it demonstrates my understanding of component architecture, state management, and modern CSS frameworks like Tailwind.",
    technologies: ["React", "Next.js", "Tailwind CSS", "TypeScript", "Framer Motion"],
    category: "Web Development",
    icon: "💼",
    features: [
      "Fully responsive dashboard design",
      "User management and role-based access",
      "Subscription tracking and billing views",
      "Analytics and reporting dashboards",
      "Dark/Light mode theming",
      "Smooth animations and transitions"
    ],
    gradient: "from-amber-500 to-orange-600",
    images: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80"
    ],
    challenges: "Creating a consistent design system across multiple pages while ensuring optimal performance and accessibility standards.",
    impact: "Provides businesses with an intuitive interface to manage their SaaS subscriptions, reducing time spent on administrative tasks."
  },
  {
    id: 8,
    title: "Bank Management System",
    shortDesc: "Streamlit-based finance app",
    fullDesc: "A full-featured banking management application with an intuitive Streamlit GUI that handles all core banking operations. This FinTech project demonstrates my ability to build practical, user-friendly applications that solve real-world problems. The system supports account creation, deposits, withdrawals, transfers, and statement generation. Data is stored securely in SQLite with proper transaction handling to ensure data integrity.",
    technologies: ["Python", "Streamlit", "SQLite", "Pandas", "Plotly"],
    category: "FinTech",
    icon: "🏦",
    features: [
      "Account creation and management",
      "Secure transaction processing",
      "Balance inquiries and account details",
      "Monthly statement generation (PDF)",
      "Transaction history visualization",
      "Multi-account transfer support"
    ],
    gradient: "from-green-500 to-emerald-600",
    images: [
      "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=800&q=80",
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80"
    ],
    challenges: "Implementing proper transaction handling with rollback capabilities and ensuring data consistency across concurrent operations.",
    impact: "Provides a template for building financial applications with Python, demonstrating that complex systems can be built with accessible tools."
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

export const interests = [
  { name: "Artificial Intelligence", icon: "🤖" },
  { name: "Astronomy", icon: "🌌" },
  { name: "Drawing & Sketching", icon: "🎨" },
  { name: "Gaming", icon: "🎮" },
  { name: "New Technologies", icon: "💡" },
  { name: "SEO", icon: "📈" }
];

export const softSkills = [
  "Problem-solving",
  "Self-learning",
  "Adaptability",
  "Technical Communication",
  "Curiosity & Exploration"
];
