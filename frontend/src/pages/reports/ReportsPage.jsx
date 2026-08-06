import { useState } from 'react';
import { FileText, Download, Package, ShoppingCart, AlertTriangle } from 'lucide-react';
import { reportApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function ReportsPage() {
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });

    const handleExport = async (exportFn, filename) => {
        setLoading(true);
        try {
            const response = await exportFn();

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('Report downloaded successfully');
        } catch (error) {
            toast.error('Failed to download report');
        } finally {
            setLoading(false);
        }
    };

    const reports = [
        {
            id: 'products',
            title: 'Products Report',
            description: 'Export all products with details',
            icon: Package,
            color: 'bg-blue-500',
            action: () => handleExport(reportApi.exportProducts, 'products-report.csv'),
        },
        {
            id: 'sales',
            title: 'Sales Report',
            description: 'Export sales data for date range',
            icon: ShoppingCart,
            color: 'bg-green-500',
            action: () => handleExport(
                () => reportApi.exportSales(dateRange.startDate, dateRange.endDate),
                `sales-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`
            ),
        },
        {
            id: 'low-stock',
            title: 'Low Stock Report',
            description: 'Export all low stock products',
            icon: AlertTriangle,
            color: 'bg-yellow-500',
            action: () => handleExport(reportApi.exportLowStock, 'low-stock-report.csv'),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                <p className="text-gray-600">Export inventory reports in CSV format</p>
            </div>

            {/* Date Range Filter for Sales Report */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Sales Report Date Range</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div>
                        <label className="label">Start Date</label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                            className="input-field"
                        />
                    </div>
                    <div>
                        <label className="label">End Date</label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                            className="input-field"
                        />
                    </div>
                </div>
            </div>

            {/* Report Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {reports.map((report) => (
                    <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                                <div className={`w-12 h-12 ${report.color} rounded-xl flex items-center justify-center`}>
                                    <report.icon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{report.title}</h3>
                                    <p className="text-sm text-gray-600">{report.description}</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={report.action}
                            disabled={loading}
                            className="mt-4 w-full btn-primary flex items-center justify-center disabled:opacity-50"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            {loading ? 'Exporting...' : 'Export CSV'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-medium text-blue-900">About Reports</h4>
                        <p className="text-sm text-blue-700 mt-1">
                            All reports are exported in CSV format and can be opened in Excel, Google Sheets,
                            or any spreadsheet software. Sales reports require a date range.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}