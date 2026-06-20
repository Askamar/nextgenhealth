import React, { useState, useEffect } from 'react';
import { getPatientsAPI, createPatientAPI, updatePatientAPI, deletePatientAPI, getAppointmentsAPI } from '../../services/api';
import { User, Role, Appointment } from '../../types';
import { Card, Button, Badge, PageHeader } from '../../components/Components';
import { Search, Plus, Edit2, Trash2, Eye, X, User as UserIcon, Calendar, Activity, FileText, ChevronLeft, Clock } from 'lucide-react';

export const ManagePatients = () => {
    const [view, setView] = useState<'list' | 'details'>('list');
    const [patients, setPatients] = useState<User[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<User | null>(null);
    const [patientHistory, setPatientHistory] = useState<Appointment[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        gender: 'Male',
        dob: '',
        bloodGroup: '',
        allergies: '',
        weight: '',
        height: ''
    });

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        const data = await getPatientsAPI();
        setPatients(data);
    };

    const handleOpenDetails = async (patient: User) => {
        setSelectedPatient(patient);
        const history = await getAppointmentsAPI(patient.id, Role.ADMIN);
        // Filter appointments for this patient only
        setPatientHistory(history.filter(a => a.patientId === patient.id));
        setView('details');
    };

    const handleCloseDetails = () => {
        setSelectedPatient(null);
        setPatientHistory([]);
        setView('list');
    };

    const handleOpenModal = (patient?: User) => {
        if (patient) {
            setEditingId(patient.id);
            setFormData({
                name: patient.name,
                email: patient.email,
                gender: patient.patientDetails?.gender || 'Male',
                dob: patient.patientDetails?.dob || '',
                bloodGroup: patient.patientDetails?.bloodGroup || '',
                allergies: patient.patientDetails?.allergies || '',
                weight: patient.patientDetails?.weight || '',
                height: patient.patientDetails?.height || ''
            });
        } else {
            setEditingId(null);
            setFormData({
                name: '', email: '', gender: 'Male', dob: '', bloodGroup: '', allergies: '', weight: '', height: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const patientData = {
            name: formData.name,
            email: formData.email,
            patientDetails: {
                gender: formData.gender as any,
                dob: formData.dob,
                bloodGroup: formData.bloodGroup,
                allergies: formData.allergies,
                weight: formData.weight,
                height: formData.height,
                lastVisit: new Date().toISOString().split('T')[0]
            }
        };

        if (editingId) {
            await updatePatientAPI(editingId, patientData);
        } else {
            await createPatientAPI(patientData);
        }
        setIsModalOpen(false);
        loadPatients();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this patient record?')) {
            await deletePatientAPI(id);
            loadPatients();
        }
    };

    const filteredPatients = patients.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (view === 'details' && selectedPatient) {
        return (
            <div className="container-fluid py-3 d-flex flex-column gap-4">
                <div>
                    <Button variant="ghost" onClick={handleCloseDetails} className="ps-0 hover-slide-right">
                        <ChevronLeft size={20} /> Back to Patient List
                    </Button>
                </div>

                <div className="row g-4">
                    {/* Patient Profile Card */}
                    <div className="col-12 col-md-4">
                        <Card className="h-fit">
                            <div className="text-center mb-4">
                                <img 
                                    src={selectedPatient.avatar} 
                                    alt={selectedPatient.name} 
                                    className="rounded-circle mx-auto mb-3 border border-4 border-light shadow-sm" 
                                    style={{ width: '128px', height: '128px', objectFit: 'cover' }}
                                />
                                <h3 className="fw-bold text-dark mb-1">{selectedPatient.name}</h3>
                                <p className="text-muted small">{selectedPatient.email}</p>
                            </div>
                            
                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex justify-content-between border-bottom pb-2">
                                    <span className="text-muted">Gender</span>
                                    <span className="fw-semibold text-dark">{selectedPatient.patientDetails?.gender}</span>
                                </div>
                                <div className="d-flex justify-content-between border-bottom pb-2">
                                    <span className="text-muted">Age/DOB</span>
                                    <span className="fw-semibold text-dark">{selectedPatient.patientDetails?.dob || 'N/A'}</span>
                                </div>
                                <div className="d-flex justify-content-between border-bottom pb-2">
                                    <span className="text-muted">Blood Group</span>
                                    <span className="fw-semibold text-dark">{selectedPatient.patientDetails?.bloodGroup || 'N/A'}</span>
                                </div>
                                <div className="d-flex justify-content-between border-bottom pb-2">
                                    <span className="text-muted">Allergies</span>
                                    <span className="fw-semibold text-danger">{selectedPatient.patientDetails?.allergies || 'None'}</span>
                                </div>
                                <div className="d-flex justify-content-between pt-2">
                                    <div className="text-center w-50 border-end">
                                        <p className="text-uppercase text-muted small mb-1" style={{ fontSize: '0.75rem' }}>Weight</p>
                                        <p className="fw-bold text-dark mb-0">{selectedPatient.patientDetails?.weight || '--'}</p>
                                    </div>
                                    <div className="text-center w-50">
                                        <p className="text-uppercase text-muted small mb-1" style={{ fontSize: '0.75rem' }}>Height</p>
                                        <p className="fw-bold text-dark mb-0">{selectedPatient.patientDetails?.height || '--'}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Medical History */}
                    <div className="col-12 col-md-8">
                        <Card className="h-100">
                            <h4 className="fw-bold mb-4 d-flex align-items-center gap-2 text-dark">
                                <Activity size={20} className="text-info" /> Medical History
                            </h4>
                            {patientHistory.length === 0 ? (
                                <p className="text-muted text-center py-5 mb-0">No appointment history found.</p>
                            ) : (
                                <div className="d-flex flex-column gap-3">
                                    {patientHistory.map(appt => (
                                        <div key={appt.id} className="border rounded-3 p-3 bg-light hover-scale">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div>
                                                    <p className="fw-bold text-dark mb-0">{appt.department}</p>
                                                    <p className="text-muted small mb-0">Dr. {appt.doctorName}</p>
                                                </div>
                                                <Badge color={appt.status === 'COMPLETED' ? 'green' : appt.status === 'CONFIRMED' ? 'blue' : 'gray'}>
                                                    {appt.status}
                                                </Badge>
                                            </div>
                                            <div className="d-flex gap-3 text-muted mb-2 small" style={{ fontSize: '0.8rem' }}>
                                                <span className="d-flex align-items-center gap-1"><Calendar size={12} /> {appt.date}</span>
                                                <span className="d-flex align-items-center gap-1"><Clock size={12} /> {appt.time}</span>
                                            </div>
                                            {appt.notes && (
                                                <div className="bg-white p-3 border rounded text-muted small">
                                                    <span className="fw-semibold text-dark">Notes: </span>
                                                    {appt.notes}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-3 d-flex flex-column gap-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <div>
                    <h1 className="fw-bold text-dark mb-1">Manage Patients</h1>
                    <p className="text-muted mb-0">View, add, edit, and delete patient records.</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus size={18} /> Add New Patient
                </Button>
            </div>

            <Card className="p-3">
                 <div className="position-relative w-100">
                     <Search className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" size={18} />
                     <input 
                        type="text" 
                        placeholder="Search patients by name or email..." 
                        className="form-control form-control-premium ps-5"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                     />
                </div>
            </Card>

            <div className="card border-0 premium-card overflow-hidden bg-white">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 small">
                        <thead className="table-light text-muted">
                            <tr>
                                <th className="p-3 ps-4">Name / Email</th>
                                <th className="p-3">DOB / Gender</th>
                                <th className="p-3">Blood / Allergies</th>
                                <th className="p-3">Last Visit</th>
                                <th className="p-3 pe-4 text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPatients.map(p => (
                                <tr key={p.id}>
                                    <td className="p-3 ps-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <img src={p.avatar} alt="" className="rounded-circle object-fit-cover" style={{ width: '40px', height: '40px' }} />
                                            <div>
                                                <p className="fw-bold text-dark mb-0">{p.name}</p>
                                                <p className="text-muted small mb-0" style={{ fontSize: '0.75rem' }}>{p.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <p className="text-dark mb-0">{p.patientDetails?.dob || '--'}</p>
                                        <p className="text-muted small mb-0">{p.patientDetails?.gender}</p>
                                    </td>
                                    <td className="p-3">
                                        <p className="text-dark fw-medium mb-0">{p.patientDetails?.bloodGroup || '--'}</p>
                                        <p className="text-danger small mb-0 text-truncate" style={{ maxWidth: '150px' }}>{p.patientDetails?.allergies || 'No Allergies'}</p>
                                    </td>
                                    <td className="p-3 text-muted">{p.patientDetails?.lastVisit || 'Never'}</td>
                                    <td className="p-3 pe-4 text-end">
                                        <button onClick={() => handleOpenDetails(p)} className="btn btn-sm btn-outline-primary border-0 rounded-circle mx-1" title="View Profile">
                                            <Eye size={18} />
                                        </button>
                                        <button onClick={() => handleOpenModal(p)} className="btn btn-sm btn-outline-info border-0 rounded-circle mx-1" title="Edit">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(p.id)} className="btn btn-sm btn-outline-danger border-0 rounded-circle mx-1" title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredPatients.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-muted">No patients found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 rounded-4 shadow overflow-hidden">
                            <div className="modal-header bg-light border-bottom-0 p-3">
                                <h5 className="modal-title fw-bold text-dark">{editingId ? 'Edit Patient' : 'Add New Patient'}</h5>
                                <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)} aria-label="Close"></button>
                            </div>
                            <form onSubmit={handleSave}>
                                <div className="modal-body p-4">
                                    <div className="row g-3">
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold text-muted mb-1">Full Name</label>
                                            <input 
                                                className="form-control form-control-premium" 
                                                value={formData.name} 
                                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                                required 
                                            />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold text-muted mb-1">Email</label>
                                            <input 
                                                type="email" 
                                                className="form-control form-control-premium" 
                                                value={formData.email} 
                                                onChange={e => setFormData({...formData, email: e.target.value})} 
                                                required 
                                            />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold text-muted mb-1">Gender</label>
                                            <select 
                                                className="form-select form-control-premium" 
                                                value={formData.gender} 
                                                onChange={e => setFormData({...formData, gender: e.target.value})}
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold text-muted mb-1">Date of Birth</label>
                                            <input 
                                                type="date" 
                                                className="form-control form-control-premium" 
                                                value={formData.dob} 
                                                onChange={e => setFormData({...formData, dob: e.target.value})} 
                                                required 
                                            />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold text-muted mb-1">Blood Group</label>
                                            <select 
                                                className="form-select form-control-premium" 
                                                value={formData.bloodGroup} 
                                                onChange={e => setFormData({...formData, bloodGroup: e.target.value})}
                                            >
                                                <option value="">Select</option>
                                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold text-muted mb-1">Allergies</label>
                                            <input 
                                                className="form-control form-control-premium" 
                                                value={formData.allergies} 
                                                onChange={e => setFormData({...formData, allergies: e.target.value})} 
                                                placeholder="e.g. Peanuts, Penicillin" 
                                            />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold text-muted mb-1">Weight (kg)</label>
                                            <input 
                                                className="form-control form-control-premium" 
                                                value={formData.weight} 
                                                onChange={e => setFormData({...formData, weight: e.target.value})} 
                                                placeholder="e.g. 70 kg" 
                                            />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold text-muted mb-1">Height (cm)</label>
                                            <input 
                                                className="form-control form-control-premium" 
                                                value={formData.height} 
                                                onChange={e => setFormData({...formData, height: e.target.value})} 
                                                placeholder="e.g. 175 cm" 
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-top-0 p-3 bg-light">
                                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button type="submit">Save Record</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};