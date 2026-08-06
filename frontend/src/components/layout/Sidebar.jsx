import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Tags,
    Users,
    ShoppingCart,
    Warehouse,
    Bot,
    FileText,
    User,
    LogOut,
    X,
    ChevronRight
} from 'lucide-react';
import useAuthStore from '../../context/authStore';
import toast from 'react-hot-toast';

const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/categories', icon: Tags, label: 'Categories' },
    { path: '/suppliers', icon: Users, label: 'Suppliers' },
    { path: '/sales', icon: ShoppingCart, label: 'Sales' },
    { path: '/inventory', icon: Warehouse, label: 'Inventory' },
    { path: '/ai', icon: Bot, label: 'AI Assistant' },
    { path: '/reports', icon: FileText, label: 'Reports' },
    { path: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar({ open, setOpen }) {
    const navigate = useNavigate();
    const { logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            <aside
                className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform ${
                    open ? 'translate-x-0' : '-translate-x-full'
                } transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between px-4 h-16 border-b border-slate-200 flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-slate-900">SmartShelfX</span>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        className="lg:hidden text-slate-400 hover:text-slate-600"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-3">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                                    isActive
                                        ? 'bg-brand-50 text-brand-600 font-medium'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={`h-5 w-5 flex-shrink-0 ${
                                        isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'
                                    }`} />
                                    <span className="ml-3 text-sm">{item.label}</span>
                                    {isActive && (
                                        <ChevronRight className="h-4 w-4 ml-auto text-brand-400" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout - Only logout, no profile */}
                <div className="p-4 border-t border-slate-200 flex-shrink-0">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors"
                    >
                        <LogOut className="h-5 w-5 text-slate-400" />
                        <span className="ml-3 text-sm">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}