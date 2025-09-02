const { app } = require('@azure/functions');
const { executeQuery } = require('../db');

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json"
};

// Add OPTIONS handler for preflight requests
app.http('corsHandler', {
    methods: ['OPTIONS'],
    authLevel: 'anonymous',
    route: '{*restOfPath}',
    handler: async (request, context) => {
        return {
            status: 200,
            headers: corsHeaders,
            body: ''
        };
    }
});

// ====================================
// PATIENTS ENDPOINTS
// ====================================
app.http('patients', {
    methods: ['GET', 'POST'],
    authLevel: 'function',
    route: 'patients',
    handler: async (request, context) => {
        context.log('Patients function triggered');

        try {
            if (request.method === 'GET') {
                // Get all patients
                const query = `SELECT patient_id, name, email, created_at FROM Patients`;
                
                context.log('Executing GET patients query...');
                const result = await executeQuery(query);

                return {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    },
                    jsonBody: {
                        success: true,
                        message: `Retrieved ${result.recordset.length} patients`,
                        data: result.recordset,
                        count: result.recordset.length
                    }
                };

            } else if (request.method === 'POST') {
                // Create new patient
                const body = await request.json();
                const { name, email, password_hash } = body;
                
                if (!name || !email || !password_hash) {
                    return {
                        status: 400,
                        jsonBody: {
                            success: false,
                            error: "Missing required fields: name, email, password_hash"
                        }
                    };
                }

                const query = `
                    INSERT INTO Patients (name, email, password_hash)
                    OUTPUT INSERTED.patient_id, INSERTED.name, INSERTED.email, INSERTED.created_at
                    VALUES (@name, @email, @password_hash)
                `;

                const params = { name, email, password_hash };
                const result = await executeQuery(query, params);

                return {
                    status: 201,
                    jsonBody: {
                        success: true,
                        message: "Patient created successfully",
                        data: result.recordset[0]
                    }
                };
            }

        } catch (error) {
            context.log.error('Error in patients function:', error);
            return {
                status: 500,
                headers: corsHeaders,
                jsonBody: {
                    success: false,
                    error: "Failed to process request",
                    message: error.message
                }
            };
        }
    }
});

// ====================================
// DOCTOR SCHEDULE ENDPOINTS
// ====================================
app.http('doctorSchedule', {
    methods: ['GET', 'POST'],
    authLevel: 'function',
    route: 'doctor-schedule',
    handler: async (request, context) => {
        context.log('Doctor Schedule function triggered');

        try {
            if (request.method === 'GET') {
                const query = `
                    SELECT 
                        ds.schedule_id,
                        ds.available_date,
                        ds.start_time,
                        ds.end_time,
                        d.name as doctor_name,
                        d.specialization
                    FROM DoctorSchedule ds
                    JOIN Doctors d ON ds.doctor_id = d.doctor_id
                    ORDER BY ds.available_date, ds.start_time
                `;
                
                const result = await executeQuery(query);

                return {
                    status: 200,
                    jsonBody: {
                        success: true,
                        message: `Retrieved ${result.recordset.length} schedule slots`,
                        data: result.recordset,
                        count: result.recordset.length
                    }
                };

            } else if (request.method === 'POST') {
                const body = await request.json();
                const { doctor_id, available_date, start_time, end_time } = body;
                
                if (!doctor_id || !available_date || !start_time || !end_time) {
                    return {
                        status: 400,
                        jsonBody: {
                            success: false,
                            error: "Missing required fields: doctor_id, available_date, start_time, end_time"
                        }
                    };
                }

                const query = `
                    INSERT INTO DoctorSchedule (doctor_id, available_date, start_time, end_time)
                    OUTPUT INSERTED.schedule_id, INSERTED.doctor_id, INSERTED.available_date, 
                           INSERTED.start_time, INSERTED.end_time
                    VALUES (@doctor_id, @available_date, @start_time, @end_time)
                `;

                const params = { doctor_id, available_date, start_time, end_time };
                const result = await executeQuery(query, params);

                return {
                    status: 201,
                    jsonBody: {
                        success: true,
                        message: "Doctor schedule created successfully",
                        data: result.recordset[0]
                    }
                };
            }

        } catch (error) {
            context.log.error('Error in doctor schedule function:', error);
            
            return {
                status: 500,
                headers: corsHeaders,
                jsonBody: {
                    success: false,
                    error: "Failed to process request",
                    message: error.message
                }
            };
        }
    }
});

