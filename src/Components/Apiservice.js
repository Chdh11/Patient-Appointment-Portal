// Replace your current Apiservice.js with this updated version
import bcrypt from 'bcryptjs';

const API_BASE_URL = 'appointment-function-app-hfbuc2hwbbbrfshd.southeastasia-01.azurewebsites.net/api';
const FUNCTION_APP_KEY=process.env.REACT_APP_FUNCTION_APP_KEY


const apiService = {
  // Register a patient
  async registerPatient(data){
    try {
      const response = await fetch(`https://${API_BASE_URL}/patients`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'x-functions-key': FUNCTION_APP_KEY,
        },
        body: JSON.stringify({
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          password_hash: data.password, // Ideally hash this before sending
          username: data.username,
          phone: data.phone,
          date_of_birth: data.dateOfBirth,
          gender: data.gender || null
        })
      });

      const result = await response.json();
      console.log(result)
      return result; // { success: true/false, message?, data? }
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, message: "Failed to register. Please try again." };
    }
  },

  //login patients with username and password
  async loginPatient(username, password) {
    try {
      const response = await fetch(`https://${API_BASE_URL}/patients`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-functions-key': FUNCTION_APP_KEY,
        },
      });

      const result = await response.json();
      console.log('API Response:', result);
      
      if (!result.success) {
        return { success: false, message: "Failed to fetch users" };
      }

      const user = result.data.find(async (u) => {
      if (u.username === username) {
        return await bcrypt.compare(password, u.password_hash);
      }});

      if (user) {
        return { success: true, userData: user };
      } else {
        return { success: false, message: "Invalid username or password" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Failed to login. Please try again." };
    }
  },
  async getDoctors() {
  try {
    const response = await fetch(`https://${API_BASE_URL}/doctors`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-functions-key': FUNCTION_APP_KEY,
      },
    });

    const result = await response.json();
    console.log('Doctors Response:', result);
    return result.success ? result.data : [];
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return [];
  }
},

  async getAppointments(username, userType = 'patient') {
  try {
    const response = await fetch(
      `https://${API_BASE_URL}/appointments?username=${encodeURIComponent(username)}&userType=${encodeURIComponent(userType)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-functions-key': FUNCTION_APP_KEY,
        },
      }
    );

    const result = await response.json();
    console.log('Appointments Response:', result);
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
},
// Get all appointments (for slot checking)
async getAllAppointments() {
  try {
    const response = await fetch(`https://${API_BASE_URL}/appointments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-functions-key': FUNCTION_APP_KEY,
      },
    });
    const result = await response.json();
    console.log('All Appointments:', result);
    return result; // full array
  } catch (error) {
    console.error('Error fetching all appointments:', error);
    return [];
  }
},


  // Create Appointment
  async createAppointment(appointmentData) {
    try {
      const response = await fetch(`https://${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-functions-key': FUNCTION_APP_KEY,
        },
        body: JSON.stringify(appointmentData),
      });

      const result = await response.json();
      console.log('Create Appointment Response:', result);
      return result;
    } catch (error) {
      console.error('Error creating appointment:', error);
      return { success: false, message: 'Failed to create appointment.' };
    }
  },

  // Cancel Appointment
  async cancelAppointment(appointmentId) {
    try {
      const response = await fetch(`https://${API_BASE_URL}/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-functions-key': FUNCTION_APP_KEY,
        },
      });

      const result = await response.json();
      console.log('Cancel Appointment Response:', result);
      return result.success;
    } catch (error) {
      console.error('Error canceling appointment:', error);
      return false;
    }
  },

  // Upload Medical Record
  async uploadMedicalRecord(file, patientId) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('patientId', patientId);

      const response = await fetch(`https://${API_BASE_URL}/medical-records`, {
        method: 'POST',
        headers: {
          'x-functions-key': FUNCTION_APP_KEY,
        },
        body: formData,
      });

      const result = await response.json();
      console.log('Upload Medical Record Response:', result);
      return result;
    } catch (error) {
      console.error('Error uploading medical record:', error);
      return { success: false, message: 'Failed to upload medical record.' };
    }
  },

  // Get Medical Records
  async getMedicalRecords(patientId) {
    try {
      const response = await fetch(`https://${API_BASE_URL}/medical-records?patientId=${encodeURIComponent(patientId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-functions-key': FUNCTION_APP_KEY,
        },
      });

      const result = await response.json();
      console.log('Medical Records Response:', result);
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Error fetching medical records:', error);
      return [];
    }
  },

  // Get User Profile
  async getUserProfile(userId, userType) {
    try {
      const endpoint = userType === 'patient' ? 'patients' : 'doctors';
      const response = await fetch(`https://${API_BASE_URL}/${endpoint}?username=${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-functions-key': FUNCTION_APP_KEY,
        },
      });

      const result = await response.json();
      console.log('User Profile Response:', result);
      return result.success ? result.data[0] : null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  // Update User Profile
  async updateUserProfile(userId, userType, profileData) {
    try {
      const endpoint = userType === 'patient' ? 'patients' : 'doctors';
      const response = await fetch(`https://${API_BASE_URL}/${endpoint}/${encodeURIComponent(userId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-functions-key': FUNCTION_APP_KEY,
        },
        body: JSON.stringify(profileData),
      });

      const result = await response.json();
      console.log('Update Profile Response:', result);
      return result;
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, message: 'Failed to update profile.' };
    }
  },
};

export default apiService;