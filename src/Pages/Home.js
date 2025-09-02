import React from "react";
import { Calendar, UserPlus, Stethoscope, FileText, Bell, Activity, TrendingUp, Settings, ChevronRight } from "lucide-react";

function HomeComponent({ onNavigate }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 relative overflow-hidden w-full">
      {/* Background Animation */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-75"></div>
        <div className="absolute -bottom-32 left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-150"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-8 w-full">
        <div className="text-center max-w-6xl w-full">
          {/* Header */}
          <div className="mb-16">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 backdrop-blur-lg rounded-full">
                <Stethoscope size={64} className="text-white" />
              </div>
            </div>
            <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
              HealthCare Portal
            </h1>
            <p className="text-xl text-blue-100 mb-4 max-w-2xl mx-auto">
              Welcome!
            </p>
            <div className="flex justify-center space-x-8 text-blue-200 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar size={16} />
                <span>Smart Scheduling</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText size={16} />
                <span>Digital Records</span>
              </div>
              <div className="flex items-center space-x-2">
                <Bell size={16} />
                <span>Smart Reminders</span>
              </div>
            </div>
          </div>

          {/* Portal Cards */}
          <div className="grid md:grid-cols-2 gap-8 mt-12 max-w-4xl mx-auto">
            <div 
              onClick={() => onNavigate('patient')}
              className="group cursor-pointer"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all duration-500 group-hover:scale-105 border border-white/20 flex flex-col justify-between min-h-[360px]">
                <div className="text-blue-200 mb-6 flex justify-center group-hover:text-white transition-colors">
                  <UserPlus size={56} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-4">Patient Portal</h2>
                  <p className="text-blue-100 mb-6 leading-relaxed line-clamp-4">
                    Book appointments with specialists, manage your medical history, and stay connected with your healthcare team
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="bg-blue-500 text-white px-6 py-3 rounded-full font-medium group-hover:bg-blue-400 transition-colors flex items-center space-x-2">
                    <span>Access Portal</span>
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            </div>
            
            <div 
              onClick={() => onNavigate('doctor')}
              className="group cursor-pointer"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all duration-500 group-hover:scale-105 border border-white/20 flex flex-col justify-between min-h-[360px]">
                <div className="text-green-200 mb-6 flex justify-center group-hover:text-white transition-colors">
                  <Stethoscope size={56} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-4">Doctor Portal</h2>
                  <p className="text-blue-100 mb-6 leading-relaxed line-clamp-4">
                    Manage patient appointments, view comprehensive schedules, and access patient records securely
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="bg-green-500 text-white px-6 py-3 rounded-full font-medium group-hover:bg-green-400 transition-colors flex items-center space-x-2">
                    <span>Access Portal</span>
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          {/*<div className="mt-20 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <Activity className="text-white mx-auto mb-4" size={32} />
              <h3 className="text-white font-semibold mb-2">Real-time Updates</h3>
              <p className="text-blue-200 text-sm">Live appointment status and instant notifications</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <TrendingUp className="text-white mx-auto mb-4" size={32} />
              <h3 className="text-white font-semibold mb-2">Analytics Dashboard</h3>
              <p className="text-blue-200 text-sm">Comprehensive health insights and trends</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <Settings className="text-white mx-auto mb-4" size={32} />
              <h3 className="text-white font-semibold mb-2">Cloud Integration</h3>
              <p className="text-blue-200 text-sm">Secure cloud-powered healthcare solutions</p>
            </div>
          </div>*/}
        </div>
      </div>
    </div>
  );
}

export default HomeComponent;