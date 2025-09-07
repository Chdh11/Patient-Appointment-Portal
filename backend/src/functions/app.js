const { app } = require('@azure/functions');
const { executeQuery } = require('../db');
const { storageHelpers, CONTAINERS, initializeContainers } = require('../storage');

initializeContainers();

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json"
};

// OPTIONS handler
app.http('corsHandler', {
    methods: ['OPTIONS'],
    authLevel: 'anonymous',
    route: '{*restOfPath}',
    handler: async () => ({ status: 200, headers: corsHeaders, body: '' })
});

// ==================== PATIENTS ====================
app.http('patients', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    route: 'patients',
    handler: async (request, context) => {
        try {
            if (request.method === 'GET') {
                const query = `
                    SELECT patient_id, name, email, username, phone, date_of_birth, gender, created_at
                    FROM Patients
                `;
                const result = await executeQuery(query);
                return { status: 200, headers: corsHeaders ,  jsonBody: { success: true, data: result.recordset, count: result.recordset.length } };
            }

            if (request.method === 'POST') {
                const body = await request.json();
                const { name, email, password_hash, username, phone, date_of_birth, gender } = body;

                if (!name || !email || !password_hash || !username) {
                    return { status: 400, headers: corsHeaders, jsonBody: { success: false, error: "Missing required fields" } };
                }

                const query = `
                    INSERT INTO Patients (name, email, password_hash, username, phone, date_of_birth, gender)
                    OUTPUT INSERTED.patient_id, INSERTED.name, INSERTED.email, INSERTED.username, INSERTED.phone, INSERTED.date_of_birth, INSERTED.gender, INSERTED.created_at
                    VALUES (@name, @email, @password_hash, @username, @phone, @date_of_birth, @gender)
                `;
                const params = { name, email, password_hash, username, phone, date_of_birth, gender };
                const result = await executeQuery(query, params);

                return { status: 201, headers: corsHeaders, jsonBody: { success: true, message: "Patient created", data: result.recordset[0] } };
            }

        } catch (error) {
            context.error(error);
            return { status: 500, headers: corsHeaders, jsonBody: { success: false, error: error.message } };
        }
    }
});

// ==================== DOCTORS ====================
app.http('doctors', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    route: 'doctors',
    handler: async (request, context) => {
        try {
            if (request.method === 'GET') {
                const query = `
                    SELECT doctor_id, name, email, username, phone, specialization, license_number, created_at
                    FROM Doctors
                `;
                const result = await executeQuery(query);
                return { status: 200, headers: corsHeaders, jsonBody: { success: true, data: result.recordset, count: result.recordset.length } };
            }

            if (request.method === 'POST') {
                const body = await request.json();
                const { name, email, password_hash, username, phone, specialization, license_number } = body;

                if (!name || !email || !password_hash || !username) {
                    return { status: 400, headers: corsHeaders, jsonBody: { success: false, error: "Missing required fields" } };
                }

                const query = `
                    INSERT INTO Doctors (name, email, password_hash, username, phone, specialization, license_number)
                    OUTPUT INSERTED.doctor_id, INSERTED.name, INSERTED.email, INSERTED.username, INSERTED.phone, INSERTED.specialization, INSERTED.license_number, INSERTED.created_at
                    VALUES (@name, @email, @password_hash, @username, @phone, @specialization, @license_number)
                `;
                const params = { name, email, password_hash, username, phone, specialization, license_number };
                const result = await executeQuery(query, params);

                return { status: 201, headers: corsHeaders, jsonBody: { success: true, message: "Doctor created", data: result.recordset[0] } };
            }

        } catch (error) {
            context.error(error);
            return { status: 500, headers: corsHeaders, jsonBody: { success: false, error: error.message } };
        }
    }
});

