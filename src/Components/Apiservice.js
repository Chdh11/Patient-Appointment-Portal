const apiService = {
  async getAppointments(userId, userType) {
    try {
      const stored = JSON.parse(window.localStorage?.getItem("appointments")) || [];
      if (userType === 'doctor') {
        return stored; // Doctors see all appointments
      } else {
        return stored.filter(a => a.username === userId); // Patients see only their appointments
      }
    } catch (error) {
      console.error('Storage Error:', error);
      return [];
    }
  },
  
  async createAppointment(appointmentData) {
    try {
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
      throw error;
    }
  },
  
  async cancelAppointment(appointmentId) {
    try {
      const stored = JSON.parse(window.localStorage?.getItem("appointments")) || [];
      const updated = stored.filter(a => a.id !== appointmentId);
      window.localStorage?.setItem("appointments", JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      throw error;
    }
  },
  
  async uploadMedicalRecord(file, patientId) {
    try {
      // Simulate file upload and return success response
      const recordData = {
        id: Date.now(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString(),
        patientId: patientId,
        url: `local://medical-records/${patientId}/${file.name}`
      };
      
      // Store medical record metadata
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
      const users = JSON.parse(window.localStorage?.getItem("users")) || [];
      return users.find(user => user.username === userId && user.userType === userType);
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  },

  async updateUserProfile(userId, userType, profileData) {
    try {
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