import React, { useState, useEffect } from "react";
import { 
  Flame, 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  BookOpen, 
  Award, 
  ListTodo, 
  Clock, 
  CheckCircle, 
  BrainCircuit,
  GraduationCap
} from "lucide-react";
import { StudyTopic, StudyGoal } from "../types";

interface DashboardViewProps {
  topics: StudyTopic[];
  goals: StudyGoal[];
  streak: number;
  onSelectTopic: (topic: StudyTopic) => void;
  onAddTopic: (title: string) => Promise<void>;
  onDeleteTopic: (id: string) => void;
  onAddGoal: (title: string) => void;
  onToggleGoal: (id: string) => void;
  onDeleteGoal: (id: string) => void;
  isGenerating: boolean;
}

export default function DashboardView({
  topics,
  goals,
  streak,
  onSelectTopic,
  onAddTopic,
  onDeleteTopic,
  onAddGoal,
  onToggleGoal,
  onDeleteGoal,
  isGenerating
}: DashboardViewProps) {
  const [newTopicName, setNewTopicName] = useState("");
  const [newGoalText, setNewGoalText] = useState("");

  // Focus Timer States
  const [timerMode, setTimerMode] = useState<"Work" | "Break">("Work");
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [timerRunning, setTimerRunning] = useState(false);
  const [totalWorkSecs, setTotalWorkSecs] = useState(0);

  // Focus Timer Cycle Hook
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        if (timerMode === "Work") {
          setTotalWorkSecs((t) => t + 1);
        }
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerRunning(false);
      // Toggle session types
      if (timerMode === "Work") {
        setTimerMode("Break");
        setTimeLeft(5 * 60); // 5 min break
        alert("📚 Great work! Work session completed. Time for a short break!");
      } else {
        setTimerMode("Work");
        setTimeLeft(25 * 60);
        alert("🚀 Break is over! Let's tackle the next study topic!");
      }
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft, timerMode]);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim() || isGenerating) return;
    const name = newTopicName.trim();
    setNewTopicName("");
    await onAddTopic(name);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    onAddGoal(newGoalText.trim());
    setNewGoalText("");
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(timerMode === "Work" ? 25 * 60 : 5 * 60);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const completionPercentage = goals.length 
    ? Math.round((goals.filter((g) => g.isCompleted).length / goals.length) * 100) 
    : 0;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
      
      {/* Dynamic Header & Streak Multiplier */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/60 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/10 text-blue-600 rounded-xl">
            <GraduationCap className="w-5.5 h-5.5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-sm tracking-tight text-[#121C28]">
              Ready to Learn?
            </h2>
            <p className="text-xs text-[#6D7A8A]">
              Choose a subject or create your own study plan.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-250/20 rounded-full font-display font-bold text-xs">
          <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
          <span>{streak} Day Streak</span>
        </div>
      </div>

      {/* Dynamic Topic Creator */}
      <div className="bg-white border border-[#D9E3F3]/80 rounded-2xl p-4.5 shadow-sm">
        <h3 className="font-display font-bold text-xs tracking-wider uppercase text-blue-600 mb-3 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span>Create Custom Study Module</span>
        </h3>
        <p className="text-xs text-[#6D7A8A] mb-3.5 leading-relaxed">
          Enter ANY topic (e.g., "Cell Division", "JS AsyncAwait", "Fractions"). AI Tutor will custom-generate study flashcards, summaries, and revision tests!
        </p>

        <form onSubmit={handleCreateTopic} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Type any study subject..."
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              disabled={isGenerating}
              className="w-full bg-[#FAFBFD] border border-[#D9E3F3] focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl py-3 pl-3 pr-10 text-xs font-semibold placeholder:text-[#BAC8D9] outline-none disabled:opacity-75 transition-all text-[#121C28]"
            />
          </div>
          <button
            type="submit"
            disabled={isGenerating || !newTopicName.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Curating Curriculum with AI...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Generate Plan with Gemini</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Focus Session Core (Pomodoro Study Timer) */}
      <div className="bg-white border border-[#D9E3F3]/80 rounded-2xl p-4.5 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="font-display font-bold text-xs tracking-wider uppercase text-blue-600 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Active Study Focus Timer</span>
          </h3>
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
            timerMode === "Work" ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
          }`}>
            {timerMode} Session
          </span>
        </div>

        <div className="text-center py-2.5">
          <div className="font-display text-4xl font-bold tracking-tight text-[#121C28] mb-1">
            {formatTimer(timeLeft)}
          </div>
          <p className="text-[10px] text-[#6D7A8A]">
            {timerMode === "Work" ? "Time to study actively" : "Relax and recharge"} • Total focus today: {Math.round(totalWorkSecs / 60)}m
          </p>
        </div>

        <div className="flex gap-2 justify-center mt-2">
          <button
            onClick={() => setTimerRunning(!timerRunning)}
            className="flex items-center gap-1 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-semibold select-none transition-colors"
          >
            {timerRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start</span>
              </>
            )}
          </button>
          <button
            onClick={resetTimer}
            className="flex items-center gap-1 px-4 py-2 bg-slate-50 text-slate-600 hover:bg-slate-150 rounded-xl text-xs font-semibold select-none transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Available Study Modules */}
      <div className="space-y-3">
        <h3 className="font-display font-bold text-xs tracking-wider uppercase text-blue-600 flex items-center gap-1.5 ml-1">
          <BookOpen className="w-4 h-4 text-blue-500" />
          <span>Your Study Curriculums</span>
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {topics.map((topic) => (
            <div 
              key={topic.id}
              className="group bg-white border border-[#D9E3F3]/80 hover:border-blue-550 hover:shadow-xs rounded-2xl p-4.5 flex flex-col justify-between transition-all relative overflow-hidden"
            >
              <div>
                <div className="flex justify-between items-start mb-1.5">
                  <h4 className="font-display font-bold text-sm text-[#121C28] group-hover:text-blue-600 transition-colors tracking-tight">
                    {topic.title}
                  </h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTopic(topic.id);
                    }}
                    className="p-1 text-[#BAC8D9] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Subject"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {topic.overview && (
                  <p className="text-xs text-[#6D7A8A] leading-relaxed line-clamp-2 pr-4 mb-3">
                    {topic.overview}
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center mt-1.5 pt-3.5 border-t border-[#FAFBFD]">
                <div className="flex items-center gap-2 text-[10px] text-[#A6B2C3] font-bold">
                  <span>{(topic.flashcards || []).length} Cards</span>
                  <span>•</span>
                  <span>{(topic.quizQuestions || []).length} Interactive Quizzes</span>
                </div>
                
                <button
                  onClick={() => onSelectTopic(topic)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Enter Class</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Study Checklist (Goals) */}
      <div className="bg-white border border-[#D9E3F3]/80 rounded-2xl p-4.5 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-display font-bold text-xs tracking-wider uppercase text-blue-600 flex items-center gap-1.5">
            <ListTodo className="w-4.5 h-4.5 text-blue-500" />
            <span>Personal Study Goals</span>
          </h3>
          <span className="text-[10px] font-bold text-[#6D7A8A]">
            {goals.filter((g) => g.isCompleted).length}/{goals.length} Done ({completionPercentage}%)
          </span>
        </div>

        {/* Completion Progress Bar */}
        <div className="w-full bg-[#F0F4FA] rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-blue-600 h-full transition-all duration-500" 
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <form onSubmit={handleCreateGoal} className="flex gap-2">
          <input
            type="text"
            placeholder="Add a milestone (e.g. Solve MLC Quiz)..."
            value={newGoalText}
            onChange={(e) => setNewGoalText(e.target.value)}
            className="flex-1 bg-[#FAFBFD] border border-[#D9E3F3] focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-3 py-2 text-xs font-semibold placeholder:text-[#BAC8D9] outline-none text-[#121C28]"
          />
          <button
            type="submit"
            className="bg-[#D2E3FC] text-blue-600 hover:bg-[#F0F4FA] border border-[#D9E3F3] p-2.5 rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        <div className="space-y-2">
          {goals.map((g) => (
            <div 
              key={g.id}
              className="flex items-center justify-between p-3 bg-[#FAFBFD] border border-[#D9E3F3]/50 rounded-xl relative hover:border-[#D9E3F3] transition-all"
            >
              <div className="flex items-center gap-2.5 flex-1 cursor-pointer" onClick={() => onToggleGoal(g.id)}>
                <button className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                  g.isCompleted 
                    ? "bg-blue-600 border-blue-600 text-white" 
                    : "border-[#D9E3F3] bg-white text-transparent hover:border-blue-600"
                }`}>
                  <CheckCircle className="w-3.5 h-3.5" />
                </button>
                <span className={`text-xs font-semibold ${g.isCompleted ? "line-through text-[#BAC8D9]" : "text-[#121C28]"}`}>
                  {g.title}
                </span>
              </div>
              <button
                onClick={() => onDeleteGoal(g.id)}
                className="p-1 text-[#BAC8D9] hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {goals.length === 0 && (
            <p className="text-center text-xs text-[#A6B2C3] py-2">
              No milestones added yet. Add some to master your studies!
            </p>
          )}
        </div>
      </div>

    </div>
  );
}