// ==================== DOCTOR SCHEDULE ====================
app.http('doctorSchedule', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    route: 'doctor-schedule',
    handler: async (request, context) => {
        try {
            if (request.method === 'GET') {
                const query = `
                    SELECT ds.schedule_id, ds.doctor_id, ds.available_date, ds.start_time, ds.end_time, ds.notes,
                           d.name AS doctor_name, d.specialization, d.license_number
                    FROM DoctorSchedule ds
                    JOIN Doctors d ON ds.doctor_id = d.doctor_id
                    ORDER BY ds.available_date, ds.start_time
                `;
                const result = await executeQuery(query);
                return { status: 200, headers: corsHeaders, jsonBody: { success: true, data: result.recordset, count: result.recordset.length } };
            }

            if (request.method === 'POST') {
                const body = await request.json();
                const { doctor_id, available_date, start_time, end_time, notes } = body;

                if (!doctor_id || !available_date || !start_time || !end_time) {
                    return { status: 400, headers: corsHeaders, jsonBody: { success: false, error: "Missing required fields" } };
                }

                const query = `
                    INSERT INTO DoctorSchedule (doctor_id, available_date, start_time, end_time, notes)
                    OUTPUT INSERTED.schedule_id, INSERTED.doctor_id, INSERTED.available_date, INSERTED.start_time, INSERTED.end_time, INSERTED.notes
                    VALUES (@doctor_id, @available_date, @start_time, @end_time, @notes)
                `;
                const params = { doctor_id, available_date, start_time, end_time, notes };
                const result = await executeQuery(query, params);

                return { status: 201, headers: corsHeaders, jsonBody: { success: true, message: "Schedule created", data: result.recordset[0] } };
            }

        } catch (error) {
            context.error(error);
            return { status: 500,headers: corsHeaders,  jsonBody: { success: false, error: error.message } };
        }
    }
});

// ==================== APPOINTMENTS ====================
app.http('appointments', {
    methods: ['GET', 'POST', 'DELETE'],
    authLevel: 'anonymous',
    route: 'appointments/{id?}',
    handler: async (request, context) => {
        const appointmentId = request.params.id;
        try {
            if (request.method === 'GET') {
                const url = new URL(request.url);
                const username = url.searchParams.get('username');
                const userType = url.searchParams.get('userType');

                let query = `
                    SELECT a.appointment_id as id,
                           CAST(a.appointment_date AS DATE) as day,
                           CAST(a.appointment_date AS TIME) as time,
                           a.status, a.created_at,
                           p.patient_id, p.name as patient_name, p.username as patient_username, p.phone as patient_phone, p.date_of_birth, p.gender, p.email as patient_email,
                           d.doctor_id, d.name as doctor_name, d.username as doctor_username, d.phone as doctor_phone, d.specialization, d.license_number
                    FROM Appointments a
                    JOIN Patients p ON a.patient_id = p.patient_id
                    JOIN Doctors d ON a.doctor_id = d.doctor_id
                `;

                let params = {};
                if (username && userType) {
                    if (userType === 'patient') {
                        query += ` WHERE p.username = @username`;
                        params.username = username;
                    } else if (userType === 'doctor') {
                        query += ` WHERE d.username = @username`;
                        params.username = username;
                    }
                }

                query += ` ORDER BY a.appointment_date DESC`;
                const result = await executeQuery(query, params);
                return { status: 200, headers: corsHeaders, jsonBody: result.recordset };
            }

            if (request.method === 'POST') {
                const body = await request.json();
                const { doctor_username, day, time, patient_username, status } = body;

                if (!doctor_username || !day || !time || !patient_username) {
                    return { status: 400, headers: corsHeaders, jsonBody: { success: false, error: "Missing required fields" } };
                }

                // Get patient_id
                const patientQuery = `SELECT patient_id FROM Patients WHERE username = @username`;
                let patientResult = await executeQuery(patientQuery, { username: patient_username });
                if (patientResult.recordset.length === 0) {
                    return { status: 400, headers: corsHeaders, jsonBody: { success: false, error: "Patient not found" } };
                }
                const patient_id = patientResult.recordset[0].patient_id;

                // Get doctor_id
                const doctorQuery = `SELECT doctor_id FROM Doctors WHERE name = @name`;
                const doctorResult = await executeQuery(doctorQuery, { name: doctor_username });
                if (doctorResult.recordset.length === 0) {
                    return { status: 400,headers: corsHeaders,  jsonBody: { success: false, error: "Doctor not found" } };
                }
                const doctor_id = doctorResult.recordset[0].doctor_id;

                const appointmentDateTime = `${day}T${time}:00`;

                const query = `
                    INSERT INTO Appointments (patient_id, doctor_id, appointment_date, status)
                    OUTPUT INSERTED.appointment_id as id, CAST(INSERTED.appointment_date AS DATE) as day, CAST(INSERTED.appointment_date AS TIME) as time, INSERTED.status
                    VALUES (@patient_id, @doctor_id, @appointment_date, @status)
                `;
                const result = await executeQuery(query, { patient_id, doctor_id, appointment_date: appointmentDateTime, status: status || 'scheduled' });
                return { status: 201, headers: corsHeaders, jsonBody: result.recordset[0] };
            }

            if (request.method === 'DELETE' && appointmentId) {
                const query = `DELETE FROM Appointments WHERE appointment_id = @appointment_id`;
                await executeQuery(query, { appointment_id: appointmentId });
                return { status: 200, headers: corsHeaders, jsonBody: { success: true, message: "Appointment cancelled" } };
            }

        } catch (error) {
            context.error(error);
            return { status: 500, headers: corsHeaders, jsonBody: { success: false, error: error.message } };
        }
    }
});

