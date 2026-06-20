import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role, Vaccine } from '../types';
import { getDoctorsAPI, getVaccinesAPI } from '../services/api';
import { User } from '../types';
import { Card, Button } from '../components/Components';
import {
  Stethoscope, Calendar, Clock, Activity, FlaskConical,
  Ambulance, Bed, HeartPulse, Microscope, Coffee, Check,
  Phone, Mail, Users, Award, Building2, Syringe,
  Star, ChevronRight, UserCheck, Heart,
  Brain, Bone, Eye, Sparkles
} from 'lucide-react';

const HOSPITAL_INFO = {
  name: "MediCore Hospital",
  tagline: "Excellence in Healthcare Since 2010",
  address: "123 Medical Drive, New York, NY 10001",
  phone: "+1 (555) 123-4567",
  emergency: "108",
  email: "info@medicore.com",
  stats: {
    beds: 500,
    doctors: 150,
    patients: "50K+",
    surgeries: "10K+"
  },
  operatingHours: {
    opd: "8:00 AM - 8:00 PM",
    emergency: "24/7",
    pharmacy: "6:00 AM - 11:00 PM"
  }
};

const DEPARTMENTS = [
  { icon: Heart, name: "Cardiology", desc: "Heart & Cardiovascular Care", color: "text-danger" },
  { icon: Brain, name: "Neurology", desc: "Brain & Nervous System", color: "text-primary" },
  { icon: Bone, name: "Orthopedics", desc: "Bone & Joint Care", color: "text-warning" },
  { icon: Users, name: "Pediatrics", desc: "Child Healthcare", color: "text-info" },
  { icon: Eye, name: "Ophthalmology", desc: "Eye Care & Surgery", color: "text-success" },
  { icon: Stethoscope, name: "General Medicine", desc: "Primary Healthcare", color: "text-secondary" }
];

const HEALTH_TIPS = [
  { title: "Stay Hydrated", desc: "Drink at least 8 glasses of water daily", icon: "💧" },
  { title: "Regular Exercise", desc: "30 minutes of physical activity recommended", icon: "🏃" },
  { title: "Balanced Diet", desc: "Include fruits and vegetables in every meal", icon: "🥗" },
  { title: "Quality Sleep", desc: "7-8 hours of sleep for optimal health", icon: "😴" }
];

