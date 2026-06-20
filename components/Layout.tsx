import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, X, Home, Users, Calendar, Settings, 
  LogOut, UserCircle, Activity, Stethoscope, Syringe
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, path, active }: any) => (
  <Link 
    to={path} 
    className={`sidebar-link ${active ? 'active' : ''}`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </Link>
);

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Define sidebar links based on role
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
          { icon: Calendar, label: 'Schedule', path: '/doctor/schedule' },
          { icon: UserCircle, label: 'Profile', path: '/doctor/profile' },
        ];
      case Role.PATIENT:
        return [
          { icon: Home, label: 'Dashboard', path: '/patient' },
          { icon: Calendar, label: 'My Appointments', path: '/patient/appointments' },
          { icon: Stethoscope, label: 'Book Appointment', path: '/patient/book' },
          { icon: UserCircle, label: 'Medical Profile', path: '/patient/profile' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex">
      {/* Sidebar for Desktop */}
      <aside 
        className="d-none d-md-flex flex-column border-end bg-white position-fixed h-100" 
        style={{ width: '256px', zIndex: 10 }}
      >
        <div className="p-4 border-bottom d-flex align-items-center gap-2">
          <div 
            className="rounded text-white d-flex align-items-center justify-content-center fw-bold" 
            style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)' }}
          >
            M
          </div>
          <span className="fs-5 fw-bold text-dark">MediCore</span>
        </div>
        <nav className="flex-grow-1 p-3 d-flex flex-column gap-1 overflow-auto">
          {getLinks().map((link) => (
            <SidebarItem 
              key={link.path} 
              {...link} 
              active={location.pathname === link.path} 
            />
          ))}
        </nav>
        <div className="p-3 border-top bg-light">
          <div className="d-flex align-items-center gap-3 p-2 mb-3 bg-white rounded border">
            <div 
              className="rounded-circle text-primary bg-primary-subtle d-flex align-items-center justify-content-center fw-bold" 
              style={{ width: '32px', height: '32px' }}
            >
              {user?.name ? user.name.charAt(0) : ''}
            </div>
            <div className="text-truncate" style={{ flex: 1 }}>
              <p className="mb-0 text-sm fw-bold text-dark text-truncate">{user?.name}</p>
              <p className="mb-0 text-muted small text-capitalize">{user?.role ? user.role.toLowerCase() : ''}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div 
        className="d-md-none position-fixed w-100 bg-white border-bottom px-3 py-2 d-flex justify-content-between align-items-center" 
        style={{ zIndex: 20, height: '56px' }}
      >
        <span className="fw-bold text-dark fs-5">MediCore</span>
        <button className="btn btn-link text-dark p-0" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="d-md-none position-fixed w-100 h-100 bg-white" 
          style={{ zIndex: 15, paddingTop: '56px', left: 0, top: 0 }}
        >
          <nav className="p-4 d-flex flex-column gap-3">
            {getLinks().map((link) => (
              <Link 
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="d-flex align-items-center gap-3 py-2 text-decoration-none text-dark border-bottom"
              >
                <link.icon size={20} className="text-muted" />
                <span>{link.label}</span>
              </Link>
            ))}
            <button onClick={logout} className="btn btn-danger w-100 mt-4">
              Sign Out
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main 
        className="flex-grow-1 p-3 p-md-5 overflow-auto" 
        style={{ marginLeft: '0px' }}
      >
        <div className="d-md-none" style={{ height: '56px' }}></div>
        <div className="d-none d-md-block" style={{ marginLeft: '256px' }}>
          {children}
        </div>
        <div className="d-md-none">
          {children}
        </div>
      </main>
    </div>
  );
};

export const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-vh-100 bg-white d-flex flex-column">
      <header className="sticky-top bg-white border-bottom bg-opacity-75 backdrop-blur">
        <div className="container-lg">
          <div className="d-flex justify-content-between align-items-center" style={{ height: '64px' }}>
            <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
              <div 
                className="rounded text-white d-flex align-items-center justify-content-center fw-bold" 
                style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)' }}
              >
                M
              </div>
              <span 
                className="fs-4 fw-bold" 
                style={{ background: 'linear-gradient(135deg, #0284c7, #0d9488)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                MediCore
              </span>
            </Link>
            <nav className="d-none d-md-flex gap-4">
              <Link to="/" className="text-decoration-none text-secondary fw-semibold hover-primary">Home</Link>
              <Link to="/doctors" className="text-decoration-none text-secondary fw-semibold hover-primary">Doctors</Link>
              <Link to="/facilities" className="text-decoration-none text-secondary fw-semibold hover-primary">Facilities</Link>
            </nav>
            <div className="d-flex align-items-center gap-3">
              <Link to="/login" className="btn btn-premium-primary text-white rounded-pill shadow-sm px-4">
                Login / Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow-1">
        {children}
      </main>
      <footer className="bg-dark text-light py-5 mt-auto">
        <div className="container">
          <div className="row g-4">
            <div className="col-12 col-md-3">
              <h5 className="text-white fw-bold mb-3">MediCore HMS</h5>
              <p className="small text-muted">Excellence in healthcare management and patient services. Providing world-class care since 2010.</p>
            </div>
            <div className="col-6 col-md-3">
              <h6 className="text-white fw-bold mb-3">Services</h6>
              <ul className="list-unstyled small d-flex flex-column gap-2 text-muted">
                <li>Emergency Care</li>
                <li>Heart Institute</li>
                <li>Orthopedic Center</li>
                <li>Neuroscience</li>
              </ul>
            </div>
            <div className="col-6 col-md-3">
              <h6 className="text-white fw-bold mb-3">Contact</h6>
              <ul className="list-unstyled small d-flex flex-column gap-2 text-muted">
                <li>123 Medical Drive</li>
                <li>New York, NY 10001</li>
                <li>+1 (555) 123-4567</li>
                <li>support@medicore.com</li>
              </ul>
            </div>
            <div className="col-12 col-md-3">
              <h6 className="text-white fw-bold mb-3">Legal</h6>
              <ul className="list-unstyled small d-flex flex-column gap-2 text-muted">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};