// ==================== REMINDERS ====================
app.http('reminders', {
    methods: ['GET', 'POST', 'PUT'],
    authLevel: 'anonymous',
    route: 'reminders/{id?}',
    handler: async (request, context) => {
        const reminderId = request.params.id;
        try {
            if (request.method === 'GET') {
                const query = `
                    SELECT r.reminder_id, r.reminder_type, r.sent_at, r.status,
                           a.appointment_id, a.appointment_date,
                           p.patient_id, p.name as patient_name, p.username as patient_username, p.phone as patient_phone,
                           d.doctor_id, d.name as doctor_name, d.username as doctor_username
                    FROM Reminders r
                    JOIN Appointments a ON r.appointment_id = a.appointment_id
                    JOIN Patients p ON a.patient_id = p.patient_id
                    JOIN Doctors d ON a.doctor_id = d.doctor_id
                    ORDER BY a.appointment_date DESC
                `;
                const result = await executeQuery(query);
                return { status: 200, headers: corsHeaders, jsonBody: { success: true, data: result.recordset, count: result.recordset.length } };
            }

            if (request.method === 'POST') {
                const body = await request.json();
                const { appointment_id, reminder_type } = body;
                if (!appointment_id || !reminder_type) {
                    return { status: 400, headers: corsHeaders, jsonBody: { success: false, error: "Missing fields" } };
                }

                const query = `
                    INSERT INTO Reminders (appointment_id, reminder_type, status)
                    OUTPUT INSERTED.reminder_id, INSERTED.appointment_id, INSERTED.reminder_type, INSERTED.sent_at, INSERTED.status
                    VALUES (@appointment_id, @reminder_type, 'pending')
                `;
                const result = await executeQuery(query, { appointment_id, reminder_type });
                return { status: 201, headers: corsHeaders, jsonBody: { success: true, message: "Reminder created", data: result.recordset[0] } };
            }

            if (request.method === 'PUT' && reminderId) {
                const query = `
                    UPDATE Reminders SET status = 'sent', sent_at = GETDATE()
                    OUTPUT INSERTED.reminder_id, INSERTED.status, INSERTED.sent_at
                    WHERE reminder_id = @reminder_id
                `;
                const result = await executeQuery(query, { reminder_id: reminderId });
                if (result.recordset.length === 0) return { status: 404,  jsonBody: { success: false, error: "Reminder not found" } };
                return { status: 200, headers: corsHeaders, jsonBody: { success: true, message: "Reminder updated", data: result.recordset[0] } };
            }

        } catch (error) {
            context.error(error);
            return { status: 500, headers: corsHeaders, jsonBody: { success: false, error: error.message } };
        }
    }
});

// ==================== MEDICAL RECORDS ====================
// app.http('medicalRecords', {
//     methods: ['GET', 'POST'],
//     authLevel: 'anonymous',
//     route: 'medical-records',
//     handler: async (request, context) => {
//         try {
//             if (request.method === 'GET') {
//                 const query = `
//                     SELECT mr.record_id, mr.file_name, mr.file_path, mr.uploaded_at,
//                            p.patient_id, p.name as patient_name, p.username as patient_username, p.phone as patient_phone, p.email as patient_email
//                     FROM MedicalRecords mr
//                     JOIN Patients p ON mr.patient_id = p.patient_id
//                     ORDER BY mr.uploaded_at DESC
//                 `;
//                 const result = await executeQuery(query);
//                 return { status: 200, headers: corsHeaders, jsonBody: { success: true, data: result.recordset, count: result.recordset.length } };
//             }

//             if (request.method === 'POST') {
//                 const body = await request.json();
//                 const { patient_username, file_name, file_path } = body;
//                 if (!patient_username || !file_name || !file_path) {
//                     return { status: 400, headers: corsHeaders, jsonBody: { success: false, error: "Missing required fields" } };
//                 }

