import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role, Vaccine } from '../types';
import { getDoctorsAPI, getVaccinesAPI } from '../services/api';
import { User } from '../types';
import { Card, Button } from '../components/Components';
import { 
  Stethoscope, Calendar, Shield, Clock, Activity, FlaskConical, 
  Ambulance, Bed, HeartPulse, Microscope, Coffee, Check, 
  Phone, MapPin, Mail, Users, Award, Building2, Syringe,
  Star, ChevronRight, AlertCircle, Baby, UserCheck, Heart,
  Brain, Bone, Eye, Zap, Sparkles, TrendingUp
} from 'lucide-react';

// Hospital Information Data
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

// Department data
const DEPARTMENTS = [
  { icon: Heart, name: "Cardiology", desc: "Heart & Cardiovascular Care", color: "from-rose-500 to-pink-500" },
  { icon: Brain, name: "Neurology", desc: "Brain & Nervous System", color: "from-purple-500 to-indigo-500" },
  { icon: Bone, name: "Orthopedics", desc: "Bone & Joint Care", color: "from-amber-500 to-orange-500" },
  { icon: Baby, name: "Pediatrics", desc: "Child Healthcare", color: "from-cyan-500 to-teal-500" },
  { icon: Eye, name: "Ophthalmology", desc: "Eye Care & Surgery", color: "from-blue-500 to-sky-500" },
  { icon: Stethoscope, name: "General Medicine", desc: "Primary Healthcare", color: "from-emerald-500 to-green-500" }
];

// Health Tips
const HEALTH_TIPS = [
  { title: "Stay Hydrated", desc: "Drink at least 8 glasses of water daily", icon: "💧" },
  { title: "Regular Exercise", desc: "30 minutes of physical activity recommended", icon: "🏃" },
  { title: "Balanced Diet", desc: "Include fruits and vegetables in every meal", icon: "🥗" },
  { title: "Quality Sleep", desc: "7-8 hours of sleep for optimal health", icon: "😴" }
];

