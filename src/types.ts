export interface Flashcard {
  question: string;
  answer: string;
  isStarred?: boolean;
}

export interface QuizQuestion {
  id: number;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizState {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  selectedOptionIndex: number | null;
  score: number;
  showExplanation: boolean;
  isFinished: boolean;
}

export interface StudyTopic {
  id: string;
  title: string;
  createdTime: string;
  overview?: string;
  flashcards?: Flashcard[];
  quizQuestions?: QuizQuestion[];
  isGenerating?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface StudyGoal {
  id: string;
  title: string;
  isCompleted: boolean;
  topicId?: string; // Opt association
}

export interface StudySessionLog {
  id: string;
  topicTitle: string;
  durationSeconds: number;
  timestamp: string;
  type: "Pomodoro" | "Short Break" | "Custom";
}
