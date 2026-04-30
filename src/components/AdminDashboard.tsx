import { useEffect, useState } from 'react';
import { LogOut, RefreshCw, Activity, Users, FileText } from 'lucide-react';
import AdminQuizEditor from './AdminQuizEditor';

export default function AdminDashboard({ token, onLogout }: { token: string, onLogout: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (res.ok) {
        setData(json);
      } else {
        setError(json.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      if (token === 'demo-token') {
        // Mock data for demo purposes when server is unreachable
        setData({
          stats: { totalUsers: 134, activeQuizzes: 12 },
          recentActivity: [
            { action: 'John finished a quiz (Score: 8/10)', timestamp: new Date().toISOString() },
            { action: 'Alice started a quiz', timestamp: new Date(Date.now() - 120000).toISOString() },
            { action: 'New user "DemoTester" registered', timestamp: new Date(Date.now() - 600000).toISOString() }
          ]
        });
      } else {
        setError('Network error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  return (
    <div className="w-full h-full p-6 sm:p-10 md:p-16 flex flex-col bg-slate-50">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Activity className="w-8 h-8 text-indigo-600" /> 
          Admin Dashboard
        </h1>
        <div className="flex gap-4">
          <button 
            onClick={fetchDashboardData}
            className="flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-2 px-4 rounded-lg transition-all"
          >
            <RefreshCw className="w-4 h-4" /> 
            Refresh
          </button>
          <button 
            onClick={onLogout}
            className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" /> 
            Logout
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col flex-1 items-center justify-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
          <p>Loading dashboard data...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col flex-1 items-center justify-center text-red-500">
          <p className="font-semibold text-lg">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-4">
              <Users className="w-8 h-8 text-blue-500" />
              <h3 className="text-lg font-semibold text-slate-700">Quiz Takers</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {data?.stats?.totalUsers || '---'}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-4">
              <FileText className="w-8 h-8 text-emerald-500" />
              <h3 className="text-lg font-semibold text-slate-700">Active Quizzes</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {data?.stats?.activeQuizzes || '---'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 md:col-span-2 lg:col-span-1">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Recent Activity</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              {data?.recentActivity?.length ? (
                data.recentActivity.map((act: any, i: number) => (
                  <li key={i} className="flex justify-between">
                    <span>{act.action}</span>
                    <span className="text-slate-400">{new Date(act.timestamp).toLocaleTimeString()}</span>
                  </li>
                ))
              ) : (
                <p className="text-slate-400 italic">Server Response: {JSON.stringify(data?.data || data?.message || 'No data')}</p>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Render Quiz Editor Below Dashboard Stats */}
      <AdminQuizEditor />
    </div>
  );
}