export const Home = () => {
  const navigate = useNavigate();
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
    <div className="font-sans">
      {/* Emergency Banner */}
      <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="animate-pulse">
              <Ambulance size={24} />
            </div>
            <span className="font-semibold">24/7 Emergency Services Available</span>
          </div>
          <a 
            href="tel:108" 
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-all font-bold"
          >
            <Phone size={18} />
            <span>Call Emergency: 108</span>
          </a>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-[650px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000" 
            alt="Hospital" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/40"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-white w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="animate-fadeIn">
              <span className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-secondary-500/20 text-secondary-300 border border-secondary-500/30 text-sm font-semibold mb-6">
                <Sparkles size={16} />
                Trusted Healthcare Provider
              </span>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                Your Health, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-400 to-cyan-400">Our Priority</span>
              </h1>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-lg">
                Experience compassionate and advanced healthcare with our team of 150+ dedicated professionals. We are here to serve you 24/7.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => navigate('/register')}
                  className="px-8 py-4 bg-gradient-to-r from-secondary-500 to-cyan-500 hover:from-secondary-600 hover:to-cyan-600 text-white rounded-full font-bold shadow-lg shadow-secondary-500/30 transition-all transform hover:-translate-y-1 flex items-center gap-2"
                >
                  <Calendar size={20} />
                  Book an Appointment
                </button>
                <button 
                  onClick={() => navigate('/doctors')}
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-full font-bold transition-all flex items-center gap-2"
                >
                  <Stethoscope size={20} />
                  Find a Doctor
                </button>
              </div>
            </div>

            {/* Right - Hospital Info Card */}
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-tr from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center text-2xl font-bold">
                    M
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{HOSPITAL_INFO.name}</h3>
                    <p className="text-sm text-slate-300">{HOSPITAL_INFO.tagline}</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { icon: Bed, value: HOSPITAL_INFO.stats.beds, label: "Total Beds" },
                    { icon: Users, value: HOSPITAL_INFO.stats.doctors, label: "Specialists" },
                    { icon: UserCheck, value: HOSPITAL_INFO.stats.patients, label: "Patients Treated" },
                    { icon: Award, value: HOSPITAL_INFO.stats.surgeries, label: "Surgeries" }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/10 rounded-xl p-4 text-center hover:bg-white/20 transition-colors">
                      <stat.icon size={24} className="mx-auto mb-2 text-secondary-400" />
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-xs text-slate-300">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Operating Hours */}
                <div className="bg-white/5 rounded-xl p-4 space-y-2">
                  <h4 className="font-semibold text-secondary-300 flex items-center gap-2">
                    <Clock size={16} />
                    Operating Hours
                  </h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">OPD:</span>
                      <span>{HOSPITAL_INFO.operatingHours.opd}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Emergency:</span>
                      <span className="text-green-400 font-semibold">{HOSPITAL_INFO.operatingHours.emergency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pharmacy:</span>
                      <span>{HOSPITAL_INFO.operatingHours.pharmacy}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mt-4 flex flex-wrap gap-3">
                  <a href={`tel:${HOSPITAL_INFO.phone}`} className="flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors">
                    <Phone size={14} />
                    {HOSPITAL_INFO.phone}
                  </a>
                  <a href={`mailto:${HOSPITAL_INFO.email}`} className="flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors">
                    <Mail size={14} />
                    {HOSPITAL_INFO.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Services Card - Overlapping */}
      <section className="max-w-7xl mx-auto px-4 -mt-20 relative z-20">
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Activity, title: "ICU", desc: "24/7 Critical Care", gradient: "from-rose-500 to-pink-500" },
            { icon: FlaskConical, title: "Pharmacy", desc: "All Medications", gradient: "from-emerald-500 to-teal-500" },
            { icon: Microscope, title: "Diagnostics", desc: "Lab & Imaging", gradient: "from-blue-500 to-indigo-500" },
            { icon: Ambulance, title: "Emergency", desc: "Immediate Care", gradient: "from-amber-500 to-orange-500" }
          ].map((feature, idx) => (
            <div 
              key={idx} 
              className="group bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hover:-translate-y-2 transition-all duration-300 cursor-pointer"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                <feature.icon size={26} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{feature.title}</h3>
              <p className="text-sm text-slate-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Visiting Doctors Section */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <span className="text-secondary-600 font-semibold text-sm uppercase tracking-wider">Our Team</span>
              <h2 className="text-4xl font-bold text-slate-900 mt-2">Visiting Specialists Today</h2>
              <p className="text-slate-500 mt-2">Top-tier medical professionals available for you.</p>
            </div>
            <button 
              onClick={() => navigate('/doctors')}
              className="mt-4 md:mt-0 flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors"
            >
              View All Doctors
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.slice(0, 4).map(doc => {
              const isAvailableToday = doc.doctorDetails?.availability.includes(todayDay);
              return (
                <div 
                  key={doc.id} 
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative">
                    <div className="h-32 bg-gradient-to-br from-primary-500 to-secondary-500"></div>
                    <img 
                      src={doc.avatar} 
                      alt={doc.name} 
                      className="w-24 h-24 rounded-full absolute -bottom-12 left-1/2 -translate-x-1/2 object-cover ring-4 ring-white shadow-lg group-hover:scale-105 transition-transform"
                    />
                    {/* Availability Badge */}
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                      isAvailableToday 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${isAvailableToday ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
                      {isAvailableToday ? 'Available' : 'Not Today'}
                    </div>
                  </div>
                  <div className="pt-14 pb-6 px-6 text-center">
                    <h3 className="font-bold text-slate-900 text-lg">{doc.name}</h3>
                    <p className="text-secondary-600 text-sm font-medium mb-3">{doc.doctorDetails?.specialization}</p>
                    
                    <div className="flex items-center justify-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          className={i < Math.floor(doc.doctorDetails?.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
                        />
                      ))}
                      <span className="text-xs text-slate-500 ml-1">{doc.doctorDetails?.rating}</span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-1 mb-4">
                      {doc.doctorDetails?.availability.map(day => (
                        <span 
                          key={day} 
                          className={`text-xs px-2 py-1 rounded ${
                            day === todayDay 
                              ? 'bg-green-100 text-green-700 font-semibold' 
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {day}
                        </span>
                      ))}
                    </div>

                    <div className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{doc.doctorDetails?.experience}</span> years exp • 
                      <span className="font-semibold text-slate-700 ml-1">{doc.doctorDetails?.patients}</span> patients
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Vaccination Calendar Section */}
      <section className="py-20 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-cyan-600 font-semibold text-sm uppercase tracking-wider">
              <Syringe size={16} />
              Immunization Program
            </span>
            <h2 className="text-4xl font-bold text-slate-900 mt-2">Vaccination Calendar</h2>
            <p className="text-slate-500 mt-2 max-w-2xl mx-auto">
              Stay protected with our comprehensive vaccination program. We offer vaccines for all age groups.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {vaccines.slice(0, 4).map((vaccine, idx) => {
              const ageColors = {
                Child: { bg: 'from-pink-500 to-rose-500', light: 'bg-pink-50 text-pink-700' },
                Adult: { bg: 'from-blue-500 to-indigo-500', light: 'bg-blue-50 text-blue-700' },
                Senior: { bg: 'from-amber-500 to-orange-500', light: 'bg-amber-50 text-amber-700' }
              };
              const colorSet = ageColors[vaccine.ageGroup] || ageColors.Adult;
              
              return (
                <div 
                  key={vaccine.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`h-2 bg-gradient-to-r ${colorSet.bg}`}></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${colorSet.bg} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                        <Syringe size={22} />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorSet.light}`}>
                        {vaccine.ageGroup}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">{vaccine.name}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar size={14} />
                        <span>Date: {new Date(vaccine.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Activity size={14} />
                        <span>Type: {vaccine.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${vaccine.stock > 100 ? 'bg-green-500' : vaccine.stock > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                        <span className={`text-sm font-medium ${vaccine.stock > 100 ? 'text-green-600' : vaccine.stock > 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {vaccine.stock} doses available
                        </span>
                      </div>
                    </div>
                    <button className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors text-sm">
                      Book Vaccination
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Vaccination Schedule Info */}
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Calendar className="text-primary-600" />
              Recommended Vaccination Schedule
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Baby className="text-pink-600" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Children (0-12 years)</h4>
                  <p className="text-sm text-slate-500 mt-1">BCG, Hepatitis B, DTaP, MMR, Polio, Varicella</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <UserCheck className="text-blue-600" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Adults (18-60 years)</h4>
                  <p className="text-sm text-slate-500 mt-1">Flu Shot, Hepatitis A/B, Tdap, HPV</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="text-amber-600" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Seniors (60+ years)</h4>
                  <p className="text-sm text-slate-500 mt-1">Pneumococcal, Shingles, Flu Shot, COVID-19</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Specializations</span>
            <h2 className="text-4xl font-bold text-slate-900 mt-2">Our Departments</h2>
            <p className="text-slate-500 mt-2">Comprehensive healthcare across all medical specialties</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DEPARTMENTS.map((dept, idx) => (
              <div 
                key={idx}
                className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${dept.color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`}></div>
                <div className={`w-14 h-14 bg-gradient-to-br ${dept.color} text-white rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <dept.icon size={26} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{dept.name}</h3>
                <p className="text-slate-500">{dept.desc}</p>
                <div className="mt-4 flex items-center text-primary-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ChevronRight size={16} className="ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Health Tips Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-white mb-10">
            <h2 className="text-3xl font-bold">Daily Health Tips</h2>
            <p className="text-white/80 mt-2">Simple habits for a healthier life</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {HEALTH_TIPS.map((tip, idx) => (
              <div 
                key={idx}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white border border-white/20 hover:bg-white/20 transition-colors"
              >
                <div className="text-4xl mb-4">{tip.icon}</div>
                <h3 className="font-bold text-lg mb-2">{tip.title}</h3>
                <p className="text-white/80 text-sm">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hospital Location & Contact */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Get in Touch</span>
              <h2 className="text-4xl font-bold text-slate-900 mt-2 mb-6">Visit Our Hospital</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Address</h4>
                    <p className="text-slate-500">{HOSPITAL_INFO.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-secondary-100 text-secondary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Phone</h4>
                    <p className="text-slate-500">{HOSPITAL_INFO.phone}</p>
                    <p className="text-red-500 font-semibold">Emergency: {HOSPITAL_INFO.emergency}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Email</h4>
                    <p className="text-slate-500">{HOSPITAL_INFO.email}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <button 
                  onClick={() => navigate('/register')}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/30 transition-all"
                >
                  Book Appointment
                </button>
                <a 
                  href={`tel:${HOSPITAL_INFO.phone}`}
                  className="px-6 py-3 bg-white border border-slate-200 hover:border-primary-300 text-slate-700 rounded-xl font-semibold transition-all flex items-center gap-2"
                >
                  <Phone size={18} />
                  Call Us Now
                </a>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <img 
                  src="https://images.unsplash.com/photo-1548438294-1ad5d5f4f063?auto=format&fit=crop&q=80&w=800" 
                  alt="Hospital Building" 
                  className="w-full h-80 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900/90 to-transparent">
                  <div className="flex items-center gap-3 text-white">
                    <Building2 size={24} />
                    <div>
                      <h4 className="font-bold">{HOSPITAL_INFO.name}</h4>
                      <p className="text-sm text-white/80">Main Campus</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Keep legacy DoctorsPreview for compatibility
const DoctorsPreview = () => null;

export const Doctors = () => {
    const [doctors, setDoctors] = useState<User[]>([]);

    useEffect(() => {
        getDoctorsAPI().then(setDoctors);
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-slate-900 mb-4">Meet Our Specialists</h2>
                <p className="text-slate-500">World-class care from experienced professionals.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {doctors.map(doc => (
                    <Card key={doc.id} className="hover:shadow-lg transition-all duration-300 group">
                        <div className="p-6 flex flex-col items-center text-center">
                            <div className="relative mb-6">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary-50">
                                    <img src={doc.avatar || `https://ui-avatars.com/api/?name=${doc.name}`} alt={doc.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-1">{doc.name}</h3>
                            <p className="text-primary-600 font-medium mb-4">{doc.doctorDetails?.specialization}</p>
                            
                            <div className="w-full space-y-3 mb-6">
                                <div className="flex justify-between text-sm text-slate-500 border-b border-gray-50 pb-2">
                                    <span>Experience</span>
                                    <span className="font-semibold text-slate-700">{doc.doctorDetails?.experience} Years</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-500 border-b border-gray-50 pb-2">
                                    <span>Qualification</span>
                                    <span className="font-semibold text-slate-700">{doc.doctorDetails?.qualification}</span>
                                </div>
                            </div>

                            <Button className="w-full">Book Appointment</Button>
                        </div>
                    </Card>
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
        <div className="font-sans">
             {/* Hero */}
            <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1587351021759-3e566b9af922?auto=format&fit=crop&q=80&w=2000" 
                        alt="Hospital Facilities" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/60"></div>
                </div>
                <div className="relative z-10 text-center text-white px-4">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">World-Class Facilities</h1>
                    <p className="text-xl text-slate-200 max-w-2xl mx-auto">Combining advanced medical technology with a healing environment.</p>
                </div>
            </section>

            {/* Main Grid */}
            <section className="max-w-7xl mx-auto px-4 py-20">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {facilities.map((f, i) => (
                        <Card key={i} className="hover:shadow-lg transition-all duration-300 group p-6 border-t-4 border-t-transparent hover:border-t-secondary-500">
                            <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <f.icon size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                            <p className="text-slate-500 leading-relaxed text-sm">{f.desc}</p>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Feature Block */}
            <section className="bg-slate-50 py-20">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
                     <div className="flex-1">
                        <img 
                            src="https://images.unsplash.com/photo-1516549655169-df83a0926006?auto=format&fit=crop&q=80&w=1000" 
                            alt="Advanced Technology" 
                            className="rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-500"
                        />
                     </div>
                     <div className="flex-1 space-y-6">
                        <span className="text-secondary-600 font-bold uppercase tracking-wider text-sm">Technology & Innovation</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Advanced Medical Technology</h2>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            We continuously invest in the latest medical technology to ensure our patients receive the best possible care. From robotic surgery systems to advanced imaging, we are at the forefront of medical innovation.
                        </p>
                        <ul className="space-y-4 pt-4">
                            {['Robotic Surgical System', '3 Tesla MRI', 'PET-CT Scan', 'Advanced Cath Lab', 'Telemedicine Services'].map(item => (
                                <li key={item} className="flex items-center gap-3 text-slate-700 font-medium">
                                    <div className="w-6 h-6 rounded-full bg-secondary-100 text-secondary-600 flex items-center justify-center">
                                        <Check size={14} strokeWidth={3} />
                                    </div> 
                                    {item}
                                </li>
                            ))}
                        </ul>
                     </div>
                </div>
            </section>
        </div>
    );
};

export const Login = () => {
  const [role, setRole] = useState<Role | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    await login(email, role);
    if(role === Role.ADMIN) navigate('/admin');
    else if(role === Role.DOCTOR) navigate('/doctor');
    else navigate('/patient');
  };

  const selectRole = (r: Role, defaultEmail: string) => {
      setRole(r);
      setEmail(defaultEmail);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="p-8 text-center bg-white">
            <div className="w-16 h-16 bg-gradient-to-tr from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg shadow-primary-500/30">
                +
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
            <p className="text-slate-500 mt-2">Secure Portal Login</p>
        </div>

        {!role ? (
             <div className="p-8 space-y-4 bg-slate-50/50 flex-1">
                 <p className="text-center text-sm font-medium text-slate-500 mb-2">Please select your role to continue</p>
                 <button onClick={() => selectRole(Role.PATIENT, 'maria@gmail.com')} className="w-full group relative flex items-center p-4 bg-white border-2 border-transparent hover:border-secondary-400 hover:shadow-md rounded-xl transition-all">
                    <div className="w-12 h-12 bg-secondary-100 text-secondary-600 rounded-full flex items-center justify-center font-bold text-xl mr-4 group-hover:scale-110 transition-transform">P</div>
                    <div className="text-left">
                        <h3 className="font-bold text-slate-800">Login as Patient</h3>
                        <p className="text-xs text-slate-500">Access medical records & appointments</p>
                    </div>
                 </button>
                 <button onClick={() => selectRole(Role.DOCTOR, 'john.smith@medicore.com')} className="w-full group relative flex items-center p-4 bg-white border-2 border-transparent hover:border-primary-400 hover:shadow-md rounded-xl transition-all">
                    <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-xl mr-4 group-hover:scale-110 transition-transform">D</div>
                    <div className="text-left">
                        <h3 className="font-bold text-slate-800">Login as Doctor</h3>
                        <p className="text-xs text-slate-500">Manage schedule & patients</p>
                    </div>
                 </button>
                 <button onClick={() => selectRole(Role.ADMIN, 'admin@medicore.com')} className="w-full group relative flex items-center p-4 bg-white border-2 border-transparent hover:border-slate-400 hover:shadow-md rounded-xl transition-all">
                    <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold text-xl mr-4 group-hover:scale-110 transition-transform">A</div>
                    <div className="text-left">
                        <h3 className="font-bold text-slate-800">Login as Admin</h3>
                        <p className="text-xs text-slate-500">System administration</p>
                    </div>
                 </button>
             </div>
        ) : (
            <div className="p-8 pt-0 animate-fadeIn">
                <button onClick={() => setRole(null)} className="text-sm text-slate-400 hover:text-slate-600 mb-6 flex items-center">← Back to role selection</button>
                <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Username or Email</label>
                    <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none bg-slate-50 focus:bg-white"
                    placeholder="name@example.com"
                    required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                    <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none bg-slate-50 focus:bg-white"
                    placeholder="••••••••"
                    />
                </div>
                
                <Button 
                    type="submit" 
                    className={`w-full py-4 text-lg rounded-xl ${
                        role === Role.PATIENT ? 'bg-secondary-500 hover:bg-secondary-600 shadow-secondary-500/30' :
                        role === Role.DOCTOR ? 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/30' :
                        'bg-slate-800 hover:bg-slate-900 shadow-slate-500/30'
                    }`}
                >
                    Login as {role.charAt(0) + role.slice(1).toLowerCase()}
                </Button>
                </form>
                <p className="text-center mt-6 text-sm text-slate-400">
                    <a href="#" className="hover:text-primary-600 underline">Forgot Password?</a>
                </p>
            </div>
        )}
      </div>
    </div>
  );
};