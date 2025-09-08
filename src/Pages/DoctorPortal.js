import React, { useState, useEffect } from "react";
import { Calendar, Home, Users, ClipboardList, Settings, LogOut, Stethoscope, Bell, ChevronRight, Clock, Filter, Search, FileText, Activity, TrendingUp } from "lucide-react";
import Navbar from "../Components/Navbar.js";
import apiService from "../Components/Apiservice.js";

function DoctorPortalComponent({ onBack }) {
  const [appointments, setAppointments] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [email,setEmail]=useState("");
  const [docName,setDocName]=useState("");
  const [license,setLicense]=useState("");
  const [speciality,setSpeciality]=useState("");
  const [docID,setDocId]=useState()

  useEffect(() => {
    if (isAuthenticated) {
      loadAppointments();
    }
  }, [isAuthenticated]);

  const loadAppointments = async () => {
    try {
      const data = await apiService.getAppointments(username, 'doctor');
      setAppointments(data);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    }
  };

  const fetchDocData=async(username)=>{
    const data = await apiService.getDoctortData(username);
    setEmail(data.email);
    setSpeciality(data.specialization);
    setDocName(data.name);
    setDocId(data.doctor_id);
    setLicense(data.license_number);
    console.log(data);
  }

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const result = await apiService.loginDoctor(username, password);
    if (result.success) {
      setIsAuthenticated(true);
      setCurrentPage("dashboard");
      fetchDocData(username);
      // Optionally store user info in state or context
    } else {
      alert("Login failed");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("An error occurred while logging in. Please try again.");
  }
};
  // const handleLogin = (e) => {
  //   e.preventDefault();
  //   if (username && password) {
  //     setIsAuthenticated(true);
  //     setCurrentPage("dashboard");
  //   }
  // };
//   const handleEmailChange = (e) => setEmail(e.target.value);

//   const handleUpdateProfile = async () => {

//   const result = await apiService.updateDoctorData(userId, email);

