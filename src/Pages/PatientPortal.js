import React, { useState, useEffect } from "react";
import { Calendar, Home, Users, ClipboardList, BookOpen, Settings, LogOut, UserPlus, Stethoscope, Filter, Search, Bell, Upload, FileText, Clock, MapPin, Phone, Mail, Activity, TrendingUp, ChevronRight, Plus, X, Edit3, Save, AlertCircle } from "lucide-react";
import Navbar from "../Components/Navbar.js";
import apiService from "../Components/Apiservice.js";

function PatientPortalComponent({ onBack }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [doctor, setDoctor] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [medicalRecords, setMedicalRecords] = useState([]);
  
  const [regData, setRegData] = useState({
    username: "", password: "", email: "", phone: "", 
    firstName: "", lastName: "", dateOfBirth: "", address: ""
  });

  const doctors = [
    { id: 1, name: "Dr. Smith", specialty: "Cardiology", experience: "15 years", rating: 4.9 },
    { id: 2, name: "Dr. Johnson", specialty: "Orthopedics", experience: "12 years", rating: 4.8 },
    { id: 3, name: "Dr. Lee", specialty: "Pediatrics", experience: "10 years", rating: 4.9 },
    { id: 4, name: "Dr. Patel", specialty: "Neurology", experience: "18 years", rating: 4.7 }
  ];

  const generateTimeSlots = () => {
    let slots = [];
    for (let hour = 9; hour < 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  useEffect(() => {
    if (isAuthenticated) {
      loadAppointments();
      loadMedicalRecords();
    }
  }, [isAuthenticated, username]);

  const loadAppointments = async () => {
    try {
      const data = await apiService.getAppointments(username, 'patient');
      setAppointments(data);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    }
  };

  const loadMedicalRecords = () => {
    const stored = JSON.parse(window.localStorage?.getItem(`medicalRecords_${username}`)) || [];
    setMedicalRecords(stored);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (username && password) {
      setIsAuthenticated(true);
      setCurrentPage("dashboard");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    // Store user data
    const users = JSON.parse(window.localStorage?.getItem("users")) || [];
    users.push({ ...regData, userType: 'patient' });
    window.localStorage?.setItem("users", JSON.stringify(users));
    
    alert("Registration successful! Please login.");
    setShowRegister(false);
    setRegData({
      username: "", password: "", email: "", phone: "", 
      firstName: "", lastName: "", dateOfBirth: "", address: ""
    });
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    // Check if slot is already booked
    const isSlotTaken = appointments.some(
      appt => appt.doctor === doctor && appt.day === day && appt.time === time
    );
    
    if (isSlotTaken) {
      alert("This time slot is already booked. Please select another time.");
      return;
    }

    try {
      const appointmentData = {
        doctor, day, time, username,
        patientName: username,
        status: 'scheduled',
        createdAt: new Date().toISOString()
      };
      
      await apiService.createAppointment(appointmentData);
      await loadAppointments();
      
      setConfirmation(`Appointment booked with ${doctor} on ${day} at ${time}`);
      setDoctor(""); setDay(""); setTime("");
      
      setTimeout(() => {
        setConfirmation("");
        setCurrentPage("history");
      }, 2000);
    } catch (error) {
      console.error('Booking failed:', error);
      alert("Failed to book appointment. Please try again.");
    }
  };

  const cancelAppointment = async (id) => {
    try {
      await apiService.cancelAppointment(id);
      await loadAppointments();
    } catch (error) {
      console.error('Cancellation failed:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const newRecord = { 
          name: file.name, 
          uploadDate: new Date().toISOString(), 
          size: file.size,
          type: file.type
        };
        const updated = [...medicalRecords, newRecord];
        setMedicalRecords(updated);
        window.localStorage?.setItem(`medicalRecords_${username}`, JSON.stringify(updated));
      } catch (error) {
        console.error('File upload failed:', error);
      }
    }
  };

  const getFilteredAppointments = (type) => {
    const today = new Date();
    let filtered = appointments;

    if (type === 'upcoming') {
      filtered = appointments.filter(a => new Date(`${a.day}T${a.time}`) >= today);
    } else if (type === 'past') {
      filtered = appointments.filter(a => new Date(`${a.day}T${a.time}`) < today);
    }

    if (dateFilter) {
      filtered = filtered.filter(a => a.day === dateFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.day.includes(searchTerm)
      );
    }

    return filtered.sort((a, b) => new Date(`${a.day}T${a.time}`) - new Date(`${b.day}T${b.time}`));
  };

  const isTimeSlotAvailable = (selectedTime) => {
    if (!doctor || !day || !selectedTime) return true;
    return !appointments.some(
      appt => appt.doctor === doctor && appt.day === day && appt.time === selectedTime
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 w-full">
        <div className="absolute top-6 left-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ChevronRight className="rotate-180" size={20} />
            <span>Back to Home</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md backdrop-blur-lg">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="text-blue-600" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Patient Portal</h2>
            <p className="text-gray-600 mt-2">Access your healthcare dashboard</p>
          </div>
          
          {!showRegister ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your username"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg"
              >
                Sign In
              </button>
              
              <div className="text-center">
                <span className="text-gray-600">First time here? </span>
                <button
                  type="button"
                  onClick={() => setShowRegister(true)}
                  className="text-blue-600 hover:text-blue-800 font-semibold underline hover:no-underline transition-all"
                >
                  Create Account
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Create Your Account</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={regData.firstName}
                    onChange={(e) => setRegData({...regData, firstName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={regData.lastName}
                    onChange={(e) => setRegData({...regData, lastName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={regData.username}
                  onChange={(e) => setRegData({...regData, username: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={regData.email}
                  onChange={(e) => setRegData({...regData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={regData.phone}
                  onChange={(e) => setRegData({...regData, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={regData.password}
                  onChange={(e) => setRegData({...regData, password: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-semibold"
              >
                Create Account
              </button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowRegister(false)}
                  className="text-blue-600 hover:text-blue-800 font-semibold underline hover:no-underline transition-all"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  const upcomingAppointments = getFilteredAppointments('upcoming');
  const pastAppointments = getFilteredAppointments('past');
  const todayAppointments = appointments.filter(appt => appt.day === new Date().toISOString().split('T')[0]);

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <Navbar 
        currentPage={currentPage} 
        userType="patient" 
        onPageChange={setCurrentPage}
        onLogout={() => {
          setIsAuthenticated(false);
          setCurrentPage("dashboard");
          setUsername(""); setPassword("");
        }}
        username={username}
      />
      
      <div className="w-full">
        <main className="p-8 max-w-7xl mx-auto w-full">
          {currentPage === "dashboard" && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Welcome back, {username}!</h1>
                  <p className="text-gray-600 mt-1">Here's your healthcare overview</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Today's Date</p>
                  <p className="text-lg font-semibold">{new Date().toISOString().split('T')[0]}</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-blue-600">{todayAppointments.length}</p>
                      <p className="text-gray-600 font-medium">Today Sessions</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-full">
                      <ClipboardList className="text-blue-400" size={24} />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-green-600">{upcomingAppointments.length}</p>
                      <p className="text-gray-600 font-medium">Upcoming</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-full">
                      <Calendar className="text-green-400" size={24} />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-purple-600">{pastAppointments.length}</p>
                      <p className="text-gray-600 font-medium">Completed</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-full">
                      <ClipboardList className="text-purple-400" size={24} />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-orange-600">{medicalRecords.length}</p>
                      <p className="text-gray-600 font-medium">Records</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-full">
                      <FileText className="text-orange-400" size={24} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">Book New Appointment</h3>
                  <p className="mb-4 opacity-90">Schedule your next consultation with a specialist</p>
                  <button
                    onClick={() => setCurrentPage("book")}
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Book Now
                  </button>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">Upload Medical Records</h3>
                  <p className="mb-4 opacity-90">Keep your medical history up to date</p>
                  <label className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors cursor-pointer">
                    Upload Files
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      multiple
                    />
                  </label>
                </div>
              </div>

              {/* Upcoming Sessions Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-800">Your Upcoming Sessions</h3>
                </div>
                <div className="p-6">
                  {upcomingAppointments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Doctor</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Time</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {upcomingAppointments.map((appt) => (
                            <tr key={appt.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-4 px-4 font-medium">{appt.doctor}</td>
                              <td className="py-4 px-4">{appt.day}</td>
                              <td className="py-4 px-4">{appt.time}</td>
                              <td className="py-4 px-4">
                                <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
                                  Scheduled
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="mx-auto mb-4 text-gray-300" size={64} />
                      <p className="text-gray-600 font-medium">No upcoming sessions</p>
                      <p className="text-gray-400">Book your first appointment to get started</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentPage === "book" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Book Appointment</h2>
                <p className="text-gray-600 mt-1">Schedule a consultation with our specialists</p>
              </div>

              {confirmation && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                  {confirmation}
                </div>
              )}

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Booking Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-xl font-bold mb-6">Schedule Appointment</h3>
                  <form onSubmit={handleBooking} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Select Doctor</label>
                      <select
                        value={doctor}
                        onChange={(e) => setDoctor(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Choose a doctor</option>
                        {doctors.map((doc) => (
                          <option key={doc.id} value={doc.name}>
                            {doc.name} - {doc.specialty}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Select Date</label>
                      <input
                        type="date"
                        value={day}
                        onChange={(e) => setDay(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Select Time</label>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setTime(slot)}
                            disabled={!isTimeSlotAvailable(slot)}
                            className={`p-2 text-sm rounded-lg border transition-colors ${
                              time === slot
                                ? 'bg-blue-600 text-white border-blue-600'
                                : isTimeSlotAvailable(slot)
                                ? 'bg-white text-gray-700 border-gray-200 hover:border-blue-400'
                                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!doctor || !day || !time}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
                    >
                      Book Appointment
                    </button>
                  </form>
                </div>

                {/* Doctor Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-xl font-bold mb-6">Available Doctors</h3>
                  <div className="space-y-4">
                    {doctors.map((doc) => (
                      <div
                        key={doc.id}
                        className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                          doctor === doc.name
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setDoctor(doc.name)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-800">{doc.name}</p>
                            <p className="text-blue-600 font-medium">{doc.specialty}</p>
                            <p className="text-sm text-gray-500">{doc.experience} experience</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1">
                              <span className="text-yellow-500">★</span>
                              <span className="font-medium">{doc.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentPage === "history" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">My Appointments</h2>
                  <p className="text-gray-600 mt-1">View and manage your appointments</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Today's Date</p>
                  <p className="text-lg font-semibold">{new Date().toISOString().split('T')[0]}</p>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Date:</label>
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Search:</label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by doctor name..."
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {setDateFilter(''); setSearchTerm('');}}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Filter size={16} />
                      <span>Clear</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Upcoming Appointments */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-green-600">Upcoming Appointments</h3>
                </div>
                <div className="p-6">
                  {upcomingAppointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="mx-auto mb-2 text-gray-300" size={48} />
                      <p>No upcoming appointments</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingAppointments.map((appt) => (
                        <div key={appt.id} className="flex items-center justify-between p-4 border-l-4 border-green-500 bg-green-50 rounded-lg">
                          <div>
                            <p className="font-bold text-gray-800">Dr. {appt.doctor}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <span className="flex items-center space-x-1">
                                <Calendar size={14} />
                                <span>{appt.day}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock size={14} />
                                <span>{appt.time}</span>
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => cancelAppointment(appt.id)}
                            className="bg-red-100 text-red-600 px-3 py-1 rounded-md text-sm hover:bg-red-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Past Appointments */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-blue-600">Past Appointments</h3>
                </div>
                <div className="p-6">
                  {pastAppointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <ClipboardList className="mx-auto mb-2 text-gray-300" size={48} />
                      <p>No past appointments</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pastAppointments.map((appt) => (
                        <div key={appt.id} className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-lg">
                          <p className="font-bold text-gray-800">Dr. {appt.doctor}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center space-x-1">
                              <Calendar size={14} />
                              <span>{appt.day}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock size={14} />
                              <span>{appt.time}</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentPage === "doctors" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">All Doctors</h2>
                <p className="text-gray-600 mt-1">Browse our medical specialists</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doc) => (
                  <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Stethoscope className="text-white" size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{doc.name}</h3>
                      <p className="text-blue-600 font-medium mb-2">{doc.specialty}</p>
                      <p className="text-gray-500 text-sm mb-4">{doc.experience} experience</p>
                      <div className="flex items-center justify-center space-x-1 mb-4">
                        <span className="text-yellow-500">★</span>
                        <span className="font-medium">{doc.rating}</span>
                        <span className="text-gray-500 text-sm">(125 reviews)</span>
                      </div>
                      <button
                        onClick={() => {
                          setDoctor(doc.name);
                          setCurrentPage("book");
                        }}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Book Appointment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentPage === "settings" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Settings</h2>
                <p className="text-gray-600 mt-1">Manage your profile and preferences</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-bold mb-6">Profile Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={username}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value="patient@edoc.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value="+1 (555) 123-4567"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value="1990-01-01"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Update Profile
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-bold mb-6">Notification Preferences</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive appointment reminders via email</p>
                    </div>
                    <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                      <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 transition-transform"></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">SMS Reminders</p>
                      <p className="text-sm text-gray-600">Get text message reminders</p>
                    </div>
                    <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                      <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 transition-transform"></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Push Notifications</p>
                      <p className="text-sm text-gray-600">Browser notifications for appointments</p>
                    </div>
                    <button className="w-12 h-6 bg-gray-200 rounded-full relative">
                      <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 transition-transform"></div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-bold mb-6">Medical Records</h3>
                <div className="space-y-4">
                  {medicalRecords.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="mx-auto mb-2 text-gray-300" size={48} />
                      <p>No medical records uploaded</p>
                    </div>
                  ) : (
                    medicalRecords.map((record, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="text-blue-500" size={24} />
                          <div>
                            <p className="font-medium">{record.name}</p>
                            <p className="text-sm text-gray-500">
                              Uploaded: {new Date(record.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button className="text-red-600 hover:text-red-800">
                          <X size={20} />
                        </button>
                      </div>
                    ))
                  )}
                  <label className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-400 transition-colors">
                    <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                    <span className="text-gray-600">Click to upload medical records</span>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      multiple
                      accept=".pdf,.jpg,.png,.doc,.docx"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default PatientPortalComponent;