import { useState } from 'react';
import InstructionScreen from './components/InstructionScreen';
import UserInputForm from './components/UserInputForm';
import QuizInterface from './components/QuizInterface';
import Leaderboard from './components/Leaderboard';

export type User = { name: string; email: string; phone: string };
export type Screen = 'instructions' | 'userForm' | 'quiz' | 'leaderboard';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('instructions');
  const [user, setUser] = useState<User | null>(null);
  const [score, setScore] = useState<number>(0);

  const startQuiz = async (userData: User) => {
    setUser(userData);
    setCurrentScreen('quiz');
    
    // Log intent to start & process notification/captcha backend validation
    try {
      await fetch('http://localhost:5000/api/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userData, captchaToken: 'mock-verified-captcha' })
      });
    } catch(err) {
      console.warn('Failed to register quiz start', err);
    }
  };

  const finishQuiz = async (finalScore: number) => {
    setScore(finalScore);
    setCurrentScreen('leaderboard');
    
    // Save to MongoDB Backend
    if (user) {
      try {
        await fetch('http://localhost:5000/api/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...user, score: finalScore })
        });
      } catch (err) {
        console.error('Failed to post result:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex items-center justify-center p-4 sm:p-8 md:p-12 lg:p-16 xl:p-24 w-full">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-slate-200 flex flex-col min-h-[80vh] items-center justify-center relative">
        {currentScreen === 'instructions' && <InstructionScreen onNext={() => setCurrentScreen('userForm')} />}
        {currentScreen === 'userForm' && <UserInputForm onSubmit={startQuiz} onBack={() => setCurrentScreen('instructions')} />}
        {currentScreen === 'quiz' && <QuizInterface user={user} onFinish={finishQuiz} />}
        {currentScreen === 'leaderboard' && <Leaderboard score={score} user={user} onRestart={() => setCurrentScreen('instructions')} />}
      </div>
    </div>
  );
}

export default App;
