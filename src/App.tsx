import { useState, useEffect } from "react";
import { 
  BookOpen, 
  GraduationCap, 
  BrainCircuit, 
  HelpCircle, 
  MessageSquare, 
  Layout, 
  ArrowLeft,
  BookMarked,
  Sparkles,
  Trophy,
  Activity
} from "lucide-react";
import AndroidFrame from "./components/AndroidFrame";
import DashboardView from "./components/DashboardView";
import FlashcardsView from "./components/FlashcardsView";
import QuizzerView from "./components/QuizzerView";
import ChatView from "./components/ChatView";
import { StudyTopic, StudyGoal, ChatMessage } from "./types";

// High-fidelity pre-curated modules to ensure immediate offline study functionality
const DEFAULT_TOPICS: StudyTopic[] = [
  {
    id: "android-fundamentals",
    title: "Android Architecture & Kotlin",
    overview: "A comprehensive breakdown of native Android engineering. Covers basic system components (Activities, Services, Providers), lifecycle hooks, jetpack compose state flows, and reactive repository design patterns.",
    createdTime: new Date().toISOString(),
    flashcards: [
      {
        question: "What are the four core app components declared in the Android Manifest?",
        answer: "Activity (visual interactions), Service (background jobs), Broadcast Receiver (OS events), and Content Provider (inter-app database sharing).",
        isStarred: false
      },
      {
        question: "What is the primary role of an Android ViewModel?",
        answer: "To store and manage UI state data in a lifecycle-aware way, ensuring information survives configuration updates like screen rotations.",
        isStarred: false
      },
      {
        question: "What file contains essential declaration metadata about app packages and configurations in Android?",
        answer: "The AndroidManifest.xml file. The OS parses this file to configure application access permissions and launcher main activities.",
        isStarred: false
      },
      {
        question: "What is Jetpack Compose?",
        answer: "Android's modern declarative UI toolkit that compiles functional Kotlin blocks with structural visual attributes directly into active UI canvas layers.",
        isStarred: false
      },
      {
        question: "Why is the Repository pattern favored in mobile app sync engines?",
        answer: "It creates a clean single point of truth for accessing database structures, abstracting whether data comes from local storage (SQLite Room) or Retrofit networks.",
        isStarred: false
      }
    ],
    quizQuestions: [
      {
        id: 1,
        questionText: "Which Android component handles processes in the background with zero physical interface?",
        options: ["ViewModel Provider", "Service component", "Activity controller", "Content Resolver"],
        correctIndex: 1,
        explanation: "An Android Service is specifically designed for ongoing background processing (like streaming media or tracking location) without a user interface."
      },
      {
        id: 2,
        questionText: "Which XML configuration file is mandatory to request Camera or Location permissions from the OS?",
        options: ["build.gradle files", "AndroidManifest.xml", "themes.xml", "MainActivity.kt"],
        correctIndex: 1,
        explanation: "In Android, Manifest.xml serves as the central directory of hardware permission requests which the user must approve."
      },
      {
        id: 3,
        questionText: "What represents the Kotlin declarative UI compiler annotation inside Jetpack Compose?",
        options: ["@LayoutView", "@Component", "@Composable", "@ComposeState"],
        correctIndex: 2,
        explanation: "Applying the `@Composable` annotation lets the compiler know to transform standard Kotlin code expressions into dynamic, interactive layout nodes."
      },
      {
        id: 4,
        questionText: "How does Android's LiveData or StateFlow benefit View-to-ViewModel communications?",
        options: ["By bypassing standard thread-safe locks", "Through continuous data stream observers that update the UI of active controllers", "By deleting state caches automatically", "By compiling views into native machine code"],
        correctIndex: 1,
        explanation: "State flows provide observable streams that push state updates directly to views, automatically pausing emission if the UI component is inactive."
      }
    ]
  },
  {
    id: "react-architecture",
    title: "React Hooks & Vite State Flow",
    overview: "Explore state rendering processes, virtual reconciliation loops, Vite hot-module replacement serving structures, and dependency sync strategies in React applications.",
    createdTime: new Date().toISOString(),
    flashcards: [
      {
        question: "How does Vite accelerate development server start times compared to legacy bundlers?",
        answer: "It serves files on-demand as standard native ES Modules (ESM) in the browser, bypassing initial global bundling entirely.",
        isStarred: false
      },
      {
        question: "What is the crucial rule governing React Hooks invocation?",
        answer: "Hooks must only be called at the top scope of functional components—never inside conditional statements, nested loops, or helper functions.",
        isStarred: false
      },
      {
        question: "What does target dependency do inside a React useEffect Hook?",
        answer: "It acts as a trigger filter. React compares the active hooks properties on each render and only re-triggers if a specified dependency primitive item changes.",
        isStarred: false
      }
    ],
    quizQuestions: [
      {
        id: 1,
        questionText: "During local development, how does Vite serve source modules without deep bundle operations?",
        options: ["By serving native on-demand ES Modules", "Pre-bundling via Webpack loaders", "Ignoring JSX transpilations", "Enforcing strict static HTML caches"],
        correctIndex: 0,
        explanation: "Vite serves files directly as browser-compliant ES Modules, letting the browser retrieve and compile modules asynchronously on target demand."
      },
      {
        id: 2,
        questionText: "What hook is strictly recommended to memoize a computationally expensive math function or scalar result?",
        options: ["useReducer", "useEffect", "useMemo", "useCallback"],
        correctIndex: 2,
        explanation: "useMemo caches the returned value of a calculation. It will only re-invoke the computation when its listed dependency values alter."
      }
    ]
  }
];

