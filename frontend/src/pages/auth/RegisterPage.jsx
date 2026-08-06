import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Mail, Lock, User, Phone, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import useAuthStore from '../../context/authStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register, isLoading } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
        phone: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await register(formData);
        if (result.success) {
            toast.success('Account created successfully! 🎉');
            navigate('/dashboard');
        } else {
            toast.error(result.error || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-2000"></div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md p-8 border border-white/20 relative z-10 max-h-[90vh] overflow-y-auto">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur-xl opacity-50"></div>
                            <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <Package className="h-10 w-10 text-white" />
                            </div>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                        Create Account
                        <Sparkles className="h-5 w-5 text-yellow-400" />
                    </h1>
                    <p className="text-purple-200">Get started with SmartShelfX</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-purple-200 mb-2">Full Name</label>
                        <div className="relative group">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300 group-focus-within:text-white transition-colors" />
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-purple-300/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-purple-200 mb-2">Username</label>
                        <div className="relative group">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300 group-focus-within:text-white transition-colors" />
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-purple-300/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                placeholder="johndoe"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-purple-200 mb-2">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300 group-focus-within:text-white transition-colors" />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-purple-300/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                placeholder="john@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-purple-200 mb-2">Phone</label>
                        <div className="relative group">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300 group-focus-within:text-white transition-colors" />
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-purple-300/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                placeholder="+1234567890"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-purple-200 mb-2">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300 group-focus-within:text-white transition-colors" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full pl-10 pr-12 py-3 bg-white/5 border border-purple-300/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                placeholder="Min 6 characters"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-blue-600 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating account...
                            </>
                        ) : (
                            <>
                                Create Account
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-purple-200 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-white font-medium hover:text-purple-200 transition-colors underline decoration-purple-400/30 hover:decoration-purple-200">
                        Sign in
                    </Link>
                </p>

                <div className="mt-6 flex justify-center gap-1">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                </div>
            </div>
        </div>
    );
}