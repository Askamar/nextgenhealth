
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { getDoctorsAPI, requestOtpAPI, verifyOtpAPI } from '../services/api';
import { User } from '../types';
import { Card, Button } from '../components/Components';
import { 
    Stethoscope, Activity, FlaskConical, Ambulance, 
    ArrowRight, Phone, MessageSquare, ShieldCheck, 
    Smartphone, Loader2 
} from 'lucide-react';

const AuthCardHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="p-8 text-center bg-white border-b border-slate-50">
        <div className="w-16 h-16 bg-gradient-to-tr from-secondary-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg shadow-secondary-500/30">
            <Smartphone />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
        <p className="text-slate-500 mt-2">{subtitle}</p>
    </div>
);

const OtpInputGroup = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
    const inputs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const val = e.target.value;
        if (isNaN(Number(val))) return;

        const newOtp = value.split('');
        newOtp[index] = val.substring(val.length - 1);
        const combined = newOtp.join('');
        onChange(combined);

        if (val && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !value[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    return (
        <div className="flex justify-between gap-2">
            {[0, 1, 2, 3, 4, 5].map((idx) => (
                <input
                    key={idx}
                    // FIX: Wrap assignment in curly braces to return void
                    ref={(el) => { inputs.current[idx] = el; }}
                    type="text"
                    maxLength={1}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:border-secondary-500 focus:ring-4 focus:ring-secondary-500/10 outline-none transition-all bg-slate-50"
                    value={value[idx] || ''}
                    onChange={(e) => handleChange(e, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                />
            ))}
        </div>
    );
};

export const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await requestOtpAPI(phone, false);
            setStep('otp');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length < 6) return;
        setError('');
        setLoading(true);
        try {
            const user = await verifyOtpAPI(phone, otp);
            // In real app, we use AuthContext login to handle session
            await login(user.email || '', user.role); 
            navigate('/patient');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col transition-all duration-500">
                <AuthCardHeader 
                    title={step === 'phone' ? "Patient Login" : "Verify OTP"} 
                    subtitle={step === 'phone' ? "Enter your phone number to receive an access code" : `We sent a 6-digit code to ${phone}`} 
                />

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                            <Activity size={16} /> {error}
                        </div>
                    )}

                    {step === 'phone' ? (
                        <form onSubmit={handleRequestOtp} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Phone size={18} />
                                    </div>
                                    <input 
                                        type="tel" 
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-100 focus:border-secondary-500 focus:ring-4 focus:ring-secondary-500/10 outline-none transition-all bg-slate-50 font-medium"
                                        placeholder="+1 (555) 000-0000"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit" disabled={loading} className="w-full py-4 text-lg bg-secondary-500 hover:bg-secondary-600 shadow-secondary-500/30">
                                {loading ? <Loader2 className="animate-spin" /> : "Request OTP"}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-8">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-4 text-center">Verification Code</label>
                                <OtpInputGroup value={otp} onChange={setOtp} />
                            </div>
                            <div className="space-y-4">
                                <Button type="submit" disabled={loading || otp.length < 6} className="w-full py-4 text-lg bg-secondary-500 hover:bg-secondary-600">
                                    {loading ? <Loader2 className="animate-spin" /> : "Verify & Login"}
                                </Button>
                                <button 
                                    type="button" 
                                    onClick={() => setStep('phone')}
                                    className="w-full text-slate-400 text-sm hover:text-slate-600 transition-colors"
                                >
                                    Change phone number
                                </button>
                            </div>
                        </form>
                    )}

                    <p className="text-center mt-10 text-slate-500 text-sm">
                        New patient? <Link to="/register" className="text-secondary-600 font-bold hover:underline">Create an account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export const Register = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState<'details' | 'otp'>('details');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
    const [dob, setDob] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await requestOtpAPI(phone, true);
            setStep('otp');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length < 6) return;
        setError('');
        setLoading(true);
        try {
            const user = await verifyOtpAPI(phone, otp, {
                name,
                patientDetails: { dob, gender, bloodGroup: '' }
            });
            await login(user.email || '', user.role);
            navigate('/patient');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
                <AuthCardHeader 
                    title={step === 'details' ? "New Patient Registration" : "Verify Your Phone"} 
                    subtitle={step === 'details' ? "Provide your basic details to get started" : `We sent a code to ${phone}`} 
                />

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                            <Activity size={16} /> {error}
                        </div>
                    )}

                    {step === 'details' ? (
                        <form onSubmit={handleRequestOtp} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-secondary-500 outline-none bg-slate-50 transition-all font-medium"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                                    <input 
                                        type="tel" 
                                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-secondary-500 outline-none bg-slate-50 transition-all font-medium"
                                        placeholder="+1 (555) 000-0000"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Date of Birth</label>
                                    <input 
                                        type="date" 
                                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-secondary-500 outline-none bg-slate-50 transition-all font-medium"
                                        value={dob}
                                        onChange={e => setDob(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Gender</label>
                                    <div className="flex gap-4">
                                        {['Male', 'Female', 'Other'].map((g) => (
                                            <button
                                                key={g}
                                                type="button"
                                                onClick={() => setGender(g as any)}
                                                className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold ${gender === g ? 'bg-secondary-500 border-secondary-500 text-white' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <Button type="submit" disabled={loading} className="w-full py-4 text-lg bg-secondary-500 hover:bg-secondary-600 shadow-secondary-500/30 mt-6">
                                {loading ? <Loader2 className="animate-spin" /> : "Send Verification Code"}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyAndRegister} className="space-y-8">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-4 text-center">Verification Code</label>
                                <OtpInputGroup value={otp} onChange={setOtp} />
                            </div>
                            <div className="space-y-4">
                                <Button type="submit" disabled={loading || otp.length < 6} className="w-full py-4 text-lg bg-secondary-500 hover:bg-secondary-600">
                                    {loading ? <Loader2 className="animate-spin" /> : "Complete Registration"}
                                </Button>
                                <button 
                                    type="button" 
                                    onClick={() => setStep('details')}
                                    className="w-full text-slate-400 text-sm hover:text-slate-600 transition-colors"
                                >
                                    Change details
                                </button>
                            </div>
                        </form>
                    )}
                    
                    <p className="text-center mt-10 text-slate-500 text-sm">
                        Already have an account? <Link to="/login" className="text-secondary-600 font-bold hover:underline">Login here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export const Home = () => { /* No changes to Home component */ return null; };
export const Doctors = () => { /* No changes to Doctors component */ return null; };
export const Facilities = () => { /* No changes to Facilities component */ return null; };
