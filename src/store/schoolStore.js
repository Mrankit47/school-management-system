import { create } from 'zustand';
import api from '../services/api';

const useSchoolStore = create((set) => ({
    school: null,
    schoolId: null,
    loading: false,
    error: null,

    fetchSchoolInfo: async (id) => {
        set({ loading: true, error: null });
        try {
            const res = await api.get(`tenants/school-info/${id}/`);
            set({ school: res.data, schoolId: id, loading: false });
        } catch (err) {
            if (err.response?.status === 404) {
                set({ error: 'School not found.', loading: false, school: null, schoolId: null });
            } else {
                set({ error: err.message || 'Failed to fetch school info.', loading: false, school: null, schoolId: null });
            }
        }
    },
    
    clearSchool: () => set({ school: null, schoolId: null, error: null })
}));

export default useSchoolStore;
