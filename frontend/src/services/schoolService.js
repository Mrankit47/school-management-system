import api from './api';

const schoolService = {
  /**
   * Fetches public branding and basic information for a school.
   * @param {string} schoolId - The unique identifier of the school.
   * @returns {Promise<Object>} The school details (name, logo, about, etc.)
   */
  getSchoolInfo: async (schoolId) => {
    try {
      const response = await api.get(`/tenants/school-info/${schoolId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching school info for ${schoolId}:`, error);
      throw error;
    }
  },

  /**
   * Fetches a list of all active schools (optional, for SaaS landing page).
   */
  getAllSchools: async () => {
    try {
      const response = await api.get('/tenants/admin-schools/');
      return response.data;
    } catch (error) {
      console.error('Error fetching all schools:', error);
      throw error;
    }
  }
};

export default schoolService;