// ====================================
// REMINDERS ENDPOINTS
// ====================================
app.http('reminders', {
    methods: ['GET', 'POST', 'PUT'],
    authLevel: 'function',
    route: 'reminders/{id?}',
    handler: async (request, context) => {
        context.log('Reminders function triggered');
        const reminderId = request.params.id;

        try {
            if (request.method === 'GET') {
                const query = `
                    SELECT 
                        r.reminder_id,
                        r.reminder_type,
                        r.sent_at,
                        r.status,
                        a.appointment_date,
                        p.name as patient_name,
                        p.email as patient_email,
                        d.name as doctor_name
                    FROM Reminders r
                    JOIN Appointments a ON r.appointment_id = a.appointment_id
                    JOIN Patients p ON a.patient_id = p.patient_id
                    JOIN Doctors d ON a.doctor_id = d.doctor_id
                    ORDER BY a.appointment_date DESC
                `;
                
                const result = await executeQuery(query);

                return {
                    status: 200,
                    jsonBody: {
                        success: true,
                        message: `Retrieved ${result.recordset.length} reminders`,
                        data: result.recordset,
                        count: result.recordset.length
                    }
                };

            } else if (request.method === 'POST') {
                const body = await request.json();
                const { appointment_id, reminder_type } = body;
                
                if (!appointment_id || !reminder_type) {
                    return {
                        status: 400,
                        jsonBody: {
                            success: false,
                            error: "Missing required fields: appointment_id, reminder_type"
                        }
                    };
                }

                if (!['email', 'sms'].includes(reminder_type)) {
                    return {
                        status: 400,
                        jsonBody: {
                            success: false,
                            error: "reminder_type must be 'email' or 'sms'"
                        }
                    };
                }

                const query = `
                    INSERT INTO Reminders (appointment_id, reminder_type, status)
                    OUTPUT INSERTED.reminder_id, INSERTED.appointment_id, INSERTED.reminder_type, 
                           INSERTED.sent_at, INSERTED.status
                    VALUES (@appointment_id, @reminder_type, 'pending')
                `;

                const params = { appointment_id, reminder_type };
                const result = await executeQuery(query, params);

                return {
                    status: 201,
                    jsonBody: {
                        success: true,
                        message: "Reminder created successfully",
                        data: result.recordset[0]
                    }
                };

            } else if (request.method === 'PUT' && reminderId) {
                // Update reminder status (mark as sent)
                const query = `
                    UPDATE Reminders 
                    SET status = 'sent', sent_at = GETDATE()
                    OUTPUT INSERTED.reminder_id, INSERTED.status, INSERTED.sent_at
                    WHERE reminder_id = @reminder_id
                `;

                const params = { reminder_id: reminderId };
                const result = await executeQuery(query, params);

                if (result.recordset.length === 0) {
                    return {
                        status: 404,
                        jsonBody: {
                            success: false,
                            error: "Reminder not found"
                        }
                    };
                }

                return {
                    status: 200,
                    jsonBody: {
                        success: true,
                        message: "Reminder updated successfully",
                        data: result.recordset[0]
                    }
                };
            }

        } catch (error) {
            context.log.error('Error in reminders function:', error);
            
            return {
                status: 500,
                headers: corsHeaders,
                jsonBody: {
                    success: false,
                    error: "Failed to process request",
                    message: error.message
                }
            };
        }
    }
});

// ====================================
// DASHBOARD/STATS ENDPOINT
// ====================================
app.http('dashboard', {
    methods: ['GET'],
    authLevel: 'function',
    route: 'dashboard',
    handler: async (request, context) => {
        context.log('Dashboard function triggered');

        try {
            // Get counts for dashboard
            const queries = {
                patients: `SELECT COUNT(*) as count FROM Patients`,
                doctors: `SELECT COUNT(*) as count FROM Doctors`,
                appointments: `SELECT COUNT(*) as count FROM Appointments`,
                pending_reminders: `SELECT COUNT(*) as count FROM Reminders WHERE status = 'pending'`,
                recent_appointments: `
                    SELECT TOP 5
                        a.appointment_id,
                        a.appointment_date,
                        a.status,
                        p.name as patient_name,
                        d.name as doctor_name
                    FROM Appointments a
                    JOIN Patients p ON a.patient_id = p.patient_id
                    JOIN Doctors d ON a.doctor_id = d.doctor_id
                    ORDER BY a.appointment_date DESC
                `
            };

            const results = {};
            
            // Execute all queries
            for (const [key, query] of Object.entries(queries)) {
                const result = await executeQuery(query);
                if (key === 'recent_appointments') {
                    results[key] = result.recordset;
                } else {
                    results[key] = result.recordset[0].count;
                }
            }

            return {
                status: 200,
                jsonBody: {
                    success: true,
                    message: "Dashboard data retrieved successfully",
                    data: {
                        stats: {
                            total_patients: results.patients,
                            total_doctors: results.doctors,
                            total_appointments: results.appointments,
                            pending_reminders: results.pending_reminders
                        },
                        recent_appointments: results.recent_appointments
                    }
                }
            };

        } catch (error) {
            context.log.error('Error in dashboard function:', error);
            
            return {
                status: 500,
                headers: corsHeaders,
                jsonBody: {
                    success: false,
                    error: "Failed to retrieve dashboard data",
                    message: error.message
                }
            };
        }
    }
});

