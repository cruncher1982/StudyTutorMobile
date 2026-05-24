import React, { useState, useRef, useEffect } from "react";
import { 
  ArrowLeft, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  HelpCircle,
  GraduationCap
} from "lucide-react";
import { ChatMessage } from "../types";

interface ChatViewProps {
  topicTitle: string;
  chatHistory: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isGenerating: boolean;
  onBack: () => void;
}

export default function ChatView({
  topicTitle,
  chatHistory,
  onSendMessage,
  isGenerating,
  onBack
}: ChatViewProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isGenerating) return;
    const text = inputText.trim();
    setInputText("");
    onSendMessage(text);
  };

  const handleQuickPrompt = (prompt: string) => {
    if (isGenerating) return;
    onSendMessage(prompt);
  };

  // Custom regex-based Markdown text formatter to avoid dangerous HTML injection
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, lineIdx) => {
      // Check for bullet items
      const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("* ");
      let cleanLine = isBullet ? line.trim().substring(2) : line;

      // Match bold pattern **text**
      const parts = cleanLine.split(/\*\*([^*]+)\*\*/g);
      const renderedLine = parts.map((part, partIdx) => {
        if (partIdx % 2 === 1) {
          return <strong key={partIdx} className="font-bold text-blue-800">{part}</strong>;
        }
        // Match code block pattern `text`
        const codeParts = part.split(/`([^`]+)`/g);
        return codeParts.map((subPart, subPartIdx) => {
          if (subPartIdx % 2 === 1) {
            return <code key={subPartIdx} className="px-1.5 py-0.5 bg-neutral-100 text-red-600 rounded font-mono text-xs">{subPart}</code>;
          }
          return subPart;
        });
      });

      if (isBullet) {
        return (
          <li key={lineIdx} className="ml-4 list-disc text-xs leading-relaxed text-slate-800 py-0.5">
            {renderedLine}
          </li>
        );
      }

      return (
        <p key={lineIdx} className="text-xs leading-relaxed text-slate-800 py-1 min-h-[1em]">
          {renderedLine}
        </p>
      );
    });
  };

  const quickPrompts = [
    `Give me a real-world analogy for ${topicTitle}`,
    `Explain the most important rule of ${topicTitle}`,
    `Ask me a quick practice question to test my understanding`,
    `Break down the hardest part of ${topicTitle}`
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#FAFBFD] overflow-hidden">
      
      {/* Header bar */}
      <div className="px-4 py-3 bg-white border-b border-[#D9E3F3]/50 flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 hover:bg-[#F0F4FA] rounded-xl text-[#6D7A8A] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center flex-1 max-w-[220px]">
          <h2 className="font-display font-bold text-xs text-[#121C28] truncate">
            {topicTitle} Tutor Hub
          </h2>
          <p className="text-[10px] text-[#A6B2C3] font-bold uppercase tracking-wider flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
            <span>Interactive Chat AI</span>
          </p>
        </div>

        <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-50 border border-blue-150 flex items-center justify-center text-blue-600">
          <Bot className="w-5 h-5 stroke-[2]" />
        </div>
      </div>

      {/* Main Messages viewport */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        
        {chatHistory.length === 0 && (
          <div className="text-center py-8 px-4 space-y-4 max-w-sm mx-auto">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-500 to-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-md mx-auto">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-[#121C28]">
                Start Curated Study Chat
              </h3>
              <p className="text-xs text-[#6D7A8A] mt-1.5 leading-relaxed">
                Welcome to active study tutor session on **{topicTitle}**! Ask any questions, formula derivations, code requests, or tap a fast prompt chip below to prompt:
              </p>
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {chatHistory.map((m) => {
          const isTutor = m.role === "assistant";
          return (
            <div 
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${isTutor ? "mr-auto" : "ml-auto flex-row-reverse"}`}
            >
              {/* Profile Icon bubble */}
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border text-xs font-bold ${
                isTutor 
                  ? "bg-blue-50 border-blue-100 text-blue-600" 
                  : "bg-indigo-50 border-indigo-100 text-indigo-600"
              }`}>
                {isTutor ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
              </div>

              {/* Message Payload bubble */}
              <div className={`rounded-2xl px-4 py-3 border text-xs ${
                isTutor 
                  ? "bg-white border-[#D9E3F3]/80 rounded-tl-xs shadow-xs text-[#121C28]"
                  : "bg-[#D2E3FC] border-blue-200 rounded-tr-xs text-[#001D47]"
              }`}>
                
                {/* Text render layer */}
                <div className="space-y-1">
                  {renderMarkdown(m.content)}
                </div>

                {/* Timestamp layer */}
                <span className="block text-[8px] text-[#A6B2C3] text-right mt-1.5 uppercase font-bold">
                  {m.timestamp}
                </span>

              </div>
            </div>
          );
        })}

        {/* Tutor Active Generating typing bubble indicator */}
        {isGenerating && (
          <div className="flex gap-2.5 max-w-[80%] mr-auto items-start">
            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-105 flex items-center justify-center text-blue-600 animate-pulse">
              <Bot className="w-4.5 h-4.5" />
            </div>
            <div className="bg-white border border-[#D9E3F3]/60 rounded-2xl rounded-tl-xs px-4 py-3.5 shadow-xs flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Persistent Quick Prompts tray at bottom */}
      {!isGenerating && (
        <div className="px-4 py-2 border-t border-[#D9E3F3]/30 bg-[#FAFBFD]/60 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none z-10 select-none">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickPrompt(p)}
              className="px-3.5 py-2 bg-white hover:bg-blue-50 hover:border-blue-500 text-xs font-semibold text-blue-600 border border-[#D9E3F3] rounded-full shadow-xs transition-all cursor-pointer inline-block"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Trigger Send Form */}
      <form 
        onSubmit={handleSubmit}
        className="p-4 bg-white border-t border-[#D9E3F3]/50 flex gap-2 items-center"
      >
        <input
          type="text"
          placeholder="Ask your tutor anything..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isGenerating}
          className="flex-1 bg-[#FAFBFD] border border-[#D9E3F3] focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-3.5 py-3 text-xs font-semibold placeholder:text-[#BAC8D9] outline-none text-[#121C28] disabled:opacity-75"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isGenerating}
          className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center shrink-0"
        >
          <Send className="w-4.5 h-4.5 stroke-[2]" />
        </button>
      </form>

    </div>
  );
}
