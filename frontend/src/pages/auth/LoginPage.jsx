import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Package,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    ShieldCheck,
    Users,
    TrendingUp,
    Sparkles
} from 'lucide-react';
import useAuthStore from '../../context/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login, isLoading } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(formData.username, formData.password);
        if (result.success) {
            toast.success('Welcome back!');
            navigate('/dashboard');
        } else {
            toast.error(result.error || 'Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Brand Section (60% width) */}
            <div className="hidden lg:flex lg:w-3/5 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-12 flex-col justify-between relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl"></div>

                {/* Floating dots */}
                <div className="absolute top-20 left-20 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
                <div className="absolute bottom-40 right-20 w-3 h-3 bg-white/20 rounded-full animate-pulse delay-700"></div>
                <div className="absolute top-1/3 right-32 w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse delay-1000"></div>

                <div className="relative z-10">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Package className="h-7 w-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">SmartShelfX</span>
                    </div>

                    <div className="mt-20">
                        <h1 className="text-5xl font-bold text-white leading-tight">
                            Intelligent Inventory<br />
                            <span className="text-indigo-200">Management Platform</span>
                        </h1>
                        <p className="text-indigo-100 text-lg max-w-md mt-4 leading-relaxed">
                            Streamline your inventory operations with AI-powered insights and real-time analytics.
                        </p>

                        <div className="mt-10 space-y-4">
                            <div className="flex items-center space-x-4 text-white/90">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                    <ShieldCheck className="h-4 w-4" />
                                </div>
                                <span className="text-sm">Enterprise-grade security</span>
                            </div>
                            <div className="flex items-center space-x-4 text-white/90">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                    <TrendingUp className="h-4 w-4" />
                                </div>
                                <span className="text-sm">AI-powered forecasting & insights</span>
                            </div>
                            <div className="flex items-center space-x-4 text-white/90">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                    <Users className="h-4 w-4" />
                                </div>
                                <span className="text-sm">Multi-user role management</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center space-x-6 text-white/50 text-sm">
                        <span>© 2026 SmartShelfX</span>
                        <span className="w-px h-4 bg-white/20"></span>
                        <span className="hover:text-white/70 cursor-pointer transition-colors">Privacy Policy</span>
                        <span className="w-px h-4 bg-white/20"></span>
                        <span className="hover:text-white/70 cursor-pointer transition-colors">Terms of Service</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form (40% width) */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="text-center mb-8 lg:hidden">
                        <div className="flex items-center justify-center space-x-2 mb-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                                <Package className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-900">SmartShelfX</span>
                        </div>
                    </div>

                    <div>
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
                            <p className="text-slate-500 mt-2">Sign in to your account to continue</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                        placeholder="Enter your username"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-sm font-medium text-slate-700">Password</label>
                                    <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign in
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="text-center text-sm text-slate-600 mt-6">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
                                Create one
                            </Link>
                        </p>

                        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <p className="text-xs text-slate-500 text-center leading-relaxed">
                                <span className="block font-medium text-slate-700 mb-1">🔑 Demo Credentials</span>
                                <span className="inline-flex items-center px-3 py-1 bg-white rounded-lg border border-slate-200 mr-1.5">
                  <span className="text-slate-500 text-xs">Username:</span>
                  <span className="font-mono text-slate-700 text-xs ml-1.5 font-semibold">adminuser</span>
                </span>
                                <span className="inline-flex items-center px-3 py-1 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-xs">Password:</span>
                  <span className="font-mono text-slate-700 text-xs ml-1.5 font-semibold">password123</span>
                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}