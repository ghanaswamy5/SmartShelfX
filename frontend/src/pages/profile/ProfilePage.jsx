import { useState, useEffect } from 'react';
import { User, Mail, Phone, Key, Save, RefreshCw } from 'lucide-react';
import { authApi } from '../../api/client';
import useAuthStore from '../../context/authStore';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const { user, updateUser } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await authApi.updateProfile(formData);
            updateUser(response.data);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await authApi.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            toast.success('Password changed successfully');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                <p className="text-gray-600">Manage your account settings</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-600">
                {user?.fullName?.charAt(0) || 'U'}
              </span>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{user?.fullName}</h2>
                            <p className="text-sm text-gray-600">{user?.role}</p>
                            <p className="text-sm text-gray-500">@{user?.username}</p>
                        </div>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div>
                            <label className="label">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="input-field pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="label">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input-field pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="label">Phone</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="input-field pl-10"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary flex items-center justify-center disabled:opacity-50"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? 'Saving...' : 'Update Profile'}
                        </button>
                    </form>
                </div>

                {/* Change Password */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="label">Current Password</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="input-field pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="label">New Password</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="input-field pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="label">Confirm New Password</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="input-field pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary flex items-center justify-center disabled:opacity-50"
                        >
                            <Key className="h-4 w-4 mr-2" />
                            {loading ? 'Changing...' : 'Change Password'}
                        </button>
                    </form>

                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-800">
                            Password must be at least 6 characters long.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}