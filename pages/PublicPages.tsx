import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { getDoctorsAPI } from '../services/api';
import { User } from '../types';
import { Card, Button } from '../components/Components';
import { Stethoscope, Calendar, Shield, Clock, Activity, FlaskConical, Ambulance, Bed, HeartPulse, Microscope, Coffee, Check } from 'lucide-react';

export const Home = () => {
    const navigate = useNavigate();

  return (
    <div className="space-y-20 pb-24 font-sans">
      {/* Hero */}
      <section className="relative h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
             <img 
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000" 
                alt="Hospital" 
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-white w-full">
            <div className="max-w-2xl animate-fadeIn">
                <span className="inline-block py-1 px-3 rounded-full bg-secondary-500/20 text-secondary-300 border border-secondary-500/30 text-sm font-semibold mb-6">
                    Trusted Healthcare Provider
                </span>
                <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                    Your Health, <br/>
                    <span className="text-secondary-400">Our Priority</span>
                </h1>
                <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                    Experience compassionate and advanced healthcare with our team of dedicated professionals. We are here to serve you 24/7.
                </p>
                <div className="flex gap-4">
                    <button 
                        onClick={() => navigate('/register')}
                        className="px-8 py-4 bg-secondary-500 hover:bg-secondary-600 text-white rounded-full font-bold shadow-lg shadow-secondary-500/30 transition-all transform hover:-translate-y-1"
                    >
                        Book an Appointment
                    </button>
                    <button 
                        onClick={() => navigate('/doctors')}
                        className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-full font-bold transition-all"
                    >
                        Find a Doctor
                    </button>
                </div>
            </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="max-w-7xl mx-auto px-4 -mt-24 relative z-20">
        <h2 className="text-2xl font-bold text-white mb-6">Our World-Class Facilities</h2>
        <div className="grid md:grid-cols-4 gap-6">
            {[
                { icon: Activity, title: "ICU", desc: "Intensive Care Unit for critical patient monitoring." },
                { icon: FlaskConical, title: "Pharmacy", desc: "Fully stocked pharmacy with all necessary medications." },
                { icon: Stethoscope, title: "Diagnostics", desc: "Advanced diagnostic imaging and testing services." },
                { icon: Ambulance, title: "24/7 Emergency", desc: "Immediate medical attention for urgent situations." }
            ].map((feature, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hover:-translate-y-1 transition-transform">
                    <div className="w-12 h-12 bg-primary-50 text-secondary-600 rounded-xl flex items-center justify-center mb-4">
                        <feature.icon size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
            ))}
        </div>
      </section>

      {/* Specialists */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
             <h2 className="text-3xl font-bold text-slate-900 mb-4">Meet Our Visiting Specialists</h2>
             <p className="text-slate-500">Top-tier medical professionals from around the globe.</p>
        </div>
        <DoctorsPreview />
      </section>
    </div>
  );
};

const DoctorsPreview = () => {
    const [doctors, setDoctors] = useState<User[]>([]);

    useEffect(() => {
        getDoctorsAPI().then(docs => setDoctors(docs.slice(0, 4)));
    }, []);

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {doctors.map(doc => (
                <div key={doc.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6 text-center">
                        <img 
                            src={doc.avatar} 
                            alt={doc.name} 
                            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover ring-4 ring-primary-50"
                        />
                        <h3 className="font-bold text-slate-900">{doc.name}</h3>
                        <p className="text-secondary-600 text-sm font-medium mb-2">{doc.doctorDetails?.specialization}</p>
                        <p className="text-xs text-slate-500">Available: {doc.doctorDetails?.availability.join(', ')}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

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