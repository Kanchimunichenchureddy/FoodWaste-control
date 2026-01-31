import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { Mail, Lock, Loader2 } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error } = await signIn(email, password);
            if (error) throw error;
            navigate('/');
        } catch (err) {
            setError(err.message || 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8 animate-slide-up">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-[2rem] mb-4 shadow-2xl shadow-emerald-500/30">
                        <span className="text-4xl">🌱</span>
                    </div>
                    <h1 className="text-4xl font-black text-emerald-950 mb-2">Welcome Back</h1>
                    <p className="text-emerald-600 font-bold">Sign in to reduce food waste</p>
                </div>

                {/* Login Form */}
                <div className="glass-card p-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                                <p className="text-red-600 font-bold text-sm">{error}</p>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-black uppercase text-emerald-900/60 mb-2 px-1 tracking-wider">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-primary pl-12"
                                    placeholder="your@email.com"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-black uppercase text-emerald-900/60 mb-2 px-1 tracking-wider">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-primary pl-12"
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-premium w-full py-4 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="mt-8 pt-6 border-t border-emerald-100">
                        <p className="text-center text-sm text-emerald-900/60 font-bold">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-emerald-600 hover:text-emerald-700 font-black">
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Demo Credentials */}
                <div className="mt-6 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <p className="text-xs font-black uppercase text-blue-900/60 mb-2 tracking-wider">
                        🎯 Demo Credentials
                    </p>
                    <p className="text-sm text-blue-900 font-mono">
                        Email: demo@foodwaste.com<br />
                        Password: demo123
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