// ====================================
// DOCTORS ENDPOINTS  
// ====================================
app.http('doctors', {
    methods: ['GET', 'POST'],
    authLevel: 'function',
    route: 'doctors',
    handler: async (request, context) => {
        context.log('Doctors function triggered');

        try {
            if (request.method === 'GET') {
                const query = `SELECT doctor_id, name, email, specialization, created_at FROM Doctors`;
                const result = await executeQuery(query);

                return {
                    status: 200,
                    jsonBody: {
                        success: true,
                        message: `Retrieved ${result.recordset.length} doctors`,
                        data: result.recordset,
                        count: result.recordset.length
                    }
                };

            } else if (request.method === 'POST') {
                const body = await request.json();
                const { name, email, password_hash, specialization } = body;
                
                if (!name || !email || !password_hash) {
                    return {
                        status: 400,
                        jsonBody: {
                            success: false,
                            error: "Missing required fields: name, email, password_hash"
                        }
                    };
                }

                const query = `
                    INSERT INTO Doctors (name, email, password_hash, specialization)
                    OUTPUT INSERTED.doctor_id, INSERTED.name, INSERTED.email, INSERTED.specialization, INSERTED.created_at
                    VALUES (@name, @email, @password_hash, @specialization)
                `;

                const params = { name, email, password_hash, specialization: specialization || null };
                const result = await executeQuery(query, params);

                return {
                    status: 201,
                    jsonBody: {
                        success: true,
                        message: "Doctor created successfully",
                        data: result.recordset[0]
                    }
                };
            }

        } catch (error) {
            context.log.error('Error in doctors function:', error);
            
            return {
                status: 500,
                headers: corsHeaders,
                jsonBody: {
                    success: false,
                    error: "Failed to process request",
                    message: error.message
                }
            };
        }
    }
});

