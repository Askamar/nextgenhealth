import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAppointmentsAPI, getDoctorsAPI, createAppointmentAPI, DEPARTMENTS, getMedicalReportsAPI, getNotificationsAPI, getPatientPrescriptionsAPI, getAiSymptomCheckAPI } from '../../services/api';
import { Appointment, User, AppointmentStatus, MedicalReport, Notification } from '../../types';
import { Card, Button, Badge, PageHeader } from '../../components/Components';
import { Calendar, Clock, MapPin, ChevronRight, Bell, FileText, Syringe, Download, CheckCircle, Search, AlertTriangle, Heart, Brain, Bone, Users, Eye, Stethoscope, Activity } from 'lucide-react';

export const PatientDashboard = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [recentDoctors, setRecentDoctors] = useState<User[]>([]);

    // E-Prescription & Scanner States
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [selectedPrescription, setSelectedPrescription] = useState<any | null>(null);
    const [symptomText, setSymptomText] = useState('');
    const [scanning, setScanning] = useState(false);
    const [scannerResult, setScannerResult] = useState<any | null>(null);

    useEffect(() => {
        if (user) {
            getAppointmentsAPI(user.id, user.role).then(setAppointments).catch(() => {});
            getNotificationsAPI(user.id).then(setNotifications).catch(() => {});
            getDoctorsAPI().then(docs => setRecentDoctors(docs.slice(0, 3))).catch(() => {});
            getPatientPrescriptionsAPI(user.id).then(setPrescriptions).catch(() => {});
        }
    }, [user]);

    const upcoming = appointments.find(a => a.status === AppointmentStatus.PENDING || a.status === AppointmentStatus.CONFIRMED);

    const handleSymptomScan = async () => {
        if (!symptomText.trim()) return;
        setScanning(true);
        try {
            const result = await getAiSymptomCheckAPI(symptomText);
            setScannerResult(result);
        } catch (e) {
            alert('Symptom scanner service is currently unavailable.');
        } finally {
            setScanning(false);
        }
    };

    const calculateQueueStatus = (appt: Appointment) => {
        const doctorAppts = appointments.filter(a => 
            a.doctorId === appt.doctorId && 
            a.date === appt.date && 
            (a.status === AppointmentStatus.PENDING || a.status === AppointmentStatus.CONFIRMED)
        );
        doctorAppts.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
        const index = doctorAppts.findIndex(a => a.id === appt.id);
        const position = index >= 0 ? index + 1 : 1;
        const waitTime = position * 15; // 15 mins average
        return { position, waitTime };
    };

    return (
        <div className="container-lg py-4 d-flex flex-column gap-4">
            <div className="d-flex justify-content-between align-items-center">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Welcome back, {user?.name ? user.name.split(' ')[0] : ''}!</h2>
                    <p className="text-muted mb-0 small">Here is your health summary.</p>
                </div>
                <div 
                    className="position-relative p-2 bg-white rounded-circle border shadow-sm cursor-pointer d-flex align-items-center justify-content-center"
                    style={{ width: '40px', height: '40px' }}
                >
                    <Bell size={20} className="text-secondary" />
                    <span 
                        className="position-absolute bg-danger rounded-circle border border-2 border-white"
                        style={{ width: '10px', height: '10px', top: '2px', right: '2px' }}
                    ></span>
                </div>
            </div>

            <div className="row g-4">
                {/* Left Column */}
                <div className="col-12 col-lg-8 d-flex flex-column gap-4">
                    
                    <div className="row g-3">
                        {/* Upcoming Appointment Card */}
                        <div className="col-12 col-md-6">
                            <div 
                                className="card border-0 text-white rounded-4 overflow-hidden position-relative shadow h-100"
                                style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)', minHeight: '180px' }}
                            >
                                <div 
                                  className="position-absolute opacity-10"
                                  style={{ right: '-10px', bottom: '-10px' }}
                                >
                                  <Calendar size={120} />
                                </div>
                                <div className="card-body p-4 position-relative" style={{ zIndex: 1 }}>
                                    <h6 className="text-uppercase fw-semibold mb-2" style={{ color: '#ccfbf1', fontSize: '11px', letterSpacing: '1px' }}>Upcoming Visit</h6>
                                    {upcoming ? (
                                        <>
                                            <h4 className="fw-bold mb-1">{upcoming.doctorName}</h4>
                                            <p className="mb-2 small" style={{ color: '#ccfbf1' }}>{upcoming.department} • {upcoming.type}</p>
                                            <div className="d-flex align-items-center gap-2 mt-3">
                                                <span className="bg-white bg-opacity-20 px-2 py-1 rounded small" style={{ fontSize: '11px' }}>
                                                    <Clock size={11} className="me-1" /> {upcoming.time}
                                                </span>
                                                <span className="bg-white bg-opacity-20 px-2 py-1 rounded small" style={{ fontSize: '11px' }}>
                                                    <MapPin size={11} className="me-1" /> Room 304
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <h5 className="fw-bold mb-0">No upcoming appointments</h5>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Live Queue Tracker Widget */}
                        <div className="col-12 col-md-6">
                            <div className="card border shadow-sm rounded-4 h-100 bg-white p-4">
                                <h6 className="text-muted small fw-semibold mb-3">Live Waiting Room Queue</h6>
                                {upcoming ? (() => {
                                    const { position, waitTime } = calculateQueueStatus(upcoming);
                                    return (
                                        <div>
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <div>
                                                    <span className="text-muted small">Token Spot</span>
                                                    <h3 className="fw-bold text-dark mb-0">#{position}</h3>
                                                </div>
                                                <div className="text-end">
                                                    <span className="text-muted small">Est. Waiting</span>
                                                    <h4 className="fw-bold text-info mb-0">{waitTime} mins</h4>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <div className="flex-grow-1 progress" style={{ height: '6px' }}>
                                                    <div className="progress-bar bg-info" style={{ width: `${Math.max(20, 100 - (position * 20))}%` }}></div>
                                                </div>
                                                <span className="small fw-semibold text-info" style={{ fontSize: '11px' }}>Active</span>
                                            </div>
                                            <p className="mb-0 text-muted small" style={{ fontSize: '11px' }}>
                                                Clinic queue calculations are derived dynamically from active database check-in indexes.
                                            </p>
                                        </div>
                                    );
                                })() : (
                                    <div className="text-center py-4 text-muted small italic">
                                        No active clinics or check-ins today.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* AI Health Assistant (Symptom Matcher) */}
                    <Card className="p-4">
                        <h5 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                            <Activity size={20} className="text-primary" /> AI Health Assistant & Symptom Matcher
                        </h5>
                        <p className="text-muted small mb-3">
                            Describe how you feel, and our string-scanning parser will match your symptoms to departments and doctors.
                        </p>
                        <div className="d-flex gap-2">
                            <input 
                                className="form-control form-control-premium" 
                                placeholder="Describe symptoms e.g. chest tightness, palpitations, fast pulse" 
                                value={symptomText}
                                onChange={e => setSymptomText(e.target.value)}
                            />
                            <Button onClick={handleSymptomScan} disabled={scanning || !symptomText.trim()}>
                                {scanning ? 'Scanning...' : 'Scan'}
                            </Button>
                        </div>

                        {scannerResult && (
                            <div className="bg-light p-3 border rounded-3 mt-3 animate-fadeIn">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <h6 className="mb-0 fw-bold text-dark">Suggested: {scannerResult.matchedDepartment}</h6>
                                        <span className="small text-muted" style={{ fontSize: '11px' }}>Algorithm Match Strength</span>
                                    </div>
                                    <Badge color="green">
                                        {scannerResult.scorePercentage}% match
                                    </Badge>
                                </div>
                                
                                <p className="small text-muted fw-bold mb-2">Recommended Doctors:</p>
                                <div className="d-flex flex-column gap-2">
                                    {scannerResult.recommendedDoctors.map((doc: any) => (
                                        <div key={doc.id} className="d-flex align-items-center justify-content-between p-2 bg-white rounded border">
                                            <div className="d-flex align-items-center gap-2">
                                                <img src={doc.avatar} className="rounded-circle border" style={{ width: '36px', height: '36px', objectFit: 'cover' }} alt="" />
                                                <div>
                                                    <p className="mb-0 small fw-bold text-dark">{doc.name}</p>
                                                    <p className="mb-0 text-muted small" style={{ fontSize: '10px' }}>{doc.experience} yrs exp • {doc.rating} ★</p>
                                                </div>
                                            </div>
                                            <Button 
                                                variant="secondary"
                                                className="btn-sm py-1 px-3"
                                                onClick={() => {
                                                    window.location.hash = `#/patient/book`;
                                                }}
                                            >
                                                Book
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Recently Visited Doctors */}
                    <div>
                        <h5 className="fw-bold text-dark mb-3">Recently Visited Doctors</h5>
                        <div className="row g-3">
                            {recentDoctors.map(doc => (
                                <div key={doc.id} className="col-12 col-md-4">
                                    <div className="card border shadow-sm rounded-4 p-3 text-center bg-white hover-scale h-100">
                                      <img 
                                        src={doc.avatar} 
                                        className="rounded-circle mx-auto mb-3 object-fit-cover" 
                                        style={{ width: '64px', height: '64px' }}
                                        alt="" 
                                      />
                                      <h6 className="fw-bold text-dark text-truncate mb-1">{doc.name}</h6>
                                      <p className="text-muted small mb-3">{doc.doctorDetails?.specialization || doc.doctorSpecialization}</p>
                                      <button onClick={() => window.location.hash = `#/patient/book`} className="btn btn-sm btn-light text-primary fw-bold w-100 rounded-pill">Book Again</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="col-12 col-lg-4 d-flex flex-column gap-4">
                    {/* Active E-Prescriptions */}
                    <Card>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold text-dark mb-0">Active E-Prescriptions</h5>
                            <span className="badge rounded-pill bg-success-subtle text-success">{prescriptions.length} Records</span>
                        </div>
                        {prescriptions.length === 0 ? (
                            <p className="text-muted small text-center py-3 mb-0">No active digital prescriptions found.</p>
                        ) : (
                            <div className="d-flex flex-column gap-2">
                                {prescriptions.map(rx => (
                                    <div key={rx.id} className="p-2 border rounded bg-light hover-scale d-flex align-items-center justify-content-between">
                                        <div className="text-truncate" style={{ maxWidth: '70%' }}>
                                            <p className="mb-0 small fw-bold text-dark text-truncate">Dr. {rx.doctorName}</p>
                                            <p className="mb-0 text-muted" style={{ fontSize: '11px' }}>{rx.date} • {rx.department}</p>
                                        </div>
                                        <button 
                                            onClick={() => setSelectedPrescription(rx)}
                                            className="btn btn-sm btn-outline-primary py-1 px-2.5 small"
                                        >
                                            View Rx
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Notifications */}
                    <Card>
                         <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold text-dark mb-0">Notifications</h5>
                            <span className="badge rounded-pill bg-danger-subtle text-danger">{notifications.filter(n => !n.read).length} New</span>
                        </div>
                        <div className="d-flex flex-column gap-3">
                            {notifications.slice(0, 3).map(not => (
                                <div key={not.id} className="d-flex gap-3 align-items-start pb-3 border-bottom last:border-0 last:pb-0">
                                    <div className={`p-2 rounded-circle d-flex align-items-center justify-content-center ${
                                        not.type === 'result' ? 'bg-success-subtle text-success' :
                                        not.type === 'reminder' ? 'bg-warning-subtle text-warning' :
                                        'bg-primary-subtle text-primary'
                                    }`}>
                                        {not.type === 'result' ? <FileText size={14} /> : not.type === 'reminder' ? <Clock size={14} /> : <Bell size={14} />}
                                    </div>
                                    <div className="text-truncate" style={{ flex: 1 }}>
                                        <h6 className="mb-0 small fw-bold text-dark text-truncate">{not.title}</h6>
                                        <p className="mb-0 small text-muted text-truncate">{not.message}</p>
                                        <span className="text-muted" style={{ fontSize: '10px' }}>{not.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Vaccination */}
                    <Card>
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="bg-purple-subtle text-purple p-2 rounded">
                                <Syringe size={20} />
                            </div>
                            <div>
                                <h5 className="fw-bold text-dark mb-0">Vaccinations</h5>
                                <p className="mb-0 text-muted small" style={{ fontSize: '11px' }}>Upcoming schedules</p>
                            </div>
                        </div>
                        <div className="d-flex flex-column gap-2">
                            <div className="d-flex align-items-center justify-content-between p-2 bg-light rounded border">
                                <div className="d-flex align-items-center gap-2">
                                    <Syringe size={16} className="text-muted" />
                                    <div>
                                        <p className="mb-0 small fw-bold text-dark">Annual Flu Shot</p>
                                        <p className="mb-0 text-warning small" style={{ fontSize: '11px' }}>Due: Nov 15, 2024</p>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex align-items-center justify-content-between p-2 bg-light rounded border opacity-50">
                                <div className="d-flex align-items-center gap-2">
                                    <CheckCircle size={16} className="text-success" />
                                    <div>
                                        <p className="mb-0 small fw-bold text-dark">Tetanus Booster</p>
                                        <p className="mb-0 text-muted small" style={{ fontSize: '11px' }}>Completed</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Printable Rx Modal */}
            {selectedPrescription && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-md modal-dialog-centered">
                        <div className="modal-content border-0 rounded-4 shadow overflow-hidden">
                            <div className="modal-header bg-light border-bottom-0 p-3">
                                <h5 className="modal-title fw-bold text-dark">Digital E-Prescription</h5>
                                <button type="button" className="btn-close" onClick={() => setSelectedPrescription(null)}></button>
                            </div>
                            <div className="modal-body p-4" id="printable-rx-area">
                                <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
                                    <div>
                                        <h4 className="fw-bold text-dark mb-1">MediCore Clinics</h4>
                                        <p className="mb-0 text-muted small" style={{ fontSize: '11px' }}>102 Health Avenue, Metro City</p>
                                    </div>
                                    <div className="text-end">
                                        <h5 className="fw-bold text-primary mb-0">Rx Receipt</h5>
                                        <p className="mb-0 text-muted small" style={{ fontSize: '11px' }}>Date: {selectedPrescription.date}</p>
                                    </div>
                                </div>
                                <div className="row g-2 mb-4 small">
                                    <div className="col-6">
                                        <span className="text-muted">Doctor:</span> <strong className="text-dark">Dr. {selectedPrescription.doctorName}</strong> <br/>
                                        <span className="text-muted">Dept:</span> <span className="text-dark">{selectedPrescription.department}</span>
                                    </div>
                                    <div className="col-6 text-end">
                                        <span className="text-muted">Patient:</span> <strong className="text-dark">{selectedPrescription.patientName}</strong> <br/>
                                        <span className="text-muted">ID:</span> <span className="text-dark">#P-{selectedPrescription.patientId.slice(-4)}</span>
                                    </div>
                                </div>

                                <table className="table table-sm border align-middle mb-4 small">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Medication Name</th>
                                            <th>Dosage</th>
                                            <th>Freq / Timing</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedPrescription.medications.map((med: any, i: number) => (
                                            <tr key={i}>
                                                <td className="fw-bold text-dark">{med.name}</td>
                                                <td>{med.dose}</td>
                                                <td>{med.frequency} ({med.timing})</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {selectedPrescription.notes && (
                                    <div className="bg-light p-3 border rounded text-muted small mb-4">
                                        <span className="fw-bold text-dark d-block mb-1">Doctor Remarks:</span>
                                        {selectedPrescription.notes}
                                    </div>
                                )}

                                <div className="d-flex justify-content-between align-items-end pt-3 border-top">
                                    <div className="small text-muted" style={{ fontSize: '10px' }}>
                                        {selectedPrescription.safetyFlagged ? (
                                            <span className="text-danger">⚠️ Bypassed Safety Checks</span>
                                        ) : (
                                            <span className="text-success">✔ Safety Checked & Approved</span>
                                        )}
                                    </div>
                                    <div className="text-center" style={{ width: '120px' }}>
                                        <div className="border-bottom pb-1" style={{ height: '30px', borderStyle: 'dashed' }}>
                                            <span className="font-monospace text-muted small" style={{ fontSize: '10px' }}>Digitally Signed</span>
                                        </div>
                                        <span className="text-muted small" style={{ fontSize: '9px' }}>Authorized Signature</span>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-top-0 p-3 bg-light">
                                <Button variant="secondary" onClick={() => setSelectedPrescription(null)}>Close</Button>
                                <Button onClick={() => window.print()} className="btn-primary">Print Rx</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const BookAppointment = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const prefilledDocId = searchParams.get('doctorId') || '';
    const prefilledDept = searchParams.get('department') || '';

    const [step, setStep] = useState(1);
    const [department, setDepartment] = useState('');
    const [doctors, setDoctors] = useState<User[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<User | null>(null);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    useEffect(() => {
        getDoctorsAPI().then(docs => {
            setDoctors(docs);
            if (prefilledDocId) {
                const doc = docs.find(d => d.id === prefilledDocId);
                if (doc) {
                    setSelectedDoctor(doc);
                    setDepartment(doc.doctorSpecialization || '');
                    setStep(3); // Skip directly to scheduling step
                }
            } else if (prefilledDept) {
                setDepartment(prefilledDept);
                setStep(2); // Skip directly to doctor selection step
            }
        }).catch(() => {});
    }, [prefilledDocId, prefilledDept]);

    const filteredDoctors = department ? doctors.filter(d => d.doctorSpecialization === department) : [];

    const DEPT_INFO = [
        { name: 'Cardiology', icon: Heart, color: 'text-danger', bg: 'rgba(239, 68, 68, 0.08)' },
        { name: 'Pediatrics', icon: Users, color: 'text-info', bg: 'rgba(6, 182, 212, 0.08)' },
        { name: 'Neurology', icon: Brain, color: 'text-primary', bg: 'rgba(59, 130, 246, 0.08)' },
        { name: 'Orthopedics', icon: Bone, color: 'text-warning', bg: 'rgba(245, 158, 11, 0.08)' },
        { name: 'Dermatology', icon: Eye, color: 'text-success', bg: 'rgba(16, 185, 129, 0.08)' },
        { name: 'General Medicine', icon: Stethoscope, color: 'text-secondary', bg: 'rgba(108, 117, 125, 0.08)' }
    ];

    return (
        <div className="container-lg py-4 max-w-4xl">
            <div className="mb-4">
                <h2 className="fw-bold text-dark mb-1">Book an Appointment</h2>
                <p className="text-muted small">Follow the steps below to book your appointment.</p>
            </div>

            {/* Stepper Indicator */}
            <div className="mb-5 bg-white p-3 rounded-4 border border-light-subtle shadow-sm">
                 <div className="d-flex align-items-center justify-content-between position-relative px-4">
                     {/* Connecting Line */}
                     <div className="position-absolute top-50 start-0 translate-y-middle w-100 bg-light-subtle" style={{ height: '2px', zIndex: 1, left: '0', right: '0' }}>
                         <div 
                             className="bg-primary transition-all" 
                             style={{ height: '2px', width: `${((step - 1) / 2) * 100}%` }}
                         ></div>
                     </div>
                     
                     {[
                         { num: 1, label: "Choose Department" },
                         { num: 2, label: "Choose Doctor" },
                         { num: 3, label: "Schedule Time" }
                     ].map((s) => (
                         <div key={s.num} className="d-flex flex-column align-items-center position-relative" style={{ zIndex: 2 }}>
                             <div className={`step-dot ${step === s.num ? 'active' : step > s.num ? 'completed' : ''}`}>
                                 {step > s.num ? '✓' : s.num}
                             </div>
                             <span className={`small mt-2 fw-semibold ${step === s.num ? 'text-primary' : step > s.num ? 'text-success' : 'text-muted'}`}>
                                 {s.label}
                             </span>
                         </div>
                     ))}
                 </div>
            </div>

            {/* Steps Content */}
            <div>
                {step === 1 && (
                    <div className="d-flex flex-column gap-4">
                        <div>
                            <h4 className="fw-bold text-dark mb-1">Select a Department</h4>
                            <p className="text-muted small">Click on a specialty department to continue.</p>
                        </div>
                        <div className="row g-3">
                            {DEPT_INFO.map(dept => {
                                const IconComp = dept.icon;
                                return (
                                    <div key={dept.name} className="col-12 col-sm-6 col-md-4">
                                        <div 
                                            onClick={() => {
                                                setDepartment(dept.name);
                                                setStep(2); // Automatically transition to step 2 on click!
                                            }}
                                            className={`dept-grid-card ${department === dept.name ? 'selected' : ''}`}
                                        >
                                            <div 
                                                className={`rounded p-3 ${dept.color}`} 
                                                style={{ background: dept.bg, width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <IconComp size={24} />
                                            </div>
                                            <h6 className="fw-bold text-dark mb-0">{dept.name}</h6>
                                            <span className="text-muted text-xs">View active specialists</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="d-flex flex-column gap-4">
                        <div>
                             <h4 className="fw-bold text-dark mb-1">Choose Your Doctor</h4>
                             <p className="text-muted small">Select a doctor from the <strong className="text-primary">{department}</strong> department.</p>
                        </div>
                        {filteredDoctors.length === 0 ? (
                            <div className="card border border-dashed rounded-4 p-5 text-center bg-white shadow-sm">
                                <AlertTriangle size={48} className="text-warning mx-auto mb-3" />
                                <h5 className="fw-bold text-dark mb-1">No Doctors Available</h5>
                                <p className="text-muted small text-center mb-0">There are currently no doctors scheduled under {department}.</p>
                                <Button className="mt-4 rounded-pill" onClick={() => setStep(1)}>Go Back</Button>
                            </div>
                        ) : (
                            <div className="row g-3">
                                {filteredDoctors.map(doc => (
                                    <div key={doc.id} className="col-12 col-md-6">
                                        <div 
                                            onClick={() => setSelectedDoctor(doc)}
                                            className={`card rounded-4 p-3 border-2 cursor-pointer transition-all position-relative h-100 ${
                                                selectedDoctor?.id === doc.id ? 'border-primary bg-primary-subtle bg-opacity-25' : 'border-light-subtle hover-scale bg-white shadow-sm'
                                            }`}
                                        >
                                            <div className="d-flex align-items-center gap-3">
                                                <img 
                                                  src={doc.avatar || ''} 
                                                  className="rounded-circle object-cover border" 
                                                  style={{ width: '72px', height: '72px' }}
                                                  alt="" 
                                                />
                                                <div className="text-truncate">
                                                    <h6 className="fw-bold text-dark mb-1 text-truncate">{doc.name}</h6>
                                                    <p className="text-primary small mb-2">{doc.doctorSpecialization}</p>
                                                    <div className="d-flex align-items-center gap-2 small text-muted">
                                                        <span className="bg-success bg-opacity-10 text-success px-1.5 py-0.5 rounded fw-bold">{doc.doctorRating} ★</span>
                                                        <span>{doc.doctorExperience}+ years exp</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {selectedDoctor?.id === doc.id && (
                                                <div className="position-absolute bg-primary text-white rounded-circle" style={{ top: '12px', right: '12px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <CheckCircle size={14} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="d-flex justify-content-between mt-3">
                            <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                            <Button disabled={!selectedDoctor} onClick={() => setStep(3)}>Next Step</Button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="row g-4">
                        <div className="col-12 col-md-6">
                            <div className="card border-0 rounded-4 p-4 shadow-sm bg-white">
                                <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                                    <Calendar size={18} className="text-primary" />
                                    Select Date
                                </h5>
                                <input 
                                    type="date" 
                                    value={date}
                                    className="form-control form-control-premium mb-4 py-2.5" 
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setDate(e.target.value)} 
                                />
                                
                                <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                                    <Clock size={18} className="text-primary" />
                                    Select Time Slot
                                </h5>
                                <div className="row g-2">
                                    {['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'].map(t => (
                                        <div key={t} className="col-4">
                                            <button 
                                                onClick={() => setTime(t)}
                                                className={`time-slot-chip ${time === t ? 'selected' : ''}`}
                                            >
                                                {t}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-12 col-md-6">
                            <div className="card border-0 rounded-4 p-4 shadow-sm bg-white">
                                <h5 className="fw-bold text-dark mb-4">Summary</h5>
                                <div className="d-flex flex-column gap-3 bg-light p-3 rounded-3 border border-light-subtle">
                                    <div className="d-flex align-items-center gap-3">
                                        <img 
                                          src={selectedDoctor?.avatar || ''} 
                                          className="rounded-circle border" 
                                          style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                                          alt="" 
                                        />
                                        <div>
                                            <h6 className="fw-bold text-dark mb-0">{selectedDoctor?.name}</h6>
                                            <p className="text-muted small mb-0">{selectedDoctor?.doctorSpecialization}</p>
                                        </div>
                                    </div>
                                    <hr className="my-2 text-muted opacity-25" />
                                    <div className="d-flex justify-content-between small">
                                        <span className="text-muted">Department</span>
                                        <span className="fw-bold text-dark">{department}</span>
                                    </div>
                                    <div className="d-flex justify-content-between small">
                                        <span className="text-muted">Date</span>
                                        <span className="fw-bold text-dark">{date || 'Not selected'}</span>
                                    </div>
                                    <div className="d-flex justify-content-between small">
                                        <span className="text-muted">Time Slot</span>
                                        <span className="fw-bold text-dark">{time || 'Not selected'}</span>
                                    </div>
                                </div>
                                
                                <div className="d-flex gap-2 mt-4">
                                    <Button variant="secondary" className="flex-grow-1" onClick={() => setStep(2)}>Back</Button>
                                    <Button 
                                        disabled={!date || !time || !selectedDoctor || !user} 
                                        className="btn-premium-primary flex-grow-2" 
                                        style={{ flexGrow: 2 }}
                                        onClick={() => {
                                            if(selectedDoctor && user) {
                                                createAppointmentAPI({
                                                    patientId: user.id,
                                                    patientName: user.name,
                                                    patientAvatar: user.avatar,
                                                    doctorId: selectedDoctor.id,
                                                    doctorName: selectedDoctor.name,
                                                    doctorAvatar: selectedDoctor.avatar,
                                                    department: department,
                                                    date: date,
                                                    time: time,
                                                }).then(() => navigate('/patient')).catch(() => {
                                                    alert("Failed to book appointment. Please try again.");
                                                });
                                            }
                                        }}
                                    >
                                        Confirm Booking
                                    </Button>
                                </div>
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
        <div className="container-lg py-4 d-flex flex-column gap-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <div>
                    <h2 className="fw-bold text-dark mb-1">My Medical Reports</h2>
                    <p className="text-muted small mb-0">Securely view, manage, and upload your health records.</p>
                </div>
                <Button className="btn-premium-secondary d-flex align-items-center gap-2">
                    <Download size={18} /> Upload New Report
                </Button>
            </div>

            {/* Filters */}
            <div className="row g-3">
                <div className="col-12 col-md-6">
                    <div className="position-relative">
                        <Search className="position-absolute text-muted" size={20} style={{ left: '12px', top: '12px' }} />
                        <input 
                          type="text" 
                          placeholder="Search reports by name or doctor..." 
                          className="form-control form-control-premium py-2" 
                          style={{ paddingLeft: '40px' }}
                        />
                    </div>
                </div>
            </div>

            {/* Reports Grid */}
            <div className="row g-4">
                {reports.map(report => (
                    <div key={report.id} className="col-12 col-md-4">
                        <div className="card h-100 border shadow-sm rounded-4 overflow-hidden bg-white hover-scale">
                            <div 
                              className="position-relative d-flex align-items-center justify-content-center bg-light" 
                              style={{ height: '180px', overflow: 'hidden' }}
                            >
                                 {report.imageUrl ? (
                                    <img src={report.imageUrl} className="w-100 h-100" style={{ objectFit: 'cover' }} alt="" />
                                 ) : (
                                    <div className="text-muted opacity-50">
                                        <FileText size={48} />
                                    </div>
                                 )}
                                 <span className="position-absolute top-2 left-2 badge bg-dark bg-opacity-75">
                                     {report.type}
                                 </span>
                            </div>
                            <div className="card-body p-4">
                                <h5 className="fw-bold text-dark mb-1 text-truncate">{report.title}</h5>
                                <p className="text-muted small mb-3">{report.date} • {report.doctorName}</p>
                                <Button variant="secondary" className="w-100 py-2 border-0 bg-primary-subtle text-primary">
                                    <Download size={16} /> Download
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
