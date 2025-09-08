// Replace your current Apiservice.js with this updated version
import bcrypt from 'bcryptjs';

// const API_BASE_URL = 'https://appointment-function-app3-czccc8hgeyeuebbf.eastasia-01.azurewebsites.net/api';

const API_BASE_URL= ' http://localhost:7071/api'
const FUNCTION_APP_KEY=process.env.REACT_APP_FUNCTION_APP_KEY


const apiService = {
  // Register a patient
  async registerPatient(data){
    try {
      const response = await fetch(`${API_BASE_URL}/patients`, {
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
      const response = await fetch(`${API_BASE_URL}/patients`, {
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
  //login patients with username and password
  async loginDoctor(username, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/doctors`, {
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

 async getPatientData(username) {
  try {
    const response = await fetch(`${API_BASE_URL}/patients?username=${encodeURIComponent(username)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-functions-key': FUNCTION_APP_KEY,
      },
    });

    const result = await response.json();
    console.log('Patient Data Response:', result);

    return result.success && result.data.length > 0 ? result.data[0] : null;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
},
 async getDoctortData(username) {
  try {
    const response = await fetch(`${API_BASE_URL}/doctors?username=${encodeURIComponent(username)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-functions-key': FUNCTION_APP_KEY,
      },
    });

    const result = await response.json();
    console.log('Doctor Data Response:', result);

    return result.success && result.data.length > 0 ? result.data[0] : null;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
},
  async getDoctors() {
  try {
    const response = await fetch(`${API_BASE_URL}/doctors`, {
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
      `${API_BASE_URL}/appointments?username=${encodeURIComponent(username)}&userType=${encodeURIComponent(userType)}`,
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
    const response = await fetch(`${API_BASE_URL}/appointments`, {
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
      const response = await fetch(`${API_BASE_URL}/appointments`, {
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
      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
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

  async uploadMedicalRecord(file, patientUsername, fileDescription) {
  try {
    // First, upload the file to blob storage
    const uploadUrl = `${API_BASE_URL}/upload/medical-records?filename=${encodeURIComponent(file.name)}&patientUsername=${encodeURIComponent(patientUsername)}&description=${encodeURIComponent(fileDescription)}&contentType=${encodeURIComponent(file.type)}`;
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'x-functions-key': FUNCTION_APP_KEY,
        'Content-Type': 'application/octet-stream',
      },
      body: file, // Send file directly as binary data
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }

    const result = await uploadResponse.json();
    console.log('Upload Medical Record Response:', result);
    
    return {
      success: result.success,
      message: result.message || 'Medical record uploaded successfully',
      data: {
        fileName: result.data?.fileName,
        originalName: file.name,
        size: file.size,
        url: result.data?.url,
        databaseRecord: result.data?.databaseRecord
      }
    };

  } catch (error) {
    console.error('Error uploading medical record:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to upload medical record.' 
    };
  }
},
async deleteMedicalRecordFile(fileName) {
    try {
        console.log('=== FRONTEND DELETE DEBUG ===');
        console.log('Original fileName:', fileName);
        console.log('Encoded fileName:', encodeURIComponent(fileName));
        
        const url = `${API_BASE_URL}/files/medical-records/${encodeURIComponent(fileName)}`;
        console.log('Delete URL:', url);

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'x-functions-key': FUNCTION_APP_KEY,
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();
        console.log('Delete Medical Record File Response:', result);
        
        if (!response.ok) {
            throw new Error(result.error || result.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        return result;

    } catch (error) {
        console.error('Error deleting medical record file:', error);
        return { 
            success: false, 
            error: error.message || 'Failed to delete medical record file.',
            details: error.name === 'TypeError' ? 'Network error - please check your connection' : error.message
        };
    }
},

  // Get Medical Records
  async getMedicalRecords(username) {
  try {
    const response = await fetch(`${API_BASE_URL}/medical-records/${encodeURIComponent(username)}`, {
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

  async updatePatientData(patient_id, email, phone) {
  try {
    const response = await fetch(`${API_BASE_URL}/patients`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-functions-key': FUNCTION_APP_KEY,
      },
      body: JSON.stringify({ patient_id, email, phone }),
    });

    const result = await response.json();
    console.log('Update Response:', result);
    return result;
  } catch (error) {
    console.error('Error updating patient data:', error);
    return { success: false, error: error.message };
  }
}

};

export default apiService;