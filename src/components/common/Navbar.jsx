import React from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import useAuthStore from '../../store/authStore';

const Navbar = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();
    const { logout } = useAuthStore();

    const handleLogout = () => {
        // Keep Zustand auth state and localStorage in sync.
        logout();
        navigate('/login');
    };

    return (
        <nav style={{ padding: '10px 20px', backgroundColor: '#343a40', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>School Intelligence System</h3>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                {user.role && <span>Welcome, {user.name} ({user.role})</span>}
                {user.role && <button onClick={handleLogout} style={{ padding: '5px 10px', cursor: 'pointer' }}>Logout</button>}
            </div>
        </nav>
    );
};

export default Navbar;
