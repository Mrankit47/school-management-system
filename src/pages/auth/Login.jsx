import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import useAuthStore from '../../store/authStore';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setUser } = useAuthStore();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const user = await authService.login(username, password);
            if (user) {
                // Update authStore to trigger MainLayout
                setUser(user);
                
                // Redirect based on role
                if (user.role === 'admin') navigate('/admin/dashboard');
                else if (user.role === 'teacher') navigate('/teacher/dashboard');
                else navigate('/student/dashboard');
            }
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', border: '1px solid #ddd' }}>
            <h2>School Management System</h2>
            <form onSubmit={handleLogin}>
                <input 
                    type="text" placeholder="Username" 
                    value={username} onChange={(e) => setUsername(e.target.value)} 
                    style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                />
                <input 
                    type="password" placeholder="Password" 
                    value={password} onChange={(e) => setPassword(e.target.value)} 
                    style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                />
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff' }}>
                    Login
                </button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default Login;
