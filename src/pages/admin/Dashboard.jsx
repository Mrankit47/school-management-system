import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StudentCards from './StudentCards';

const AdminDashboard = () => {
    const [formData, setFormData] = useState({
        email: '', password: '',
        first_name: '', last_name: '', name: '',
        admission_number: '',
        class_id: '', section_id: ''
        ,
        dob: '',
        gender: '',
        blood_group: '',
        parent_guardian_name: '',
        parent_contact_number: '',
        address: '',
        date_of_admission: '',
        category: '',
    });
    const [mainClasses, setMainClasses] = useState([]);
    const [mainSections, setMainSections] = useState([]);
    const [message, setMessage] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);

    const inputStyle = {
        width: '100%',
        padding: '12px 14px',
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
    };

    const labelStyle = {
        fontSize: '12px',
        color: '#6b7280',
        fontWeight: 600,
        marginBottom: '6px',
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
    };

    const fetchStudents = async () => {
        setStudentsLoading(true);
        try {
            const res = await api.get('students/');
            setStudents(res.data);
        } catch (e) {
            setStudents([]);
        } finally {
            setStudentsLoading(false);
        }
    };

    useEffect(() => {
        api.get('classes/main-classes/').then(res => setMainClasses(res.data)).catch(() => {});
        api.get('classes/main-sections/').then(res => setMainSections(res.data)).catch(() => {});
    }, []);

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // `name` kept for backward compatibility; backend also uses first/last.
            const payload = { ...formData };

            // Backend requires `username`, but UI me username input nahi hai.
            // Generate username from first/last; fallback to email local-part.
            const first = (formData.first_name || '').trim();
            const last = (formData.last_name || '').trim();
            const generatedFromName = `${first}.${last}`
                .replace(/\s+/g, '')
                .replace(/[^a-zA-Z0-9.]/g, '')
                .toLowerCase();
            const emailLocal = (formData.email || '')
                .split('@')[0]
                .trim()
                .toLowerCase();

            // Prefer email-local-part (typically unique). Fallback to first/last.
            payload.username = emailLocal ? emailLocal : (generatedFromName && generatedFromName !== '.' ? generatedFromName : 'student');

            payload.name = `${formData.first_name} ${formData.last_name}`.trim();
            await api.post('students/admin-create/', payload);
            setMessage('Student created successfully!');
            await fetchStudents();
            setIsFormOpen(false);
            setFormData({
                email: '',
                password: '',
                first_name: '',
                last_name: '',
                name: '',
                admission_number: '',
                class_id: '',
                section_id: '',
                dob: '',
                gender: '',
                blood_group: '',
                parent_guardian_name: '',
                parent_contact_number: '',
                address: '',
                date_of_admission: '',
                category: '',
            });
        } catch (err) {
            setMessage('Error creating student.');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <h1 style={{ margin: 0 }}>Add Student</h1>
                <button
                    type="button"
                    onClick={() => setIsFormOpen(true)}
                    style={{
                        backgroundColor: '#1e40af',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        fontWeight: 700,
                    }}
                >
                    + Add
                </button>
            </div>

            {isFormOpen && (
                <div style={{ border: '1px solid #e5e7eb', padding: '24px', width: '520px', backgroundColor: '#fff', borderRadius: '10px', marginTop: '16px' }}>
                    <h3>Quick Addition: New Student</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <div style={labelStyle}>First Name</div>
                            <input
                                type="text"
                                placeholder="First Name"
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                style={inputStyle}
                                required
                            />
                        </div>
                        <div>
                            <div style={labelStyle}>Last Name</div>
                            <input
                                type="text"
                                placeholder="Last Name"
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                style={inputStyle}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <div style={labelStyle}>Email</div>
                        <input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            style={inputStyle}
                            required
                        />
                    </div>

                    <div>
                        <div style={labelStyle}>Password</div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            style={inputStyle}
                            required
                        />
                    </div>

                    <div>
                        <div style={labelStyle}>Admission Number</div>
                        <input
                            type="text"
                            placeholder="Admission Number"
                            value={formData.admission_number}
                            onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
                            style={inputStyle}
                            required
                        />
                    </div>

                    <div>
                        <div style={labelStyle}>Date of Birth (DOB)</div>
                        <input
                            type="date"
                            value={formData.dob}
                            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                            style={inputStyle}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <div style={labelStyle}>Gender</div>
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                required
                                style={inputStyle}
                            >
                                <option value="">-- Select Gender --</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <div style={labelStyle}>Blood Group</div>
                            <select
                                value={formData.blood_group}
                                onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                                required
                                style={inputStyle}
                            >
                                <option value="">-- Select Blood Group --</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <div style={labelStyle}>Parent/Guardian Name</div>
                        <input
                            type="text"
                            placeholder="Parent/Guardian Name"
                            value={formData.parent_guardian_name}
                            onChange={(e) => setFormData({ ...formData, parent_guardian_name: e.target.value })}
                            style={inputStyle}
                            required
                        />
                    </div>

                    <div>
                        <div style={labelStyle}>Parent Contact Number</div>
                        <input
                            type="text"
                            placeholder="Parent Contact Number"
                            value={formData.parent_contact_number}
                            onChange={(e) => setFormData({ ...formData, parent_contact_number: e.target.value })}
                            style={inputStyle}
                            required
                        />
                    </div>

                    <div>
                        <div style={labelStyle}>Residential Address</div>
                        <input
                            type="text"
                            placeholder="Residential Address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            style={inputStyle}
                            required
                        />
                    </div>

                    <div>
                        <div style={labelStyle}>Date of Admission</div>
                        <input
                            type="date"
                            value={formData.date_of_admission}
                            onChange={(e) => setFormData({ ...formData, date_of_admission: e.target.value })}
                            style={inputStyle}
                            required
                        />
                    </div>

                    <div>
                        <div style={labelStyle}>Category</div>
                        <input
                            type="text"
                            placeholder="Category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            style={inputStyle}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <div style={labelStyle}>Class</div>
                            <select
                                value={formData.class_id}
                                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                required
                                style={inputStyle}
                            >
                                <option value="">-- Select Class --</option>
                                {mainClasses.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <div style={labelStyle}>Section</div>
                            <select
                                value={formData.section_id}
                                onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                                required
                                style={inputStyle}
                            >
                                <option value="">-- Select Section --</option>
                                {mainSections.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        style={{ backgroundColor: '#28a745', color: '#fff', padding: '12px 18px', border: 'none', cursor: 'pointer', borderRadius: '10px', width: '100%', fontWeight: 700 }}
                    >
                        Create Student
                    </button>
                </form>
                {message && <p style={{ color: 'green' }}>{message}</p>}
            </div>

            )}

            {!isFormOpen && (
                <div style={{ marginTop: '24px' }}>
                    <h2 style={{ marginBottom: '12px' }}>Students</h2>
                    {studentsLoading ? (
                        <p>Loading students...</p>
                    ) : (
                        <StudentCards students={students} refreshStudents={fetchStudents} />
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
