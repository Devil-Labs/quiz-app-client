import { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import InstructionScreen from './components/InstructionScreen';
import UserInputForm from './components/UserInputForm';
import QuizInterface from './components/QuizInterface';
import Leaderboard from './components/Leaderboard';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { Settings } from 'lucide-react';

export type User = { name: string; email: string; phone: string };

function QuizAppFlow() {
  const [currentScreen, setCurrentScreen] = useState<'instructions' | 'userForm' | 'quiz' | 'leaderboard'>('instructions');
  const [user, setUser] = useState<User | null>(null);
  const [score, setScore] = useState<number>(0);
  const navigate = useNavigate();

  const startQuiz = async (userData: User) => {
    setUser(userData);
    setCurrentScreen('quiz');
    
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
    <div className="w-full relative flex items-center justify-center min-h-[80vh]">
      {(currentScreen === 'instructions' || currentScreen === 'leaderboard') && (
        <button 
          onClick={() => navigate('/admin')}
          className="absolute top-4 right-4 sm:top-8 sm:right-8 bg-white p-2 rounded-full shadow-md text-slate-400 hover:text-indigo-600 transition-colors z-10"
        >
          <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}
      
      {currentScreen === 'instructions' && <InstructionScreen onNext={() => setCurrentScreen('userForm')} />}
      {currentScreen === 'userForm' && <UserInputForm onSubmit={startQuiz} onBack={() => setCurrentScreen('instructions')} />}
      {currentScreen === 'quiz' && <QuizInterface user={user} onFinish={finishQuiz} />}
      {currentScreen === 'leaderboard' && <Leaderboard score={score} user={user} onRestart={() => setCurrentScreen('instructions')} />}
    </div>
  );
}

function AdminFlow() {
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const navigate = useNavigate();

  if (adminToken) {
    return <AdminDashboard token={adminToken} onLogout={() => { setAdminToken(null); navigate('/'); }} />;
  }

  return <AdminLogin onLogin={(token) => setAdminToken(token)} onBack={() => navigate('/')} />;
}

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex items-center justify-center p-4 sm:p-8 md:p-12 lg:p-16 xl:p-24 w-full relative">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-slate-200 flex flex-col min-h-[80vh] items-center justify-center relative">
        <Routes>
          <Route path="/" element={<QuizAppFlow />} />
          <Route path="/admin" element={<AdminFlow />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
