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
-- CREATE USER [appointment-function-app] FROM EXTERNAL PROVIDER;

-- -- Grant permissions
-- ALTER ROLE db_datareader ADD MEMBER [appointment-function-app];
-- ALTER ROLE db_datawriter ADD MEMBER [appointment-function-app];

-- -- Verify
-- SELECT name, type_desc FROM sys.database_principals WHERE name = 'appointment-function-app';

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



