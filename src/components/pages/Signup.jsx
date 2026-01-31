import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { Mail, Lock, Building2, User, MapPin, Loader2 } from 'lucide-react';

const Signup = () => {
    const navigate = useNavigate();
    const { signUp } = useAuth();
    const [step, setStep] = useState(1); // 1: Personal Info, 2: Organization Info
    const [accountType, setAccountType] = useState('household');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form states
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [orgName, setOrgName] = useState('');
    const [sectorType, setSectorType] = useState('Household');
    const [city, setCity] = useState('');

    const handleAccountTypeSelect = (type) => {
        setAccountType(type);
        setSectorType(type === 'household' ? 'Household' : 'Restaurant');
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const organizationData = {
                name: accountType === 'household' ? `${fullName}'s Home` : orgName,
                sector_type: sectorType,
                city: accountType === 'household' ? 'Local' : city,
            };

            const { error } = await signUp(email, password, fullName, organizationData);
            if (error) throw error;

            navigate('/');
        } catch (err) {
            setError(err.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    const sectorOptions = ['Restaurant', 'Grocery', 'Hotel', 'Donation'];

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8 animate-slide-up">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-[2rem] mb-4 shadow-2xl shadow-emerald-500/30">
                        <span className="text-4xl">🌱</span>
                    </div>
                    <h1 className="text-4xl font-black text-emerald-950 mb-2">Join FoodWaste</h1>
                    <p className="text-emerald-600 font-bold">Start reducing food waste today</p>
                </div>

                {/* Signup Form */}
                <div className="glass-card p-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    {step === 1 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-black text-emerald-950 mb-4">Choose Account Type</h3>

                            <button
                                onClick={() => handleAccountTypeSelect('household')}
                                className="w-full p-6 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 hover:border-emerald-400 rounded-2xl transition-all text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="text-4xl">🏠</div>
                                    <div>
                                        <h4 className="font-black text-emerald-950">Personal / Household</h4>
                                        <p className="text-sm text-emerald-600 font-medium">Track your family's food waste</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleAccountTypeSelect('business')}
                                className="w-full p-6 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-400 rounded-2xl transition-all text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="text-4xl">🏢</div>
                                    <div>
                                        <h4 className="font-black text-blue-950">Business / Organization</h4>
                                        <p className="text-sm text-blue-600 font-medium">For restaurants, hotels, stores, NGOs</p>
                                    </div>
                                </div>
                            </button>

                            <div className="mt-6 pt-6 border-t border-emerald-100">
                                <p className="text-center text-sm text-emerald-900/60 font-bold">
                                    Already have an account?{' '}
                                    <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-black">
                                        Sign In
                                    </Link>
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                                    <p className="text-red-600 font-bold text-sm">{error}</p>
                                </div>
                            )}

                            {/* Full Name */}
                            <div>
                                <label className="block text-xs font-black uppercase text-emerald-900/60 mb-2 px-1 tracking-wider">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="input-primary pl-12"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                            </div>

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
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-xs font-black uppercase text-emerald-900/60 mb-2 px-1 tracking-wider">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="input-primary pl-12"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Organization Fields (if business) */}
                            {accountType === 'business' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-black uppercase text-emerald-900/60 mb-2 px-1 tracking-wider">
                                            Organization Name
                                        </label>
                                        <div className="relative">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                                            <input
                                                type="text"
                                                value={orgName}
                                                onChange={(e) => setOrgName(e.target.value)}
                                                className="input-primary pl-12"
                                                placeholder="Your Restaurant/Store Name"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase text-emerald-900/60 mb-2 px-1 tracking-wider">
                                            Sector Type
                                        </label>
                                        <select
                                            value={sectorType}
                                            onChange={(e) => setSectorType(e.target.value)}
                                            className="input-primary"
                                            required
                                        >
                                            {sectorOptions.map((sector) => (
                                                <option key={sector} value={sector}>
                                                    {sector}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase text-emerald-900/60 mb-2 px-1 tracking-wider">
                                            City
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                                            <input
                                                type="text"
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                className="input-primary pl-12"
                                                placeholder="Bangalore"
                                                required
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Submit */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="btn-secondary flex-1"
                                    disabled={loading}
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-premium flex-1 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Signup;
