import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAppointmentsAPI } from '../../services/api';
import { Appointment, AppointmentStatus, User } from '../../types';
import { Card, Button, Badge, PageHeader } from '../../components/Components';
import { Calendar, Clock, User as UserIcon, CheckCircle, XCircle, MoreVertical, Activity, FileText } from 'lucide-react';

export const DoctorDashboard = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    useEffect(() => {
        if (user) {
            getAppointmentsAPI(user.id, user.role).then(data => {
                setAppointments(data);
                if(data.length > 0) setSelectedAppointment(data[0]);
            });
        }
    }, [user]);

    const stats = {
        completed: appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length,
        pending: appointments.filter(a => a.status === AppointmentStatus.PENDING).length,
        today: appointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length || 4, // Mock today count
    };

    return (
        <div className="space-y-8 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex justify-between items-center">
                 <div>
                    <h1 className="text-3xl font-bold text-slate-900">Good Morning, {user?.name.split(' ')[0]}!</h1>
                    <p className="text-slate-500">Here's what your day looks like.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 min-w-[200px]">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg"><CheckCircle size={20} /></div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{stats.completed}</p>
                            <p className="text-xs text-slate-500">Completed</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 min-w-[200px]">
                        <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg"><Clock size={20} /></div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
                            <p className="text-xs text-slate-500">Pending</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden">
                {/* Appointment List */}
                <Card className="col-span-1 flex flex-col h-full">
                    <div className="p-6 border-b border-gray-100 bg-slate-50/50">
                        <h2 className="font-bold text-slate-900">Today's Appointments</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {appointments.map(appt => (
                            <div 
                                key={appt.id} 
                                onClick={() => setSelectedAppointment(appt)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                                    selectedAppointment?.id === appt.id 
                                    ? 'bg-primary-50 border-primary-500 ring-1 ring-primary-500' 
                                    : 'bg-white border-gray-100 hover:border-primary-200'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <img src={appt.patientAvatar || `https://ui-avatars.com/api/?name=${appt.patientName}`} className="w-10 h-10 rounded-full" alt="" />
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-sm">{appt.patientName}</h3>
                                            <span className="text-xs text-slate-500">{appt.type}</span>
                                        </div>
                                    </div>
                                    <span className="font-mono text-sm font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">{appt.time}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                     <span className="text-xs text-slate-500 truncate max-w-[150px]">{appt.notes || 'Routine Checkup'}</span>
                                     <Badge color={appt.status === AppointmentStatus.CONFIRMED ? 'green' : 'yellow'}>{appt.status}</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Patient Details Detail View */}
                <div className="col-span-1 lg:col-span-2 h-full">
                    {selectedAppointment ? (
                        <Card className="h-full flex flex-col">
                             <div className="p-8 border-b border-gray-100 flex justify-between items-start">
                                 <div className="flex gap-6">
                                     <img src={selectedAppointment.patientAvatar} className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 shadow-sm" alt="" />
                                     <div>
                                         <h2 className="text-2xl font-bold text-slate-900 mb-1">{selectedAppointment.patientName}</h2>
                                         <div className="flex gap-4 text-sm text-slate-500 mb-4">
                                             <span>34 yrs, Female</span>
                                             <span>•</span>
                                             <span>ID: #P-{selectedAppointment.patientId.slice(-4)}</span>
                                         </div>
                                         <div className="flex gap-2">
                                             <Button size="sm" variant="secondary">View Full History</Button>
                                             <Button size="sm" variant="secondary">Message</Button>
                                         </div>
                                     </div>
                                 </div>
                                 <div className="text-right">
                                     <div className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold mb-2">
                                         {selectedAppointment.status}
                                     </div>
                                     <p className="text-slate-500 text-sm">{selectedAppointment.date}, {selectedAppointment.time}</p>
                                 </div>
                             </div>

                             <div className="p-8 flex-1 overflow-y-auto">
                                 <div className="grid grid-cols-3 gap-4 mb-8">
                                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                         <p className="text-xs text-slate-500 uppercase font-bold mb-1">Blood Pressure</p>
                                         <p className="text-2xl font-bold text-slate-800">120/80</p>
                                     </div>
                                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                         <p className="text-xs text-slate-500 uppercase font-bold mb-1">Heart Rate</p>
                                         <p className="text-2xl font-bold text-slate-800">72 bpm</p>
                                     </div>
                                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                         <p className="text-xs text-slate-500 uppercase font-bold mb-1">Weight</p>
                                         <p className="text-2xl font-bold text-slate-800">62 kg</p>
                                     </div>
                                 </div>

                                 <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                     <Activity size={18} className="text-primary-500" /> Reason for Visit
                                 </h3>
                                 <p className="text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8 leading-relaxed">
                                     {selectedAppointment.notes || "Patient reports experiencing mild headaches and occasional dizziness over the past two weeks. Symptoms are more pronounced in the morning. No recent injuries or changes in medication. Seeking evaluation and advice."}
                                 </p>

                                 <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                     <FileText size={18} className="text-primary-500" /> Medical History
                                 </h3>
                                 <div className="space-y-3 mb-8">
                                     <div className="flex gap-4 items-start">
                                         <div className="w-2 h-2 rounded-full bg-slate-300 mt-2"></div>
                                         <div>
                                             <span className="font-bold text-slate-700">Allergies:</span> <span className="text-slate-600">Penicillin (mild rash)</span>
                                         </div>
                                     </div>
                                      <div className="flex gap-4 items-start">
                                         <div className="w-2 h-2 rounded-full bg-slate-300 mt-2"></div>
                                         <div>
                                             <span className="font-bold text-slate-700">Current Meds:</span> <span className="text-slate-600">Lisinopril 10mg daily</span>
                                         </div>
                                     </div>
                                 </div>
                             </div>

                             <div className="p-6 border-t border-gray-100 bg-slate-50 flex justify-end gap-4">
                                 <Button className="bg-green-500 hover:bg-green-600 shadow-green-500/20">Confirm Appointment</Button>
                                 <Button className="bg-blue-500 hover:bg-blue-600 shadow-blue-500/20">Mark as Completed</Button>
                                 <Button variant="danger">No-Show</Button>
                             </div>
                        </Card>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400">
                            Select an appointment to view details
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
