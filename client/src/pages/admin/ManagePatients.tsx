import React, { useState, useEffect } from 'react';
import { getPatientsAPI, createPatientAPI, updatePatientAPI, deletePatientAPI, getAppointmentsAPI } from '../../services/api';
import { User, Role, Appointment } from '../../types';
import { Card, Button, Badge, PageHeader } from '../../components/Components';
import { Search, Plus, Edit2, Trash2, Eye, X, Activity, Calendar, Clock, ChevronLeft, ArrowUpDown } from 'lucide-react';

export const ManagePatients = () => {
    const [view, setView] = useState<'list' | 'details'>('list');
    const [patients, setPatients] = useState<User[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<User | null>(null);
    const [patientHistory, setPatientHistory] = useState<Appointment[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // History Filter/Sort State
    const [historyFilterQuery, setHistoryFilterQuery] = useState('');
    const [historySortBy, setHistorySortBy] = useState<'date' | 'department' | 'doctorName'>('date');
    const [historySortOrder, setHistorySortOrder] = useState<'asc' | 'desc'>('desc');

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
        
        // Reset history filters
        setHistoryFilterQuery('');
        setHistorySortBy('date');
        setHistorySortOrder('desc');
        
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

    // Filter and Sort Patient History
    const getProcessedHistory = () => {
        let processed = [...patientHistory];

        if (historyFilterQuery) {
            const lowerQ = historyFilterQuery.toLowerCase();
            processed = processed.filter(a => 
                a.doctorName.toLowerCase().includes(lowerQ) ||
                a.department.toLowerCase().includes(lowerQ) ||
                (a.notes && a.notes.toLowerCase().includes(lowerQ))
            );
        }

        processed.sort((a, b) => {
            if (historySortBy === 'date') {
                 const dateA = new Date(`${a.date} ${a.time}`).getTime();
                 const dateB = new Date(`${b.date} ${b.time}`).getTime();
                 return historySortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            }
            
            const valA = (a[historySortBy] || '').toLowerCase();
            const valB = (b[historySortBy] || '').toLowerCase();
            
            if (valA < valB) return historySortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return historySortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return processed;
    };
    
    const processedHistory = getProcessedHistory();

    if (view === 'details' && selectedPatient) {
        return (
            <div className="space-y-6 animate-fadeIn">
                <Button variant="ghost" onClick={handleCloseDetails} className="pl-0 hover:bg-transparent">
                    <ChevronLeft size={20} /> Back to Patient List
                </Button>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Patient Profile Card */}
                    <Card className="p-6 md:w-1/3 h-fit">
                        <div className="text-center mb-6">
                            <img src={selectedPatient.avatar} alt={selectedPatient.name} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-primary-50" />
                            <h2 className="text-2xl font-bold text-slate-900">{selectedPatient.name}</h2>
                            <p className="text-slate-500">{selectedPatient.email}</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-slate-500">Gender</span>
                                <span className="font-medium">{selectedPatient.patientDetails?.gender}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-slate-500">Age/DOB</span>
                                <span className="font-medium">{selectedPatient.patientDetails?.dob || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-slate-500">Blood Group</span>
                                <span className="font-medium">{selectedPatient.patientDetails?.bloodGroup || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-slate-500">Allergies</span>
                                <span className="font-medium text-red-500">{selectedPatient.patientDetails?.allergies || 'None'}</span>
                            </div>
                            <div className="flex justify-between pt-2">
                                <div className="text-center w-1/2 border-r border-gray-100">
                                    <p className="text-xs text-slate-400 uppercase">Weight</p>
                                    <p className="font-bold">{selectedPatient.patientDetails?.weight || '--'}</p>
                                </div>
                                <div className="text-center w-1/2">
                                    <p className="text-xs text-slate-400 uppercase">Height</p>
                                    <p className="font-bold">{selectedPatient.patientDetails?.height || '--'}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Medical History */}
                    <div className="flex-1 space-y-6">
                        <Card className="p-6">
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Activity size={20} className="text-secondary-500" /> Medical History
                                </h3>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <div className="relative flex-1 sm:w-48">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                        <input 
                                            className="w-full pl-8 pr-3 py-1.5 border rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors"
                                            placeholder="Search history..."
                                            value={historyFilterQuery}
                                            onChange={e => setHistoryFilterQuery(e.target.value)}
                                        />
                                    </div>
                                    <select 
                                        className="border rounded-lg px-2 py-1.5 text-sm bg-slate-50 focus:bg-white outline-none cursor-pointer"
                                        value={historySortBy}
                                        onChange={(e) => setHistorySortBy(e.target.value as any)}
                                    >
                                        <option value="date">Date</option>
                                        <option value="department">Dept</option>
                                        <option value="doctorName">Doctor</option>
                                    </select>
                                    <button 
                                        className="border rounded-lg px-2 py-1.5 hover:bg-slate-100 text-slate-600 transition-colors"
                                        onClick={() => setHistorySortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                        title={historySortOrder === 'asc' ? "Ascending" : "Descending"}
                                    >
                                        <ArrowUpDown size={16} />
                                    </button>
                                </div>
                            </div>

                            {patientHistory.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">No appointment history found.</p>
                            ) : processedHistory.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">No matching records found.</p>
                            ) : (
                                <div className="space-y-4">
                                    {processedHistory.map(appt => (
                                        <div key={appt.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow bg-white">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-bold text-slate-800">{appt.department}</p>
                                                    <p className="text-sm text-slate-500">Dr. {appt.doctorName}</p>
                                                </div>
                                                <Badge color={appt.status === 'COMPLETED' ? 'green' : appt.status === 'CONFIRMED' ? 'blue' : 'gray'}>
                                                    {appt.status}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 text-xs text-slate-400 mb-3">
                                                <span className="flex items-center gap-1"><Calendar size={12} /> {appt.date}</span>
                                                <span className="flex items-center gap-1"><Clock size={12} /> {appt.time}</span>
                                            </div>
                                            {appt.notes && (
                                                <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600">
                                                    <span className="font-semibold text-slate-700">Notes: </span>
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manage Patients</h1>
                    <p className="text-slate-500">View, add, edit, and delete patient records.</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus size={18} /> Add New Patient
                </Button>
            </div>

            <Card className="p-4 flex gap-4">
                 <div className="relative flex-1">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                     <input 
                        type="text" 
                        placeholder="Search patients by name or email..." 
                        className="w-full pl-10 pr-4 py-2 border rounded-lg bg-slate-50 focus:bg-white transition-colors"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                     />
                </div>
            </Card>

            <Card className="overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 border-b border-gray-100">
                        <tr>
                            <th className="p-4">Name / Email</th>
                            <th className="p-4">DOB / Gender</th>
                            <th className="p-4">Blood / Allergies</th>
                            <th className="p-4">Last Visit</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredPatients.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50 group">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <img src={p.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                        <div>
                                            <p className="font-bold text-slate-900">{p.name}</p>
                                            <p className="text-xs text-slate-500">{p.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <p className="text-slate-900">{p.patientDetails?.dob || '--'}</p>
                                    <p className="text-xs text-slate-500">{p.patientDetails?.gender}</p>
                                </td>
                                <td className="p-4">
                                    <p className="text-slate-900 font-medium">{p.patientDetails?.bloodGroup || '--'}</p>
                                    <p className="text-xs text-red-500 truncate max-w-[150px]">{p.patientDetails?.allergies || 'No Allergies'}</p>
                                </td>
                                <td className="p-4 text-slate-500">{p.patientDetails?.lastVisit || 'Never'}</td>
                                <td className="p-4 text-right space-x-1">
                                    <button onClick={() => handleOpenDetails(p)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="View Profile">
                                        <Eye size={18} />
                                    </button>
                                    <button onClick={() => handleOpenModal(p)} className="p-2 text-slate-400 hover:text-secondary-600 hover:bg-secondary-50 rounded-full transition-colors" title="Edit">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Delete">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                         {filteredPatients.length === 0 && (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-400">No patients found.</td></tr>
                        )}
                    </tbody>
                </table>
            </Card>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50 sticky top-0">
                            <h3 className="text-xl font-bold text-slate-800">{editingId ? 'Edit Patient' : 'Add New Patient'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Full Name</label>
                                    <input className="w-full border rounded-lg p-2.5" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input type="email" className="w-full border rounded-lg p-2.5" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Gender</label>
                                    <select className="w-full border rounded-lg p-2.5" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Date of Birth</label>
                                    <input type="date" className="w-full border rounded-lg p-2.5" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Blood Group</label>
                                    <select className="w-full border rounded-lg p-2.5" value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})}>
                                        <option value="">Select</option>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Allergies</label>
                                    <input className="w-full border rounded-lg p-2.5" value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})} placeholder="e.g. Peanuts, Penicillin" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                                    <input className="w-full border rounded-lg p-2.5" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} placeholder="e.g. 70 kg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Height (cm)</label>
                                    <input className="w-full border rounded-lg p-2.5" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} placeholder="e.g. 175 cm" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Save Record</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};