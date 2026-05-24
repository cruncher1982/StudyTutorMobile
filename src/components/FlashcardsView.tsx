import React, { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  Star, 
  GraduationCap, 
  ArrowLeft,
  Flame,
  Award,
  BookOpen
} from "lucide-react";
import { Flashcard } from "../types";

interface FlashcardsViewProps {
  topicTitle: string;
  flashcards: Flashcard[];
  onBack: () => void;
}

export default function FlashcardsView({
  topicTitle,
  flashcards,
  onBack
}: FlashcardsViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);
  const [studyHistory, setStudyHistory] = useState<{ [key: number]: "known" | "learning" }>({});

  const card = flashcards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleMarkConfidence = (status: "known" | "learning") => {
    setStudyHistory((prev) => {
      const up = { ...prev };
      // Track counts increment
      if (status === "known" && prev[currentIndex] !== "known") {
        setMasteredCount((c) => c + 1);
      } else if (status === "learning" && prev[currentIndex] === "known") {
        setMasteredCount((c) => Math.max(0, c - 1));
      }
      up[currentIndex] = status;
      return up;
    });
    handleNext();
  };

  if (!card) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <GraduationCap className="w-12 h-12 text-[#BAC8D9] mb-3" />
        <p className="text-sm font-semibold text-[#121C28]">No flashcards found for this subject.</p>
        <button 
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isCompleted = Object.keys(studyHistory).length === flashcards.length;

  return (
    <div className="flex-1 flex flex-col bg-[#FAFBFD] overflow-hidden select-none">
      
      {/* Header controls */}
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
            Active Recall Quiz
          </p>
        </div>

        <div className="w-9 h-9 flex items-center justify-center text-xs font-bold text-blue-600 bg-blue-550/10 rounded-full">
          {currentIndex + 1}/{flashcards.length}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col justify-between">
        
        {isCompleted ? (
          /* Finished Stats Card */
          <div className="flex-1 bg-white border border-[#D9E3F3]/80 rounded-3xl p-6 shadow-sm flex flex-col justify-center items-center text-center space-y-5">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full">
              <Award className="w-10 h-10 animate-bounce" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-[#121C28]">Active Recall Concluded!</h3>
              <p className="text-xs text-[#6D7A8A] mt-1.5 leading-relaxed max-w-xs mx-auto">
                Excellent! You completed all flashcards. Ready to lock in your scores with the interactive test?
              </p>
            </div>

            <div className="bg-[#FAFBFD] border border-[#D9E3F3]/50 rounded-2xl p-4 w-full grid grid-cols-2 gap-4">
              <div>
                <span className="text-2xl font-bold font-display text-blue-600">
                  {masteredCount}
                </span>
                <p className="text-[10px] uppercase font-bold text-[#BAC8D9] mt-0.5">mastered</p>
              </div>
              <div>
                <span className="text-2xl font-bold font-display text-amber-500">
                  {flashcards.length - masteredCount}
                </span>
                <p className="text-[10px] uppercase font-bold text-[#BAC8D9] mt-0.5">reinforcing</p>
              </div>
            </div>

            <button
              onClick={() => {
                setCurrentIndex(0);
                setMasteredCount(0);
                setStudyHistory({});
                setIsFlipped(false);
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer w-full flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Core Session</span>
            </button>
          </div>
        ) : (
          /* High Fidelity Flip Card Canvas */
          <div className="flex-1 flex flex-col justify-between gap-5 my-auto">
            
            {/* Clickable Card Body */}
            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className="relative w-full aspect-[4/5] bg-white border border-[#D9E3F3] hover:border-blue-500 rounded-3xl p-6.5 flex flex-col justify-between cursor-pointer transition-all duration-300 shadow-xs"
            >
              <div className="flex justify-between items-center text-[10px] font-bold text-[#BAC8D9] uppercase tracking-wider">
                <span>INDEX CARD</span>
                <span className="text-blue-500 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 anim-spin" />
                  <span>Click to Flip</span>
                </span>
              </div>

              {/* Card Question/Answer Content */}
              <div className="flex-1 flex items-center justify-center py-4">
                {!isFlipped ? (
                  <p className="font-display font-bold text-base text-[#121C28] text-center leading-relaxed px-2">
                    {card.question}
                  </p>
                ) : (
                  <p className="text-xs font-medium text-[#121C28] leading-relaxed text-center bg-blue-50/50 p-4.5 rounded-2xl border border-blue-550/10">
                    {card.answer}
                  </p>
                )}
              </div>

              {/* Trigger Indicator */}
              <div className="text-center">
                <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1.5 rounded-full ${
                  isFlipped ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                }`}>
                  {isFlipped ? "Recall Key Revealed" : "Formulating Answer..."}
                </span>
              </div>
            </div>

            {/* Tactile Study Feedback Buttons */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[11px] font-bold text-[#BAC8D9] px-1 uppercase tracking-wider">
                <span>Evaluate Your Recall Accuracy:</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleMarkConfidence("learning")}
                  className="py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs border border-[#D9E3F3]/80 transition-colors cursor-pointer"
                >
                  Struggled. Repeat Card
                </button>
                <button
                  onClick={() => handleMarkConfidence("known")}
                  className="py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-xl text-xs border border-[#D9E3F3]/85 transition-colors cursor-pointer"
                >
                  I Recalled Perfectly!
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Carousel controls - visible only if study is active */}
        {!isCompleted && (
          <div className="flex justify-between items-center mt-5 pt-3.5 border-t border-[#FAFBFD]">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-3 bg-white border border-[#D9E3F3] hover:border-blue-500 hover:bg-[#F0F4FA] rounded-2xl text-[#121C28] disabled:opacity-40 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            <span className="text-xs font-semibold text-[#6D7A8A]">
              Swipe through cards
            </span>

            <button
              onClick={handleNext}
              disabled={currentIndex === flashcards.length - 1}
              className="p-3 bg-white border border-[#D9E3F3] hover:border-blue-500 hover:bg-[#F0F4FA] rounded-2xl text-[#121C28] disabled:opacity-40 transition-all cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
