import { Menu, Bell, BellOff, User, LogOut, X, AlertTriangle, Clock, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { notificationApi, productApi } from '../../api/client';
import toast from 'react-hot-toast';
import useAuthStore from '../../context/authStore';
import { useNavigate, Link } from 'react-router-dom';

export default function Topbar({ sidebarOpen, setSidebarOpen }) {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const notificationRef = useRef(null);
    const profileRef = useRef(null);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotificationDropdown(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchData = async () => {
        try {
            const [countRes, listRes] = await Promise.all([
                notificationApi.getUnreadCount(),
                notificationApi.getAll(),
            ]);
            setUnreadCount(countRes.data.count || 0);
            setNotifications(listRes.data || []);

            const productsRes = await productApi.getAll({ size: 100 });
            const products = productsRes.data.content || [];
            const newAlerts = [];

            products.forEach(product => {
                if (product.currentStock <= product.reorderLevel) {
                    newAlerts.push({
                        id: `low-${product.id}`,
                        type: 'LOW_STOCK',
                        productName: product.name,
                        currentStock: product.currentStock,
                        reorderLevel: product.reorderLevel,
                        message: `Only ${product.currentStock} units remaining. Reorder level is ${product.reorderLevel}.`,
                    });
                }
            });

            products.forEach(product => {
                if (product.expiryDate) {
                    const expiry = new Date(product.expiryDate);
                    const now = new Date();
                    const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
                    if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
                        newAlerts.push({
                            id: `exp-${product.id}`,
                            type: 'EXPIRY',
                            productName: product.name,
                            expiryDate: product.expiryDate,
                            daysUntilExpiry: daysUntilExpiry,
                            message: `Expires in ${daysUntilExpiry} days on ${new Date(product.expiryDate).toLocaleDateString()}`,
                        });
                    }
                }
            });

            setAlerts(newAlerts);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await notificationApi.markRead(id);
            fetchData();
            toast.success('Notification marked as read');
        } catch (error) {
            toast.error('Failed to mark notification as read');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationApi.markAllRead();
            fetchData();
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'LOW_STOCK': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'EXPIRY': return <Clock className="h-4 w-4 text-red-500" />;
            default: return <Bell className="h-4 w-4 text-gray-400" />;
        }
    };

    const getAlertIcon = (type) => {
        switch (type) {
            case 'LOW_STOCK': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'EXPIRY': return <Clock className="h-4 w-4 text-red-500" />;
            default: return <Bell className="h-4 w-4 text-gray-400" />;
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString();
    };

    const totalAlerts = alerts.length;

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
            {/* Left side - Menu button with decorative dots */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <Menu className="h-5 w-5 text-gray-600" />
                </button>

                {/* Decorative Design Elements */}
                <div className="hidden lg:flex items-center space-x-3">
                    {/* Status indicator dots */}
                    <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400/60"></span>
                        <span className="w-1 h-1 rounded-full bg-green-300/40"></span>
                    </div>

                    {/* Small decorative line */}
                    <div className="h-6 w-px bg-gray-200"></div>

                    {/* Status text */}
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <Sparkles className="h-3 w-3 text-primary-400" />
                        <span className="font-medium text-gray-500">System Online</span>
                    </div>

                    {/* Small decorative line */}
                    <div className="h-6 w-px bg-gray-200"></div>

                    {/* Time display */}
                    <div className="text-xs text-gray-400 font-mono">
                        {new Date().toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        })}
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-3">
                {/* Notification Bell */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {(unreadCount > 0 || totalAlerts > 0) ? (
                            <Bell className="h-5 w-5 text-primary-600" />
                        ) : (
                            <BellOff className="h-5 w-5 text-gray-400" />
                        )}
                        {(unreadCount > 0 || totalAlerts > 0) && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium px-1">
                {unreadCount + totalAlerts > 99 ? '99+' : unreadCount + totalAlerts}
              </span>
                        )}
                    </button>

                    {showNotificationDropdown && (
                        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                            <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-xl">
                                <div className="flex items-center space-x-2">
                                    <Bell className="h-4 w-4 text-gray-600" />
                                    <span className="font-semibold text-gray-900 text-sm">Alerts & Notifications</span>
                                    {(unreadCount + totalAlerts) > 0 && (
                                        <span className="px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                      {unreadCount + totalAlerts} new
                    </span>
                                    )}
                                </div>
                                {(unreadCount > 0 || totalAlerts > 0) && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            <div className="max-h-80 overflow-y-auto">
                                {alerts.length > 0 && (
                                    <div className="border-b border-gray-100">
                                        <div className="px-3 py-2 bg-red-50/50">
                                            <span className="text-xs font-semibold text-red-600">⚠️ Alerts</span>
                                        </div>
                                        {alerts.map((alert) => (
                                            <div
                                                key={alert.id}
                                                className="p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors bg-red-50/20"
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <div className="flex-shrink-0 mt-0.5">
                                                        {getAlertIcon(alert.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between">
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {alert.productName}
                                                            </p>
                                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                                alert.type === 'LOW_STOCK'
                                                                    ? 'bg-yellow-100 text-yellow-700'
                                                                    : 'bg-red-100 text-red-700'
                                                            }`}>
                                {alert.type === 'LOW_STOCK' ? `Stock: ${alert.currentStock}` : `Expires soon`}
                              </span>
                                                        </div>
                                                        <p className="text-xs text-gray-600 mt-0.5">
                                                            {alert.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {notifications.length > 0 && (
                                    <div>
                                        <div className="px-3 py-2 bg-blue-50/50">
                                            <span className="text-xs font-semibold text-blue-600">📬 Notifications</span>
                                        </div>
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                                    !notification.isRead ? 'bg-blue-50/30' : ''
                                                }`}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <div className="flex-shrink-0 mt-0.5">
                                                        {getNotificationIcon(notification.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between">
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {notification.title}
                                                            </p>
                                                            {!notification.isRead && (
                                                                <button
                                                                    onClick={() => handleMarkRead(notification.id)}
                                                                    className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0 text-xs"
                                                                >
                                                                    ✓
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-600 mt-0.5">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {formatTime(notification.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {alerts.length === 0 && notifications.length === 0 && (
                                    <div className="p-6 text-center">
                                        <BellOff className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">No alerts or notifications</p>
                                        <p className="text-xs text-gray-400">Everything looks good!</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-2 border-t border-gray-200 bg-gray-50 rounded-b-xl text-center">
                                <button
                                    onClick={() => setShowNotificationDropdown(false)}
                                    className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                        className="flex items-center space-x-3 pl-3 border-l border-gray-200 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-gray-900">{user?.fullName || 'Admin'}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase() || 'Admin'}</p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-600">
                {user?.fullName?.charAt(0) || 'A'}
              </span>
                        </div>
                    </button>

                    {showProfileDropdown && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary-600">
                      {user?.fullName?.charAt(0) || 'A'}
                    </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{user?.fullName || 'Admin'}</p>
                                        <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase() || 'Admin'}</p>
                                        <p className="text-xs text-gray-400">{user?.email || ''}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="py-2">
                                <Link
                                    to="/profile"
                                    onClick={() => setShowProfileDropdown(false)}
                                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <User className="h-4 w-4 mr-3 text-gray-400" />
                                    Profile Settings
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="h-4 w-4 mr-3 text-red-400" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}