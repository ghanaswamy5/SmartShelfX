import { useEffect, useState } from 'react';
import {
    Package,
    AlertTriangle,
    TrendingUp,
    ShoppingCart,
    DollarSign,
    Box,
    Clock,
    RefreshCw,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { dashboardApi } from '../../api/client';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import toast from 'react-hot-toast';

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        fetchDashboard();
        const interval = setInterval(fetchDashboard, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await dashboardApi.getDashboard();
            setData(response.data);
            setLastUpdated(new Date());
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-600 border-t-transparent"></div>
            </div>
        );
    }

    const { kpiSummary, revenueChart } = data;

    const stats = [
        {
            title: 'Total Revenue',
            value: `$${kpiSummary.totalRevenue.toFixed(2)}`,
            change: '+12.5%',
            icon: DollarSign,
            color: 'bg-accent-50 text-accent-600',
            trend: 'up',
        },
        {
            title: 'Total Products',
            value: kpiSummary.totalProducts,
            change: '+3.2%',
            icon: Package,
            color: 'bg-blue-50 text-blue-600',
            trend: 'up',
        },
        {
            title: 'Low Stock Items',
            value: kpiSummary.lowStockCount,
            change: '-2.1%',
            icon: AlertTriangle,
            color: 'bg-yellow-50 text-yellow-600',
            trend: 'down',
        },
        {
            title: 'Today\'s Sales',
            value: kpiSummary.todaySales,
            change: '+8.4%',
            icon: ShoppingCart,
            color: 'bg-purple-50 text-purple-600',
            trend: 'up',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-sm text-gray-500">Overview of your inventory performance</p>
                </div>
                <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-400">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
                    <button
                        onClick={fetchDashboard}
                        className="btn-secondary px-3 py-2 text-sm"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <div className="flex items-center justify-between">
                            <div className={`stat-icon ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <span className={`inline-flex items-center text-sm font-medium ${
                                stat.trend === 'up' ? 'text-accent-600' : 'text-red-600'
                            }`}>
                {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                ) : (
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                )}
                                {stat.change}
              </span>
                        </div>
                        <div className="mt-3">
                            <p className="text-sm text-slate-500">{stat.title}</p>
                            <p className="text-2xl font-bold text-slate-900 mt-0.5">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Revenue Trend</h3>
                    <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        View All →
                    </button>
                </div>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueChart.length > 0 ? revenueChart : [{ date: 'No Data', revenue: 0 }]}>
                            <defs>
                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} />
                            <YAxis stroke="#94A3B8" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    background: 'white',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#4F46E5"
                                strokeWidth={2}
                                fill="url(#revenueGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}