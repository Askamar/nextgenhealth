import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAppointmentsAPI, getDoctorsAPI, createAppointmentAPI, DEPARTMENTS, getMedicalReportsAPI, getNotificationsAPI } from '../../services/api';
import { Appointment, User, AppointmentStatus, MedicalReport, Notification } from '../../types';
import { Card, Button, Badge, PageHeader } from '../../components/Components';
import { Calendar, Clock, MapPin, ChevronRight, Bell, FileText, Syringe, Download, CheckCircle, Search, Filter } from 'lucide-react';

export const PatientDashboard = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [recentDoctors, setRecentDoctors] = useState<User[]>([]);

    useEffect(() => {
        if (user) {
            getAppointmentsAPI(user.id, user.role).then(setAppointments);
            getNotificationsAPI(user.id).then(setNotifications);
            getDoctorsAPI().then(docs => setRecentDoctors(docs.slice(0, 3))); // Mock recent
        }
    }, [user]);

    const upcoming = appointments.find(a => a.status === AppointmentStatus.PENDING || a.status === AppointmentStatus.CONFIRMED);

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name.split(' ')[0]}!</h1>
                    <p className="text-slate-500">Here is your health summary.</p>
                </div>
                <div className="relative p-2 bg-white rounded-full shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                    <Bell size={24} className="text-slate-600" />
                    <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Upcoming Appointment Card */}
                    <Card className="p-0 border-none shadow-lg bg-gradient-to-r from-secondary-500 to-teal-600 text-white overflow-hidden relative">
                        <div className="absolute right-0 bottom-0 opacity-10">
                            <Calendar size={200} />
                        </div>
                        <div className="p-8 relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-secondary-100 text-sm font-semibold uppercase tracking-wider mb-1">Upcoming Appointment</h3>
                                    {upcoming ? (
                                        <>
                                            <h2 className="text-2xl font-bold mb-2">{upcoming.doctorName}</h2>
                                            <p className="text-white/90">{upcoming.department} • {upcoming.type}</p>
                                        </>
                                    ) : (
                                        <h2 className="text-2xl font-bold">No upcoming appointments</h2>
                                    )}
                                </div>
                                <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl text-center min-w-[80px]">
                                    {upcoming ? (
                                        <>
                                            <div className="text-xs uppercase opacity-80 mb-1">{new Date(upcoming.date).toLocaleString('default', { month: 'short' })}</div>
                                            <div className="text-3xl font-bold">{new Date(upcoming.date).getDate()}</div>
                                        </>
                                    ) : (
                                        <Calendar size={32} className="mx-auto" />
                                    )}
                                </div>
                            </div>
                            {upcoming && (
                                <div className="flex items-center gap-6 text-sm font-medium">
                                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                                        <Clock size={16} /> {upcoming.time}
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                                        <MapPin size={16} /> Room 304
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Recently Visited Doctors */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-900 text-lg">Recently Visited Doctors</h3>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            {recentDoctors.map(doc => (
                                <div key={doc.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center">
                                    <img src={doc.avatar} className="w-16 h-16 rounded-full mx-auto mb-3 object-cover" alt="" />
                                    <h4 className="font-bold text-slate-800 text-sm truncate">{doc.name}</h4>
                                    <p className="text-xs text-slate-500 mb-3">{doc.doctorDetails?.specialization}</p>
                                    <button className="text-xs font-semibold text-secondary-600 hover:text-secondary-700 bg-secondary-50 py-1.5 px-4 rounded-full w-full">Book Again</button>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* CTA Banner */}
                    <div className="bg-primary-600 rounded-2xl p-8 text-white flex justify-between items-center shadow-lg shadow-primary-500/20">
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Need a doctor?</h3>
                            <p className="text-primary-100 max-w-sm">Book an appointment online with top specialists.</p>
                        </div>
                        <Button className="bg-white text-primary-700 hover:bg-primary-50 px-8 py-3 h-auto" onClick={() => window.location.href = '#/patient/book'}>
                            Book Now
                        </Button>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {/* Notifications */}
                    <Card className="p-6">
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-900">Notifications</h3>
                            <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{notifications.filter(n => !n.read).length} New</span>
                        </div>
                        <div className="space-y-4">
                            {notifications.map(not => (
                                <div key={not.id} className="flex gap-3 items-start pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${
                                        not.type === 'result' ? 'bg-green-100 text-green-600' :
                                        not.type === 'reminder' ? 'bg-yellow-100 text-yellow-600' :
                                        'bg-blue-100 text-blue-600'
                                    }`}>
                                        {not.type === 'result' ? <FileText size={14} /> : not.type === 'reminder' ? <Clock size={14} /> : <Bell size={14} />}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-800 leading-tight">{not.title}</h4>
                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{not.message}</p>
                                        <span className="text-[10px] text-slate-400 font-medium">{not.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Vaccination */}
                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                                <Syringe size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Vaccination Reminders</h3>
                                <p className="text-xs text-slate-500">Upcoming schedules</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white p-2 rounded border border-gray-100">
                                        <Syringe size={16} className="text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">Annual Flu Shot</p>
                                        <p className="text-xs text-orange-500 font-medium">Due: Nov 15, 2024</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg opacity-60">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white p-2 rounded border border-gray-100">
                                        <CheckCircle size={16} className="text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">Tetanus Booster</p>
                                        <p className="text-xs text-slate-500">Completed</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export const BookAppointment = () => {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [department, setDepartment] = useState('');
    const [doctors, setDoctors] = useState<User[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<User | null>(null);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    useEffect(() => {
        getDoctorsAPI().then(setDoctors);
    }, []);

    const filteredDoctors = department ? doctors.filter(d => d.doctorDetails?.specialization === department) : [];

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Book an Appointment</h1>
                <p className="text-slate-500">Follow the steps below to book your appointment.</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-12">
                 <div className="flex justify-between text-sm font-medium text-slate-500 mb-2">
                     <span className={step >= 1 ? 'text-secondary-600' : ''}>Department</span>
                     <span className={step >= 2 ? 'text-secondary-600' : ''}>Doctor</span>
                     <span className={step >= 3 ? 'text-secondary-600' : ''}>Schedule</span>
                 </div>
                 <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-secondary-500 transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
                 </div>
            </div>

            {/* Steps Content */}
            <div className="animate-fadeIn">
                {step === 1 && (
                    <div className="space-y-6">
                        <Card className="p-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Choose a Department</h2>
                            <p className="text-slate-500 mb-6">Choose a medical department to get started.</p>
                            <div className="relative">
                                <select 
                                    className="w-full p-4 border border-gray-200 rounded-xl appearance-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-secondary-500 outline-none transition-all text-lg"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                >
                                    <option value="">Select Department</option>
                                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-500">
                                    <ChevronRight className="rotate-90" />
                                </div>
                            </div>
                            <div className="flex justify-end mt-8">
                                <Button disabled={!department} onClick={() => setStep(2)} className="px-8">Next Step</Button>
                            </div>
                        </Card>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8">
                        <div>
                             <h2 className="text-2xl font-bold text-slate-900 mb-4">Choose Your Doctor</h2>
                             <p className="text-slate-500 mb-6">Select a doctor from the {department} department.</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            {filteredDoctors.map(doc => (
                                <div 
                                    key={doc.id}
                                    onClick={() => setSelectedDoctor(doc)}
                                    className={`relative bg-white p-6 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-lg flex items-start gap-4 ${
                                        selectedDoctor?.id === doc.id ? 'border-secondary-500 ring-4 ring-secondary-500/10' : 'border-gray-100 hover:border-secondary-200'
                                    }`}
                                >
                                    <img src={doc.avatar} className="w-20 h-20 rounded-full object-cover border-4 border-slate-50" alt="" />
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg">{doc.name}</h3>
                                        <p className="text-secondary-600 font-medium mb-1">{doc.doctorDetails?.specialization}</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                                            <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-md font-bold">4.9 ★</span>
                                            <span>15+ years exp</span>
                                        </div>
                                    </div>
                                    {selectedDoctor?.id === doc.id && (
                                        <div className="absolute top-4 right-4 bg-secondary-500 text-white rounded-full p-1">
                                            <CheckCircle size={16} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                         <div className="flex justify-between mt-8">
                            <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                            <Button disabled={!selectedDoctor} onClick={() => setStep(3)}>Next Step</Button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-8">
                         <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <h3 className="font-bold text-lg mb-4">Select Date</h3>
                                <input type="date" className="w-full p-3 border rounded-lg mb-4" onChange={(e) => setDate(e.target.value)} />
                                <h3 className="font-bold text-lg mb-4">Select Time</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'].map(t => (
                                        <button 
                                            key={t}
                                            onClick={() => setTime(t)}
                                            className={`py-2 px-1 text-sm rounded-lg border ${time === t ? 'bg-secondary-500 text-white border-secondary-500' : 'border-gray-200 hover:border-secondary-300'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 p-6 rounded-2xl border border-gray-200">
                                <h3 className="font-bold text-lg mb-6">Appointment Summary</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <img src={selectedDoctor?.avatar} className="w-12 h-12 rounded-full" alt="" />
                                        <div>
                                            <p className="font-bold text-slate-900">{selectedDoctor?.name}</p>
                                            <p className="text-sm text-slate-500">{selectedDoctor?.doctorDetails.specialization}</p>
                                        </div>
                                    </div>
                                    <div className="h-px bg-gray-200 my-4"></div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Date</span>
                                        <span className="font-semibold text-slate-800">{date}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Time</span>
                                        <span className="font-semibold text-slate-800">{time}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Department</span>
                                        <span className="font-semibold text-slate-800">{department}</span>
                                    </div>
                                </div>
                                <Button className="w-full mt-8" onClick={() => {
                                    if(selectedDoctor && user) {
                                        createAppointmentAPI({
                                            patientId: user.id,
                                            patientName: user.name,
                                            doctorId: selectedDoctor.id,
                                            doctorName: selectedDoctor.name,
                                            department: department,
                                            date: date,
                                            time: time,
                                        }).then(() => window.location.href = '#/patient');
                                    }
                                }}>Confirm Appointment</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export const MedicalReports = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState<MedicalReport[]>([]);

    useEffect(() => {
        if(user) getMedicalReportsAPI(user.id).then(setReports);
    }, [user]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">My Medical Reports</h1>
                    <p className="text-slate-500 mt-1">Securely view, manage, and upload your health records.</p>
                </div>
                <Button className="bg-secondary-500 hover:bg-secondary-600 text-white">
                    <Download size={18} /> Upload New Report
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input type="text" placeholder="Search reports by name or doctor..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-secondary-500 outline-none" />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {['All Reports', 'Lab Results', 'Scans', 'Prescriptions'].map((filter, i) => (
                        <button key={i} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${i === 0 ? 'bg-secondary-100 text-secondary-700' : 'bg-white border border-gray-200 text-slate-600 hover:bg-gray-50'}`}>
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Reports Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map(report => (
                    <div key={report.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-lg transition-all">
                        <div className="h-48 overflow-hidden relative bg-slate-100">
                             {report.imageUrl ? (
                                <img src={report.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <FileText size={48} />
                                </div>
                             )}
                             <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 uppercase tracking-wide">
                                 {report.type}
                             </div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-1">{report.title}</h3>
                            <p className="text-sm text-slate-500 mb-4">{report.date} • {report.doctorName}</p>
                            <Button variant="secondary" className="w-full bg-secondary-50 text-secondary-700 hover:bg-secondary-100 border-none">
                                <Download size={16} /> Download
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
