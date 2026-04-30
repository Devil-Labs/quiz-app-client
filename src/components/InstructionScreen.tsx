import { BookOpen, CheckCircle, Clock, AlertTriangle, Share2 } from 'lucide-react';
import { getQuizConfig } from '../types/quiz';
import { useState } from 'react';

export default function InstructionScreen({ onNext }: { onNext: () => void }) {
  const config = getQuizConfig();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full p-6 sm:p-10 md:p-16 flex flex-col justify-center items-center text-center relative">
      <button 
        onClick={handleShare}
        className="absolute top-4 left-4 sm:top-8 sm:left-8 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md text-indigo-600 hover:bg-indigo-50 border border-indigo-100 transition-colors"
      >
        <Share2 className="w-4 h-4" />
        <span className="font-medium text-sm">{copied ? 'Link Copied!' : 'Share Quiz'}</span>
      </button>

      <BookOpen className="w-16 h-16 sm:w-20 sm:h-20 text-indigo-600 mb-6 drop-shadow-md" />
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
        {config.title}
      </h1>
      <p className="text-base sm:text-lg lg:text-xl text-slate-600 mb-10 md:mb-16 max-w-2xl">
        {config.description}
      </p>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 text-left mb-12">
        <div className="flex items-start gap-4 p-5 sm:p-6 rounded-2xl bg-indigo-50/50 hover:bg-indigo-50 transition-colors border border-indigo-100/50">
          <CheckCircle className="w-7 h-7 text-indigo-600 shrink-0" />
          <div>
            <h3 className="font-semibold text-slate-900 text-lg sm:text-xl">Multiple Choice</h3>
            <p className="text-slate-600 text-sm sm:text-base mt-1">Select the best answer for each question from the given options.</p>
          </div>
        </div>
        <div className="flex items-start gap-4 p-5 sm:p-6 rounded-2xl bg-indigo-50/50 hover:bg-indigo-50 transition-colors border border-indigo-100/50">
          <Clock className="w-7 h-7 text-indigo-600 shrink-0" />
          <div>
            <h3 className="font-semibold text-slate-900 text-lg sm:text-xl">Timed Questions</h3>
            <p className="text-slate-600 text-sm sm:text-base mt-1">You have limited time to answer. Read swiftly and be accurate!</p>
          </div>
        </div>
        <div className="flex items-start gap-4 p-5 sm:p-6 rounded-2xl bg-indigo-50/50 hover:bg-indigo-50 transition-colors border border-indigo-100/50">
          <AlertTriangle className="w-7 h-7 text-indigo-600 shrink-0" />
          <div>
            <h3 className="font-semibold text-slate-900 text-lg sm:text-xl">No Going Back</h3>
            <p className="text-slate-600 text-sm sm:text-base mt-1">Once you submit an answer, you cannot return to previous questions.</p>
          </div>
        </div>
        <div className="flex items-start gap-4 p-5 sm:p-6 rounded-2xl bg-indigo-50/50 hover:bg-indigo-50 transition-colors border border-indigo-100/50">
          <CheckCircle className="w-7 h-7 text-indigo-600 shrink-0" />
          <div>
            <h3 className="font-semibold text-slate-900 text-lg sm:text-xl">Scoring</h3>
            <p className="text-slate-600 text-sm sm:text-base mt-1">Points are awarded for correct answers. Track your rank at the end!</p>
          </div>
        </div>
      </div>

      <button 
        onClick={onNext}
        className="w-full sm:w-auto px-10 py-4 sm:px-12 sm:py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-lg sm:text-xl shadow-lg hover:shadow-indigo-200 transition-all transform hover:-translate-y-1 focus:ring-4 focus:ring-indigo-200 outline-none"
      >
        I understand, Let's Go!
      </button>
    </div>
  );
}
