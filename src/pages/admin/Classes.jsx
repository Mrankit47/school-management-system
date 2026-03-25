import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const Classes = () => {
    const [sections, setSections] = useState([]);
    const [className, setClassName] = useState('');
    const [sectionName, setSectionName] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        api.get('classes/sections/').then(res => setSections(res.data));
    }, []);

    const refreshSections = async () => {
        const res = await api.get('classes/sections/');
        setSections(res.data);
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        try {
            await api.post('classes/admin-create-class/', { name: className });
            setMessage('Class created');
            setClassName('');
            await refreshSections();
        } catch (err) {
            setMessage('Error creating class');
        }
    };

    const handleCreateSection = async (e) => {
        e.preventDefault();
        try {
            await api.post('classes/admin-create-section/', { name: sectionName });
            setMessage('Section created');
            setSectionName('');
            await refreshSections();
        } catch (err) {
            setMessage('Error creating section');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>School Classes & Sections</h1>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <div style={{ border: '1px solid #ddd', padding: '20px', width: '300px', backgroundColor: '#fff' }}>
                    <h3>Create Class</h3>
                    <form onSubmit={handleCreateClass} style={{ display: 'grid', gap: '10px' }}>
                        <input
                            type="text"
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                            placeholder="e.g., 10"
                            required
                            style={{ padding: '10px' }}
                        />
                        <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none' }}>
                            Create Class
                        </button>
                    </form>
                </div>
                <div style={{ border: '1px solid #ddd', padding: '20px', width: '300px', backgroundColor: '#fff' }}>
                    <h3>Create Section</h3>
                    <form onSubmit={handleCreateSection} style={{ display: 'grid', gap: '10px' }}>
                        <input
                            type="text"
                            value={sectionName}
                            onChange={(e) => setSectionName(e.target.value)}
                            placeholder="e.g., A"
                            required
                            style={{ padding: '10px' }}
                        />
                        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none' }}>
                            Create Section
                        </button>
                    </form>
                </div>
            </div>
            {message && <p style={{ color: 'green', marginTop: '-10px' }}>{message}</p>}

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
