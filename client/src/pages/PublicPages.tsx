import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { getDoctorsAPI, requestOtpAPI, verifyOtpAPI, registerAPI, forgotPasswordAPI, resetPasswordAPI } from '../services/api';
import { User } from '../types';
import { Card, Button } from '../components/Components';
import {
    Stethoscope, Activity, FlaskConical,
    ArrowRight, Phone, ShieldCheck,
    Smartphone, Loader2, Users, Calendar, Clock,
    Mail, Key, Lock, Fingerprint, Eye, EyeOff
} from 'lucide-react';

import heroBg from '../assets/hero_bg.png';
import { DrugInteractionChecker } from '../components/DrugInteractionChecker';
import { useToast } from '../context/ToastContext';

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
    const { login, loginWithPassword, user } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const getDashboardPath = (role: Role) => {
        switch (role) {
            case Role.PATIENT: return '/patient';
            case Role.DOCTOR: return '/doctor';
            case Role.ADMIN: return '/admin';
            default: return '/';
        }
    };

    useEffect(() => {
        if (user) {
            navigate(getDashboardPath(user.role));
        }
    }, [user, navigate]);

    // Login Methods: 'password' | 'otp'
    const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');

    // OTP State
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');

    // Password State
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

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
            await login(user.email || '', user.role);
            navigate(getDashboardPath(user.role));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await loginWithPassword(identifier, password);
            toast.success('Welcome back!', `Logged in as ${user.name}`);
            navigate(getDashboardPath(user.role));
        } catch (err: any) {
            setError(err.message);
            toast.error('Login Failed', err.message || 'Please check your credentials');
        } finally {
            setLoading(false);
        }
    };

    const handlePasskeyLogin = () => {
        toast.info('Passkey Login', 'Passkey authentication initiated...');
        // In real implementation:
        // navigator.credentials.get({ publicKey: ... })
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col transition-all duration-500">
                <AuthCardHeader
                    title={loginMethod === 'otp' ? (step === 'phone' ? "Login" : "Verify OTP") : "Welcome Back"}
                    subtitle={loginMethod === 'otp' ? "Login with your mobile number" : "Login with email, phone or passkey"}
                />

                {/* Login Method Tabs */}
                <div className="flex border-b border-slate-100">
                    <button
                        className={`flex-1 py-4 text-sm font-bold transition-colors ${loginMethod === 'password' ? 'text-secondary-600 border-b-2 border-secondary-500' : 'text-slate-400 hover:text-slate-600'}`}
                        onClick={() => setLoginMethod('password')}
                    >
                        Password / Passkey
                    </button>
                    <button
                        className={`flex-1 py-4 text-sm font-bold transition-colors ${loginMethod === 'otp' ? 'text-secondary-600 border-b-2 border-secondary-500' : 'text-slate-400 hover:text-slate-600'}`}
                        onClick={() => setLoginMethod('otp')}
                    >
                        Mobile OTP
                    </button>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                            <Activity size={16} /> {error}
                        </div>
                    )}

                    {loginMethod === 'password' ? (
                        <div className="space-y-6">
                            <form onSubmit={handlePasswordLogin} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Email or Phone</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-100 focus:border-secondary-500 focus:ring-4 focus:ring-secondary-500/10 outline-none transition-all bg-slate-50 font-medium"
                                            placeholder="john@example.com or +1555..."
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="w-full pl-12 pr-12 py-4 rounded-xl border-2 border-slate-100 focus:border-secondary-500 focus:ring-4 focus:ring-secondary-500/10 outline-none transition-all bg-slate-50 font-medium"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <div className="text-right mt-2">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/forgot-password')}
                                            className="text-sm font-medium text-secondary-600 hover:text-secondary-700 hover:underline"
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>
                                </div>
                                <Button type="submit" disabled={loading} className="w-full py-4 text-lg bg-secondary-500 hover:bg-secondary-600 shadow-secondary-500/30">
                                    {loading ? <Loader2 className="animate-spin" /> : "Login"}
                                </Button>
                            </form>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-slate-500">Or continue with</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePasskeyLogin}
                                className="w-full py-4 rounded-xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all font-bold text-slate-700 flex items-center justify-center gap-2"
                            >
                                <Fingerprint size={20} className="text-secondary-500" />
                                Sign in with Passkey
                            </button>
                        </div>
                    ) : (
                        // Existing OTP Flow
                        step === 'phone' ? (
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
                        )
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <div className="text-xs text-slate-400 font-semibold mb-3 tracking-wider uppercase text-center">Demo Credentials</div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => { setIdentifier('admin@medicore.com'); setPassword('123456'); setLoginMethod('password'); }}>
                                <div className="font-bold text-slate-700">Admin</div>
                                <div className="text-slate-500 truncate">admin@medicore.com</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => { setIdentifier('john.smith@medicore.com'); setPassword('123456'); setLoginMethod('password'); }}>
                                <div className="font-bold text-slate-700">Doctor</div>
                                <div className="text-slate-500 truncate">john.smith@medicore.com</div>
                            </div>
                        </div>
                    </div>

                    <p className="text-center mt-6 text-slate-500 text-sm">
                        New patient? <Link to="/register" className="text-secondary-600 font-bold hover:underline">Create an account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

