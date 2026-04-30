import { useState } from 'react';
import { Lock, LogIn } from 'lucide-react';

export default function AdminLogin({ onLogin, onBack }: { onLogin: (token: string) => void, onBack: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok && data.token) {
        onLogin(data.token);
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      // Demo Fallback: If backend is unreachable, allow demo login
      if (username === 'admin') {
        onLogin('demo-token');
      } else {
        setError('Server unreachable. For Demo, use username: admin');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full p-6 sm:p-10 md:p-16 flex flex-col justify-center items-center text-center">
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 transition-colors px-3 py-1 font-medium"
      >
        &larr; Back to Home
      </button>

      <Lock className="w-12 h-12 sm:w-16 sm:h-16 text-indigo-600 mb-4 sm:mb-6" />
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Admin Login</h2>
      <p className="text-slate-500 mb-8 text-sm sm:text-base">Enter your credentials to access the admin panel.</p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 text-left">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
          <input 
            type="text" 
            required 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 sm:py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="admin"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 sm:py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 sm:py-4 px-6 rounded-xl transition-all shadow-lg shadow-indigo-200 disabled:opacity-70"
        >
          <LogIn className="w-5 h-5" />
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}