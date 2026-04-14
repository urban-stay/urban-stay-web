import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Mail, Lock, KeyRound, ArrowLeft, Shield,
    Eye, EyeOff, CheckCircle2, AlertCircle, RefreshCw, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from '../../config';

// ── API helpers ───────────────────────────────────────────────────────────────
const API_BASE = BASE_URL ?? 'http://localhost:8080';

const forgotPasswordAPI = (email: string) =>
    axios.post(`${API_BASE}/auth/forgot-password`, { email });

const verifyOtpAPI = (email: string, otp: string) =>
    axios.post(`${API_BASE}/auth/verify-otp`, { email, otp });

const resetPasswordAPI = (email: string, otp: string, newPassword: string) =>
    axios.post(`${API_BASE}/auth/reset-password`, { email, otp, newPassword });

// ── Types ─────────────────────────────────────────────────────────────────────
type Step = 'email' | 'otp' | 'password' | 'success';

// ── OTP Input component ───────────────────────────────────────────────────────
const OtpInput: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
    console.log(value);

    const digits = value.split('').concat(Array(6).fill('')).slice(0, 6);

    const handleChange = (index: number, char: string) => {
        if (!/^\d?$/.test(char)) return;
        const next = digits.map((d, i) => (i === index ? char : d));
        onChange(next.join('').replace(/\s/g, '').slice(0, 6));

        // auto-focus next
        if (char && index < 5) {
            (document.getElementById(`otp-${index + 1}`) as HTMLInputElement)?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            (document.getElementById(`otp-${index - 1}`) as HTMLInputElement)?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        onChange(pasted);
        e.preventDefault();
    };

    return (
        <div className="flex justify-center gap-3" onPaste={handlePaste}>
            {Array.from({ length: 6 }).map((_, i) => (
                <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digits[i] === ' ' ? '' : digits[i]}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-white/10 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:bg-white/15 transition-all caret-transparent"
                />
            ))}
        </div>
    );
};

