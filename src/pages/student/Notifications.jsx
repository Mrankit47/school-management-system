import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        api.get('communication/my/').then(res => setNotifications(res.data));
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>My Notifications</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {notifications.map(n => (
                    <div key={n.id} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '5px', backgroundColor: n.is_read ? '#fff' : '#f0f7ff' }}>
                        <h4 style={{ margin: '0 0 5px 0' }}>{n.title}</h4>
                        <p style={{ margin: 0 }}>{n.message}</p>
                        <small>{new Date(n.created_at).toLocaleString()}</small>
                    </div>
                ))}
                {notifications.length === 0 && <p>No notifications yet.</p>}
            </div>
        </div>
    );
};

export default Notifications;
