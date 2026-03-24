import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const Assignments = () => {
    const [assignments, setAssignments] = useState([]);

    useEffect(() => {
        api.get('assignments/').then(res => setAssignments(res.data));
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>My Assignments</h1>
            <div style={{ display: 'grid', gap: '20px' }}>
                {assignments.map(a => (
                    <div key={a.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                        <h3>{a.title}</h3>
                        <p>{a.description}</p>
                        <p><strong>Due Date:</strong> {a.due_date}</p>
                        {a.file_url && <a href={a.file_url} target="_blank" rel="noreferrer">Download Attachment</a>}
                    </div>
                ))}
            </div>
            {assignments.length === 0 && <p>No assignments currently.</p>}
        </div>
    );
};

export default Assignments;
