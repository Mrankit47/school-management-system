import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const Classes = () => {
    const [sections, setSections] = useState([]);

    useEffect(() => {
        api.get('classes/sections/').then(res => setSections(res.data));
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>School Classes & Sections</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                {sections.map(s => (
                    <div key={s.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                        <h2 style={{ margin: '0 0 5px 0' }}>{s.class_name}</h2>
                        <h4 style={{ margin: 0, color: '#666' }}>Section: {s.section_name}</h4>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Classes;
