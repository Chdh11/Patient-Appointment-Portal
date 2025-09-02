import React from "react";
import { Calendar, Home, Users, ClipboardList, BookOpen, Settings, Bell, LogOut, Stethoscope } from "lucide-react";

function Navbar({ currentPage, userType, onPageChange, onLogout, username }) {
  const getNavItems = () => {
    if (userType === 'patient') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'book', label: 'Book Appointment', icon: Calendar },
        { id: 'history', label: 'My Appointments', icon: BookOpen },
        { id: 'doctors', label: 'All Doctors', icon: Users },
        { id: 'settings', label: 'Settings', icon: Settings }
      ];
    } else if (userType === 'doctor') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'appointments', label: 'My Appointments', icon: Calendar },
        { id: 'patients', label: 'My Patients', icon: Users },
        // { id: 'sessions', label: 'My Sessions', icon: ClipboardList },
        { id: 'settings', label: 'Settings', icon: Settings }
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  if (!userType) return null;

  return (
    <nav className="bg-white shadow-sm border-b px-6 py-4 w-full">
      <div className="flex items-center justify-between max-w-full">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <Stethoscope className="text-blue-600" size={24} />
            <span className="text-xl font-bold text-gray-800">HealthCare Portal</span>
          </div>
          <div className="hidden md:flex space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors cursor-pointer ${
                    isActive 
                      ? 'text-blue-600 bg-blue-50 font-medium' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Bell className="text-gray-400 cursor-pointer hover:text-gray-600" size={20} />
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-medium">
                {userType === 'patient' ? username?.charAt(0)?.toUpperCase() : 'D'}
              </span>
            </div>
            <span className="text-gray-700 font-medium">
              {userType === 'patient' ? username : `Dr. ${username}`}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="text-red-600 hover:text-red-800 transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;