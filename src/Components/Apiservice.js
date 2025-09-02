// Replace your current Apiservice.js with this updated version

const API_BASE_URL = 'appointment-function-app-hfbuc2hwbbbrfshd.southeastasia-01.azurewebsites.net/api';
// Replace 'your-function-app-name' with your actual Azure Function App name

const apiService = {
  async getAppointments(userId, userType) {
    try {
      // First try to get from backend
      const response = await fetch(`${API_BASE_URL}/appointments?username=${encodeURIComponent(userId)}&userType=${encodeURIComponent(userType)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      }

      // Fallback to localStorage if backend fails
      console.warn('Backend failed, using localStorage');
      const stored = JSON.parse(window.localStorage?.getItem("appointments")) || [];
      if (userType === 'doctor') {
        return stored;
      } else {
        return stored.filter(a => a.username === userId);
      }
    } catch (error) {
      console.error('API Error:', error);
      // Fallback to localStorage
      const stored = JSON.parse(window.localStorage?.getItem("appointments")) || [];
      if (userType === 'doctor') {
        return stored;
      } else {
        return stored.filter(a => a.username === userId);
      }
    }
  },
  
  async createAppointment(appointmentData) {
    try {
      // Try backend first
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData)
      });

      if (response.ok) {
        const newAppointment = await response.json();
        return newAppointment;
      }

      // Fallback to localStorage
      console.warn('Backend failed, using localStorage');
      const stored = JSON.parse(window.localStorage?.getItem("appointments")) || [];
      const newAppointment = { 
        ...appointmentData, 
        id: Date.now(),
        createdAt: new Date().toISOString(),
        status: 'scheduled'
      };
      const updated = [...stored, newAppointment];
      window.localStorage?.setItem("appointments", JSON.stringify(updated));
      return newAppointment;
    } catch (error) {
      console.error('Failed to create appointment:', error);
      
      // Fallback to localStorage
      const stored = JSON.parse(window.localStorage?.getItem("appointments")) || [];
      const newAppointment = { 
        ...appointmentData, 
        id: Date.now(),
        createdAt: new Date().toISOString(),
        status: 'scheduled'
      };
      const updated = [...stored, newAppointment];
      window.localStorage?.setItem("appointments", JSON.stringify(updated));
      return newAppointment;
    }
  },
  
  async cancelAppointment(appointmentId) {
    try {
      // Try backend first
      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return true;
      }

      // Fallback to localStorage
      console.warn('Backend failed, using localStorage');
      const stored = JSON.parse(window.localStorage?.getItem("appointments")) || [];
      const updated = stored.filter(a => a.id !== appointmentId);
      window.localStorage?.setItem("appointments", JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      
      // Fallback to localStorage
      const stored = JSON.parse(window.localStorage?.getItem("appointments")) || [];
      const updated = stored.filter(a => a.id !== appointmentId);
      window.localStorage?.setItem("appointments", JSON.stringify(updated));
      return true;
    }
  },
  
  async uploadMedicalRecord(file, patientId) {
    try {
      // For now, keep this as localStorage since file upload needs more setup
      const recordData = {
        id: Date.now(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString(),
        patientId: patientId,
        url: `local://medical-records/${patientId}/${file.name}`
      };
      
      const stored = JSON.parse(window.localStorage?.getItem(`medicalRecords_${patientId}`)) || [];
      const updated = [...stored, recordData];
      window.localStorage?.setItem(`medicalRecords_${patientId}`, JSON.stringify(updated));
      
      return { success: true, data: recordData };
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  },

  async getMedicalRecords(patientId) {
    try {
      const stored = JSON.parse(window.localStorage?.getItem(`medicalRecords_${patientId}`)) || [];
      return stored;
    } catch (error) {
      console.error('Failed to get medical records:', error);
      return [];
    }
  },

  async getUserProfile(userId, userType) {
    try {
      // Try backend first for user data
      let endpoint = userType === 'patient' ? 'patients' : 'doctors';
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const users = Array.isArray(data.data) ? data.data : data;
        return users.find(user => user.name === userId);
      }

      // Fallback to localStorage
      const users = JSON.parse(window.localStorage?.getItem("users")) || [];
      return users.find(user => user.username === userId && user.userType === userType);
    } catch (error) {
      console.error('Failed to get user profile:', error);
      const users = JSON.parse(window.localStorage?.getItem("users")) || [];
      return users.find(user => user.username === userId && user.userType === userType);
    }
  },

  async updateUserProfile(userId, userType, profileData) {
    try {
      // For now, keep this as localStorage since user management needs more setup
      const users = JSON.parse(window.localStorage?.getItem("users")) || [];
      const userIndex = users.findIndex(user => user.username === userId && user.userType === userType);
      
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...profileData };
        window.localStorage?.setItem("users", JSON.stringify(users));
        return users[userIndex];
      }
      
      throw new Error('User not found');
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }
};

export default apiService;