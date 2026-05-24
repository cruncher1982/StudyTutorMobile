import React, { useState } from "react";
import { 
  ArrowLeft, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  Award, 
  RefreshCw,
  BookOpen,
  HelpCircle as QuestionIcon
} from "lucide-react";
import { QuizQuestion } from "../types";

interface QuizzerViewProps {
  topicTitle: string;
  questions: QuizQuestion[];
  onBack: () => void;
}

export default function QuizzerView({
  topicTitle,
  questions,
  onBack
}: QuizzerViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const activeQuestion = questions[currentIndex];

  const handleSelectOption = (optionIdx: number) => {
    if (selectedOption !== null) return; // Prevent clicking twice
    setSelectedOption(optionIdx);
    setShowExplanation(true);
    if (optionIdx === activeQuestion.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setIsFinished(false);
  };

  if (!activeQuestion && !isFinished) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <HelpCircle className="w-12 h-12 text-[#BAC8D9] mb-3" />
        <p className="text-sm font-semibold text-[#121C28]">No questions curated for this topic yet.</p>
        <button 
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#FAFBFD] overflow-hidden">
      
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-[#D9E3F3]/50 flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 hover:bg-[#F0F4FA] rounded-xl text-[#6D7A8A] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center flex-1 max-w-[200px]">
          <h2 className="font-display font-bold text-xs text-[#121C28] truncate">
            {topicTitle}
          </h2>
          <p className="text-[10px] text-[#A6B2C3] font-bold uppercase tracking-wider">
            Review Test Interactive
          </p>
        </div>

        <div className="w-9 h-9 flex items-center justify-center text-xs font-bold text-blue-600 bg-blue-50 rounded-full">
          {!isFinished ? `${currentIndex + 1}/${questions.length}` : "Done"}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        
        {isFinished ? (
          /* High-Fidelity Scoring Dashboard */
          <div className="bg-white border border-[#D9E3F3]/80 rounded-3xl p-6.5 shadow-xs text-center space-y-5">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full inline-block">
              <Award className="w-11 h-11 animate-pulse" />
            </div>

            <div>
              <h3 className="font-display font-bold text-lg text-[#121C28]">Curriculum Exam Complete!</h3>
              <p className="text-xs text-[#6D7A8A] mt-1 pr-1 leading-relaxed">
                Tutor Scorecard curated. Let's see how much concept content you have mastered!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-1.5">
              <div className="bg-blue-50/40 border border-blue-105/10 rounded-2xl p-4">
                <span className="text-3xl font-bold font-display text-blue-600">
                  {Math.round((score / questions.length) * 100)}%
                </span>
                <p className="text-[10px] uppercase font-bold text-[#A6B2C3] mt-0.5">accuracy</p>
              </div>
              <div className="bg-slate-50 border border-slate-105/10 rounded-2xl p-4">
                <span className="text-3xl font-bold font-display text-[#121C28]">
                  {score}/{questions.length}
                </span>
                <p className="text-[10px] uppercase font-bold text-[#A6B2C3] mt-0.5">points</p>
              </div>
            </div>

            <div className="text-left bg-[#FAFBFD] border border-[#D9E3F3]/50 rounded-2xl p-4.5 space-y-2">
              <h4 className="text-xs font-bold text-[#121C28] flex items-center gap-1">
                <span>🎓 Tutor Evaluation Advice:</span>
              </h4>
              <p className="text-xs text-[#6D7A8A] leading-relaxed">
                {score === questions.length 
                  ? "Perfect Score! You demonstrate stellar grasp over the content. Move onto explaining the concept to the AI to verify active teaching mastery."
                  : score >= questions.length / 2
                    ? "Great efforts! Check out your incorrect answers and re-read index flashcards to easily clear any minor conceptual blindspots."
                    : "A solid first run! Retake the quiz and practice explanation chat with the tutor to build strong study recall bridges."
                }
              </p>
            </div>

            <div className="space-y-2 pt-2.5">
              <button
                onClick={handleRetry}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 animate-spin-slow" />
                <span>Retake Core Exam</span>
              </button>
              <button
                onClick={onBack}
                className="w-full py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs border border-[#D9E3F3] transition-colors cursor-pointer"
              >
                Return to Subjects List
              </button>
            </div>
          </div>
        ) : (
          /* MCQ Interactive Question Canvas */
          <div className="space-y-5">
            
            {/* Question Text Box */}
            <div className="bg-white border border-[#D9E3F3]/60 rounded-2xl p-5.5 shadow-sm">
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-blue-500 mb-2.5 tracking-wider">
                <QuestionIcon className="w-4 h-4" />
                <span>Question of Understanding</span>
              </div>
              <h3 className="font-display font-semibold text-sm text-[#121C28] leading-relaxed">
                {activeQuestion.questionText}
              </h3>
            </div>

            {/* List of Options */}
            <div className="space-y-3">
              {activeQuestion.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = activeQuestion.correctIndex === idx;
                const hasSelectedAny = selectedOption !== null;

                let optionStyle = "bg-white border-[#D9E3F3] hover:border-blue-500 hover:bg-blue-50/20";
                let textStyle = "text-[#121C28]";
                let icon = null;

                if (hasSelectedAny) {
                  if (isCorrect) {
                    optionStyle = "bg-emerald-50 border-emerald-555 text-emerald-800 font-semibold shadow-xs";
                    textStyle = "text-emerald-900";
                    icon = <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />;
                  } else if (isSelected) {
                    optionStyle = "bg-red-50 border-red-550 text-red-800 shadow-xs";
                    textStyle = "text-red-900";
                    icon = <XCircle className="w-4.5 h-4.5 text-red-500" />;
                  } else {
                    optionStyle = "bg-white/60 border-neutral-100 opacity-60";
                    textStyle = "text-[#6D7A8A]";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={hasSelectedAny}
                    className={`w-full p-4 border rounded-xl flex justify-between items-center transition-all text-left text-xs ${optionStyle} ${
                      !hasSelectedAny ? "cursor-pointer" : "cursor-default"
                    }`}
                  >
                    <div className="flex items-center gap-3 pr-2">
                      <span className={`w-6 h-6 rounded-full border flex items-center justify-center font-display font-semibold text-xs transition-colors shrink-0 ${
                        isSelected 
                          ? "bg-blue-600 border-blue-600 text-white"
                          : hasSelectedAny && isCorrect
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-neutral-200 bg-neutral-50 text-[#6D7A8A]"
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className={`font-semibold ${textStyle}`}>
                        {option}
                      </span>
                    </div>
                    {icon}
                  </button>
                );
              })}
            </div>

            {/* AI Coaching Explanation Area */}
            {showExplanation && (
              <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-4.5 space-y-2 shadow-inner">
                <h4 className="text-xs font-bold text-blue-800">
                  {selectedOption === activeQuestion.correctIndex 
                    ? "🎉 Correct! Let's explore:" 
                    : "💡 Incorrect, check out why:"
                  }
                </h4>
                <p className="text-xs text-blue-950 font-medium leading-relaxed">
                  {activeQuestion.explanation}
                </p>
                
                <button
                  onClick={handleNext}
                  className="w-full mt-3 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>
                    {currentIndex === questions.length - 1 ? "Finish Test" : "Continue to Next Question"}
                  </span>
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
