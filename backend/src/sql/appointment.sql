-- -- ==============================
-- -- Patients Table
-- -- ==============================
-- CREATE TABLE Patients (
--     patient_id INT IDENTITY(1,1) PRIMARY KEY,
--     name NVARCHAR(100) NOT NULL,
--     email NVARCHAR(100) UNIQUE NOT NULL,
--     password_hash NVARCHAR(255) NOT NULL,
--     created_at DATETIME DEFAULT GETDATE()
-- );

-- -- ==============================
-- -- Doctors Table
-- -- ==============================
-- CREATE TABLE Doctors (
--     doctor_id INT IDENTITY(1,1) PRIMARY KEY,
--     name NVARCHAR(100) NOT NULL,
--     email NVARCHAR(100) UNIQUE NOT NULL,
--     password_hash NVARCHAR(255) NOT NULL,
--     specialization NVARCHAR(50),
--     created_at DATETIME DEFAULT GETDATE()
-- );

-- -- ==============================
-- -- DoctorSchedule Table
-- -- ==============================
-- CREATE TABLE DoctorSchedule (
--     schedule_id INT IDENTITY(1,1) PRIMARY KEY,
--     doctor_id INT NOT NULL FOREIGN KEY REFERENCES Doctors(doctor_id),
--     available_date DATE NOT NULL,
--     start_time TIME NOT NULL,
--     end_time TIME NOT NULL
-- );

-- -- ==============================
-- -- Appointments Table
-- -- ==============================
-- CREATE TABLE Appointments (
--     appointment_id INT IDENTITY(1,1) PRIMARY KEY,
--     patient_id INT NOT NULL FOREIGN KEY REFERENCES Patients(patient_id),
--     doctor_id INT NOT NULL FOREIGN KEY REFERENCES Doctors(doctor_id),
--     appointment_date DATETIME NOT NULL,
--     status NVARCHAR(10) DEFAULT 'scheduled',
--     created_at DATETIME DEFAULT GETDATE()
-- );

-- -- ==============================
-- -- MedicalRecords Table
-- -- ==============================
-- CREATE TABLE MedicalRecords (
--     record_id INT IDENTITY(1,1) PRIMARY KEY,
--     patient_id INT NOT NULL FOREIGN KEY REFERENCES Patients(patient_id),
--     file_name NVARCHAR(255),
--     file_path NVARCHAR(255),
--     uploaded_at DATETIME DEFAULT GETDATE()
-- );

-- -- ==============================
-- -- Reminders Table
-- -- ==============================
-- CREATE TABLE Reminders (
--     reminder_id INT IDENTITY(1,1) PRIMARY KEY,
--     appointment_id INT NOT NULL FOREIGN KEY REFERENCES Appointments(appointment_id),
--     reminder_type NVARCHAR(10) CHECK(reminder_type IN ('email','sms')),
--     sent_at DATETIME,
--     status NVARCHAR(10) DEFAULT 'pending'
-- );

-- SELECT * FROM Patients;
-- SELECT * FROM Doctors;
-- SELECT * FROM Appointments;
-- SELECT * FROM MedicalRecords;
-- SELECT * FROM DoctorSchedule;
-- SELECT * FROM Reminders;

-- Dummy data for testing

-- INSERT INTO Patients (name, email, password_hash)
-- VALUES 
-- ('John Doe', 'john@example.com', 'hashedpassword1'),
-- ('Jane Smith', 'jane@example.com', 'hashedpassword2');

-- INSERT INTO Doctors (name, email, password_hash, specialization)
-- VALUES 
-- ('Dr. Alice', 'alice@example.com', 'hashedpassword3', 'Cardiology'),
-- ('Dr. Bob', 'bob@example.com', 'hashedpassword4', 'Pediatrics');

-- INSERT INTO DoctorSchedule (doctor_id, available_date, start_time, end_time)
-- VALUES
-- (1, '2025-09-01', '09:00', '12:00'),
-- (1, '2025-09-01', '14:00', '17:00'),
-- (2, '2025-09-01', '10:00', '13:00'),
-- (2, '2025-09-02', '09:00', '12:00');

