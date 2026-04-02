import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StudentCards from './StudentCards';

const AddStudent = () => {
    const [formData, setFormData] = useState({
        email: '', password: '', confirm_password: '',
        first_name: '', last_name: '', name: '',
        admission_number: '',
        roll_number: '',
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
    const parentPhoneDigits = (formData.parent_contact_number || '').replace(/\D/g, '').slice(0, 10);
    const selectedSection = mainSections.find((s) => String(s.id) === String(formData.section_id));
    const rollPreview = selectedSection?.name ? `101${String(selectedSection.name).trim().charAt(0).toUpperCase()}` : 'Auto (e.g. 101A)';
    const admissionPreview = (() => {
        const used = new Set(
            (students || [])
            .map((s) => {
                const m = String(s.admission_number || '').toUpperCase().match(/^ADM(\d+)$/);
                return m ? parseInt(m[1], 10) : null;
            })
            .filter((n) => Number.isFinite(n))
        );
        let next = 101;
        while (used.has(next)) next += 1;
        return `ADM${next}`;
    })();

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
        const password = formData.password || '';
        const confirm = formData.confirm_password || '';
        if (password !== confirm) {
            setMessage('Error: Password and confirm password do not match.');
            return;
        }
        if (parentPhoneDigits.length !== 10) {
            setMessage('Error: Parent contact number must be exactly 10 digits.');
            return;
        }
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
            payload.parent_contact_number = `+91${parentPhoneDigits}`;
            await api.post('students/admin-create/', payload);
            setMessage('Student created successfully!');
            await fetchStudents();
            setIsFormOpen(false);
            setFormData({
                email: '',
                password: '',
                confirm_password: '',
                first_name: '',
                last_name: '',
                name: '',
                admission_number: '',
                roll_number: '',
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
                <div
                    style={{
                        border: '1px solid #e5e7eb',
                        padding: '22px',
                        width: '100%',
                        backgroundColor: '#fff',
                        borderRadius: '16px',
                        marginTop: '18px',
                    }}
                >
                    <h3>Quick Addition: New Student</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '18px' }}>
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
                        <div style={labelStyle}>Confirm Password</div>
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={formData.confirm_password || ''}
                            onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                            style={inputStyle}
                            required
                        />
                    </div>

                    <div>
                        <div style={labelStyle}>Admission Number (Auto Generated)</div>
                        <input
                            type="text"
                            value={admissionPreview}
                            readOnly
                            style={{ ...inputStyle, backgroundColor: '#f9fafb', color: '#6b7280' }}
                        />
                    </div>

                    <div>
                        <div style={labelStyle}>Roll Number (Auto Generated)</div>
                        <input
                            type="text"
                            value={rollPreview}
                            readOnly
                            style={{ ...inputStyle, backgroundColor: '#f9fafb', color: '#6b7280' }}
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
                        <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '8px' }}>
                            <input
                                type="text"
                                value="+91"
                                disabled
                                style={{ ...inputStyle, textAlign: 'center', backgroundColor: '#f9fafb', color: '#6b7280' }}
                            />
                            <input
                                type="tel"
                                inputMode="numeric"
                                pattern="[0-9]{10}"
                                placeholder="10-digit number"
                                value={parentPhoneDigits}
                                onChange={(e) => {
                                    const digits = (e.target.value || '').replace(/\D/g, '').slice(0, 10);
                                    setFormData({ ...formData, parent_contact_number: digits });
                                }}
                                style={inputStyle}
                                required
                            />
                        </div>
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
                {message && <p style={{ color: message.startsWith('Error') ? '#dc2626' : 'green' }}>{message}</p>}
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

export default AddStudent;