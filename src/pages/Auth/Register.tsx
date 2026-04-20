import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../services/auth.service';
import { Mail, Lock, User, Loader2, ArrowRight, UserPlus } from 'lucide-react';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await register(formData);
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 py-12 md:py-24 text-[#0f172a] relative">
            {/* Subtle background glow for premium feel */}
            <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-50/50 to-transparent -z-10" />

            <div className="w-full max-w-[540px] z-10 animate-in fade-in zoom-in duration-500">
                <div className="bg-white p-10 md:p-12 pb-12 md:pb-16 rounded-[32px] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    
                    {/* Header Block (24px spacing) */}
                    <div className="flex flex-col items-center mb-10 text-center">
                        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-600/20">
                            <UserPlus className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-[32px] font-extrabold tracking-tight text-slate-900 leading-tight">Create Account</h1>
                        <p className="text-slate-500 mt-2 font-medium text-[15px]">Join LetsCrack and start your CELPIP prep</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold mb-6">
                                {error}
                            </div>
                        )}

                        {/* Name Grid (16px spacing) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[12px] font-bold uppercase tracking-widest text-slate-500 ml-1">First Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                    <input
                                        name="firstName"
                                        required
                                        className="w-full h-[52px] bg-white border border-slate-300 rounded-2xl pl-12 pr-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-medium text-slate-900 placeholder:text-slate-400 shadow-sm"
                                        placeholder="John"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[12px] font-bold uppercase tracking-widest text-slate-500 ml-1">Last Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                    <input
                                        name="lastName"
                                        required
                                        className="w-full h-[52px] bg-white border border-slate-300 rounded-2xl pl-12 pr-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-medium text-slate-900 placeholder:text-slate-400 shadow-sm"
                                        placeholder="Doe"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Email Address */}
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full h-[52px] bg-white border border-slate-300 rounded-2xl pl-12 pr-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-medium text-slate-900 placeholder:text-slate-400 shadow-sm"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold uppercase tracking-widest text-slate-500 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full h-[52px] bg-white border border-slate-300 rounded-2xl pl-12 pr-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-medium text-slate-900 placeholder:text-slate-400 shadow-sm"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* CTA Block (24px/32px spacing) */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-[56px] bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/10 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Creating Account...</span>
                                    </>
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Footer Block */}
                    <div className="mt-10 text-center border-t border-slate-100 pt-8">
                        <p className="text-slate-500 text-[14px] font-medium">
                            Already have an account?{' '}
                            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold ml-1 transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;