export const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<User[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    getDoctorsAPI().then(setDoctors);
    getVaccinesAPI().then(setVaccines);

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayDay = currentTime.toLocaleDateString('en-US', { weekday: 'short' });

  return (
    <div>
      {/* Emergency Banner */}
      <div className="bg-danger text-white py-2">
        <div className="container d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <Ambulance size={20} />
            <span className="fw-semibold">24/7 Emergency Services Available</span>
          </div>
          <a
            href="tel:108"
            className="btn btn-sm btn-light fw-bold rounded-pill px-3 py-1 text-danger"
          >
            <Phone size={14} className="me-1" />
            Call Emergency: 108
          </a>
        </div>
      </div>

      {/* Hero Section */}
      <section 
        className="position-relative d-flex align-items-center overflow-hidden" 
        style={{ height: '600px' }}
      >
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 0 }}>
          <img
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000"
            alt="Hospital"
            className="w-100 h-100"
            style={{ objectFit: 'cover' }}
          />
          <div 
            className="position-absolute top-0 start-0 w-100 h-100" 
            style={{ background: 'linear-gradient(to right, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.4))' }}
          ></div>
        </div>

        <div className="container position-relative text-white" style={{ zIndex: 1 }}>
          <div className="row align-items-center g-5">
            {/* Left Content */}
            <div className="col-12 col-lg-6">
              <span className="badge rounded-pill bg-info bg-opacity-25 text-info border border-info border-opacity-50 mb-3 px-3 py-2">
                <Sparkles size={14} className="me-1" />
                Trusted Healthcare Provider
              </span>
              <h1 className="display-4 fw-bold mb-4">
                Your Health, <br />
                <span className="text-gradient-rainbow">Our Priority</span>
              </h1>
              <p className="lead text-light opacity-75 mb-4 max-w-lg">
                Experience compassionate and advanced healthcare with our team of 150+ dedicated professionals. We are here to serve you 24/7.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/login?role=PATIENT&redirect=/patient/book')}
                  className="btn btn-premium-primary rounded-pill px-4 py-3 fw-bold d-flex align-items-center gap-2"
                >
                  <Calendar size={18} />
                  Book an Appointment
                </button>
                <button
                  onClick={() => navigate('/doctors')}
                  className="btn btn-outline-light rounded-pill px-4 py-3 fw-bold d-flex align-items-center gap-2"
                >
                  <Stethoscope size={18} />
                  Find a Doctor
                </button>
              </div>
            </div>

            {/* Right - Hospital Info Card */}
            <div className="col-12 col-lg-6 d-none d-lg-block">
              <div className="card bg-white bg-opacity-10 border border-light border-opacity-25 rounded-4 p-4 shadow-lg text-white">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div 
                    className="rounded text-white d-flex align-items-center justify-content-center fw-bold" 
                    style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)', fontSize: '20px' }}
                  >
                    M
                  </div>
                  <div>
                    <h3 className="mb-0 fs-5 fw-bold">{HOSPITAL_INFO.name}</h3>
                    <p className="mb-0 small text-light opacity-75">{HOSPITAL_INFO.tagline}</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="row g-3 mb-4">
                  {[
                    { icon: Bed, value: HOSPITAL_INFO.stats.beds, label: "Total Beds" },
                    { icon: Users, value: HOSPITAL_INFO.stats.doctors, label: "Specialists" },
                    { icon: UserCheck, value: HOSPITAL_INFO.stats.patients, label: "Patients Treated" },
                    { icon: Award, value: HOSPITAL_INFO.stats.surgeries, label: "Surgeries" }
                  ].map((stat, i) => (
                    <div key={i} className="col-6">
                      <div className="bg-white bg-opacity-10 rounded p-3 text-center hover-scale">
                        <stat.icon size={20} className="mb-2 text-info" />
                        <div className="fs-4 fw-bold">{stat.value}</div>
                        <div className="small text-light opacity-75" style={{ fontSize: '11px' }}>{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Operating Hours */}
                <div className="bg-white bg-opacity-5 rounded p-3 mb-3">
                  <h6 className="text-info fw-bold mb-2 d-flex align-items-center gap-2">
                    <Clock size={14} />
                    Operating Hours
                  </h6>
                  <div className="small d-flex flex-column gap-1">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">OPD:</span>
                      <span>{HOSPITAL_INFO.operatingHours.opd}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Emergency:</span>
                      <span className="text-success fw-bold">{HOSPITAL_INFO.operatingHours.emergency}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Pharmacy:</span>
                      <span>{HOSPITAL_INFO.operatingHours.pharmacy}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Services Section */}
      <section className="container position-relative" style={{ marginTop: '-80px', zIndex: 10 }}>
        <div className="row g-4">
          {[
            { icon: Activity, title: "ICU", desc: "24/7 Critical Care", bg: "bg-danger" },
            { icon: FlaskConical, title: "Pharmacy", desc: "All Medications", bg: "bg-success" },
            { icon: Microscope, title: "Diagnostics", desc: "Lab & Imaging", bg: "bg-primary" },
            { icon: Ambulance, title: "Emergency", desc: "Immediate Care", bg: "bg-warning" }
          ].map((feature, idx) => (
            <div key={idx} className="col-12 col-md-3">
              <div className="card border-0 shadow-lg rounded-4 p-4 hover-scale bg-white h-100">
                <div className={`rounded-3 text-white d-flex align-items-center justify-content-center mb-3 ${feature.bg}`} style={{ width: '48px', height: '48px' }}>
                  <feature.icon size={22} />
                </div>
                <h5 className="fw-bold text-dark mb-1">{feature.title}</h5>
                <p className="small text-muted mb-0">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Visiting Doctors Section */}
      <section className="py-5 mt-5 bg-light">
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-end mb-4">
            <div>
              <span className="text-primary fw-bold text-uppercase small">Our Team</span>
              <h2 className="fw-bold text-dark mt-1 mb-0">Visiting Specialists Today</h2>
            </div>
            <button
              onClick={() => navigate('/doctors')}
              className="btn btn-link text-primary fw-bold p-0 d-flex align-items-center gap-1 mt-2 mt-md-0"
            >
              View All Doctors
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="row g-4">
            {doctors.slice(0, 4).map(doc => {
              const isAvailableToday = doc.doctorAvailability?.includes(todayDay);
              return (
                <div key={doc.id} className="col-12 col-sm-6 col-lg-3">
                  <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden bg-white hover-scale">
                    <div className="position-relative" style={{ height: '100px', background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)' }}>
                      {/* Availability Badge */}
                      <span className={`position-absolute top-2 right-2 badge rounded-pill px-2.5 py-1 text-xs fw-semibold ${isAvailableToday ? 'bg-success text-white' : 'bg-secondary text-white'}`}>
                        {isAvailableToday ? 'Available' : 'Not Today'}
                      </span>
                    </div>
                    <div className="text-center px-3 pb-4" style={{ marginTop: '-48px' }}>
                      <img
                        src={doc.avatar || ''}
                        alt={doc.name}
                        className="rounded-circle border border-4 border-white mb-3"
                        style={{ width: '96px', height: '96px', objectFit: 'cover' }}
                      />
                      <h5 className="fw-bold text-dark mb-0">{doc.name}</h5>
                      <p className="text-muted small mb-2">{doc.doctorSpecialization}</p>

                      <div className="d-flex justify-content-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < Math.floor(doc.doctorRating || 0) ? 'text-warning fill-warning' : 'text-black-50'}
                          />
                        ))}
                      </div>

                      <div className="small text-muted mb-3">
                        <span className="fw-bold text-dark">{doc.doctorExperience}</span> years exp • <span className="fw-bold text-dark">{doc.doctorPatients}</span> patients
                      </div>
                      <button
                        onClick={() => {
                          if (user && user.role === Role.PATIENT) {
                            navigate(`/patient/book?doctorId=${doc.id}`);
                          } else {
                            navigate(`/login?role=PATIENT&redirect=${encodeURIComponent(`/patient/book?doctorId=${doc.id}`)}`);
                          }
                        }}
                        className="btn btn-sm btn-premium-primary rounded-pill w-100 fw-bold d-flex align-items-center justify-content-center gap-1.5 py-2 hover-scale"
                      >
                        <Calendar size={14} />
                        Book Consult
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Immunization Calendar Section */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <span className="text-primary fw-bold text-uppercase small d-flex align-items-center justify-content-center gap-1">
              <Syringe size={16} />
              Immunization Program
            </span>
            <h2 className="fw-bold text-dark mt-1">Vaccination Calendar</h2>
          </div>

          <div className="row g-4">
            {vaccines.slice(0, 4).map((vaccine) => (
              <div key={vaccine.id} className="col-12 col-md-3">
                <div className="card h-100 border border-light-subtle rounded-4 p-4 shadow-sm hover-scale bg-white">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="rounded bg-primary-subtle text-primary p-2">
                      <Syringe size={20} />
                    </div>
                    <span className="badge bg-secondary-subtle text-secondary">{vaccine.ageGroup}</span>
                  </div>
                  <h5 className="fw-bold text-dark mb-3">{vaccine.name}</h5>
                  <div className="small text-muted d-flex flex-column gap-2">
                    <div>Type: {vaccine.type}</div>
                    <div>Stock: {vaccine.stock} doses</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <span className="text-primary fw-bold text-uppercase small">Specializations</span>
            <h2 className="fw-bold text-dark mt-1">Our Departments</h2>
          </div>

          <div className="row g-4">
            {DEPARTMENTS.map((dept, idx) => (
              <div key={idx} className="col-12 col-md-4">
                <div className="card h-100 border-0 shadow-sm rounded-4 p-4 bg-white hover-scale">
                  <div className={`rounded mb-3 p-3 d-inline-block ${dept.color} bg-opacity-10`} style={{ width: '48px', height: '48px' }}>
                    <dept.icon size={22} className={dept.color} />
                  </div>
                  <h5 className="fw-bold text-dark mb-2">{dept.name}</h5>
                  <p className="small text-muted mb-0">{dept.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export const Doctors = () => {
  const [doctors, setDoctors] = useState<User[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getDoctorsAPI().then(setDoctors);
  }, []);

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h2 className="fw-bold text-dark">Meet Our Specialists</h2>
        <p className="text-muted">World-class care from experienced professionals.</p>
      </div>
      <div className="row g-4">
        {doctors.map(doc => (
          <div key={doc.id} className="col-12 col-md-4">
            <Card className="hover-scale">
              <div className="text-center p-3">
                <img
                  src={doc.avatar || ''}
                  alt={doc.name}
                  className="rounded-circle border border-4 border-primary-subtle mb-3"
                  style={{ width: '96px', height: '96px', objectFit: 'cover' }}
                />
                <h5 className="fw-bold text-dark mb-1">{doc.name}</h5>
                <p className="text-primary fw-semibold mb-3 small">{doc.doctorSpecialization}</p>

                <div className="border-top pt-3 text-start small text-muted d-flex flex-column gap-2 mb-3">
                  <div className="d-flex justify-content-between border-bottom pb-2">
                    <span>Experience</span>
                    <span className="fw-bold text-dark">{doc.doctorExperience} Years</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Qualification</span>
                    <span className="fw-bold text-dark">{doc.doctorQualification}</span>
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    if (user && user.role === Role.PATIENT) {
                      navigate(`/patient/book?doctorId=${doc.id}`);
                    } else {
                      navigate(`/login?role=PATIENT&redirect=${encodeURIComponent(`/patient/book?doctorId=${doc.id}`)}`);
                    }
                  }}
                  className="w-100 rounded-pill"
                >
                  Book Appointment
                </Button>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Facilities = () => {
  const facilities = [
    { icon: Ambulance, title: "24/7 Emergency", desc: "Immediate medical attention for critical conditions with state-of-the-art life support systems." },
    { icon: Activity, title: "ICU & CCU", desc: "Intensive Care Units equipped with advanced monitoring technology for critically ill patients." },
    { icon: FlaskConical, title: "Modern Laboratory", desc: "Fully automated pathology and diagnostic lab services available round the clock." },
    { icon: Stethoscope, title: "Operation Theatres", desc: "Modular operation theatres with HEPA filters and modern surgical equipment." },
    { icon: Bed, title: "Inpatient Wards", desc: "Comfortable private and semi-private rooms ensuring patient privacy and recovery." },
    { icon: HeartPulse, title: "Cardiac Center", desc: "Dedicated heart care center with Cath Lab and non-invasive diagnostics." },
    { icon: Microscope, title: "Radiology", desc: "Digital X-ray, CT Scan, MRI, and Ultrasound services for precise diagnosis." },
    { icon: Coffee, title: "Cafeteria", desc: "Hygienic and nutritious food services for patients and visitors." },
  ];

  return (
    <div>
      <section className="bg-dark text-white py-5 text-center position-relative">
        <div className="container">
          <h1 className="display-5 fw-bold mb-3">World-Class Facilities</h1>
          <p className="lead text-light opacity-75 max-w-2xl mx-auto">Combining advanced medical technology with a healing environment.</p>
        </div>
      </section>

      <div className="container py-5">
        <div className="row g-4">
          {facilities.map((f, i) => (
            <div key={i} className="col-12 col-md-3">
              <Card className="hover-scale h-100">
                <div className="rounded bg-primary-subtle text-primary p-2 d-inline-block mb-3">
                  <f.icon size={24} />
                </div>
                <h5 className="fw-bold text-dark mb-2">{f.title}</h5>
                <p className="small text-muted mb-0">{f.desc}</p>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const roleParam = params.get('role');
  const isRoleLocked = roleParam === 'PATIENT';

  const [role, setRole] = useState<Role | null>(
    roleParam === 'PATIENT' ? Role.PATIENT : null
  );
  const [email, setEmail] = useState(
    roleParam === 'PATIENT' ? 'maria@gmail.com' : ''
  );
  const [password, setPassword] = useState(
    roleParam === 'PATIENT' ? 'password123' : ''
  );
  
  const { login } = useAuth();

  useEffect(() => {
    if (roleParam === 'PATIENT') {
      setRole(Role.PATIENT);
      setEmail('maria@gmail.com');
      setPassword('password123');
    } else if (!roleParam) {
      setRole(null);
      setEmail('');
      setPassword('');
    }
  }, [roleParam]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    await login(email, password, role);

    const redirect = params.get('redirect');

    if (redirect) {
      navigate(redirect);
    } else {
      if (role === Role.ADMIN) navigate('/admin');
      else if (role === Role.DOCTOR) navigate('/doctor');
      else navigate('/patient');
    }
  };

  const selectRole = (r: Role, defaultEmail: string, defaultPassword: string = 'password123') => {
    setRole(r);
    setEmail(defaultEmail);
    setPassword(defaultPassword);
  }

  return (
    <div className="login-mesh-bg py-5">
      <div className="glass-login-card border-0 shadow-lg overflow-hidden">
        <div className="card-body p-4 p-md-5 text-center">
          <div 
            className="rounded-circle text-white d-flex align-items-center justify-content-center mx-auto mb-4" 
            style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)', fontSize: '26px', fontWeight: 'bold', boxShadow: '0 8px 16px rgba(14, 165, 233, 0.2)' }}
          >
            +
          </div>
          <h3 className="fw-bold text-dark mb-1">MediCore Portal</h3>
          <p className="text-muted small mb-4">
            {isRoleLocked ? 'Sign in to your Patient portal' : 'Select your portal role below to sign in'}
          </p>

          {!role ? (
            <div className="d-flex flex-column gap-3">
              {/* Only show Doctor and Admin roles in generic role selector */}
              <button 
                onClick={() => selectRole(Role.DOCTOR, 'john.smith@medicore.com')} 
                className="role-quick-card doctor-card"
              >
                <span className="badge p-3 rounded-circle fs-5 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', color: '#0ea5e9', background: 'rgba(14, 165, 233, 0.1)' }}>D</span>
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: '15px' }}>Doctor Portal</div>
                  <div className="small text-muted" style={{ fontSize: '11.5px', marginTop: '2px' }}>Consult patients, write Rx & view schedule</div>
                </div>
              </button>
              <button 
                onClick={() => selectRole(Role.ADMIN, 'admin@medicore.com')} 
                className="role-quick-card admin-card"
              >
                <span className="badge p-3 rounded-circle fs-5 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', color: '#64748b', background: 'rgba(100, 116, 139, 0.1)' }}>A</span>
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: '15px' }}>Admin Dashboard</div>
                  <div className="small text-muted" style={{ fontSize: '11.5px', marginTop: '2px' }}>Manage clinic staff, vaccines & view metrics SLA</div>
                </div>
              </button>
            </div>
          ) : (
            <div className="text-start">
              {!isRoleLocked && (
                <button onClick={() => setRole(null)} className="btn btn-link text-muted small p-0 mb-4 text-decoration-none d-flex align-items-center gap-1">
                  &larr; Choose a different portal
                </button>
              )}
              <div className="mb-4 p-3 rounded-3 bg-light border border-light-subtle d-flex align-items-center gap-3">
                <div 
                  className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold" 
                  style={{ 
                    width: '36px', 
                    height: '36px', 
                    background: role === Role.PATIENT ? '#14b8a6' : role === Role.DOCTOR ? '#0ea5e9' : '#64748b',
                    fontSize: '14px'
                  }}
                >
                  {role.charAt(0)}
                </div>
                <div>
                  <div className="small text-muted" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Signing in as</div>
                  <div className="fw-bold text-dark small">{role.charAt(0) + role.slice(1).toLowerCase()}</div>
                </div>
              </div>
              <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
                <div>
                  <label className="form-label small fw-bold text-muted">Username or Email</label>
                  <input
                     type="email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="form-control form-control-premium py-2.5"
                     placeholder="name@example.com"
                     required
                  />
                </div>
                <div>
                  <label className="form-label small fw-bold text-muted">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control form-control-premium py-2.5"
                    placeholder="••••••••"
                  />
                </div>
                <Button type="submit" className="w-100 py-3 mt-3 rounded-pill btn-premium-primary">
                  Enter {role.charAt(0) + role.slice(1).toLowerCase()} Portal
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};