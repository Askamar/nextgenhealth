import React, { useState, useEffect } from 'react';
import { getDoctorsAPI, createDoctorAPI, getStatsAPI, getAppointmentsAPI, updateAppointmentStatusAPI, grantDoctorEditPermissionAPI } from '../../services/api';
import { User, Appointment, AppointmentStatus, Role } from '../../types';
import { Card, Button, Badge, PageHeader } from '../../components/Components';
import { Eye } from 'lucide-react';

export const AdminDashboard = () => {
    const [stats, setStats] = useState<any>({ 
        totalDoctors: 0, 
        totalPatients: 0, 
        totalAppointments: 0, 
        vaccineCoveragePercentage: 75, 
        safetyPassRatePercentage: 98, 
        queueSlaFulfillmentPercentage: 85 
    });
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    useEffect(() => {
        getStatsAPI().then(setStats).catch(() => {});
        getAppointmentsAPI('admin', Role.ADMIN).then(data => setAppointments(data.slice(0, 5))).catch(() => {});
    }, []);

    return (
        <div className="container-fluid py-3 d-flex flex-column gap-4 animate-fadeIn">
            <PageHeader title="Admin Dashboard" subtitle="Welcome back, Eleanor! Here's what's happening today." />
            
            {/* Stats Cards */}
            <div className="row g-3">
                 <div className="col-12 col-md-4">
                     <Card>
                         <p className="text-muted small fw-semibold mb-2">Total Patients</p>
                         <h2 className="fw-bold text-dark mb-1">{stats.totalPatients ?? stats.patients}</h2>
                         <p className="mb-0 text-success small fw-semibold">+2.5% this month</p>
                     </Card>
                 </div>
                 <div className="col-12 col-md-4">
                     <Card>
                         <p className="text-muted small fw-semibold mb-2">Total Doctors</p>
                         <h2 className="fw-bold text-dark mb-1">{stats.totalDoctors ?? stats.doctors}</h2>
                         <p className="mb-0 text-success small fw-semibold">+1.2% this month</p>
                     </Card>
                 </div>
                 <div className="col-12 col-md-4">
                     <Card>
                         <p className="text-muted small fw-semibold mb-2">Today's Appointments</p>
                         <h2 className="fw-bold text-dark mb-1">{stats.totalAppointments ?? stats.appointments}</h2>
                         <p className="mb-0 text-success small fw-semibold">Live hospital throughput</p>
                     </Card>
                 </div>
            </div>

            {/* Quality & Safety Analytics Dashboard */}
            <div className="row g-3">
                <div className="col-12 col-md-4">
                    <Card className="h-100">
                        <p className="text-muted small fw-semibold mb-2">Prescription Safety Rating</p>
                        <h2 className="fw-bold text-success mb-2">{stats.safetyPassRatePercentage ?? 98}%</h2>
                        <div className="progress mb-2" style={{ height: '8px' }}>
                            <div className="progress-bar bg-success" style={{ width: `${stats.safetyPassRatePercentage ?? 98}%` }}></div>
                        </div>
                        <p className="mb-0 text-muted small" style={{ fontSize: '0.8rem' }}>
                            Percentage of prescriptions cleared with zero drug interaction warnings.
                        </p>
                    </Card>
                </div>
                <div className="col-12 col-md-4">
                    <Card className="h-100">
                        <p className="text-muted small fw-semibold mb-2">Vaccine Target Coverage</p>
                        <h2 className="fw-bold text-primary mb-2">{stats.vaccineCoveragePercentage ?? 75}%</h2>
                        <div className="progress mb-2" style={{ height: '8px' }}>
                            <div className="progress-bar bg-primary" style={{ width: `${stats.vaccineCoveragePercentage ?? 75}%` }}></div>
                        </div>
                        <p className="mb-0 text-muted small" style={{ fontSize: '0.8rem' }}>
                            Dispensed immunizations relative to target community capacity.
                        </p>
                    </Card>
                </div>
                <div className="col-12 col-md-4">
                    <Card className="h-100">
                        <p className="text-muted small fw-semibold mb-2">Queue SLA Fulfillment</p>
                        <h2 className="fw-bold text-info mb-2">{stats.queueSlaFulfillmentPercentage ?? 85}%</h2>
                        <div className="progress mb-2" style={{ height: '8px' }}>
                            <div className="progress-bar bg-info" style={{ width: `${stats.queueSlaFulfillmentPercentage ?? 85}%` }}></div>
                        </div>
                        <p className="mb-0 text-muted small" style={{ fontSize: '0.8rem' }}>
                            Patients treated within their initial token time window.
                        </p>
                    </Card>
                </div>
            </div>

            <div className="row g-4">
                {/* Visual Chart Placeholder */}
                <div className="col-12 col-lg-8">
                    <Card>
                        <h5 className="fw-bold text-dark mb-4">Patient Registrations</h5>
                        <div className="d-flex align-items-end justify-content-between gap-2" style={{ height: '220px' }}>
                            {[40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 95].map((h, i) => (
                                <div key={i} className="w-100 bg-primary-subtle rounded-top position-relative" style={{ height: '100%', cursor: 'pointer' }}>
                                    <div 
                                      className="position-absolute bottom-0 start-0 w-100 bg-primary rounded-top transition-all" 
                                      style={{ height: `${h}%` }}
                                    ></div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Donut Chart / Department Distribution */}
                <div className="col-12 col-lg-4">
                    <Card>
                        <h5 className="fw-bold text-dark mb-4">Appointments by Dept</h5>
                        <div className="d-flex flex-column gap-3">
                            <div>
                                <div className="d-flex justify-content-between small mb-1">
                                    <span>Cardiology</span>
                                    <span className="fw-bold">45%</span>
                                </div>
                                <div className="progress" style={{ height: '6px' }}>
                                    <div className="progress-bar bg-primary" style={{ width: '45%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="d-flex justify-content-between small mb-1">
                                    <span>Pediatrics</span>
                                    <span className="fw-bold">30%</span>
                                </div>
                                <div className="progress" style={{ height: '6px' }}>
                                    <div className="progress-bar bg-success" style={{ width: '30%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="d-flex justify-content-between small mb-1">
                                    <span>Neurology</span>
                                    <span className="fw-bold">25%</span>
                                </div>
                                <div className="progress" style={{ height: '6px' }}>
                                    <div className="progress-bar bg-warning" style={{ width: '25%' }}></div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Upcoming Appointments Table */}
            <div className="card border shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="card-header border-0 bg-transparent p-3">
                    <h5 className="fw-bold text-dark mb-0">Upcoming Appointments</h5>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 small">
                        <thead className="table-light text-muted">
                            <tr>
                                <th className="p-3 ps-4">Patient</th>
                                <th className="p-3">Doctor</th>
                                <th className="p-3">Time</th>
                                <th className="p-3 pe-4 text-end">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map(apt => (
                                <tr key={apt.id}>
                                    <td className="p-3 ps-4 fw-bold text-dark">{apt.patientName}</td>
                                    <td className="p-3 text-muted">{apt.doctorName}</td>
                                    <td className="p-3 text-muted">{apt.time}</td>
                                    <td className="p-3 pe-4 text-end">
                                        <Badge color={
                                            apt.status === AppointmentStatus.CONFIRMED ? 'green' : 
                                            apt.status === AppointmentStatus.PENDING ? 'yellow' : 'gray'
                                        }>{apt.status}</Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export const ManageDoctors = () => {
    const [doctors, setDoctors] = useState<User[]>([]);
    const [newDocName, setNewDocName] = useState('');
    const [newDocEmail, setNewDocEmail] = useState('');
    const [newDocGender, setNewDocGender] = useState('Male');
    const [newDocPassword, setNewDocPassword] = useState('');
    const [newDocSpec, setNewDocSpec] = useState('General Medicine');

    useEffect(() => {
        getDoctorsAPI().then(setDoctors);
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let avatarUrl = '';
        if (newDocGender === 'Female') {
            avatarUrl = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300';
        } else if (newDocGender === 'Male') {
            avatarUrl = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300';
        } else {
            avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(newDocName)}`;
        }

        try {
            const doc = await createDoctorAPI({
                name: newDocName,
                email: newDocEmail,
                gender: newDocGender,
                password: newDocPassword,
                doctorDetails: {
                    specialization: newDocSpec,
                    qualification: 'MBBS, MD',
                    experience: 5,
                    availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
                },
                avatar: avatarUrl
            });
            
            setDoctors([...doctors, doc]);
            setNewDocName('');
            setNewDocEmail('');
            setNewDocGender('Male');
            setNewDocPassword('');
            setNewDocSpec('General Medicine');
            alert('Doctor added successfully!');
        } catch (err) {
            alert('Failed to add doctor. The email address might already be registered.');
        }
    };

    const handleGrantEdit = async (docId: string, allowed: boolean) => {
        try {
            await grantDoctorEditPermissionAPI(docId, allowed);
            const docs = await getDoctorsAPI();
            setDoctors(docs);
            alert(allowed ? 'Edit permission granted successfully.' : 'Edit request denied / revoked.');
        } catch (err) {
            alert('Failed to update doctor permission.');
        }
    };

    return (
        <div className="container-fluid py-3">
            <PageHeader title="Manage Doctors" subtitle="View and manage medical staff" />
            <div className="row g-4 mt-1">
                <div className="col-12 col-lg-8">
                     <div className="card border shadow-sm rounded-4 overflow-hidden bg-white">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0 small">
                                <thead className="table-light text-muted">
                                    <tr>
                                        <th className="p-3 ps-4">Name</th>
                                        <th className="p-3">Specialization</th>
                                        <th className="p-3">Profile Edit Access</th>
                                        <th className="p-3 pe-4 text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {doctors.map(doc => (
                                        <tr key={doc.id}>
                                            <td className="p-3 ps-4">
                                                <div className="d-flex align-items-center gap-2">
                                                    <img 
                                                      src={doc.avatar || ''} 
                                                      alt="" 
                                                      className="rounded-circle border" 
                                                      style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
                                                    />
                                                    <div>
                                                        <p className="mb-0 fw-bold text-dark">{doc.name}</p>
                                                        <p className="mb-0 text-muted small" style={{ fontSize: '11px' }}>{doc.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3 text-muted">{doc.doctorSpecialization}</td>
                                            <td className="p-3">
                                                {doc.doctorEditRequest ? (
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="badge rounded-pill bg-warning-subtle text-warning border border-warning border-opacity-20 px-2.5 py-1">⏳ Requesting Edit</span>
                                                        <button 
                                                            onClick={() => handleGrantEdit(doc.id, true)} 
                                                            className="btn btn-success py-0.5 px-2 rounded text-white border-0 fw-bold"
                                                            style={{ fontSize: '11px', padding: '2px 8px' }}
                                                        >
                                                            Allow
                                                        </button>
                                                        <button 
                                                            onClick={() => handleGrantEdit(doc.id, false)} 
                                                            className="btn btn-danger py-0.5 px-2 rounded text-white border-0 fw-bold"
                                                            style={{ fontSize: '11px', padding: '2px 8px' }}
                                                        >
                                                            Deny
                                                        </button>
                                                    </div>
                                                ) : doc.doctorEditPermission ? (
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="badge rounded-pill bg-success-subtle text-success border border-success border-opacity-20 px-2.5 py-1">✔ Unlocked</span>
                                                        <button 
                                                            onClick={() => handleGrantEdit(doc.id, false)} 
                                                            className="btn btn-secondary py-0.5 px-2 rounded text-white border-0 fw-bold"
                                                            style={{ fontSize: '11px', padding: '2px 8px' }}
                                                        >
                                                            Lock
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="badge rounded-pill bg-light text-muted border px-2.5 py-1">🔒 Locked</span>
                                                )}
                                            </td>
                                            <td className="p-3 pe-4 text-end">
                                                <button className="btn btn-link text-muted p-1"><Eye size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div className="col-12 col-lg-4">
                    <Card>
                        <h5 className="fw-bold text-dark mb-4">Add New Doctor</h5>
                        <form onSubmit={handleAdd} className="d-flex flex-column gap-3">
                            <div>
                                <label className="form-label small fw-bold text-muted">Full Name</label>
                                <input className="form-control form-control-premium" placeholder="Dr. John Doe" value={newDocName} onChange={e => setNewDocName(e.target.value)} required />
                            </div>
                            <div>
                                <label className="form-label small fw-bold text-muted">Email Address</label>
                                <input type="email" className="form-control form-control-premium" placeholder="john.doe@medicore.com" value={newDocEmail} onChange={e => setNewDocEmail(e.target.value)} required />
                            </div>
                            <div>
                                <label className="form-label small fw-bold text-muted">Gender</label>
                                <select className="form-select form-control-premium" value={newDocGender} onChange={e => setNewDocGender(e.target.value)}>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label small fw-bold text-muted">Temporary Password</label>
                                <input type="text" className="form-control form-control-premium" placeholder="Temp password for login" value={newDocPassword} onChange={e => setNewDocPassword(e.target.value)} required />
                            </div>
                            <div>
                                <label className="form-label small fw-bold text-muted">Specialization</label>
                                <select className="form-select form-control-premium" value={newDocSpec} onChange={e => setNewDocSpec(e.target.value)}>
                                    <option value="Cardiology">Cardiology</option>
                                    <option value="Pediatrics">Pediatrics</option>
                                    <option value="Neurology">Neurology</option>
                                    <option value="Orthopedics">Orthopedics</option>
                                    <option value="Dermatology">Dermatology</option>
                                    <option value="General Medicine">General Medicine</option>
                                </select>
                            </div>
                            <Button type="submit" className="w-100 mt-2 py-2">Add Doctor</Button>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export const AppointmentManagement = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    
    useEffect(() => {
        getAppointmentsAPI('admin', Role.ADMIN).then(setAppointments);
    }, []);

    const handleStatus = async (id: string, status: AppointmentStatus) => {
        await updateAppointmentStatusAPI(id, status);
        setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
    }

    return (
        <div className="container-fluid py-3 d-flex flex-column gap-4">
            <PageHeader title="Appointment Management" subtitle="View, approve, or reject patient appointments." />
            
            <div className="card border shadow-sm rounded-4 overflow-hidden bg-white">
                 <div className="card-header border-0 bg-transparent p-3 d-flex gap-2 overflow-auto">
                     {['All', 'Pending', 'Approved', 'Rejected', 'Completed'].map(filter => (
                         <button key={filter} className="btn btn-sm btn-outline-secondary px-3 rounded-pill">
                             {filter}
                         </button>
                     ))}
                 </div>
                 <div className="table-responsive">
                     <table className="table table-hover align-middle mb-0 small">
                        <thead className="table-light text-muted">
                            <tr>
                                <th className="p-3 ps-4">Patient Name & ID</th>
                                <th className="p-3">Assigned Doctor</th>
                                <th className="p-3">Date & Time</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 pe-4 text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map(apt => (
                                <tr key={apt.id}>
                                    <td className="p-3 ps-4">
                                        <p className="mb-0 fw-bold text-dark">{apt.patientName}</p>
                                        <p className="mb-0 text-muted small" style={{ fontSize: '11px' }}>#{apt.patientId}</p>
                                    </td>
                                    <td className="p-3 text-muted">
                                        {apt.doctorName} <br/> <span className="small text-muted-50" style={{ fontSize: '11px' }}>{apt.department}</span>
                                    </td>
                                    <td className="p-3 text-muted">
                                        {apt.date} - {apt.time}
                                    </td>
                                    <td className="p-3">
                                        <Badge color={
                                            apt.status === AppointmentStatus.CONFIRMED ? 'green' : 
                                            apt.status === AppointmentStatus.PENDING ? 'yellow' : 
                                            apt.status === AppointmentStatus.CANCELLED ? 'red' : 'gray'
                                        }>{apt.status}</Badge>
                                    </td>
                                    <td className="p-3 pe-4 text-end">
                                        {apt.status === AppointmentStatus.PENDING && (
                                            <div className="d-inline-flex gap-2 me-2">
                                                <button onClick={() => handleStatus(apt.id, AppointmentStatus.CONFIRMED)} className="btn btn-sm btn-success py-1.5 px-3">Approve</button>
                                                <button onClick={() => handleStatus(apt.id, AppointmentStatus.CANCELLED)} className="btn btn-sm btn-danger py-1.5 px-3">Reject</button>
                                            </div>
                                        )}
                                        <button className="btn btn-sm btn-link text-muted py-1.5">Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                     </table>
                 </div>
            </div>
        </div>
    );
}
