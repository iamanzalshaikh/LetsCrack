import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../services/auth.service';
import { useAuthStore } from '../../store/useAuthStore';
import { Shield, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const data = await login({ email, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setAuth(data.user, data.token);

            if (data.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-10 md:px-6 md:py-16">
            <div
                className="pointer-events-none absolute inset-0"
                style={{ background: 'radial-gradient(900px circle at 50% 0%, rgba(59,130,246,0.12), transparent 65%)' }}
            />

            <div className="relative w-full max-w-lg">
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-900/10 md:p-10">
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-xl shadow-blue-600/30">
                            <Shield className="h-7 w-7 text-white" />
                        </div>
                        <h1 className="font-display text-5xl font-bold tracking-tight text-slate-900 max-md:text-[2.1rem]">
                            Welcome Back
                        </h1>
                        <p className="max-w-none mt-2 text-sm font-medium text-slate-500 md:text-[15px]">
                            Log in to your LetsCrack account
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-[13px] font-semibold text-slate-600">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-[13px] font-semibold text-slate-600">
                                    Password
                                </label>
                                <button type="button" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                                    Forgot?
                                </button>
                            </div>
                            <div className="relative">
                                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-65"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 border-t border-slate-100 pt-6 text-center">
                        <p className="max-w-none text-sm text-slate-500">
                            New here?{' '}
                            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