// Updated APPOINTMENTS ENDPOINTS
app.http('appointments', {
    methods: ['GET', 'POST', 'DELETE'],
    authLevel: 'function',
    route: 'appointments/{id?}',
    handler: async (request, context) => {
        context.log('Appointments function triggered');
        const appointmentId = request.params.id;

        try {
            if (request.method === 'GET') {
                // Get query parameters for filtering
                const url = new URL(request.url);
                const username = url.searchParams.get('username');
                const userType = url.searchParams.get('userType');

                let query = `
                    SELECT 
                        a.appointment_id as id,
                        CAST(a.appointment_date as DATE) as day,
                        CAST(a.appointment_date as TIME) as time,
                        a.status,
                        a.created_at,
                        p.name as username,
                        p.email as patient_email,
                        d.name as doctor,
                        d.specialization as doctor_specialization
                    FROM Appointments a
                    JOIN Patients p ON a.patient_id = p.patient_id
                    JOIN Doctors d ON a.doctor_id = d.doctor_id
                `;

                let params = {};
                
                // Filter based on user type and username
                if (username && userType) {
                    if (userType === 'patient') {
                        query += ` WHERE p.name = @username`;
                        params.username = username;
                    } else if (userType === 'doctor') {
                        query += ` WHERE d.name = @doctorName`;
                        params.doctorName = username;
                    }
                }
                
                query += ` ORDER BY a.appointment_date DESC`;
                
                const result = await executeQuery(query, params);

                return {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    },
                    jsonBody: result.recordset
                };

            } else if (request.method === 'POST') {
                const body = await request.json();
                const { doctor, day, time, username, patientName, status } = body;
                
                if (!doctor || !day || !time || !username) {
                    return {
                        status: 400,
                        jsonBody: {
                            success: false,
                            error: "Missing required fields: doctor, day, time, username"
                        }
                    };
                }

                // First, get or create patient
                let patientQuery = `SELECT patient_id FROM Patients WHERE name = @username`;
                let patientResult = await executeQuery(patientQuery, { username });
                
                let patientId;
                if (patientResult.recordset.length === 0) {
                    // Create patient if doesn't exist
                    const createPatientQuery = `
                        INSERT INTO Patients (name, email, password_hash)
                        OUTPUT INSERTED.patient_id
                        VALUES (@username, @email, @password)
                    `;
                    const newPatientResult = await executeQuery(createPatientQuery, {
                        username,
                        email: `${username}@temp.com`,
                        password: 'temp_password'
                    });
                    patientId = newPatientResult.recordset[0].patient_id;
                } else {
                    patientId = patientResult.recordset[0].patient_id;
                }

                // Get doctor ID
                const doctorQuery = `SELECT doctor_id FROM Doctors WHERE name = @doctor`;
                const doctorResult = await executeQuery(doctorQuery, { doctor });
                
                if (doctorResult.recordset.length === 0) {
                    return {
                        status: 400,
                        jsonBody: {
                            success: false,
                            error: "Doctor not found"
                        }
                    };
                }

                const doctorId = doctorResult.recordset[0].doctor_id;
                const appointmentDateTime = `${day}T${time}:00`;

                const query = `
                    INSERT INTO Appointments (patient_id, doctor_id, appointment_date, status)
                    OUTPUT INSERTED.appointment_id as id, 
                           CAST(INSERTED.appointment_date as DATE) as day,
                           CAST(INSERTED.appointment_date as TIME) as time,
                           INSERTED.status
                    VALUES (@patient_id, @doctor_id, @appointment_date, @status)
                `;

                const params = { 
                    patient_id: patientId, 
                    doctor_id: doctorId, 
                    appointment_date: appointmentDateTime,
                    status: status || 'scheduled'
                };
                const result = await executeQuery(query, params);

                const newAppointment = {
                    ...result.recordset[0],
                    doctor,
                    username
                };

                return {
                    status: 201,
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    },
                    jsonBody: newAppointment
                };

            } else if (request.method === 'DELETE' && appointmentId) {
                const query = `DELETE FROM Appointments WHERE appointment_id = @appointment_id`;
                await executeQuery(query, { appointment_id: appointmentId });

                return {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    },
                    jsonBody: { success: true, message: "Appointment cancelled" }
                };
            }

        } catch (error) {
            context.log.error('Error in appointments function:', error);
            
            return {
                status: 500,
                headers: corsHeaders,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                jsonBody: {
                    success: false,
                    error: "Failed to process request",
                    message: error.message
                }
            };
        }
    }
});
// ====================================
// MEDICAL RECORDS ENDPOINTS
// ====================================
app.http('medicalRecords', {
    methods: ['GET', 'POST'],
    authLevel: 'function',
    route: 'medical-records',
    handler: async (request, context) => {
        context.log('Medical Records function triggered');

        try {
            if (request.method === 'GET') {
                const query = `
                    SELECT 
                        mr.record_id,
                        mr.file_name,
                        mr.file_path,
                        mr.uploaded_at,
                        p.name as patient_name,
                        p.email as patient_email
                    FROM MedicalRecords mr
                    JOIN Patients p ON mr.patient_id = p.patient_id
                    ORDER BY mr.uploaded_at DESC
                `;
                
                const result = await executeQuery(query);

                return {
                    status: 200,
                    jsonBody: {
                        success: true,
                        message: `Retrieved ${result.recordset.length} medical records`,
                        data: result.recordset,
                        count: result.recordset.length
                    }
                };

            } else if (request.method === 'POST') {
                const body = await request.json();
                const { patient_id, file_name, file_path } = body;
                
                if (!patient_id || !file_name || !file_path) {
                    return {
                        status: 400,
                        jsonBody: {
                            success: false,
                            error: "Missing required fields: patient_id, file_name, file_path"
                        }
                    };
                }

                const query = `
                    INSERT INTO MedicalRecords (patient_id, file_name, file_path)
                    OUTPUT INSERTED.record_id, INSERTED.patient_id, INSERTED.file_name, 
                           INSERTED.file_path, INSERTED.uploaded_at
                    VALUES (@patient_id, @file_name, @file_path)
                `;

                const params = { patient_id, file_name, file_path };
                const result = await executeQuery(query, params);

                return {
                    status: 201,
                    jsonBody: {
                        success: true,
                        message: "Medical record created successfully",
                        data: result.recordset[0]
                    }
                };
            }

        } catch (error) {
            context.log.error('Error in medical records function:', error);
            
            return {
                status: 500,
                headers: corsHeaders,
                jsonBody: {
                    success: false,
                    error: "Failed to process request",
                    message: error.message
                }
            };
        }
    }
});