-- INSERT INTO Appointments (patient_id, doctor_id, appointment_date, status)
-- VALUES
-- (1, 1, '2025-09-01 09:30', 'scheduled'),
-- (2, 2, '2025-09-02 10:00', 'scheduled');

-- INSERT INTO MedicalRecords (patient_id, file_name, file_path)
-- VALUES
-- (1, 'blood_test.pdf', '/files/john/blood_test.pdf'),
-- (2, 'xray_image.jpg', '/files/jane/xray_image.jpg');

-- INSERT INTO Reminders (appointment_id, reminder_type, sent_at, status)
-- VALUES
-- (1, 'email', NULL, 'pending'),
-- (2, 'sms', NULL, 'pending');

-- Create user for the Function App's managed identity
-- Replace 'healthcare-functions-app' with your actual Function App name
-- Create user for your function app
-- CREATE USER [appointment-function-app3] FROM EXTERNAL PROVIDER;

-- -- -- Grant permissions
-- ALTER ROLE db_datareader ADD MEMBER [appointment-function-app2];
-- ALTER ROLE db_datawriter ADD MEMBER [appointment-function-app2];

-- -- Verify
-- SELECT name, type_desc FROM sys.database_principals WHERE name = 'appointment-function-app2';

-- Add the doctors that your frontend expects
-- INSERT INTO Doctors (name, email, password_hash, specialization)
-- VALUES 
-- ('Dr. Smith', 'dr.smith@hospital.com', 'hashedpassword1', 'Cardiology'),
-- ('Dr. Johnson', 'dr.johnson@hospital.com', 'hashedpassword2', 'Orthopedics'),
-- ('Dr. Lee', 'dr.lee@hospital.com', 'hashedpassword3', 'Pediatrics'),
-- ('Dr. Patel', 'dr.patel@hospital.com', 'hashedpassword4', 'Neurology');

-- -- Add some sample patients
-- INSERT INTO Patients (name, email, password_hash)
-- VALUES 
-- ('john_doe', 'john@example.com', 'hashedpassword5'),
-- ('jane_smith', 'jane@example.com', 'hashedpassword6'),
-- ('test_patient', 'test@example.com', 'hashedpassword7');

-- -- Add doctor schedules for availability
-- INSERT INTO DoctorSchedule (doctor_id, available_date, start_time, end_time)
-- VALUES
-- (1, '2025-09-03', '09:00', '17:00'),
-- (2, '2025-09-03', '09:00', '17:00'),
-- (3, '2025-09-03', '09:00', '17:00'),
-- (4, '2025-09-03', '09:00', '17:00'),
-- (1, '2025-09-04', '09:00', '17:00'),
-- (2, '2025-09-04', '09:00', '17:00'),
-- (3, '2025-09-04', '09:00', '17:00'),
-- (4, '2025-09-04', '09:00', '17:00');



-- ALTER TABLE Patients 
-- ADD username NVARCHAR(50);

-- ALTER TABLE Patients 
-- ADD phone NVARCHAR(20);

-- ALTER TABLE Doctors
-- ADD username NVARCHAR(50),
--     phone NVARCHAR(20),
--     license_number NVARCHAR(50),
--     working_hours_start TIME,
--     working_hours_end TIME;

-- ALTER TABLE Appointments
-- ADD day DATE,
--     time TIME,
--     notes NVARCHAR(500);

-- ALTER TABLE MedicalRecords
-- ADD description NVARCHAR(500);



-- ALTER TABLE Reminders
-- ADD message NVARCHAR(255);




-- INSERT INTO Patients (name, email, password_hash, username, phone, date_of_birth, gender)
-- VALUES 
-- ('John Doe', 'john@example.com', 'hashedpassword1', 'john_doe', '9876543210', '1990-05-12', 'Male'),
-- ('Jane Smith', 'jane@example.com', 'hashedpassword2', 'jane_smith', '9876543211', '1988-11-23', 'Female'),
-- ('Chhavi Dhankhar', 'chhavidhankhar07@gmail.com', 'hashedpassword3', 'chhavi_dh', '9991215441', '2002-08-11', 'Female');

