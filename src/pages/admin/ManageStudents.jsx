import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StudentCards from './StudentCards';

const ManageStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('students/').then((res) => {
            setStudents(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Student List</h1>
            {loading ? (
                <p>Loading students...</p>
            ) : (
                <StudentCards
                    students={students}
                    refreshStudents={async () => {
                        const res = await api.get('students/');
                        setStudents(res.data);
                    }}
                />
            )}
        </div>
    );
};

export default ManageStudents;