// Direct Registration Flow (No OTP for initial test)
export const Register = () => {
    // const { login } = useAuth(); // Not logging in automatically anymore
    const navigate = useNavigate();
    // Removed 'otp' step
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
    const [dob, setDob] = useState('');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // New Fields State
    const [addressStreet, setAddressStreet] = useState('');
    const [addressCity, setAddressCity] = useState('');
    const [addressState, setAddressState] = useState('');
    const [addressPincode, setAddressPincode] = useState('');
    const [govIdType, setGovIdType] = useState('');
    const [govIdNumber, setGovIdNumber] = useState('');

    const [captchaInput, setCaptchaInput] = useState('');
    const [captchaValue, setCaptchaValue] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        regenerateCaptcha();
    }, []);

    const regenerateCaptcha = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptchaValue(result);
        setCaptchaInput('');
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (captchaInput !== captchaValue) {
            setError('Invalid Captcha. Please try again.');
            regenerateCaptcha();
            return;
        }

        setLoading(true);

        try {
            // Calculate Age
            const birthDate = new Date(dob);
            const ageDifMs = Date.now() - birthDate.getTime();
            const ageDate = new Date(ageDifMs);
            const age = Math.abs(ageDate.getUTCFullYear() - 1970);

            // Call Register API directly
            await registerAPI({
                phone,
                name,
                email,
                password,
                address: {
                    street: addressStreet,
                    city: addressCity,
                    state: addressState,
                    pincode: addressPincode
                },
                patientDetails: {
                    dob,
                    age,
                    gender,
                    bloodGroup: '',
                    govId: govIdType ? { type: govIdType, number: govIdNumber } : undefined
                }
            });

            // On success
            alert('Registration Successful! Please login with your credentials.');
            navigate('/login');

        } catch (err: any) {
            setError(err.message);
            regenerateCaptcha();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
                <AuthCardHeader
                    title="New Patient Registration"
                    subtitle="Provide your basic details to create an account"
                />

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                            <Activity size={16} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-6">
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

                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-secondary-500 outline-none bg-slate-50 transition-all font-medium"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Retype Password</label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-secondary-500 outline-none bg-slate-50 transition-all font-medium"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address <span className="text-slate-400 font-normal">(Optional)</span></label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-secondary-500 outline-none bg-slate-50 transition-all font-medium"
                                    placeholder="john@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
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

                            <div className="md:col-span-2 border-t pt-4 border-slate-100">
                                <h4 className="font-bold text-slate-800 mb-4">Address Details</h4>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Address Line</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-secondary-500 outline-none bg-slate-50 transition-all font-medium"
                                    placeholder="123 Main St"
                                    name="address_street"
                                    value={addressStreet}
                                    onChange={e => setAddressStreet(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">City</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-secondary-500 outline-none bg-slate-50 transition-all font-medium"
                                    placeholder="New York"
                                    value={addressCity}
                                    onChange={e => setAddressCity(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">State</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-secondary-500 outline-none bg-slate-50 transition-all font-medium"
                                    placeholder="NY"
                                    value={addressState}
                                    onChange={e => setAddressState(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Pincode</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-secondary-500 outline-none bg-slate-50 transition-all font-medium"
                                    placeholder="10001"
                                    value={addressPincode}
                                    onChange={e => setAddressPincode(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="md:col-span-2 border-t pt-4 border-slate-100">
                                <h4 className="font-bold text-slate-800 mb-4">Optional Details</h4>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Government ID Type</label>
                                <select
                                    name="govId_type"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-secondary-500 outline-none bg-slate-50 transition-all font-medium"
                                    value={govIdType}
                                    onChange={e => setGovIdType(e.target.value)}
                                >
                                    <option value="">Select ID Type</option>
                                    <option value="Aadhaar">Aadhaar Card</option>
                                    <option value="PAN">PAN Card</option>
                                    <option value="Passport">Passport</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">ID Number</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-secondary-500 outline-none bg-slate-50 transition-all font-medium"
                                    placeholder="XXXX-XXXX-XXXX"
                                    value={govIdNumber}
                                    onChange={e => setGovIdNumber(e.target.value)}
                                />
                            </div>

                            <div className="md:col-span-2 border-t pt-4 border-slate-100">
                                <h4 className="font-bold text-slate-800 mb-4">Verification</h4>
                                <div className="flex flex-col md:flex-row gap-4 items-center">
                                    <div className="bg-slate-100 p-4 rounded-xl font-mono text-2xl font-bold tracking-widest text-slate-700 select-none w-full md:w-auto text-center">
                                        {captchaValue}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={regenerateCaptcha}
                                        className="text-secondary-600 hover:text-secondary-700 font-medium text-sm"
                                    >
                                        Refresh
                                    </button>
                                    <div className="flex-1 w-full">
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-secondary-500 outline-none bg-slate-50 transition-all font-medium"
                                            placeholder="Enter Captcha"
                                            value={captchaInput}
                                            onChange={e => setCaptchaInput(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full py-4 text-lg bg-secondary-500 hover:bg-secondary-600 shadow-secondary-500/30 mt-6">
                            {loading ? <Loader2 className="animate-spin" /> : "Register & Create Account"}
                        </Button>
                    </form>

                    <p className="text-center mt-10 text-slate-500 text-sm">
                        Already have an account? <Link to="/login" className="text-secondary-600 font-bold hover:underline">Login here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export const Home = () => {
    return (
        <div className="flex flex-col w-full">
            {/* Hero Section */}
            <section className="relative min-h-[95vh] flex items-center relative overflow-hidden">
                {/* Background Image & Overlays */}
                <div className="absolute inset-0 z-0">
                    <img src={heroBg} className="w-full h-full object-cover" alt="Hospital Background" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-20">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-primary-300 font-semibold text-sm mb-8 border border-white/20 shadow-lg">
                                <Activity size={16} className="text-primary-400" />
                                <span>#1 Modern Hospital Management System</span>
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-8 drop-shadow-lg tracking-tight">
                                Smart Healthcare for a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-teal-400">Better Tomorrow</span>
                            </h1>

                            <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
                                Experience the future of medical care with MediCore. Streamlined appointments, expert doctors, and world-class facilities at your fingertips.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                                <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-primary-500/25 hover:scale-105 transition-all duration-300">
                                    Book Appointment <ArrowRight size={20} />
                                </Link>
                                <Link to="/doctors" className="inline-flex items-center justify-center gap-2 px-8 py-5 bg-white/5 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all hover:scale-105">
                                    Find a Doctor
                                </Link>
                            </div>

                            <div className="mt-16 flex items-center justify-center lg:justify-start gap-8 opacity-90">
                                <div className="flex -space-x-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-xs font-bold text-slate-300 shadow-lg">
                                            {i === 4 ? '2k+' : ''}
                                        </div>
                                    ))}
                                </div>
                                <div className="text-sm font-medium text-slate-300">
                                    Trusted by <span className="text-white font-bold text-lg">2,000+</span> patients
                                    <div className="flex text-amber-400 gap-0.5 mt-1">
                                        {[1, 2, 3, 4, 5].map(s => <span key={s}>★</span>)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-1/2 relative hidden lg:block">
                            <div className="relative z-10 grid grid-cols-2 gap-6 perspective-1000">
                                <div className="space-y-6 mt-12">
                                    <div className="p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 hover:bg-white/20 transition-all duration-300 shadow-2xl hover:-translate-y-2 group">
                                        <div className="w-14 h-14 bg-gradient-to-br from-red-500/20 to-red-500/5 text-red-400 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                            <Phone size={28} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Emergency</h3>
                                        <p className="text-slate-400 text-sm">24/7 Rapid Response Team ready to help.</p>
                                    </div>
                                    <div className="p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 hover:bg-white/20 transition-all duration-300 shadow-2xl hover:-translate-y-2 group">
                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-500/5 text-blue-400 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                            <Stethoscope size={28} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Best Doctors</h3>
                                        <p className="text-slate-400 text-sm">Certified specialists from round the globe.</p>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 hover:bg-white/20 transition-all duration-300 shadow-2xl hover:-translate-y-2 group">
                                        <div className="w-14 h-14 bg-gradient-to-br from-teal-500/20 to-teal-500/5 text-teal-400 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                            <ShieldCheck size={28} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Secure Data</h3>
                                        <p className="text-slate-400 text-sm">Encrypted records ensuring 100% privacy.</p>
                                    </div>
                                    <div className="p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 hover:bg-white/20 transition-all duration-300 shadow-2xl hover:-translate-y-2 group">
                                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-purple-500/5 text-purple-400 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                            <FlaskConical size={28} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Advanced Lab</h3>
                                        <p className="text-slate-400 text-sm">State-of-the-art testing & diagnostics.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Drug Interaction Checker Section */}
            <section className="py-20 bg-slate-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-200/[0.04] mask-image-gradient-b"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-bold text-sm mb-6 border border-blue-100">
                            <ShieldCheck size={16} />
                            <span>Patient Safety First</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Check Your Medicine Interactions</h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Stay safe by checking if your medicines interact with each other. Our smart system helps you avoid harmful combinations.
                        </p>
                    </div>

                    <DrugInteractionChecker />
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { label: 'Happy Patients', value: '15,000+', icon: Users, color: 'text-primary-600', bg: 'bg-primary-50' },
                        { label: 'Expert Doctors', value: '150+', icon: Stethoscope, color: 'text-secondary-600', bg: 'bg-secondary-50' },
                        { label: 'Hospital Rooms', value: '500+', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
                        { label: 'Awards Won', value: '25+', icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
                    ].map((stat, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors cursor-default">
                            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                                <stat.icon size={28} />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                                <div className="text-sm font-medium text-slate-500">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Services / Features */}
            <section className="py-24 bg-slate-50 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Comprehensive Care for You</h2>
                        <p className="text-lg text-slate-600">We provide a wide range of medical services to ensure your health and well-being are always prioritized.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: 'General Medicine', desc: 'Comprehensive healthcare for adults, covering diagnosis, treatment, and prevention.', icon: Activity, color: 'blue' },
                            { title: 'Pediatrics', desc: 'Specialized medical care for infants, children, and adolescents.', icon: Users, color: 'green' },
                            { title: 'Cardiology', desc: 'Advanced cardiac care with state-of-the-art diagnostic and treatment facilities.', icon: Activity, color: 'red' },
                            { title: 'Neurology', desc: 'Expert care for disorders of the nervous system, including brain and spinal cord.', icon: Activity, color: 'purple' },
                            { title: 'Orthopedics', desc: 'Treatment for conditions involving the musculoskeletal system.', icon: Activity, color: 'amber' },
                            { title: 'Dental Care', desc: 'Complete dental solution for you and your family.', icon: Activity, color: 'teal' },
                        ].map((service, idx) => (
                            <div key={idx} className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100">
                                <div className={`w-14 h-14 bg-${service.color}-50 text-${service.color}-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <service.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary-600 transition-colors">{service.title}</h3>
                                <p className="text-slate-500 leading-relaxed">{service.desc}</p>
                                <Link to="/facilities" className="inline-flex items-center gap-2 text-primary-600 font-bold mt-6 hover:gap-3 transition-all">
                                    Learn more <ArrowRight size={16} />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-primary-500/25">
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-black/10 rounded-full blur-3xl"></div>

                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to prioritize your health?</h2>
                            <p className="text-xl text-primary-50 mb-10">Book an appointment today with our expert doctors and take the first step towards a healthier life.</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/register" className="inline-block px-10 py-4 bg-white text-primary-600 rounded-xl font-bold text-lg hover:bg-slate-50 transition-colors shadow-lg">
                                    Book Now
                                </Link>
                                {/* Optional Contact Link */}
                                <button className="inline-block px-10 py-4 bg-primary-700 text-white border border-primary-500 rounded-xl font-bold text-lg hover:bg-primary-800 transition-colors">
                                    Contact Us
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div >
    );
};
export const ForgotPassword = () => {
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await forgotPasswordAPI(identifier);
            // Navigate to reset password page with identifier in state
            navigate('/reset-password', { state: { identifier } });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
                <AuthCardHeader
                    title="Forgot Password"
                    subtitle="Enter your email or phone to receive a reset code"
                />
                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                            <Activity size={16} /> {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Email or Phone</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-secondary-500 outline-none bg-slate-50 transition-all font-medium"
                                placeholder="john@example.com or +1555..."
                                value={identifier}
                                onChange={e => setIdentifier(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full py-4 text-lg bg-secondary-500 hover:bg-secondary-600 shadow-secondary-500/30">
                            {loading ? <Loader2 className="animate-spin" /> : "Send Reset Code"}
                        </Button>
                    </form>
                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-secondary-600 font-bold hover:underline">Back to Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Get identifier from navigation state or fallback to prompt (though prompt is not ideal UI)
    const [identifier, setIdentifier] = useState(location.state?.identifier || '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (!identifier) {
            setError("Missing identifier (email/phone). Please start over.");
            return;
        }

        setLoading(true);
        try {
            await resetPasswordAPI(identifier, otp, newPassword);
            alert('Password reset successful! Please login with your new password.');
            navigate('/login');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
                <AuthCardHeader
                    title="Reset Password"
                    subtitle="Enter the code sent to you and your new password"
                />
                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                            <Activity size={16} /> {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!location.state?.identifier && (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Email or Phone</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-secondary-500 outline-none bg-slate-50 transition-all font-medium"
                                    placeholder="Confirm your identifier"
                                    value={identifier}
                                    onChange={e => setIdentifier(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Verification Code</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-secondary-500 outline-none bg-slate-50 transition-all font-medium"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-secondary-500 outline-none bg-slate-50 transition-all font-medium"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-secondary-500 outline-none bg-slate-50 transition-all font-medium"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full py-4 text-lg bg-secondary-500 hover:bg-secondary-600 shadow-secondary-500/30">
                            {loading ? <Loader2 className="animate-spin" /> : "Reset Password"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export { Doctors } from './Doctors';
export { Facilities } from './Facilities';
export { About } from './About';
export { Contact } from './Contact';
