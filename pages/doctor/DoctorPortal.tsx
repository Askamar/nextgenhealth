import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAppointmentsAPI, updateAppointmentStatusAPI, getDrugAutocompleteAPI, checkDrugInteractionsAPI, createPrescriptionAPI, updateDoctorAPI } from '../../services/api';
import { Appointment, AppointmentStatus } from '../../types';
import { Card, Button, Badge } from '../../components/Components';
import { Calendar, Clock, CheckCircle, Activity, FileText, AlertTriangle, Search, Plus, Trash2 } from 'lucide-react';

export const DoctorDashboard = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    // E-Prescription Wizard States
    const [prescribing, setPrescribing] = useState(false);
    const [medications, setMedications] = useState<any[]>([]);
    const [medName, setMedName] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [dose, setDose] = useState('10mg');
    const [freq, setFreq] = useState('1x daily');
    const [timing, setTiming] = useState('After Meals');
    const [rxNotes, setRxNotes] = useState('');
    const [safetyWarning, setSafetyWarning] = useState<string | null>(null);
    const [safetyFlagged, setSafetyFlagged] = useState(false);

    useEffect(() => {
        if (user) {
            getAppointmentsAPI(user.id, user.role).then(data => {
                setAppointments(data);
                if(data.length > 0) setSelectedAppointment(data[0]);
            });
        }
    }, [user]);

    const handleMedNameChange = async (val: string) => {
        setMedName(val);
        if (val.trim().length > 1) {
            try {
                const list = await getDrugAutocompleteAPI(val);
                setSuggestions(list);
            } catch (e) {}
        } else {
            setSuggestions([]);
        }
    };

    const addMedication = async () => {
        if (!medName.trim()) return;
        const newMed = { name: medName, dose, frequency: freq, timing };
        const updatedMeds = [...medications, newMed];
        setMedications(updatedMeds);
        setMedName('');
        setSuggestions([]);
        
        const drugNames = updatedMeds.map(m => m.name);
        if (drugNames.length > 1) {
            try {
                const res = await checkDrugInteractionsAPI(drugNames);
                if (!res.isSafe) {
                    setSafetyWarning(res.warning || 'Potential drug interaction detected.');
                    setSafetyFlagged(true);
                } else {
                    setSafetyWarning(null);
                    setSafetyFlagged(false);
                }
            } catch (e) {}
        }
    };

    const removeMedication = async (index: number) => {
        const updatedMeds = medications.filter((_, i) => i !== index);
        setMedications(updatedMeds);
        
        const drugNames = updatedMeds.map(m => m.name);
        if (drugNames.length > 1) {
            try {
                const res = await checkDrugInteractionsAPI(drugNames);
                if (!res.isSafe) {
                    setSafetyWarning(res.warning || 'Potential drug interaction detected.');
                    setSafetyFlagged(true);
                } else {
                    setSafetyWarning(null);
                    setSafetyFlagged(false);
                }
            } catch (e) {}
        } else {
            setSafetyWarning(null);
            setSafetyFlagged(false);
        }
    };

    const handleSaveRx = async () => {
        if (!selectedAppointment) return;
        try {
            await createPrescriptionAPI({
                appointmentId: selectedAppointment.id,
                patientId: selectedAppointment.patientId,
                patientName: selectedAppointment.patientName || 'Patient',
                doctorId: selectedAppointment.doctorId,
                doctorName: selectedAppointment.doctorName || user?.name || 'Doctor',
                department: selectedAppointment.department || 'General Medicine',
                date: new Date().toLocaleDateString(),
                medications,
                notes: rxNotes,
                safetyFlagged
            });
            await updateAppointmentStatusAPI(selectedAppointment.id, AppointmentStatus.COMPLETED);
            alert('Prescription submitted and appointment completed successfully!');
            
            if (user) {
                const data = await getAppointmentsAPI(user.id, user.role);
                setAppointments(data);
                if (data.length > 0) setSelectedAppointment(data[0]);
            }
            
            setMedications([]);
            setPrescribing(false);
            setRxNotes('');
            setSafetyWarning(null);
            setSafetyFlagged(false);
        } catch (e) {
            alert('Failed to save prescription.');
        }
    };

    const stats = {
        completed: appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length,
        pending: appointments.filter(a => a.status === AppointmentStatus.PENDING).length,
        today: appointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length || 4,
    };

    return (
        <div className="container-fluid py-3 d-flex flex-column gap-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                 <div>
                    <h2 className="fw-bold text-dark mb-1">Good Morning, {user?.name ? user.name.split(' ')[0] : ''}!</h2>
                    <p className="text-muted mb-0 small">Here's what your day looks like.</p>
                </div>
                <div className="d-flex gap-3">
                    <div className="card border shadow-sm p-3 d-flex flex-row align-items-center gap-3 bg-white" style={{ minWidth: '180px' }}>
                        <div className="p-2 bg-success-subtle text-success rounded"><CheckCircle size={20} /></div>
                        <div>
                            <h4 className="mb-0 fw-bold text-dark">{stats.completed}</h4>
                            <p className="mb-0 small text-muted">Completed</p>
                        </div>
                    </div>
                    <div className="card border shadow-sm p-3 d-flex flex-row align-items-center gap-3 bg-white" style={{ minWidth: '180px' }}>
                        <div className="p-2 bg-warning-subtle text-warning rounded"><Clock size={20} /></div>
                        <div>
                            <h4 className="mb-0 fw-bold text-dark">{stats.pending}</h4>
                            <p className="mb-0 small text-muted">Pending</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* Appointment List */}
                <div className="col-12 col-lg-4">
                    <div className="card border shadow-sm rounded-4 h-100 bg-white">
                        <div className="card-header border-0 bg-light p-3">
                            <h5 className="fw-bold text-dark mb-0">Today's Appointments</h5>
                        </div>
                        <div className="card-body p-3 d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '500px' }}>
                            {appointments.map(appt => (
                                <div 
                                    key={appt.id} 
                                    onClick={() => setSelectedAppointment(appt)}
                                    className={`p-3 rounded border cursor-pointer transition-all ${
                                        selectedAppointment?.id === appt.id 
                                        ? 'bg-primary-subtle bg-opacity-25 border-primary' 
                                        : 'bg-white border-light-subtle hover-scale'
                                    }`}
                                >
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div className="d-flex align-items-center gap-2">
                                            <img 
                                              src={appt.patientAvatar || `https://ui-avatars.com/api/?name=${appt.patientName}`} 
                                              className="rounded-circle border" 
                                              style={{ width: '36px', height: '36px', objectFit: 'cover' }}
                                              alt="" 
                                            />
                                            <div className="text-truncate" style={{ maxWidth: '120px' }}>
                                                <h6 className="mb-0 small fw-bold text-dark text-truncate">{appt.patientName}</h6>
                                                <span className="text-muted small" style={{ fontSize: '10px' }}>{appt.type}</span>
                                            </div>
                                        </div>
                                        <span className="badge bg-light text-dark border font-monospace py-1.5">{appt.time}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mt-2">
                                         <span className="small text-muted text-truncate" style={{ maxWidth: '120px', fontSize: '11px' }}>{appt.notes || 'Routine Checkup'}</span>
                                         <Badge color={appt.status === AppointmentStatus.CONFIRMED ? 'green' : 'yellow'}>{appt.status}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Patient Details Detail View */}
                <div className="col-12 col-lg-8">
                    {selectedAppointment ? (
                        <div className="card border shadow-sm rounded-4 bg-white h-100">
                             <div className="card-header border-bottom bg-transparent p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                                 <div className="d-flex align-items-center gap-3">
                                     <img 
                                       src={selectedAppointment.patientAvatar || ''} 
                                       className="rounded-circle border border-3 shadow-sm" 
                                       style={{ width: '72px', height: '72px', objectFit: 'cover' }} 
                                       alt="" 
                                     />
                                     <div>
                                         <h4 className="fw-bold text-dark mb-1">{selectedAppointment.patientName}</h4>
                                         <div className="d-flex gap-3 small text-muted">
                                             <span>34 yrs, Female</span>
                                             <span>•</span>
                                             <span>ID: #P-{selectedAppointment.patientId.slice(-4)}</span>
                                         </div>
                                     </div>
                                 </div>
                                 <div className="text-md-end">
                                     <span className="badge bg-warning text-warning-emphasis mb-2 px-3 py-2 fs-6">
                                         {selectedAppointment.status}
                                     </span>
                                     <p className="mb-0 small text-muted">{selectedAppointment.date}, {selectedAppointment.time}</p>
                                 </div>
                             </div>
                             {prescribing ? (
                                  <div className="card-body p-4 overflow-auto" style={{ maxHeight: '450px' }}>
                                      <h5 className="fw-bold text-dark mb-4">Write Digital E-Prescription</h5>
                                      
                                      {/* Drug interactions warnings box */}
                                      {safetyWarning && (
                                          <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
                                              <AlertTriangle className="text-danger flex-shrink-0" size={24} />
                                              <div className="small">
                                                  <strong>Drug Interaction Detected:</strong> {safetyWarning}
                                              </div>
                                          </div>
                                      )}

                                      <div className="row g-3 align-items-end mb-4 border p-3 rounded bg-light">
                                          <div className="col-12 col-md-4 position-relative">
                                              <label className="form-label small fw-bold text-muted mb-1">Medication Name</label>
                                              <input 
                                                  className="form-control form-control-premium" 
                                                  placeholder="Search drug e.g. Aspirin" 
                                                  value={medName} 
                                                  onChange={e => handleMedNameChange(e.target.value)} 
                                              />
                                              {suggestions.length > 0 && (
                                                  <div className="position-absolute start-0 end-0 bg-white border rounded shadow-sm overflow-auto" style={{ maxHeight: '150px', zIndex: 1000, marginTop: '2px' }}>
                                                      {suggestions.map(sug => (
                                                          <div 
                                                              key={sug} 
                                                              onClick={() => { setMedName(sug); setSuggestions([]); }} 
                                                              className="p-2 cursor-pointer hover-bg-light small border-bottom text-dark"
                                                              style={{ cursor: 'pointer' }}
                                                          >
                                                              {sug}
                                                          </div>
                                                      ))}
                                                  </div>
                                              )}
                                          </div>
                                          <div className="col-6 col-md-2">
                                              <label className="form-label small fw-bold text-muted mb-1">Dosage</label>
                                              <input className="form-control form-control-premium" value={dose} onChange={e => setDose(e.target.value)} />
                                          </div>
                                          <div className="col-6 col-md-3">
                                              <label className="form-label small fw-bold text-muted mb-1">Frequency</label>
                                              <select className="form-select form-control-premium" value={freq} onChange={e => setFreq(e.target.value)}>
                                                  <option value="1x daily">1x daily</option>
                                                  <option value="2x daily">2x daily</option>
                                                  <option value="3x daily">3x daily</option>
                                                  <option value="As needed">As needed</option>
                                              </select>
                                          </div>
                                          <div className="col-6 col-md-3">
                                              <label className="form-label small fw-bold text-muted mb-1">Timing</label>
                                              <select className="form-select form-control-premium" value={timing} onChange={e => setTiming(e.target.value)}>
                                                  <option value="After Meals">After Meals</option>
                                                  <option value="Before Meals">Before Meals</option>
                                                  <option value="With Meals">With Meals</option>
                                                  <option value="Before Bedtime">Before Bedtime</option>
                                              </select>
                                          </div>
                                          <div className="col-12 text-end">
                                              <Button onClick={addMedication} className="btn-sm"><Plus size={16} /> Add to Prescription</Button>
                                          </div>
                                      </div>

                                      <h6 className="fw-bold text-dark mb-3">Prescribed Medications</h6>
                                      {medications.length === 0 ? (
                                          <p className="text-muted small italic">No medications added yet.</p>
                                      ) : (
                                          <div className="table-responsive mb-4">
                                              <table className="table table-hover align-middle mb-0 small border">
                                                  <thead className="table-light">
                                                      <tr>
                                                          <th>Medication</th>
                                                          <th>Dosage</th>
                                                          <th>Frequency</th>
                                                          <th>Timing</th>
                                                          <th className="text-end">Action</th>
                                                      </tr>
                                                  </thead>
                                                  <tbody>
                                                      {medications.map((m, idx) => (
                                                          <tr key={idx}>
                                                              <td className="fw-bold text-dark">{m.name}</td>
                                                              <td>{m.dose}</td>
                                                              <td>{m.frequency}</td>
                                                              <td>{m.timing}</td>
                                                              <td className="text-end">
                                                                  <button onClick={() => removeMedication(idx)} className="btn btn-sm btn-outline-danger border-0 rounded-circle" title="Remove"><Trash2 size={16} /></button>
                                                              </td>
                                                          </tr>
                                                      ))}
                                                  </tbody>
                                              </table>
                                          </div>
                                      )}

                                      <div className="mb-3">
                                          <label className="form-label small fw-bold text-muted mb-1">Doctor Notes / Remarks</label>
                                          <textarea 
                                              className="form-control form-control-premium" 
                                              rows={3} 
                                              placeholder="Provide specific instructions to the patient..." 
                                              value={rxNotes} 
                                              onChange={e => setRxNotes(e.target.value)}
                                          />
                                      </div>
                                  </div>
                              ) : (
                                  <div className="card-body p-4 overflow-auto" style={{ maxHeight: '450px' }}>
                                      <div className="row g-3 mb-4">
                                          <div className="col-4">
                                              <div className="bg-light p-3 rounded border text-center">
                                                  <p className="small text-muted text-uppercase mb-1" style={{ fontSize: '10px' }}>Blood Pressure</p>
                                                  <h5 className="fw-bold text-dark mb-0">120/80</h5>
                                              </div>
                                          </div>
                                          <div className="col-4">
                                              <div className="bg-light p-3 rounded border text-center">
                                                  <p className="small text-muted text-uppercase mb-1" style={{ fontSize: '10px' }}>Heart Rate</p>
                                                  <h5 className="fw-bold text-dark mb-0">72 bpm</h5>
                                              </div>
                                          </div>
                                          <div className="col-4">
                                              <div className="bg-light p-3 rounded border text-center">
                                                  <p className="small text-muted text-uppercase mb-1" style={{ fontSize: '10px' }}>Weight</p>
                                                  <h5 className="fw-bold text-dark mb-0">62 kg</h5>
                                              </div>
                                          </div>
                                      </div>

                                      <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                                          <Activity size={16} className="text-primary" /> Reason for Visit
                                      </h6>
                                      <p className="small text-muted bg-light p-3 rounded border mb-4">
                                          {selectedAppointment.notes || "Patient reports experiencing mild headaches and occasional dizziness over the past two weeks. Symptoms are more pronounced in the morning. Seeking evaluation and advice."}
                                      </p>

                                      <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                                          <FileText size={16} className="text-primary" /> Medical History
                                      </h6>
                                      <ul className="list-unstyled small d-flex flex-column gap-2 text-muted mb-0">
                                          <li className="d-flex gap-2">
                                              <span className="fw-bold text-dark">Allergies:</span>
                                              <span>Penicillin (mild rash)</span>
                                          </li>
                                          <li className="d-flex gap-2">
                                              <span className="fw-bold text-dark">Current Meds:</span>
                                              <span>Lisinopril 10mg daily</span>
                                          </li>
                                      </ul>
                                  </div>
                              )}

                              <div className="card-footer bg-light p-3 d-flex justify-content-end gap-2 border-top">
                                  {prescribing ? (
                                      <>
                                          <Button variant="secondary" onClick={() => setPrescribing(false)}>Cancel</Button>
                                          <Button onClick={handleSaveRx} disabled={medications.length === 0} className="btn-primary">
                                              {safetyFlagged ? 'Override Warning & Complete' : 'Complete Prescription'}
                                          </Button>
                                      </>
                                  ) : (
                                      <>
                                          {selectedAppointment.status !== AppointmentStatus.COMPLETED && (
                                              <>
                                                  <Button onClick={() => setPrescribing(true)} variant="secondary" className="btn-premium-secondary text-white">
                                                      Write E-Prescription
                                                  </Button>
                                                  <Button onClick={async () => {
                                                      await updateAppointmentStatusAPI(selectedAppointment.id, AppointmentStatus.COMPLETED);
                                                      alert('Appointment marked as Completed.');
                                                      if (user) {
                                                          const data = await getAppointmentsAPI(user.id, user.role);
                                                          setAppointments(data);
                                                          if (data.length > 0) setSelectedAppointment(data[0]);
                                                      }
                                                  }} className="btn-primary">
                                                      Mark Completed
                                                  </Button>
                                              </>
                                          )}
                                      </>
                                  )}
                              </div>
                        </div>
                    ) : (
                        <div className="card border shadow-sm rounded-4 h-100 bg-white d-flex align-items-center justify-content-center text-muted" style={{ minHeight: '300px' }}>
                            Select an appointment to view details
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const DoctorSchedule = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [availability, setAvailability] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        if (user) {
            getAppointmentsAPI(user.id, user.role).then(setAppointments).catch(() => {});
            
            // Parse availability
            let availDays: string[] = [];
            if (user.doctorAvailability) {
                try {
                    availDays = JSON.parse(user.doctorAvailability);
                } catch (e) {
                    if (typeof user.doctorAvailability === 'string') {
                        availDays = user.doctorAvailability.split(',').map((s: string) => s.trim());
                    }
                }
            }
            setAvailability(availDays);
        }
    }, [user]);

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const handleToggleDay = async (day: string) => {
        const updated = availability.includes(day)
            ? availability.filter(d => d !== day)
            : [...availability, day];
            
        setAvailability(updated);
        setSaving(true);
        setSaveMessage('');
        
        try {
            if (user) {
                await updateDoctorAPI(user.id, { availability: updated });
                setSaveMessage('Availability updated successfully!');
                setTimeout(() => setSaveMessage(''), 3000);
            }
        } catch (e) {
            setSaveMessage('Failed to update availability.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container-fluid py-3 d-flex flex-column gap-4">
            <div>
                <h2 className="fw-bold text-dark mb-1">My Schedule & Availability</h2>
                <p className="text-muted mb-0 small">Configure your weekly consulting days and view scheduled sessions.</p>
            </div>

            <div className="row g-4">
                {/* Availability settings */}
                <div className="col-12 col-lg-5">
                    <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
                        <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                            <Calendar size={18} className="text-primary" />
                            Weekly consulting days
                        </h5>
                        <p className="text-muted small mb-4">Toggle the days you are active and accepting appointments at MediCore clinic.</p>
                        
                        <div className="d-flex flex-column gap-2 mb-4">
                            {daysOfWeek.map(day => {
                                const active = availability.includes(day);
                                return (
                                    <button
                                        key={day}
                                        onClick={() => handleToggleDay(day)}
                                        className={`btn text-start p-3 rounded-3 border d-flex justify-content-between align-items-center transition-all ${
                                            active 
                                            ? 'border-primary bg-primary bg-opacity-10 text-primary fw-bold' 
                                            : 'border-light-subtle bg-light text-muted'
                                        }`}
                                    >
                                        <span>{day === 'Mon' ? 'Monday' : day === 'Tue' ? 'Tuesday' : day === 'Wed' ? 'Wednesday' : day === 'Thu' ? 'Thursday' : day === 'Fri' ? 'Friday' : day === 'Sat' ? 'Saturday' : 'Sunday'}</span>
                                        <span className={`badge rounded-pill px-3 py-1.5 ${active ? 'bg-primary text-white' : 'bg-secondary text-white'}`}>
                                            {active ? 'Active' : 'Inactive'}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {saving && (
                            <div className="text-muted small italic d-flex align-items-center gap-2">
                                <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
                                Saving changes...
                            </div>
                        )}
                        {saveMessage && (
                            <div className={`alert py-2.5 px-3 rounded-3 mb-0 small ${saveMessage.includes('Failed') ? 'alert-danger' : 'alert-success border-success border-opacity-20 bg-success-subtle bg-opacity-25 text-success-emphasis'}`}>
                                {saveMessage}
                            </div>
                        )}
                    </div>
                </div>

                {/* Scheduled appointments */}
                <div className="col-12 col-lg-7">
                    <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
                        <h5 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                            <Clock size={18} className="text-primary" />
                            Active Appointments
                        </h5>
                        
                        {appointments.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                No appointments scheduled currently.
                            </div>
                        ) : (
                              <div className="table-responsive">
                                  <table className="table table-hover align-middle mb-0 small border">
                                      <thead className="table-light">
                                          <tr>
                                              <th>Patient</th>
                                              <th>Date & Time</th>
                                              <th>Type</th>
                                              <th>Status</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                          {appointments.map(appt => (
                                              <tr key={appt.id}>
                                                  <td>
                                                      <div className="d-flex align-items-center gap-2.5">
                                                          <img
                                                              src={appt.patientAvatar || `https://ui-avatars.com/api/?name=${appt.patientName}`}
                                                              className="rounded-circle border"
                                                              style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                                              alt=""
                                                          />
                                                          <span className="fw-bold text-dark">{appt.patientName}</span>
                                                      </div>
                                                  </td>
                                                  <td>
                                                      <div className="d-flex flex-column">
                                                          <span className="fw-semibold text-dark">{appt.date}</span>
                                                          <span className="text-muted text-xs">{appt.time}</span>
                                                      </div>
                                                  </td>
                                                  <td>{appt.type}</td>
                                                  <td>
                                                      <Badge color={appt.status === 'COMPLETED' ? 'green' : appt.status === 'CONFIRMED' ? 'blue' : 'yellow'}>
                                                          {appt.status}
                                                      </Badge>
                                                  </td>
                                              </tr>
                                          ))}
                                      </tbody>
                                  </table>
                              </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const DoctorProfile = () => {
    const { user } = useAuth();
    const [specialization, setSpecialization] = useState(user?.doctorSpecialization || '');
    const [qualification, setQualification] = useState(user?.doctorQualification || '');
    const [experience, setExperience] = useState(user?.doctorExperience || 5);
    const [avgConsultationTime, setAvgConsultationTime] = useState(user?.doctorAvgConsultationTime || 15);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSaving(true);
        setSaveMessage('');
        
        try {
            await updateDoctorAPI(user.id, {
                specialization,
                qualification,
                experience: Number(experience),
                avgConsultationTime: Number(avgConsultationTime)
            });
            setSaveMessage('Profile saved successfully! Reload the page to sync credentials.');
        } catch (error) {
            setSaveMessage('Failed to save profile details.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container-fluid py-3 d-flex flex-column gap-4">
            <div>
                <h2 className="fw-bold text-dark mb-1">My Profile Settings</h2>
                <p className="text-muted mb-0 small">Manage your professional credentials, consulting info, and clinical details.</p>
            </div>

            <div className="row g-4">
                {/* Credentials summary cards */}
                <div className="col-12 col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 bg-white p-4 text-center">
                        <img 
                            src={user?.avatar || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300'} 
                            className="rounded-circle border border-4 border-primary-subtle mx-auto mb-3" 
                            style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                            alt="" 
                        />
                        <h4 className="fw-bold text-dark mb-1">{user?.name}</h4>
                        <p className="text-primary fw-semibold small mb-4">{user?.doctorSpecialization || 'Specialist'}</p>
                        
                        <div className="d-flex flex-column gap-2 text-start p-3 bg-light rounded-3 border border-light-subtle">
                            <div className="d-flex justify-content-between small">
                                <span className="text-muted">Doctor ID</span>
                                <span className="fw-bold text-dark font-monospace">#{user?.id.slice(-6)}</span>
                            </div>
                            <div className="d-flex justify-content-between small">
                                <span className="text-muted">Contact Phone</span>
                                <span className="fw-bold text-dark">{user?.phone}</span>
                            </div>
                            <div className="d-flex justify-content-between small">
                                <span className="text-muted">Rating</span>
                                <span className="fw-bold text-success">{user?.doctorRating || 4.9} ★</span>
                            </div>
                            <div className="d-flex justify-content-between small">
                                <span className="text-muted">Patients treated</span>
                                <span className="fw-bold text-dark">{user?.doctorPatients || '1,200+'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="col-12 col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
                        <h5 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                            <FileText size={18} className="text-primary" />
                            Professional Credentials
                        </h5>
                        
                        <form onSubmit={handleSave} className="d-flex flex-column gap-3">
                            <div className="row g-3">
                                <div className="col-12 col-md-6">
                                    <label className="form-label small fw-bold text-muted mb-1">Medical Specialization</label>
                                    <input 
                                        type="text" 
                                        className="form-control form-control-premium" 
                                        value={specialization} 
                                        onChange={e => setSpecialization(e.target.value)} 
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label small fw-bold text-muted mb-1">Qualifications (degrees)</label>
                                    <input 
                                        type="text" 
                                        className="form-control form-control-premium" 
                                        value={qualification} 
                                        onChange={e => setQualification(e.target.value)} 
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label small fw-bold text-muted mb-1">Years of Experience</label>
                                    <input 
                                        type="number" 
                                        className="form-control form-control-premium" 
                                        value={experience} 
                                        onChange={e => setExperience(Number(e.target.value))} 
                                        min={1}
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label small fw-bold text-muted mb-1">Average Consultation Time (mins)</label>
                                    <input 
                                        type="number" 
                                        className="form-control form-control-premium" 
                                        value={avgConsultationTime} 
                                        onChange={e => setAvgConsultationTime(Number(e.target.value))} 
                                        min={5}
                                        max={60}
                                        required
                                    />
                                </div>
                            </div>
                            
                            {saveMessage && (
                                <div className={`alert py-2.5 px-3 rounded-3 mt-2 mb-0 small ${saveMessage.includes('Failed') ? 'alert-danger' : 'alert-success border-success border-opacity-20 bg-success-subtle bg-opacity-25 text-success-emphasis'}`}>
                                    {saveMessage}
                                </div>
                            )}

                            <div className="d-flex justify-content-end gap-2 mt-3">
                                <Button type="submit" disabled={saving} className="btn-premium-primary px-4 py-2.5 d-flex align-items-center gap-1.5">
                                    {saving ? 'Saving...' : 'Save Profile Changes'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
