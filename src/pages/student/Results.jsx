import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const Results = () => {
    const [results, setResults] = useState([]);

    useEffect(() => {
        api.get('academics/results/my/').then(res => setResults(res.data));
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>My Exam Results</h1>
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>Exam</th>
                        <th>Subject</th>
                        <th>Marks Obtained</th>
                        <th>Max Marks</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map(r => (
                        <tr key={r.id}>
                            <td>{r.exam_name}</td>
                            <td>{r.subject}</td>
                            <td>{r.marks}</td>
                            <td>{r.max_marks}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {results.length === 0 && <p>No results posted yet.</p>}
        </div>
    );
};

export default Results;
