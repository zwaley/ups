import React, { useState } from 'react';
import { COMPONENT_INFO } from '../constants';
import { askGeminiTutor, generateQuiz } from '../services/geminiService';
import { MessageSquare, X, ChevronRight, CheckCircle, AlertCircle, Cpu, RotateCw } from 'lucide-react';

interface InfoPanelProps {
  selectedComponent: string | null;
  onClose: () => void;
  context: string;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ selectedComponent, onClose, context }) => {
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<any>(null);
  const [quizResult, setQuizResult] = useState<boolean | null>(null);

  const description = selectedComponent 
    ? COMPONENT_INFO[selectedComponent] || "暂无该组件详细数据。"
    : "点击系统图中的组件（如整流器、开关）查看详细原理，或使用下方 AI 助教。";

  const handleAsk = async () => {
    if (!chatInput.trim()) return;
    const q = chatInput;
    setChatInput("");
    setChatHistory(prev => [...prev, { role: 'user', text: q }]);
    setLoading(true);
    
    const answer = await askGeminiTutor(q, `Currently selected: ${selectedComponent || 'None'}. Context: ${context}`);
    
    setChatHistory(prev => [...prev, { role: 'ai', text: answer }]);
    setLoading(false);
  };

  const handleQuiz = async () => {
    setLoading(true);
    setQuiz(null);
    setQuizResult(null);
    const q = await generateQuiz(context);
    setQuiz(q);
    setLoading(false);
  }

  const checkAnswer = (idx: number) => {
      setQuizResult(idx === quiz.correctIndex);
  }

  return (
    <div className="h-full flex flex-col bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
      
      {/* Header */}
      <div className="p-4 bg-slate-900/50 border-b border-slate-700 flex justify-between items-center">
        <h3 className="font-bold text-slate-200 flex items-center gap-2">
          <Cpu size={18} className="text-blue-400" />
          技术详情面板
        </h3>
        {selectedComponent && <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={18} /></button>}
      </div>

      {/* Component Info */}
      <div className="p-5 border-b border-slate-700 bg-slate-800/50">
        <h4 className="font-mono font-bold text-blue-400 mb-2 text-sm tracking-wider">
            {selectedComponent ? selectedComponent : "SYSTEM READY"}
        </h4>
        <p className="text-slate-300 text-sm leading-relaxed">{description}</p>
      </div>

      {/* AI Chat Area */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden bg-slate-900/30">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
          {chatHistory.length === 0 && !quiz && (
            <div className="text-center text-slate-600 mt-10">
              <MessageSquare size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-xs">AI 专家在线<br/>您可以询问任何关于 UPS 的技术问题。</p>
              <button onClick={handleQuiz} className="mt-6 px-4 py-2 bg-slate-700 text-blue-300 text-xs rounded hover:bg-slate-600 transition border border-slate-600 shadow-lg">
                启动知识测验 (Start Quiz)
              </button>
            </div>
          )}

          {quiz && (
             <div className="bg-slate-800 p-4 rounded border border-slate-600 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex justify-between items-start mb-3">
                    <p className="font-semibold text-slate-200 text-sm flex-1">{quiz.question}</p>
                    <button onClick={() => setQuiz(null)} className="text-slate-500 hover:text-slate-300"><X size={14}/></button>
                </div>
                <div className="space-y-2">
                    {quiz.options.map((opt: string, i: number) => (
                        <button 
                            key={i}
                            disabled={quizResult !== null}
                            onClick={() => checkAnswer(i)}
                            className={`w-full text-left p-2.5 text-xs rounded border transition ${
                                quizResult !== null 
                                    ? i === quiz.correctIndex 
                                        ? 'bg-green-900/30 border-green-500 text-green-200' 
                                        : quizResult === false && selectedComponent === null // Just simple highlighting 
                                            ? 'bg-slate-800 border-slate-700 text-slate-500'
                                            : 'bg-slate-800 border-slate-700 text-slate-500'
                                    : 'bg-slate-700 border-slate-600 hover:border-blue-400 text-slate-300 hover:bg-slate-650'
                            } ${quizResult !== null && i !== quiz.correctIndex && 'opacity-50'}`}
                        >
                            <span className="inline-block w-5 font-mono opacity-50">{String.fromCharCode(65+i)}.</span> {opt}
                        </button>
                    ))}
                </div>
                {quizResult !== null && (
                    <div className={`mt-3 text-xs p-3 rounded border ${quizResult ? 'bg-green-900/20 border-green-900/50 text-green-400' : 'bg-red-900/20 border-red-900/50 text-red-400'}`}>
                        <div className="flex items-center justify-between mb-2">
                            {quizResult ? <span className="flex items-center gap-2 font-bold"><CheckCircle size={14}/> 回答正确</span> : <span className="flex items-center gap-2 font-bold"><AlertCircle size={14}/> 回答错误</span>}
                        </div>
                        <p className="opacity-90 leading-relaxed mb-3">{quiz.explanation}</p>
                        <button onClick={handleQuiz} className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded flex items-center justify-center gap-2 transition">
                             <RotateCw size={14} /> 下一题 (Next Question)
                        </button>
                    </div>
                )}
             </div>
          )}

          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] p-3 rounded-lg text-xs leading-5 shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-center py-4">
                <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="relative flex-shrink-0">
          <input 
            type="text" 
            className="w-full pl-4 pr-10 py-3 bg-slate-800 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-blue-500 shadow-inner placeholder-slate-500 transition-colors"
            placeholder="输入您的问题..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          />
          <button 
            onClick={handleAsk}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded hover:bg-blue-500 transition shadow-lg"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;