const DEFAULT_GOALS: StudyGoal[] = [
  { id: "g1", title: "Complete Android Compose Quiz", isCompleted: false },
  { id: "g2", title: "Review Vite Flashcard Deck", isCompleted: true },
  { id: "g3", title: "Solve Quiz with 100% Accuracy", isCompleted: false }
];

export default function App() {
  const [topics, setTopics] = useState<StudyTopic[]>(() => {
    const saved = localStorage.getItem("study_tutor_topics");
    return saved ? JSON.parse(saved) : DEFAULT_TOPICS;
  });

  const [goals, setGoals] = useState<StudyGoal[]>(() => {
    const saved = localStorage.getItem("study_tutor_goals");
    return saved ? JSON.parse(saved) : DEFAULT_GOALS;
  });

  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem("study_tutor_streak");
    return saved ? parseInt(saved, 10) : 5;
  });

  const [chatHistories, setChatHistories] = useState<{ [topicId: string]: ChatMessage[] }>(() => {
    const saved = localStorage.getItem("study_tutor_logs");
    return saved ? JSON.parse(saved) : {};
  });

  // Navigation Logic States
  const [activeTopic, setActiveTopic] = useState<StudyTopic | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "flashcards" | "quiz" | "chat">("overview");

  // Loading States
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatGenerating, setChatGenerating] = useState(false);

  // Sync state data to localStorage on changes
  useEffect(() => {
    localStorage.setItem("study_tutor_topics", JSON.stringify(topics));
  }, [topics]);

  useEffect(() => {
    localStorage.setItem("study_tutor_goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem("study_tutor_streak", streak.toString());
  }, [streak]);

  useEffect(() => {
    localStorage.setItem("study_tutor_logs", JSON.stringify(chatHistories));
  }, [chatHistories]);

  // Handle dynamic AI Study Plan Creation
  const handleAddTopic = async (topicTitle: string) => {
    setIsGenerating(true);
    try {
      // 1. Fetch Summary + Flashcards
      const cardRes = await fetch("/api/tutor/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicTitle }),
      });
      if (!cardRes.ok) {
        throw new Error("Unable to compose flashcards with Gemini. Please confirm your API Key configuration.");
      }
      const cardData = await cardRes.json();

      // 2. Fetch Multi-choice quiz
      const quizRes = await fetch("/api/tutor/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicTitle }),
      });
      if (!quizRes.ok) {
        throw new Error("Unable to formulate Interactive Quiz with Gemini.");
      }
      const quizData = await quizRes.json();

      const newTopic: StudyTopic = {
        id: "topic-" + Math.random().toString(36).substring(2, 9),
        title: topicTitle,
        createdTime: new Date().toISOString(),
        overview: cardData.overview || `An intuitive study curriculum focusing on ${topicTitle}.`,
        flashcards: cardData.flashcards || [],
        quizQuestions: quizData.questions || []
      };

      setTopics((prev) => [newTopic, ...prev]);
      setStreak((s) => s + 1); // Boost streak for active curriculum creation!

      // Automatically focus into new created topic
      setActiveTopic(newTopic);
      setActiveTab("overview");

    } catch (err: any) {
      alert(`⚠️ Study Blueprint Generation Failed: ${err.message || "An unexpected error occurred during synthesis."}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteTopic = (id: string) => {
    if (confirm("Are you sure you want to remove this study subject from your profile?")) {
      setTopics((prev) => prev.filter((t) => t.id !== id));
      if (activeTopic?.id === id) {
        setActiveTopic(null);
      }
    }
  };

  // Chat message submission to Server Proxy
  const handleSendChatMessage = async (text: string) => {
    if (!activeTopic) return;
    const history = chatHistories[activeTopic.id] || [];
    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(5),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...history, userMsg];
    setChatHistories((prev) => ({ ...prev, [activeTopic.id]: updatedHistory }));
    setChatGenerating(true);

    try {
      const response = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedHistory,
          contextTopic: activeTopic.title,
        }),
      });

      if (!response.ok) {
        throw new Error("Tutor was unable to respond. Please make sure the API key is active.");
      }

      const resData = await response.json();
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(36).substring(5),
        role: "assistant",
        content: resData.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatHistories((prev) => ({
        ...prev,
        [activeTopic.id]: [...updatedHistory, assistantMsg],
      }));
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: Math.random().toString(36).substring(5),
        role: "assistant",
        content: `⚠️ **Study Companion Error:** I couldn't connect to the AI model. Please verify your **GEMINI_API_KEY** is configured in AI Studio's Secrets panel.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistories((prev) => ({
        ...prev,
        [activeTopic.id]: [...updatedHistory, errorMsg],
      }));
    } finally {
      setChatGenerating(false);
    }
  };

  // Goals List controllers
  const handleAddGoal = (title: string) => {
    const newGoal: StudyGoal = {
      id: "goal-" + Math.random().toString(36).substring(5),
      title,
      isCompleted: false
    };
    setGoals((prev) => [newGoal, ...prev]);
  };

  const handleToggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isCompleted: !g.isCompleted } : g))
    );
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <AndroidFrame>
      <div className="flex flex-col h-full bg-[#FAFBFD] relative">
        
        {/* App Title Frame Header */}
        {!activeTopic && (
          <div className="bg-white border-b border-[#D9E3F3]/50 px-4 py-3 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-display font-bold text-sm tracking-tight text-[#121C28]">
                Study Tutor Companion
              </span>
            </div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" title="Study Engine Online" />
          </div>
        )}

        {/* Dynamic Route views router */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTopic ? (
            activeTab === "flashcards" ? (
              <FlashcardsView
                topicTitle={activeTopic.title}
                flashcards={activeTopic.flashcards || []}
                onBack={() => setActiveTab("overview")}
              />
            ) : activeTab === "quiz" ? (
              <QuizzerView
                topicTitle={activeTopic.title}
                questions={activeTopic.quizQuestions || []}
                onBack={() => setActiveTab("overview")}
              />
            ) : activeTab === "chat" ? (
              <ChatView
                topicTitle={activeTopic.title}
                chatHistory={chatHistories[activeTopic.id] || []}
                onSendMessage={handleSendChatMessage}
                isGenerating={chatGenerating}
                onBack={() => setActiveTab("overview")}
              />
            ) : (
              /* High Fidelity Single Topic Overview Hub */
              <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
                
                {/* Back Link */}
                <button
                  onClick={() => setActiveTopic(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D9E3F3] text-xs font-semibold text-[#6D7A8A] rounded-xl hover:bg-[#F0F4FA] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Subjects</span>
                </button>

                {/* Primary Subject card summary */}
                <div className="bg-white border border-[#D9E3F3]/80 rounded-2xl p-5 shadow-xs relative overflow-hidden">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl inline-block mb-3.5">
                    <BookMarked className="w-5.5 h-5.5" />
                  </div>
                  <h2 className="font-display font-bold text-base text-[#121C28] tracking-tight">
                    {activeTopic.title}
                  </h2>
                  <p className="text-xs text-[#6D7A8A] leading-relaxed mt-2">
                    {activeTopic.overview || "This AI module includes persistent flashcards, study summaries, and interactive revision testing."}
                  </p>
                </div>

                {/* Menu list representing class options/views (Flashcards, Quiz, Chat) */}
                <div className="space-y-3">
                  <h3 className="font-display font-bold text-xs tracking-wider uppercase text-blue-600 flex items-center gap-1.5 ml-1">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span>Selected Curriculum Tasks</span>
                  </h3>

                  <div className="grid grid-cols-1 gap-3">
                    
                    {/* Recall Flashcards Task item */}
                    <button
                      onClick={() => setActiveTab("flashcards")}
                      className="w-full text-left bg-white border border-[#D9E3F3]/80 hover:border-blue-500 rounded-2xl p-4 flex items-center justify-between transition-all cursor-pointer shadow-xs group"
                    >
                      <div className="flex items-center gap-3.5 pr-2">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                          <BookOpen className="w-5.5 h-5.5" />
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-xs text-[#121C28] group-hover:text-blue-600 transition-colors">
                            Active Recall Index Cards
                          </h4>
                          <p className="text-[10px] text-[#A6B2C3] mt-0.5 font-semibold">
                            Flip and practice concepts • {(activeTopic.flashcards || []).length} Flashcards
                          </p>
                        </div>
                      </div>
                      <div className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl text-[10px] font-bold uppercase select-none">
                        Practice
                      </div>
                    </button>

                    {/* Dynamic Mini Quiz Task item */}
                    <button
                      onClick={() => setActiveTab("quiz")}
                      className="w-full text-left bg-white border border-[#D9E3F3]/80 hover:border-blue-500 rounded-2xl p-4 flex items-center justify-between transition-all cursor-pointer shadow-xs group"
                    >
                      <div className="flex items-center gap-3.5 pr-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                          <BrainCircuit className="w-5.5 h-5.5" />
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-xs text-[#121C28] group-hover:text-blue-600 transition-colors">
                            Knowledge Review Test
                          </h4>
                          <p className="text-[10px] text-[#A6B2C3] mt-0.5 font-semibold">
                            Interactively score yourself • {(activeTopic.quizQuestions || []).length} interactive questions
                          </p>
                        </div>
                      </div>
                      <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-bold uppercase select-none">
                        Test MCQ
                      </div>
                    </button>

                    {/* Chat with Tutor Task item */}
                    <button
                      onClick={() => setActiveTab("chat")}
                      className="w-full text-left bg-white border border-[#D9E3F3]/80 hover:border-blue-500 rounded-2xl p-4 flex items-center justify-between transition-all cursor-pointer shadow-xs group"
                    >
                      <div className="flex items-center gap-3.5 pr-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                          <MessageSquare className="w-5.5 h-5.5" />
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-xs text-[#121C28] group-hover:text-blue-600 transition-colors">
                            AI Explanation Coach
                          </h4>
                          <p className="text-[10px] text-[#A6B2C3] mt-0.5 font-semibold">
                            Ask math, code, or context explanations directly to Gemini
                          </p>
                        </div>
                      </div>
                      <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-bold uppercase select-none">
                        Chat
                      </div>
                    </button>

                  </div>
                </div>

                {/* Progress Card */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold tracking-wider uppercase opacity-80">STUDY COMPLETION ADVICE</span>
                    <h4 className="font-display font-bold text-xs">Test Ready Scorecard</h4>
                    <p className="text-[10px] opacity-90 max-w-[220px]">
                      Complete all listed recall cards and scored quizzes to lock in total study retention.
                    </p>
                  </div>
                  <Trophy className="w-10 h-10 text-amber-300 stroke-[1.5] fill-amber-300/10 drop-shadow shrink-0 ml-2" />
                </div>

              </div>
            )
          ) : (
            /* Home / Dashboard list representation */
            <DashboardView
              topics={topics}
              goals={goals}
              streak={streak}
              onSelectTopic={(t) => {
                setActiveTopic(t);
                setActiveTab("overview");
              }}
              onAddTopic={handleAddTopic}
              onDeleteTopic={handleDeleteTopic}
              onAddGoal={handleAddGoal}
              onToggleGoal={handleToggleGoal}
              onDeleteGoal={handleDeleteGoal}
              isGenerating={isGenerating}
            />
          )}
        </div>

        {/* Global sticky Bottom Navigation Area for mobile design standard */}
        <div className="bg-white border-t border-[#D9E3F3]/50 px-4 py-2 flex justify-around items-center shrink-0 z-10 select-none">
          <button
            onClick={() => {
              setActiveTopic(null);
            }}
            className={`flex flex-col items-center gap-1.5 py-1 px-4.5 rounded-xl transition-all cursor-pointer ${
              activeTopic === null 
                ? "bg-blue-50 text-blue-600 font-bold" 
                : "text-[#6D7A8A] hover:bg-neutral-50"
            }`}
          >
            <Layout className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-wider">Dashboard</span>
          </button>

          <button
            onClick={() => {
              if (topics.length > 0) {
                setActiveTopic(topics[0]);
                setActiveTab("overview");
              } else {
                alert("Please add or select a study topic first!");
              }
            }}
            className={`flex flex-col items-center gap-1.5 py-1 px-4.5 rounded-xl transition-all cursor-pointer ${
              activeTopic !== null 
                ? "bg-blue-50 text-blue-600 font-bold" 
                : "text-[#6D7A8A] hover:bg-neutral-50"
            }`}
          >
            <BookMarked className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-wider">Plan Hub</span>
          </button>
        </div>

      </div>
    </AndroidFrame>
  );
}