-- INSERT INTO Doctors (name, email, password_hash, specialization, username, phone, license_number, working_hours_start, working_hours_end)
-- VALUES 
-- ('Dr. Alice', 'alice@example.com', 'hashedpassword4', 'Cardiology', 'dr_alice', '9876500001', 'MD-111', '09:00', '17:00'),
-- ('Dr. Bob', 'bob@example.com', 'hashedpassword5', 'Pediatrics', 'dr_bob', '9876500002', 'MD-222', '09:00', '17:00'),
-- ('Dr. Smith', 'dr.smith@hospital.com', 'hashedpassword6', 'Cardiology', 'dr_smith', '9876500003', 'MD-333', '09:00', '17:00'),
-- ('Dr. Johnson', 'dr.johnson@hospital.com', 'hashedpassword7', 'Orthopedics', 'dr_johnson', '9876500004', 'MD-444', '09:00', '17:00');

-- ALTER TABLE DoctorSchedule
-- ADD notes NVARCHAR(255);

-- INSERT INTO DoctorSchedule (doctor_id, available_date, start_time, end_time, notes)
-- VALUES
-- (7, '2025-09-03', '09:00', '17:00', 'Regular clinic hours'),
-- (8, '2025-09-03', '09:00', '17:00', 'Regular clinic hours'),
-- (9, '2025-09-03', '09:00', '17:00', 'Regular clinic hours'),
-- (10, '2025-09-03', '09:00', '17:00', 'Regular clinic hours'),
-- (7, '2025-09-04', '09:00', '17:00', 'Extended hours'),
-- (8, '2025-09-04', '09:00', '17:00', 'Extended hours');

-- INSERT INTO Appointments (patient_id, doctor_id, appointment_date, status, day, time, notes)
-- VALUES
-- (4, 7, '2025-09-01 09:30', 'scheduled', '2025-09-01', '09:30', 'Routine checkup'),
-- (5, 8, '2025-09-02 10:00', 'scheduled', '2025-09-02', '10:00', 'Follow-up'),
-- (6, 7, '2025-09-03 11:00', 'scheduled', '2025-09-03', '11:00', 'Consultation');

-- INSERT INTO Reminders (appointment_id, reminder_type, sent_at, status, message)
-- VALUES
-- (3, 'email', NULL, 'pending', 'Reminder: Your appointment is scheduled for 2025-09-01 09:30'),
-- (4, 'sms', NULL, 'pending', 'Reminder: Your appointment is scheduled for 2025-09-02 10:00'),
-- (5, 'email', NULL, 'pending', 'Reminder: Your appointment is scheduled for 2025-09-03 11:00');

-- INSERT INTO MedicalRecords (patient_id, file_name, file_path, uploaded_at, description)
-- VALUES
-- (4, 'blood_test.pdf', '/files/john/blood_test.pdf', GETDATE(), 'Blood test results'),
-- (5, 'xray_image.jpg', '/files/jane/xray_image.jpg', GETDATE(), 'X-ray scan of chest'),
-- (6, 'mri_scan.pdf', '/files/test/mri_scan.pdf', GETDATE(), 'MRI brain scan');


-- ALTER TABLE MedicalRecords 
-- ADD blob_name NVARCHAR(500),
--     file_size BIGINT,
--     mime_type NVARCHAR(100);

-- UPDATE MedicalRecords 
-- SET blob_name = file_path 
-- WHERE blob_name IS NULL;

-- INSERT INTO MedicalRecords (patient_id, file_name, blob_name, file_size, mime_type, description)
-- VALUES 
-- (1, 'blood_test.pdf', 'patient1/uuid_blood_test.pdf', 102400, 'application/pdf', 'Blood test results'),
-- (2, 'xray_image.jpg', 'patient2/uuid_xray_image.jpg', 524288, 'image/jpeg', 'X-ray scan of chest'),
-- (3, 'mri_scan.pdf', 'patient3/uuid_mri_scan.pdf', 1048576, 'application/pdf', 'MRI brain scan');

select * from MedicalRecords


-- Create user for your function app
-- CREATE USER [appointment-function-app3] FROM EXTERNAL PROVIDER;

-- -- Grant permissions
-- ALTER ROLE db_datareader ADD MEMBER [appointment-function-app3];
-- ALTER ROLE db_datawriter ADD MEMBER [appointment-function-app3];

-- -- Verify
-- SELECT name, type_desc FROM sys.database_principals WHERE name = 'appointment-function-app3';