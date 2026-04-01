import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import useAuthStore from '../../store/authStore';

const SuperAdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();
    const { setUser } = useAuthStore();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const user = await authService.login(username, password);
            if (user) {
                if (user.role !== 'superadmin') {
                    setError('Access Denied: You are not a registered Superadmin.');
                    authService.logout(); 
                    useAuthStore.getState().logout();
                    setIsLoading(false);
                    return;
                }
                
                setUser(user);
                navigate('/superadmin/dashboard');
            }
        } catch (err) {
            setError('Invalid credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-inter">
            <div className="w-full max-w-md bg-white rounded-3xl p-10 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                        SA
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Platform Control</h1>
                    <p className="text-sm text-slate-500 mt-1">Superadmin Portal Authentication</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-5">
                    <input 
                        type="text" 
                        placeholder="Username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    {error && <p className="text-red-500 text-sm font-bold px-2">{error}</p>}
                    <button disabled={isLoading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all">
                        {isLoading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>
                <div className="mt-8 text-center pt-6 border-t border-slate-100">
                   <button onClick={() => navigate('/')} className="text-xs uppercase font-bold text-slate-400 hover:text-blue-600">← Back to Platform</button>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminLogin;