// ── Main component ────────────────────────────────────────────────────────────
const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(0);

    // ── Step 1: Send OTP ─────────────────────────────────────────────────────
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const emailLower = email.trim().toLowerCase();
            await forgotPasswordAPI(emailLower);
            setStep('otp');
            startCountdown();
        } catch (err: any) {
            setError(err?.response?.data?.error ?? 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // ── Step 2: Verify OTP ───────────────────────────────────────────────────
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log(otp);

        const cleanOtp = otp.replace(/\s/g, '');
        if (cleanOtp.length < 6 || !/^\d{6}$/.test(cleanOtp)) {
            setError('Please enter the complete 6-digit OTP.');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            await verifyOtpAPI(email, otp);
            setStep('password');
        } catch (err: any) {
            setError(err?.response?.data?.error ?? 'Invalid or expired OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    // ── Step 3: Reset password ───────────────────────────────────────────────
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPass) { setError('Passwords do not match.'); return; }
        if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
        setError('');
        setIsLoading(true);
        try {
            await resetPasswordAPI(email, otp, newPassword);
            setStep('success');
        } catch (err: any) {
            setError(err?.response?.data?.error ?? 'Failed to reset password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // ── Resend OTP ───────────────────────────────────────────────────────────
    const handleResend = async () => {
        if (countdown > 0) return;
        setError('');
        setIsLoading(true);
        try {
            await forgotPasswordAPI(email);
            setOtp('');
            startCountdown();
        } catch (err: any) {
            setError(err?.response?.data?.error ?? 'Failed to resend OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const startCountdown = () => {
        setCountdown(60);
        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) { clearInterval(interval); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    // ── Progress indicator ───────────────────────────────────────────────────
    const steps = [
        { id: 'email', label: 'Email', icon: Mail },
        { id: 'otp', label: 'Verify', icon: KeyRound },
        { id: 'password', label: 'Reset', icon: Lock },
    ];
    const stepIndex = steps.findIndex(s => s.id === step);

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Background — matches AdminLogin exactly */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
                <div className="absolute inset-0" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }} />
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
                        style={{
                            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`, animationDuration: `${5 + Math.random() * 10}s`
                        }} />
                ))}
            </div>

            {/* Card */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md animate-slide-in-right">

                    {/* Back to Login */}
                    <button
                        onClick={() => navigate('/login')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to Login</span>
                    </button>

                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8 lg:p-10 space-y-8">

                        {/* Header */}
                        <div className="text-center space-y-3">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg mb-4">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-white">Forgot Password</h2>
                            <p className="text-slate-300 text-sm">
                                {step === 'email' && "We'll send a one-time code to your email."}
                                {step === 'otp' && `Enter the 6-digit code sent to ${email}`}
                                {step === 'password' && 'Create a new secure password.'}
                                {step === 'success' && 'Your password has been reset!'}
                            </p>
                        </div>

                        {/* Progress Steps (hide on success) */}
                        {step !== 'success' && (
                            <div className="flex items-center justify-center gap-2">
                                {steps.map((s, i) => {
                                    const Icon = s.icon;
                                    const active = i === stepIndex;
                                    const complete = i < stepIndex;
                                    return (
                                        <React.Fragment key={s.id}>
                                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${complete ? 'bg-green-500/30 text-green-300 border border-green-500/40' :
                                                active ? 'bg-purple-500/40 text-purple-200 border border-purple-500/60' :
                                                    'bg-white/5 text-slate-500 border border-white/10'
                                                }`}>
                                                <Icon className="w-3.5 h-3.5" />
                                                {s.label}
                                            </div>
                                            {i < steps.length - 1 && (
                                                <div className={`h-px w-6 transition-all duration-500 ${i < stepIndex ? 'bg-green-500/60' : 'bg-white/10'}`} />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/50 rounded-xl animate-shake">
                                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                                <p className="text-sm text-red-200">{error}</p>
                            </div>
                        )}

                        {/* ── STEP 1: Email ── */}
                        {step === 'email' && (
                            <form onSubmit={handleSendOtp} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-white/90">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                            autoFocus
                                            className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            placeholder="admin@hostel.com"
                                        />
                                    </div>
                                </div>

                                <SubmitButton isLoading={isLoading} label="Send OTP" />
                            </form>
                        )}

                        {/* ── STEP 2: OTP ── */}
                        {step === 'otp' && (
                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                <div className="space-y-4">
                                    <label className="block text-sm font-semibold text-white/90 text-center">
                                        Enter 6-digit OTP
                                    </label>
                                    <OtpInput value={otp} onChange={setOtp} />
                                    <p className="text-center text-xs text-slate-500">You can also paste the code directly</p>
                                </div>

                                <SubmitButton isLoading={isLoading} label="Verify OTP" />

                                {/* Resend */}
                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={countdown > 0 || isLoading}
                                        className="inline-flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => { setStep('email'); setOtp(''); setError(''); }}
                                    className="w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    ← Change email address
                                </button>
                            </form>
                        )}

                        {/* ── STEP 3: New Password ── */}
                        {step === 'password' && (
                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-white/90">New Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            required
                                            autoFocus
                                            minLength={6}
                                            className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            placeholder="Min. 6 characters"
                                        />
                                        <button type="button" onClick={() => setShowPass(p => !p)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                                            {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-white/90">Confirm Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
                                        <input
                                            type={showConfirm ? 'text' : 'password'}
                                            value={confirmPass}
                                            onChange={e => setConfirmPass(e.target.value)}
                                            required
                                            className={`w-full pl-12 pr-12 py-4 bg-white/10 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${confirmPass && confirmPass !== newPassword ? 'border-red-500/60' : 'border-white/20'
                                                }`}
                                            placeholder="Repeat new password"
                                        />
                                        <button type="button" onClick={() => setShowConfirm(p => !p)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                                            {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {confirmPass && confirmPass !== newPassword && (
                                        <p className="text-xs text-red-400">Passwords do not match</p>
                                    )}
                                </div>

                                {/* Strength bar */}
                                <PasswordStrength password={newPassword} />

                                <SubmitButton isLoading={isLoading} label="Reset Password" />
                            </form>
                        )}

                        {/* ── STEP 4: Success ── */}
                        {step === 'success' && (
                            <div className="text-center space-y-6">
                                <div className="flex justify-center">
                                    <div className="w-20 h-20 bg-green-500/20 border border-green-500/40 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="w-10 h-10 text-green-400" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-white">Password Reset!</h3>
                                    <p className="text-slate-400 text-sm">
                                        Your password has been changed successfully. You can now log in with your new password.
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="group w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/50 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    Go to Login
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-400">
                            Need help? Contact{' '}
                            <a href="mailto:support@urbanstay.com" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
                                support@urbanstay.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.2; }
          50%       { transform: translateY(-20px) translateX(10px); opacity: 0.5; }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(50px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25%       { transform: translateX(-10px); }
          75%       { transform: translateX(10px); }
        }
        .animate-float         { animation: float linear infinite; }
        .animate-slide-in-right{ animation: slide-in-right 0.8s ease-out; }
        .animate-shake         { animation: shake 0.5s ease-in-out; }
      `}</style>
        </div>
    );
};

// ── Sub-components ────────────────────────────────────────────────────────────
const SubmitButton: React.FC<{ isLoading: boolean; label: string; disabled?: boolean }> = ({ isLoading, label, disabled }) => (
    <button
        type="submit"
        disabled={isLoading || disabled}
        className="group relative w-full py-4 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
    >
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        <span className="relative flex items-center justify-center gap-2">
            {isLoading ? (
                <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                </>
            ) : (
                <>
                    {label}
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
            )}
        </span>
    </button>
);

const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
    const getStrength = (p: string) => {
        let score = 0;
        if (p.length >= 6) score++;
        if (p.length >= 10) score++;
        if (/[A-Z]/.test(p)) score++;
        if (/[0-9]/.test(p)) score++;
        if (/[^A-Za-z0-9]/.test(p)) score++;
        return score;
    };

    if (!password) return null;
    const strength = getStrength(password);
    const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
    const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-400'];

    return (
        <div className="space-y-1.5">
            <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < strength ? colors[strength] : 'bg-white/10'}`} />
                ))}
            </div>
            <p className={`text-xs font-medium ${colors[strength].replace('bg-', 'text-')}`}>
                {labels[strength]}
            </p>
        </div>
    );
};

export default ForgotPassword;