//   if (result.success) {
//     alert('Profile updated successfully!');
//   } else {
//     alert('Failed to update profile: ' + (result.error || 'Unknown error'));
//   }
// };

  const cancelAppointment = async (id) => {
    try {
      await apiService.cancelAppointment(id);
      await loadAppointments();
    } catch (error) {
      console.error('Cancellation failed:', error);
    }
  };
  const getAppointmentDateTime = (a) => {
  const dayPart = a.day.split('T')[0];         
  const timePart = a.time.split('T')[1].slice(0,5); 
  return new Date(`${dayPart}T${timePart}:00`);
};
const getFilteredAppointments = (type) => 
  { 
    const today = new Date(); 
    // console.log(today)
    let filtered = [...appointments]; 
    // console.log("filtered1",filtered)
    if (type === 'upcoming') {
    filtered = filtered.filter(a => getAppointmentDateTime(a) >= today);
  } else if (type === 'past') {
    filtered = filtered.filter(a => getAppointmentDateTime(a) < today);
  }
    
    if (dateFilter) {
    filtered = filtered.filter(a => a.day.split('T')[0] === dateFilter);
  }
    
    if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(a =>
      (a.doctor_name && a.doctor_name.toLowerCase().includes(term)) ||
      (a.day && a.day.includes(term))
    );
  }
    
    // Sort by datetime
  filtered.sort((a, b) => getAppointmentDateTime(a) - getAppointmentDateTime(b));
  return filtered;
  
  };


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="absolute top-6 left-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ChevronRight className="rotate-180" size={20} />
            <span>Back to Home</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <Stethoscope className="mx-auto text-green-600 mb-3" size={48} />
            <h2 className="text-2xl font-bold text-gray-800">Doctor Portal</h2>
            <p className="text-gray-600 mt-2">Access your medical practice dashboard</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor ID</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your doctor ID"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Login
            </button>
          </form>
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
        userType="doctor" 
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
                  <h1 className="text-3xl font-bold text-gray-800">Doctor Dashboard</h1>
                  <p className="text-gray-600 mt-1">Welcome back, {username}</p>
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
                      <p className="text-gray-600 font-medium">Today's Patients</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-full">
                      <Users className="text-blue-400" size={24} />
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
                      <p className="text-3xl font-bold text-orange-600">{appointments.length}</p>
                      <p className="text-gray-600 font-medium">Total</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-full">
                      <Activity className="text-orange-400" size={24} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's Schedule */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800">Today's Schedule</h3>
                </div>
                <div className="p-6">
                  {todayAppointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="mx-auto mb-2 text-gray-300" size={48} />
                      <p>No appointments scheduled for today</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {todayAppointments.map((appt) => (
                        <div key={appt.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <div>
                            <p className="font-bold text-gray-800">Patient: {appt.patient_name}</p>
                            <p className="text-gray-600">{appt.time.split('T')[1].slice(0,5)}</p>
                          </div>
                          <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                            Scheduled
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Overview */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold mb-4 text-green-600">Next Week Appointments</h3>
                  {upcomingAppointments.slice(0, 3).map((appt) => (
                    <div key={appt.id} className="border-l-4 border-green-500 bg-green-50 p-3 rounded mb-3">
                      <p className="font-medium text-gray-800">Patient: {appt.patient_name}</p>
                      <p className="text-sm text-gray-600">{appt.day.split('T')[0]} at {appt.time.split('T')[1].slice(0,5)}</p>
                    </div>
                  ))}
                  {upcomingAppointments.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold mb-4 text-blue-600">Recent Consultations</h3>
                  {pastAppointments.slice(0, 3).map((appt) => (
                    <div key={appt.id} className="border-l-4 border-blue-500 bg-blue-50 p-3 rounded mb-3">
                      <p className="font-medium text-gray-800">Patient: {appt.patient_name}</p>
                      <p className="text-sm text-gray-600">{appt.day.split('T')[0]} at {appt.time.split('T')[1].slice(0,5)}</p>
                    </div>
                  ))}
                  {pastAppointments.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No recent appointments</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentPage === "appointments" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">My Appointments</h2>
                  <p className="text-gray-600 mt-1">Manage your patient appointments</p>
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
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Search Patient:</label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by patient name..."
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {setDateFilter(''); setSearchTerm('');}}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
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
                  <h3 className="text-xl font-bold text-green-600">Upcoming Appointments (Next 7 Days)</h3>
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
                            <p className="font-bold text-gray-800">Patient: {appt.patient_name}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <span className="flex items-center space-x-1">
                                <Calendar size={14} />
                                <span>{appt.day.split('T')[0]}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock size={14} />
                                <span>{appt.time.split('T')[1].slice(0,5)}</span>
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
                  <h3 className="text-xl font-bold text-blue-600">Recent Appointments (Past 7 Days)</h3>
                </div>
                <div className="p-6">
                  {pastAppointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <ClipboardList className="mx-auto mb-2 text-gray-300" size={48} />
                      <p>No recent appointments</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pastAppointments.map((appt) => (
                        <div key={appt.id} className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-lg">
                          <p className="font-bold text-gray-800">Patient: {appt.patient_name}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center space-x-1">
                              <Calendar size={14} />
                              <span>{appt.day.split('T')[0]}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock size={14} />
                              <span>{appt.time.split('T')[1].slice(0,5)}</span>
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

          {currentPage === "patients" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">My Patients</h2>
                  <p className="text-gray-600 mt-1">View and manage patient information</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800">Patient List</h3>
                </div>
                <div className="p-6">
                  {appointments.length > 0 ? (
                    <div className="space-y-4">
                      {[...new Set(appointments.map(a => a.username))].map((patientName, index) => {
                        const patientAppts = appointments.filter(a => a.username === patientName);
                        const lastVisit = patientAppts
                          .filter(a => new Date(`${a.day}T${a.time}`) < new Date())
                          .sort((a, b) => new Date(`${b.day}T${b.time}`) - new Date(`${a.day}T${a.time}`))[0];
                        
                        return (
                          <div key={index} className="flex items-center justify-between p-6 border rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                {patientName}
                              </div>
                              <div>
                                <p className="font-bold text-gray-800 text-lg">{patientName}</p>
                                <p className="text-gray-600">{patientAppts.length} appointment(s)</p>
                                {lastVisit && (
                                  <p className="text-sm text-gray-500">Last visit: {lastVisit.day}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors font-medium">
                                View History
                              </button>
                              <button className="bg-green-100 text-green-600 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors font-medium">
                                Contact
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Users className="mx-auto mb-4 text-gray-300" size={64} />
                      <p className="font-medium">No patients yet</p>
                      <p className="text-sm">Patients will appear here once they book appointments</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/*{currentPage === "sessions" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">My Sessions</h2>
                  <p className="text-gray-600 mt-1">Manage your consultation sessions</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800">Session Overview</h3>
                </div>
                <div className="p-8 text-center">
                  <ClipboardList className="mx-auto mb-4 text-gray-300" size={64} />
                  <h4 className="text-xl font-bold text-gray-800 mb-2">Session Management</h4>
                  <p className="text-gray-600 mb-6">Advanced session management features will be available here</p>
                  <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                    Create New Session
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-blue-600">Today's Sessions</h3>
                </div>
                <div className="p-6">
                  {todayAppointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="mx-auto mb-2 text-gray-300" size={48} />
                      <p>No sessions scheduled for today</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {todayAppointments.map((appt) => (
                        <div key={appt.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold text-gray-800">{appt.username}</p>
                              <p className="text-gray-600">{appt.time}</p>
                            </div>
                            <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                              Scheduled
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}*/}

          {currentPage === "settings" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Settings</h2>
                <p className="text-gray-600 mt-1">Manage your practice preferences</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-bold mb-6">Profile Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Doctor Name</label>
                    <input
                      type="text"
                      value={docName}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Specialty</label>
                    <input
                      type="text"
                      value={speciality}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">License Number</label>
                    <input
                      type="text"
                      value={license}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                {/* <button className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Update Profile
                </button> */}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-bold mb-6">Practice Settings</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Online Appointments</p>
                      <p className="text-sm text-gray-600">Allow patients to book appointments online</p>
                    </div>
                    <button className="w-12 h-6 bg-green-600 rounded-full relative">
                      <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 transition-transform"></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive notifications about new appointments</p>
                    </div>
                    <button className="w-12 h-6 bg-green-600 rounded-full relative">
                      <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 transition-transform"></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">SMS Reminders</p>
                      <p className="text-sm text-gray-600">Send SMS reminders to patients</p>
                    </div>
                    <button className="w-12 h-6 bg-gray-200 rounded-full relative">
                      <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 transition-transform"></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Auto-confirm Appointments</p>
                      <p className="text-sm text-gray-600">Automatically confirm new appointment requests</p>
                    </div>
                    <button className="w-12 h-6 bg-green-600 rounded-full relative">
                      <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 transition-transform"></div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-bold mb-6">Working Hours</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                    <input
                      type="time"
                      value="09:00"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
                    <input
                      type="time"
                      value="17:00"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <button className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Update Schedule
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default DoctorPortalComponent;