//                 const patientQuery = `SELECT patient_id FROM Patients WHERE username = @username`;
//                 const patientResult = await executeQuery(patientQuery, { username: patient_username });
//                 if (patientResult.recordset.length === 0) return { status: 404,  jsonBody: { success: false, error: "Patient not found" } };
//                 const patient_id = patientResult.recordset[0].patient_id;

//                 const query = `
//                     INSERT INTO MedicalRecords (patient_id, file_name, file_path)
//                     OUTPUT INSERTED.record_id, INSERTED.file_name, INSERTED.file_path, INSERTED.uploaded_at
//                     VALUES (@patient_id, @file_name, @file_path)
//                 `;
//                 const result = await executeQuery(query, { patient_id, file_name, file_path });
//                 return { status: 201, headers: corsHeaders, jsonBody: { success: true, message: "Medical record uploaded", data: result.recordset[0] } };
//             }

//         } catch (error) {
//             context.error(error);
//             return { status: 500, headers: corsHeaders, jsonBody: { success: false, error: error.message } };
//         }
//     }
// });

//======================get all records based on patient id=================
app.http('medical-records', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'medical-records/{username}',
    handler: async (request, context) => {
        const username = request.params.username;

        try {
            const query = `
                SELECT mr.record_id, mr.file_name, mr.blob_name, mr.uploaded_at, mr.description,
                       p.patient_id, p.name as patient_name, p.username as patient_username, p.phone as patient_phone, p.email as patient_email
                FROM MedicalRecords mr
                JOIN Patients p ON mr.patient_id = p.patient_id 
                WHERE p.username = @username
                ORDER BY mr.uploaded_at DESC
            `;
            
            const params = { username: username };
            const result = await executeQuery(query, params);
            
            return { 
                status: 200, 
                headers: corsHeaders, 
                jsonBody: { 
                    success: true, 
                    data: result.recordset, 
                    count: result.recordset.length 
                } 
            };
        } catch (error) {
            context.error(error);
            return { 
                status: 500, 
                headers: corsHeaders, 
                jsonBody: { 
                    success: false, 
                    error: error.message 
                } 
            };
        }
    }
});

//=======================File Upload=========================

app.http('uploadFile', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'upload/{containerType}',
    handler: async (request, context) => {
        const containerType = request.params.containerType;
        
        try {
            // Validate container type
            const validContainers = {
                'medical-records': CONTAINERS.MEDICAL_RECORDS
            };

            if (!validContainers[containerType]) {
                return {
                    status: 400,
                    headers: corsHeaders,
                    jsonBody: { success: false, error: "Invalid container type" }
                };
            }

            // Get file data from request
            const fileBuffer = Buffer.from(await request.arrayBuffer());
            
            if (fileBuffer.length === 0) {
                return {
                    status: 400,
                    headers: corsHeaders,
                    jsonBody: { success: false, error: "No file data provided" }
                };
            }

            // Get query parameters
            const originalFileName = request.query.get('filename') || 'uploaded_file';
            const patientUsername = request.query.get('patientUsername');
            const description = request.query.get('description') || 'Medical record uploaded via portal';
            const contentType = request.query.get('contentType') || 'application/octet-stream';

            // Generate unique blob name with patient folder structure
            let blobName;
            if (patientUsername) {
                const uniqueId = storageHelpers.generateUniqueFileName(originalFileName);
                blobName = `${patientUsername}/${uniqueId}`;
            } else {
                blobName = storageHelpers.generateUniqueFileName(originalFileName);
            }

            // Upload file to blob storage
            const uploadResult = await storageHelpers.uploadFile(
                validContainers[containerType],
                blobName,
                fileBuffer,
                contentType
            );

            // If this is a medical record, save to database with all required fields
            if (containerType === 'medical-records' && patientUsername) {
                const { executeQuery } = require('../db');
                
                try {
                    // Get patient_id
                    const patientQuery = `SELECT patient_id FROM Patients WHERE username = @username`;
                    const patientResult = await executeQuery(patientQuery, { username: patientUsername });
                    
                    if (patientResult.recordset.length > 0) {
                        const patient_id = patientResult.recordset[0].patient_id;
                        
                        // Save file info to MedicalRecords table with all fields
                        const recordQuery = `
                            INSERT INTO MedicalRecords (patient_id, file_name, blob_name, file_size, mime_type, description)
                            OUTPUT INSERTED.record_id, INSERTED.patient_id, INSERTED.file_name, INSERTED.blob_name, 
                                   INSERTED.file_size, INSERTED.mime_type, INSERTED.description, INSERTED.uploaded_at
                            VALUES (@patient_id, @file_name, @blob_name, @file_size, @mime_type, @description)
                        `;
                        
                        const recordParams = {
                            patient_id: patient_id,
                            file_name: originalFileName,
                            blob_name: blobName,
                            file_size: fileBuffer.length,
                            mime_type: contentType,
                            description: description
                        };
                        
                        const recordResult = await executeQuery(recordQuery, recordParams);
                        uploadResult.databaseRecord = recordResult.recordset[0];
                        
                        console.log('Database record created:', recordResult.recordset[0]);
                    } else {
                        console.log('Patient not found for username:', patientUsername);
                        uploadResult.warning = 'File uploaded but patient not found for database record';
                    }
                } catch (dbError) {
                    console.error('Database error:', dbError);
                    uploadResult.warning = 'File uploaded but database record creation failed';
                    uploadResult.dbError = dbError.message;
                }
            }

            return {
                status: 200,
                headers: corsHeaders,
                jsonBody: {
                    success: true,
                    message: "File uploaded successfully",
                    data: {
                        fileName: originalFileName,
                        blobName: blobName,
                        fileSize: fileBuffer.length,
                        mimeType: contentType,
                        description: description,
                        url: uploadResult.url,
                        databaseRecord: uploadResult.databaseRecord,
                        warning: uploadResult.warning,
                        uploadResponse: uploadResult.uploadResponse
                    }
                }
            };

        } catch (error) {
            console.error('Upload error:', error);
            context.error('Upload error:', error.message);
            
            return {
                status: 500,
                headers: corsHeaders,
                jsonBody: { success: false, error: error.message }
            };
        }
    }
});

