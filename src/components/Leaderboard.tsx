import { useEffect, useState } from 'react';
import type { User } from '../App';
import { Trophy, Medal, RotateCcw, Loader2 } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  isUser?: boolean;
}

export default function Leaderboard({ score, user, onRestart }: { score: number, user: User | null, onRestart: () => void }) {
  const [lb, setLb] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/leaderboard');
      if (res.ok) {
        const data = await res.json();
        // Flag the current user's entry (basic match by name & score to highlight it)
        const updated = data.map((entry: any) => ({
          ...entry,
          isUser: user ? (entry.name === user.name && entry.score === score) : false
        }));
        setLb(updated);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchLeaderboard();

    // Setup short-polling for pseudo-real-time updates (every 5 seconds)
    const interval = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(interval);
  }, [user, score]);

  return (
    <div className="w-full max-w-4xl p-6 sm:p-10 md:p-14 lg:p-20 flex flex-col items-center mx-auto min-h-[70vh]">
      <Trophy className="w-24 h-24 sm:w-28 sm:h-28 text-yellow-500 mb-8 drop-shadow-xl" />
      <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 mb-4 tracking-tight drop-shadow-sm">Quiz Completed!</h2>
      <p className="text-xl sm:text-2xl text-slate-600 mb-12 text-center max-w-2xl leading-relaxed">
        Outstanding performance, <span className="font-bold text-indigo-600">{user?.name}</span>! Your final score is <span className="font-bold text-indigo-600 border-b-4 border-indigo-200">{score}</span> points.
      </p>

      <div className="w-full bg-white rounded-3xl border-2 border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-12">
        <div className="flex bg-slate-50 text-slate-500 font-bold p-5 border-b-2 border-slate-100 text-sm sm:text-base uppercase tracking-widest">
          <div className="w-20 text-center shrink-0">Rank</div>
          <div className="flex-grow px-6">Player Name</div>
          <div className="w-32 text-right pr-6 shrink-0">Points</div>
        </div>
        
        {isLoading && lb.length === 0 ? (
          <div className="p-10 flex justify-center text-indigo-600">
            <Loader2 className="w-10 h-10 animate-spin" />
            <span className="ml-3 text-lg font-medium">Loading Real-Time Scores...</span>
          </div>
        ) : (
          <div className="divide-y-2 divide-slate-100 max-h-[400px] overflow-y-auto">
            {lb.map((entry) => (
              <div key={`${entry.rank}-${entry.name}`} className={`flex items-center p-5 sm:p-6 transition-colors ${entry.isUser ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}>
                <div className="w-20 text-center font-bold text-slate-700 shrink-0 flex justify-center">
                  {entry.rank === 1 ? <Medal className="w-8 h-8 text-yellow-500 drop-shadow-sm" /> : 
                  entry.rank === 2 ? <Medal className="w-8 h-8 text-slate-400 drop-shadow-sm" /> : 
                  entry.rank === 3 ? <Medal className="w-8 h-8 text-amber-600 drop-shadow-sm" /> : 
                  <span className="text-xl sm:text-2xl text-slate-400">#{entry.rank}</span>}
                </div>
                <div className={`flex-grow px-6 text-lg sm:text-xl truncate ${entry.isUser ? 'font-extrabold text-indigo-800' : 'font-semibold text-slate-800'}`}>
                  {entry.name}{entry.isUser && <span className="ml-2 text-sm uppercase tracking-wide text-indigo-400 font-bold">(You)</span>}
                </div>
                <div className={`w-32 text-right pr-6 font-extrabold text-2xl sm:text-3xl shrink-0 ${entry.isUser ? 'text-indigo-700' : 'text-slate-900'}`}>
                  {entry.score}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button 
        onClick={onRestart}
        className="flex items-center justify-center gap-4 px-10 py-5 sm:px-12 sm:py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-extrabold text-lg sm:text-xl shadow-xl hover:shadow-indigo-300 transition-all transform hover:-translate-y-1 active:scale-95 w-full sm:w-auto min-w-[280px]"
      >
        <RotateCcw className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" /> Play Again
      </button>
    </div>
  );
}
