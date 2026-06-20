import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu, X, Home, Users, Calendar,
  LogOut, UserCircle, Activity, Stethoscope, Syringe
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, path, active }: any) => (
  <Link
    to={path}
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-slate-50'
      }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getLinks = () => {
    switch (user?.role) {
      case Role.ADMIN:
        return [
          { icon: Activity, label: 'Dashboard', path: '/admin' },
          { icon: Stethoscope, label: 'Doctors', path: '/admin/doctors' },
          { icon: Users, label: 'Patients', path: '/admin/patients' },
          { icon: Calendar, label: 'Appointments', path: '/admin/appointments' },
          { icon: Syringe, label: 'Vaccinations', path: '/admin/vaccinations' },
        ];
      case Role.DOCTOR:
        return [
          { icon: Activity, label: 'Dashboard', path: '/doctor' },
          { icon: Users, label: 'Queue Management', path: '/doctor/queue' },
          { icon: Calendar, label: 'Schedule', path: '/doctor/schedule' },
          { icon: UserCircle, label: 'Profile', path: '/doctor/profile' },
        ];
      case Role.PATIENT:
        return [
          { icon: Home, label: 'Dashboard', path: '/patient' },
          { icon: Activity, label: 'Live Queue', path: '/patient/queue' },
          { icon: Calendar, label: 'My Appointments', path: '/patient/appointments' },
          { icon: Stethoscope, label: 'Book Appointment', path: '/patient/book' },
          { icon: UserCircle, label: 'Medical Profile', path: '/patient/profile' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-10">
        <div className="p-6 border-b border-gray-100 flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-primary-600 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold">
            M
          </div>
          <span className="text-xl font-bold text-slate-800">MediCore</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {getLinks().map((link) => (
            <SidebarItem
              key={link.path}
              {...link}
              active={location.pathname === link.path}
            />
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role.toLowerCase()}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed w-full bg-white border-b border-gray-200 z-20 px-4 py-3 flex justify-between items-center">
        <span className="text-lg font-bold text-slate-800">MediCore</span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-10 pt-16 px-4">
          <nav className="space-y-4">
            {getLinks().map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 py-3 text-slate-700 border-b border-gray-100"
              >
                <link.icon size={20} />
                <span>{link.label}</span>
              </Link>
            ))}
            <button onClick={logout} className="w-full text-left py-3 text-red-600 font-medium">
              Sign Out
            </button>
          </nav>
        </div>
      )}

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  const getDashboardPath = () => {
    switch (user?.role) {
      case Role.PATIENT: return '/patient';
      case Role.DOCTOR: return '/doctor';
      case Role.ADMIN: return '/admin';
      default: return '/';
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-tr from-primary-600 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold">
                M
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-secondary-600">MediCore</span>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link to="/doctors" className="text-slate-600 hover:text-primary-600 font-medium text-sm lg:text-base">Doctors</Link>
              <Link to="/facilities" className="text-slate-600 hover:text-primary-600 font-medium text-sm lg:text-base">Departments</Link>
              <Link to="/about" className="text-slate-600 hover:text-primary-600 font-medium text-sm lg:text-base">About Us</Link>
              <Link to="/contact" className="text-slate-600 hover:text-primary-600 font-medium text-sm lg:text-base">Contact</Link>
            </nav>
            <div className="flex items-center space-x-4">
              <div className="hidden lg:flex flex-col items-end mr-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Emergency</span>
                <span className="text-red-500 font-bold flex items-center gap-1 animate-pulse">
                  <Activity size={16} /> 108
                </span>
              </div>
              {user ? (
                <Link to={getDashboardPath()} className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2 rounded-full hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30 font-medium">
                  <UserCircle size={20} />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-slate-600 hover:text-primary-600 font-semibold text-sm flex items-center gap-1">
                    <LogOut size={16} className="rotate-180" />
                    Login / Sign Up
                  </Link>
                  <button
                    onClick={() => window.location.href = '/login?redirect=/patient/book'}
                    className="bg-gradient-to-r from-primary-600 to-secondary-500 text-white px-6 py-2.5 rounded-full hover:shadow-lg hover:shadow-primary-500/30 transition-all font-bold text-sm"
                  >
                    Book Appointment
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">MediCore HMS</h3>
            <p className="text-sm text-slate-400">Excellence in healthcare management and patient services. Providing world-class care since 2010.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>Emergency Care</li>
              <li>Heart Institute</li>
              <li>Orthopedic Center</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>123 Medical Drive</li>
              <li>New York, NY 10001</li>
              <li>+1 (555) 123-4567</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};