// ==================== UPDATED DELETE FUNCTION ====================
app.http('deleteFile', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'files/{containerType}/{*blobPath}',
    handler: async (request, context) => {
        const containerType = request.params.containerType;
        const blobPath = request.params.blobPath;

        // ADD THIS LOGGING
        console.log('=== DELETE REQUEST DEBUG ===');
        console.log('Container Type:', containerType);
        console.log('Blob Path from URL:', blobPath);
        console.log('Full URL:', request.url);
        console.log('Raw params:', request.params);

        try {
            // Validate container type
            const validContainers = {
                'medical-records': CONTAINERS.MEDICAL_RECORDS
            };

            if (!validContainers[containerType]) {
                return {
                    status: 400,
                    headers: corsHeaders,
                    jsonBody: { success: false, error: "Invalid container type" }
                };
            }

            // ADD MORE LOGGING BEFORE STORAGE CALL
            console.log('Attempting to delete from container:', validContainers[containerType]);
            console.log('Full blob path being deleted:', blobPath);

            // Delete from blob storage
            const deleteResult = await storageHelpers.deleteFile(
                validContainers[containerType],
                blobPath  // This should be the full path: chhavi/1757230690615_g25t7h.pdf
            );

            // If this is a medical record, also delete from database using blob_name
            if (containerType === 'medical-records') {
                try {
                    const { executeQuery } = require('../db');
                    
                    // ADD LOGGING FOR DATABASE OPERATION
                    console.log('Deleting from database with blob_name:', blobPath);
                    
                    const recordQuery = `DELETE FROM MedicalRecords WHERE blob_name = @blob_name`;
                    const dbResult = await executeQuery(recordQuery, { blob_name: blobPath });
                    
                    console.log('Database delete result:', dbResult);
                    
                } catch (dbError) {
                    console.error('Database delete error:', dbError);
                    return {
                        status: 200,
                        headers: corsHeaders,
                        jsonBody: {
                            success: true,
                            message: "File deleted from storage but database cleanup failed",
                            warning: dbError.message
                        }
                    };
                }
            }

            return {
                status: 200,
                headers: corsHeaders,
                jsonBody: {
                    success: true,
                    message: "File deleted successfully",
                    data: deleteResult
                }
            };

        } catch (error) {
            console.error('Delete file error:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            
            context.error('Delete file error:', error.message);
            
            return {
                status: 500,
                headers: corsHeaders,
                jsonBody: { success: false, error: error.message }
            };
        }
    }
});