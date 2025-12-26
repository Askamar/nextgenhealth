import React, { useState, useEffect } from 'react';
import { getDoctorsAPI, createDoctorAPI, getStatsAPI, getAppointmentsAPI, updateAppointmentStatusAPI } from '../../services/api';
import { User, Appointment, AppointmentStatus, Role } from '../../types';
import { Card, Button, Badge, PageHeader } from '../../components/Components';
import { Eye } from 'lucide-react';

export const AdminDashboard = () => {
    const [stats, setStats] = useState({ doctors: 0, patients: 0, appointments: 0 });
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    useEffect(() => {
        getStatsAPI().then(setStats);
        getAppointmentsAPI('admin', Role.ADMIN).then(data => setAppointments(data.slice(0, 5)));
    }, []);

    return (
        <div className="space-y-8">
            <PageHeader title="Admin Dashboard" subtitle="Welcome back, Eleanor! Here's what's happening today." />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Card className="p-6">
                     <p className="text-slate-500 font-medium mb-2">Total Patients</p>
                     <p className="text-4xl font-bold text-slate-900 mb-2">{stats.patients + 1250}</p>
                     <p className="text-sm text-green-600 font-medium">+2.5% this month</p>
                 </Card>
                 <Card className="p-6">
                     <p className="text-slate-500 font-medium mb-2">Total Doctors</p>
                     <p className="text-4xl font-bold text-slate-900 mb-2">{stats.doctors + 82}</p>
                     <p className="text-sm text-green-600 font-medium">+1.2% this month</p>
                 </Card>
                 <Card className="p-6">
                     <p className="text-slate-500 font-medium mb-2">Today's Appointments</p>
                     <p className="text-4xl font-bold text-slate-900 mb-2">42</p>
                     <p className="text-sm text-red-500 font-medium">-0.5% vs yesterday</p>
                 </Card>
            </div>

            <Card className="overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-lg">Upcoming Appointments</h3>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                            <th className="p-4 pl-6">Patient</th>
                            <th className="p-4">Doctor</th>
                            <th className="p-4">Time</th>
                            <th className="p-4 pr-6 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {appointments.map(apt => (
                            <tr key={apt.id} className="hover:bg-slate-50/50">
                                <td className="p-4 pl-6 font-medium text-slate-900">{apt.patientName}</td>
                                <td className="p-4 text-slate-500">{apt.doctorName}</td>
                                <td className="p-4 text-slate-500">{apt.time}</td>
                                <td className="p-4 pr-6 text-right">
                                    <Badge color={
                                        apt.status === AppointmentStatus.CONFIRMED ? 'green' : 
                                        apt.status === AppointmentStatus.PENDING ? 'yellow' : 'gray'
                                    }>{apt.status}</Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export const ManageDoctors = () => {
    const [doctors, setDoctors] = useState<User[]>([]);
    const [newDocName, setNewDocName] = useState('');
    const [newDocSpec, setNewDocSpec] = useState('');

    useEffect(() => { getDoctorsAPI().then(setDoctors); }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const doc = await createDoctorAPI({
            name: newDocName,
            email: `${newDocName.toLowerCase().replace(' ', '.')}@medi.com`,
            doctorDetails: { specialization: newDocSpec, qualification: 'MBBS', experience: 0, availability: ['Mon', 'Tue'] },
            avatar: `https://ui-avatars.com/api/?name=${newDocName}`
        });
        setDoctors([...doctors, doc]);
        setNewDocName('');
        setNewDocSpec('');
    };

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                 <PageHeader title="Manage Doctors" subtitle="View and manage medical staff" />
                 <Card className="overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 border-b border-gray-100">
                            <tr><th className="p-4">Name</th><th className="p-4">Specialization</th><th className="p-4 text-right">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {doctors.map(doc => (
                                <tr key={doc.id} className="group hover:bg-slate-50/50">
                                    <td className="p-4 flex items-center space-x-3">
                                        <img src={doc.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                        <div><p className="font-bold text-slate-900">{doc.name}</p><p className="text-xs text-slate-500">{doc.email}</p></div>
                                    </td>
                                    <td className="p-4 text-slate-500">{doc.doctorDetails?.specialization}</td>
                                    <td className="p-4 text-right"><button className="text-slate-400 hover:text-primary-600 p-2"><Eye size={18} /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>
            <div className="lg:col-span-1">
                <Card className="p-6 sticky top-8">
                    <h3 className="font-bold text-lg mb-6">Add New Doctor</h3>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div><label className="text-sm font-medium text-slate-700 block mb-1">Full Name</label><input className="w-full p-3 border rounded-xl bg-slate-50" placeholder="e.g. Dr. John Doe" value={newDocName} onChange={e => setNewDocName(e.target.value)} required /></div>
                        <div><label className="text-sm font-medium text-slate-700 block mb-1">Specialization</label><input className="w-full p-3 border rounded-xl bg-slate-50" placeholder="e.g. Cardiologist" value={newDocSpec} onChange={e => setNewDocSpec(e.target.value)} required /></div>
                        <Button type="submit" className="w-full mt-4 bg-teal-500 hover:bg-teal-600 shadow-teal-500/20">Add Doctor</Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export const AppointmentManagement = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    useEffect(() => { getAppointmentsAPI('admin', Role.ADMIN).then(setAppointments); }, []);

    const handleStatus = async (id: string, status: AppointmentStatus) => {
        await updateAppointmentStatusAPI(id, status);
        setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Appointment Management" subtitle="View, approve, or reject patient appointments." />
            <Card className="overflow-hidden">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr><th className="p-4 pl-6">Patient Name & ID</th><th className="p-4">Assigned Doctor</th><th className="p-4">Date & Time</th><th className="p-4">Status</th><th className="p-4 pr-6 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {appointments.map(apt => (
                            <tr key={apt.id} className="hover:bg-slate-50/50">
                                <td className="p-4 pl-6"><p className="font-bold text-slate-900">{apt.patientName}</p><p className="text-xs text-slate-500">#{apt.patientId}</p></td>
                                <td className="p-4 text-slate-600">{apt.doctorName} <br/> <span className="text-xs text-slate-400">{apt.department}</span></td>
                                <td className="p-4 text-slate-600">{apt.date} - {apt.time}</td>
                                <td className="p-4"><Badge color={apt.status === AppointmentStatus.CONFIRMED ? 'green' : apt.status === AppointmentStatus.PENDING ? 'yellow' : apt.status === AppointmentStatus.CANCELLED ? 'red' : 'gray'}>{apt.status}</Badge></td>
                                <td className="p-4 pr-6 text-right space-x-2">
                                    {apt.status === AppointmentStatus.PENDING && (
                                        <><button onClick={() => handleStatus(apt.id, AppointmentStatus.CONFIRMED)} className="text-green-600 hover:bg-green-50 px-3 py-1 rounded font-medium transition-colors">Approve</button><button onClick={() => handleStatus(apt.id, AppointmentStatus.CANCELLED)} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded font-medium transition-colors">Reject</button></>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
            </Card>
        </div>
    );
}