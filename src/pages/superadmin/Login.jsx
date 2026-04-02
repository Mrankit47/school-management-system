import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import useAuthStore from '../../store/authStore';

export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await authService.login(username, password);
      if (user) {
        if (user.role !== 'superadmin') {
          setError('Access Denied: This portal is reserved for Platform Administrators.');
          authService.logout();
          setIsLoading(false);
          return;
        }
        setUser(user);
        navigate('/superadmin/dashboard');
      }
    } catch (err) {
      setError('Invalid platform credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 font-inter">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-2xl shadow-blue-500/20 ring-1 ring-white/10">
            A
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Platform Control</h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">Enter your administrative credentials</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Secure Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-white/10 transition-all font-medium"
                placeholder="admin_id"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Security Token</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-white/10 transition-all font-medium"
                placeholder="••••••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-xs font-bold leading-relaxed">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-5 rounded-2xl text-sm font-extrabold text-white transition-all active:scale-[0.98] shadow-2xl shadow-blue-500/20
                ${isLoading ? 'bg-slate-700' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'}`}
            >
              {isLoading ? 'Verifying Identity...' : 'Initialize Secure Session'}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <button 
              onClick={() => navigate('/')}
              className="text-[10px] font-bold text-slate-500 hover:text-blue-400 transition-colors uppercase tracking-[0.2em]"
            >
              ← Back to SaaS Gateway
            </button>
          </div>
        </div>

        <p className="text-center mt-10 text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-loose">
          Atheris Lab School Platform Management <br />
          Multi-Tenant Isolation Level 4 Active.
        </p>
      </div>
    </div>
  );
}
