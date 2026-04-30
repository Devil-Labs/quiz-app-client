import { useState, useEffect } from 'react';
import type { User } from '../App';
import { getQuizConfig } from '../types/quiz';

export default function QuizInterface({ user, onFinish }: { user: User | null, onFinish: (score: number) => void }) {
  const MOCK_QUESTIONS = getQuizConfig().questions;

  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [violationLogs, setViolationLogs] = useState<{ time: string; event: string }[]>([]);

  // State for different question types
  const [singleAnswer, setSingleAnswer] = useState<number | null>(null);
  const [multipleAnswer, setMultipleAnswer] = useState<number[]>([]);
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [matchAnswer, setMatchAnswer] = useState<Record<string, string>>({});

  const question = MOCK_QUESTIONS[currentQ];
  const progress = ((currentQ) / MOCK_QUESTIONS.length) * 100;

  useEffect(() => {
    // 1. Enforce Fullscreen Mode
    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.warn("Fullscreen API blocked or unsupported:", err);
      }
    };
    enterFullscreen();

    const logSuspiciousEvent = async (eventLabel: string) => {
      const newLog = { time: new Date().toISOString(), event: eventLabel };
      setViolationLogs((prev) => [...prev, newLog]);
      console.warn(`[Anti-Cheat System] Suspicious behavior by ${user?.name || 'Unknown'}:`, newLog);
      
      // Async post to persistence log backend table
      try {
        await fetch('http://localhost:5000/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventType: 'Anti-Cheat Violation', user: user?.name, details: newLog })
        });
      } catch (err) {
         // Silently fail if log cannot be published
      }
    };

    // 2. Disable Right-Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      logSuspiciousEvent('Right-click (Context Menu) attempted');
    };

    // 3. Disable Copy & Paste
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      logSuspiciousEvent('Copy action attempted');
    };
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      logSuspiciousEvent('Paste action attempted');
    };

    // 4. Detect Tab Switching (Page Visibility API)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        logSuspiciousEvent('Tab switched or browser minimized');
      }
    };

    // 5. Detect Exiting Fullscreen
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        logSuspiciousEvent('Exited fullscreen mode');
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.warn(err));
      }
    };
  }, [user]);

  const clearCurrentResponse = () => {
    setSingleAnswer(null);
    setMultipleAnswer([]);
    setTextAnswer('');
    setMatchAnswer({});
  };

  const evaluateCurrentQuestion = () => {
    let isCorrect = false;

    if (question.type === 'single_mcq') {
      isCorrect = singleAnswer === question.answer;
    } else if (question.type === 'multiple_mcq') {
      const sortedSelected = [...multipleAnswer].sort();
      const sortedAnswer = [...question.answer].sort();
      isCorrect = sortedSelected.length === sortedAnswer.length && sortedSelected.every((v, i) => v === sortedAnswer[i]);
    } else if (question.type === 'text') {
      isCorrect = textAnswer.trim().toLowerCase() === question.answer.toLowerCase();
    } else if (question.type === 'match') {
      const keys = Object.keys(question.answer);
      isCorrect = keys.length > 0 && keys.every(k => matchAnswer[k] === question.answer[k]);
    }

    return isCorrect;
  };

  const handleNext = () => {
    const isCorrect = evaluateCurrentQuestion();
    const newScore = score + (isCorrect ? 10 : 0);
    
    if (isCorrect) setScore(newScore);
    
    if (currentQ + 1 < MOCK_QUESTIONS.length) {
      setCurrentQ(c => c + 1);
      clearCurrentResponse();
    } else {
      console.log('--- Final Anti-Cheat Report ---');
      console.log(violationLogs);
      onFinish(newScore);
    }
  };

  const isNextDisabled = () => {
    if (question.type === 'single_mcq') return singleAnswer === null;
    if (question.type === 'multiple_mcq') return multipleAnswer.length === 0;
    if (question.type === 'text') return textAnswer.trim() === '';
    if (question.type === 'match') return Object.keys(matchAnswer).length !== question.leftItems.length;
    return true;
  };

  const toggleMultipleOption = (index: number) => {
    setMultipleAnswer(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleMatchSelect = (left: string, right: string) => {
    setMatchAnswer(prev => ({ ...prev, [left]: right }));
  };

  return (
    <div className="w-full flex-grow flex flex-col relative h-full min-h-[70vh] select-none">
      {/* Anti-Cheat Watermark overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-5 overflow-hidden mix-blend-multiply">
        <div className="transform -rotate-45 flex flex-col items-center justify-center space-y-8 whitespace-nowrap">
          {Array.from({ length: 15 }).map((_, i) => (
            <span key={i} className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-widest">
              {user?.name} • {user?.email} • {user?.phone} • {user?.name}
            </span>
          ))}
        </div>
      </div>

      {/* Header/Progress */}
      <div className="w-full bg-slate-50/90 backdrop-blur-sm p-4 sm:p-6 md:px-10 border-b border-slate-200 flex justify-between items-center z-10 shrink-0">
        <div className="text-slate-500 font-bold tracking-wide uppercase text-sm sm:text-base">
          Question <span className="text-indigo-600">{currentQ + 1}</span> of {MOCK_QUESTIONS.length}
        </div>
        <div className="text-slate-600 font-semibold tracking-wide hidden sm:block text-sm sm:text-base">
          Participant: <span className="text-slate-900">{user?.name}</span>
        </div>
      </div>
      
      {/* Progress Bar Container */}
      <div className="w-full h-1.5 sm:h-2 bg-slate-100 shrink-0 z-10 relative">
        <div className="h-full bg-indigo-600 transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
      </div>
      
      {/* Question Area */}
      <div className="flex-grow flex flex-col w-full h-full overflow-y-auto z-10 relative">
        <div className="p-6 sm:p-10 md:p-14 lg:p-20 flex flex-col max-w-5xl mx-auto w-full h-full">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-10 leading-tight lg:leading-snug">
            {question.question}
          </h2>
          
          <div className="flex-grow w-full mb-12">
            {/* Single MCQ */}
            {question.type === 'single_mcq' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {question.options.map((opt, i) => {
                  const isSelected = singleAnswer === i;
                  return (
                    <button
                      key={i}
                      onClick={() => setSingleAnswer(i)}
                      className={`text-left w-full p-5 sm:p-6 lg:p-8 rounded-2xl border-2 transition-all duration-200 group ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50 shadow-md ring-4 ring-indigo-600/10 scale-[1.02]' 
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'
                        }`}>
                          {isSelected && <div className="w-3 h-3 bg-white rounded-full"></div>}
                        </div>
                        <span className={`text-base sm:text-lg lg:text-xl leading-relaxed ${isSelected ? 'text-indigo-900 font-bold' : 'text-slate-700 font-medium'}`}>
                          {opt}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Multiple MCQ */}
            {question.type === 'multiple_mcq' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {question.options.map((opt, i) => {
                  const isSelected = multipleAnswer.includes(i);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleMultipleOption(i)}
                      className={`text-left w-full p-5 sm:p-6 lg:p-8 rounded-2xl border-2 transition-all duration-200 group ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50 shadow-md ring-4 ring-indigo-600/10 scale-[1.02]' 
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className={`w-8 h-8 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'
                        }`}>
                          {isSelected && (
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-base sm:text-lg lg:text-xl leading-relaxed ${isSelected ? 'text-indigo-900 font-bold' : 'text-slate-700 font-medium'}`}>
                          {opt}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Text Input */}
            {question.type === 'text' && (
              <div className="w-full max-w-2xl">
                <input
                  type="text"
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  className="w-full px-6 py-5 rounded-2xl border-2 border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/20 outline-none text-xl sm:text-2xl text-slate-800 transition-all font-medium"
                  placeholder="Type your answer here..."
                />
              </div>
            )}

            {/* Match the Following */}
            {question.type === 'match' && (
              <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-3xl">
                {question.leftItems.map((left, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-6 bg-white border-2 border-slate-200 rounded-2xl shadow-sm hover:border-indigo-200 transition-colors">
                    <span className="text-lg sm:text-xl font-bold text-slate-800 self-start sm:self-center w-full sm:w-1/2">{left}</span>
                    <select
                      value={matchAnswer[left] || ''}
                      onChange={(e) => handleMatchSelect(left, e.target.value)}
                      className="w-full sm:w-1/2 p-3 sm:p-4 border-2 border-slate-300 rounded-xl outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 text-base sm:text-lg font-medium bg-slate-50 cursor-pointer"
                    >
                      <option value="" disabled>Select match</option>
                      {question.rightItems.map((right, rIdx) => (
                        <option key={rIdx} value={right}>{right}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-auto pt-6 flex flex-col-reverse sm:flex-row justify-between items-center gap-4 border-t-2 border-slate-100/50">
            <button
              onClick={clearCurrentResponse}
              className="text-slate-500 hover:text-red-500 font-semibold text-lg py-3 px-6 rounded-xl hover:bg-red-50 transition-colors w-full sm:w-auto"
            >
              Clear Response
            </button>

            <button
              disabled={isNextDisabled()}
              onClick={handleNext}
              className="w-full sm:w-auto px-10 py-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-full font-bold text-lg sm:text-xl transition-all transform active:scale-95 shadow-xl disabled:shadow-none min-w-[200px] lg:min-w-[240px]"
            >
              {currentQ + 1 === MOCK_QUESTIONS.length ? 'Submit Quiz' : 'Next Question'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
