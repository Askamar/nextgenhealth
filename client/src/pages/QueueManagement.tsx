
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getDoctorsAPI } from '../services/api';
import { registerToken, getQueueStatus, updateTokenStatus, getPatientToken, getQueueAnalytics, RegisterTokenError } from '../services/queueService';
import { Role, User, Token } from '../types';
import { AlertTriangle, X } from 'lucide-react';

// Emergency Modal Component
const EmergencyModal = ({
    isOpen,
    onClose,
    onSubmit,
    loading
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => void;
    loading: boolean;
}) => {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (reason.trim().length < 10) {
            setError('Please provide a detailed description (at least 10 characters)');
            return;
        }
        onSubmit(reason);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl max-w-md w-full p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                        <AlertTriangle className="text-red-500" size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Emergency Registration</h3>
                        <p className="text-sm text-slate-400">Describe your emergency condition</p>
                    </div>
                    <button onClick={onClose} className="ml-auto text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
                    <p className="text-sm text-red-400">
                        <strong>Emergency cases include:</strong> Chest pain, difficulty breathing, severe bleeding,
                        accidents, unconscious patients, seizures, stroke symptoms, high fever, allergic reactions, fractures.
                    </p>
                </div>

                <textarea
                    value={reason}
                    onChange={(e) => { setReason(e.target.value); setError(''); }}
                    placeholder="Describe your emergency condition in detail..."
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 outline-none resize-none mb-2"
                />
                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Submitting...' : 'Submit Emergency'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const QueueManagement = () => {
    const { user } = useAuth();
    const toast = useToast();
    const [doctors, setDoctors] = useState<User[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<string>('');
    const [doctorQueue, setDoctorQueue] = useState<{ activeToken: Token | null, queue: Token[], totalWaiting: number } | null>(null);
    const [myTokens, setMyTokens] = useState<Token[]>([]);
    const [loading, setLoading] = useState(false);
    const [showEmergencyModal, setShowEmergencyModal] = useState(false);

    useEffect(() => {
        if (user?.role === Role.PATIENT) {
            loadDoctors();
            loadMyTokens();
        } else if (user?.role === Role.DOCTOR) {
            loadDoctorQueue(user.id);
            const interval = setInterval(() => loadDoctorQueue(user.id), 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const loadDoctors = async () => {
        try {
            const docs = await getDoctorsAPI();
            setDoctors(docs);
        } catch (e) {
            console.error(e);
        }
    };

    const loadMyTokens = async () => {
        if (user?.id) {
            try {
                const tokens = await getPatientToken(user.id);
                setMyTokens(tokens);
            } catch (e) { console.error(e); }
        }
    };

    const loadDoctorQueue = async (docId: string) => {
        try {
            const data = await getQueueStatus(docId);
            setDoctorQueue(data);
        } catch (e) { console.error(e); }
    };

    const handleJoinQueue = async (isEmergency: boolean = false, emergencyReason?: string) => {
        if (!selectedDoctor || !user) return;
        setLoading(true);
        try {
            const result = await registerToken(
                user.id,
                selectedDoctor,
                user.name,
                isEmergency ? 'EMERGENCY' : 'REGULAR',
                emergencyReason
            );

            toast.success(
                isEmergency ? 'Emergency Token Registered!' : 'Token Registered!',
                `Token #${result.token.tokenNumber} - Wait: ~${result.waitMinutes} min`
            );

            setShowEmergencyModal(false);
            loadMyTokens();
            loadDoctorQueue(selectedDoctor);

        } catch (err: any) {
            const error = err as RegisterTokenError;

            if (error.requiresReason) {
                setShowEmergencyModal(true);
            } else if (error.isEmergencyValid === false) {
                toast.warning('Not an Emergency', error.hint || error.message);
            } else if (error.maxTokens) {
                toast.error('Queue Full', `Maximum ${error.maxTokens} patients for today. Try again tomorrow.`);
            } else {
                toast.error('Failed to Join Queue', error.message || 'Please try again');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEmergencySubmit = (reason: string) => {
        handleJoinQueue(true, reason);
    };

    const handleNextPatient = async () => {
        if (!doctorQueue?.queue.length) return;
        const nextToken = doctorQueue.queue[0];
        try {
            await updateTokenStatus(nextToken._id, 'ACTIVE');
            toast.info('Next Patient', `Token #${nextToken.tokenNumber} - ${nextToken.patientName}`);
            loadDoctorQueue(user!.id);
        } catch (e) {
            toast.error('Error', 'Failed to call next patient');
        }
    };

    const [analytics, setAnalytics] = useState<{ dailyLoad: number, completedPatients: number, avgConsultationTime: number } | null>(null);

    const loadAnalytics = async (docId: string) => {
        try {
            const data = await getQueueAnalytics(docId);
            setAnalytics(data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        if (user?.role === Role.DOCTOR && user.id) {
            loadAnalytics(user.id);
        }
    }, [user, doctorQueue]); // Reload when queue changes (e.g. patient completed)

    const handleCompletePatient = async () => {
        if (!doctorQueue?.activeToken) return;
        try {
            await updateTokenStatus(doctorQueue.activeToken._id, 'COMPLETED');
            loadDoctorQueue(user!.id);
            loadAnalytics(user!.id);
        } catch (e) { console.error(e); }
    };

    if (user?.role === Role.DOCTOR) {
        return (
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-6 text-white">Smart Queue Dashboard</h2>

                {analytics && (
                    <div className="grid grid-cols-3 gap-6 mb-8">
                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                            <div className="text-slate-400 text-sm">Today's Patients</div>
                            <div className="text-2xl font-bold text-white">{analytics.dailyLoad}</div>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                            <div className="text-slate-400 text-sm">Completed</div>
                            <div className="text-2xl font-bold text-green-400">{analytics.completedPatients}</div>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                            <div className="text-slate-400 text-sm">Avg. Consult Time</div>
                            <div className="text-2xl font-bold text-blue-400">{analytics.avgConsultationTime} min</div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current Patient Card */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <h3 className="text-lg font-semibold text-slate-300 mb-4">Currently Serving</h3>
                        {doctorQueue?.activeToken ? (
                            <div className="text-center py-8">
                                <div className="text-6xl font-black text-green-400 mb-2">{doctorQueue.activeToken.tokenNumber}</div>
                                <div className="text-xl text-white">{doctorQueue.activeToken.patientName}</div>
                                <div className="mt-6">
                                    <button
                                        onClick={handleCompletePatient}
                                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-blue-900/50"
                                    >
                                        Complete Visit
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-slate-500 text-center py-10">No active patient</div>
                        )}
                    </div>

                    {/* Queue List */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-300">Waiting List ({doctorQueue?.totalWaiting || 0})</h3>
                            <button
                                onClick={handleNextPatient}
                                disabled={!doctorQueue?.queue.length}
                                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Call Next
                            </button>
                        </div>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {doctorQueue?.queue.map(token => (
                                <div key={token._id} className="bg-slate-900/50 p-4 rounded-lg flex justify-between items-center border border-slate-700/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-300">
                                            {token.tokenNumber}
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-200">{token.patientName}</div>
                                            <div className="text-xs text-slate-500">Est. Wait: {token.estimatedTime ? new Date(token.estimatedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Calculating...'}</div>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded border ${token.type === 'EMERGENCY' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-slate-700 border-slate-600 text-slate-400'}`}>
                                        {token.type}
                                    </span>
                                </div>
                            ))}
                            {doctorQueue?.queue.length === 0 && (
                                <p className="text-slate-500 text-center py-4">Queue is empty</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-white text-center">Hospital Queue Registration</h2>

            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl mb-8">
                <label className="block text-sm font-medium text-slate-400 mb-2">Select Doctor / Department</label>
                <div className="flex gap-4">
                    <select
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={selectedDoctor}
                        onChange={(e) => {
                            setSelectedDoctor(e.target.value);
                            loadDoctorQueue(e.target.value); // Show queue info before joining
                        }}
                    >
                        <option value="">-- Choose Doctor --</option>
                        {doctors.map(doc => (
                            <option key={doc.id} value={doc.id}>Dr. {doc.name} - {doc.doctorDetails?.specialization}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => handleJoinQueue(false)} // Pass false for regular
                        disabled={!selectedDoctor || loading}
                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-bold transition-all"
                    >
                        {loading ? 'Joining...' : 'Get Token'}
                    </button>
                </div>
                {/* Emergency Join Option */}
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={() => handleJoinQueue(true)} // Pass true for emergency
                        disabled={!selectedDoctor || loading}
                        className="text-red-500 hover:text-red-400 text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Join as Emergency Case
                    </button>
                </div>
                {doctorQueue && (
                    <div className="mt-4 p-4 bg-slate-900/50 rounded-lg flex items-center justify-between text-sm text-slate-400">
                        <span>Waiting: <strong className="text-white">{doctorQueue.totalWaiting}</strong> patients</span>
                        <span>Current Token: <strong className="text-green-400">#{doctorQueue.activeToken?.tokenNumber || '-'}</strong></span>
                    </div>
                )}
            </div>

            <h3 className="text-xl font-bold mb-4 text-white">My Active Tokens</h3>
            <div className="grid gap-4 md:grid-cols-2">
                {myTokens.map(token => (
                    <div key={token._id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 relative overflow-hidden group hover:border-blue-500/50 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl group-hover:opacity-20 transition-all">
                            #{token.tokenNumber}
                        </div>
                        <div className="relative">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="text-slate-400 text-sm">Token Number</div>
                                    <div className="text-4xl font-black text-white">#{token.tokenNumber}</div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${token.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                                    token.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-slate-400'
                                    }`}>
                                    {token.status}
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Doctor</span>
                                    <span className="text-slate-300 font-medium">Dr. {(token as any).doctorId?.name || '...'}</span>
                                    {/* Usually doctorId is populated, but types might just say string. 
                                        In getPatientToken controller I used populate('doctorId') so it will be an object.
                                        I need to cast or fix types to handle populated fields.
                                    */}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Estimated Time</span>
                                    <span className="text-slate-300 font-medium">
                                        {token.estimatedTime ? new Date(token.estimatedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {myTokens.length === 0 && <p className="text-slate-500">You are not in any queue.</p>}
            </div>

            {/* Notification Area */}
            {myTokens.some(t => t.status === 'PENDING' && t.estimatedTime && (new Date(t.estimatedTime).getTime() - Date.now() < 15 * 60000) && (new Date(t.estimatedTime).getTime() - Date.now() > 0)) && (
                <div className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-xl shadow-2xl border border-blue-400 animate-bounce cursor-pointer" onClick={() => toast.info('Get Ready!', 'Please head to the waiting area!')}>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🔔</span>
                        <div>
                            <div className="font-bold">Your turn is near!</div>
                            <div className="text-xs text-blue-100">One of your appointments is in less than 15 minutes.</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Emergency Modal */}
            <EmergencyModal
                isOpen={showEmergencyModal}
                onClose={() => setShowEmergencyModal(false)}
                onSubmit={handleEmergencySubmit}
                loading={loading}
            />
        </div>
    );
};
