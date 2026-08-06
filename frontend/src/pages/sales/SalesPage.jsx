import { useEffect, useState } from 'react';
import {
    Plus,
    RefreshCw,
    Eye,
    XCircle,
    Trash2,
    ShoppingCart,
    User,
    Mail,
    Phone,
    Percent,
    CreditCard,
    FileText,
    Search,
    Minus,
    Plus as PlusIcon,
    CheckCircle,
    AlertCircle,
    Calendar,
    DollarSign,
    Package,
    Receipt
} from 'lucide-react';
import { saleApi, productApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function SalesPage() {
    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        discountPercent: 0,
        paymentMethod: 'CASH',
        notes: '',
        items: [],
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [salesRes, productsRes] = await Promise.all([
                saleApi.getAll({ size: 100 }),
                productApi.getAll({ size: 100 }),
            ]);
            setSales(salesRes.data.content || []);
            setProducts(productsRes.data.content || []);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = () => {
        if (!selectedProduct) {
            toast.error('Please select a product');
            return;
        }

        const existingItem = formData.items.find(item => item.productId === selectedProduct.id);
        if (existingItem) {
            toast.error('Product already added');
            return;
        }

        setFormData({
            ...formData,
            items: [
                ...formData.items,
                {
                    productId: selectedProduct.id,
                    productName: selectedProduct.name,
                    sku: selectedProduct.sku,
                    quantity: 1,
                    unitPrice: selectedProduct.sellingPrice || 0,
                    discountPercent: 0,
                    totalPrice: selectedProduct.sellingPrice || 0,
                }
            ]
        });
        setSelectedProduct(null);
        setSearchTerm('');
        toast.success('Product added to sale');
    };

    const handleRemoveItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const handleItemQuantityChange = (index, quantity) => {
        if (quantity < 1) return;
        const newItems = [...formData.items];
        newItems[index].quantity = quantity;
        newItems[index].totalPrice = newItems[index].unitPrice * quantity * (1 - newItems[index].discountPercent / 100);
        setFormData({ ...formData, items: newItems });
    };

    const handleItemDiscountChange = (index, discount) => {
        const newItems = [...formData.items];
        newItems[index].discountPercent = Math.min(Math.max(discount, 0), 100);
        const price = newItems[index].unitPrice * newItems[index].quantity;
        const discountAmount = price * (newItems[index].discountPercent / 100);
        newItems[index].totalPrice = price - discountAmount;
        setFormData({ ...formData, items: newItems });
    };

    const calculateTotals = () => {
        let subtotal = 0;
        let totalDiscount = 0;

        formData.items.forEach(item => {
            const itemTotal = item.unitPrice * item.quantity;
            const discount = itemTotal * (item.discountPercent / 100);
            subtotal += itemTotal;
            totalDiscount += discount;
        });

        const afterDiscount = subtotal - totalDiscount;
        const tax = afterDiscount * 0.10;
        const total = afterDiscount + tax;

        return { subtotal, totalDiscount, tax, total };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.items.length === 0) {
            toast.error('Please add at least one product');
            return;
        }

        if (!formData.customerName.trim()) {
            toast.error('Customer name is required');
            return;
        }

        const saleData = {
            customerName: formData.customerName,
            customerEmail: formData.customerEmail,
            customerPhone: formData.customerPhone,
            discountPercent: parseFloat(formData.discountPercent) || 0,
            paymentMethod: formData.paymentMethod,
            notes: formData.notes,
            items: formData.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discountPercent: item.discountPercent || 0,
            })),
        };

        try {
            await saleApi.create(saleData);
            toast.success('Sale created successfully!');
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create sale');
        }
    };

    const resetForm = () => {
        setFormData({
            customerName: '',
            customerEmail: '',
            customerPhone: '',
            discountPercent: 0,
            paymentMethod: 'CASH',
            notes: '',
            items: [],
        });
        setSelectedProduct(null);
        setSearchTerm('');
    };

    const handleCancelSale = async (id) => {
        if (!confirm('Are you sure you want to cancel this sale?')) return;
        try {
            await saleApi.cancel(id);
            toast.success('Sale cancelled successfully');
            fetchData();
        } catch (error) {
            toast.error('Failed to cancel sale');
        }
    };

    const handleViewSale = async (id) => {
        try {
            const response = await saleApi.getById(id);
            setSelectedSale(response.data);
            setShowDetailModal(true);
        } catch (error) {
            toast.error('Failed to load sale details');
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totals = calculateTotals();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage your sales transactions</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New Sale
                </button>
            </div>

            {/* Sales Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {sales.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                    <ShoppingCart className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                    <p className="text-sm">No sales yet</p>
                                    <p className="text-xs text-gray-400 mt-1">Create your first sale by clicking the "New Sale" button</p>
                                </td>
                            </tr>
                        ) : (
                            sales.map((sale) => (
                                <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-mono text-gray-900">{sale.saleNumber}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900 capitalize">{sale.customerName}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(sale.saleDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {sale.items?.length || 0} items
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                        ${sale.totalAmount?.toFixed(2) || '0.00'}
                                    </td>
                                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          sale.paymentStatus === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : sale.paymentStatus === 'CANCELLED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {sale.paymentStatus}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleViewSale(sale.id)}
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                            title="View sale details"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        {sale.paymentStatus !== 'CANCELLED' && (
                                            <button
                                                onClick={() => handleCancelSale(sale.id)}
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                                title="Cancel sale"
                                            >
                                                <XCircle className="h-4 w-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sale Detail Modal */}
            {showDetailModal && selectedSale && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-modal max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Receipt className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Sale Details</h2>
                                    <p className="text-sm text-gray-500">#{selectedSale.saleNumber}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <XCircle className="h-5 w-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Customer Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                                        <User className="h-4 w-4" />
                                        <span>Customer</span>
                                    </div>
                                    <p className="font-medium text-gray-900 capitalize">{selectedSale.customerName}</p>
                                    {selectedSale.customerEmail && (
                                        <p className="text-sm text-gray-600">{selectedSale.customerEmail}</p>
                                    )}
                                    {selectedSale.customerPhone && (
                                        <p className="text-sm text-gray-600">{selectedSale.customerPhone}</p>
                                    )}
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>Sale Information</span>
                                    </div>
                                    <p className="text-sm text-gray-900">
                                        Date: {new Date(selectedSale.saleDate).toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-900">
                                        Payment: {selectedSale.paymentMethod}
                                    </p>
                                    <p className="text-sm text-gray-900">
                                        Status: <span className={`font-medium ${
                                        selectedSale.paymentStatus === 'COMPLETED' ? 'text-green-600' : 'text-red-600'
                                    }`}>{selectedSale.paymentStatus}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                    {selectedSale.items?.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-2.5">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                                                    <p className="text-xs text-gray-500 font-mono">{item.productSku}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2.5 text-sm text-gray-700">
                                                ${item.unitPrice.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-2.5 text-sm text-gray-700">
                                                {item.quantity}
                                            </td>
                                            <td className="px-4 py-2.5 text-sm text-gray-700">
                                                {item.discountPercent > 0 ? `${item.discountPercent}%` : '-'}
                                            </td>
                                            <td className="px-4 py-2.5 text-right text-sm font-semibold text-gray-900">
                                                ${item.totalPrice.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <div className="max-w-xs ml-auto space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-medium text-gray-900">${selectedSale.subtotal?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    {selectedSale.discountAmount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Discount:</span>
                                            <span className="text-red-600">-${selectedSale.discountAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tax (10%):</span>
                                        <span className="text-gray-900">${selectedSale.taxAmount?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                                        <span className="text-gray-900">Total:</span>
                                        <span className="text-primary-600">${selectedSale.totalAmount?.toFixed(2) || '0.00'}</span>
                                    </div>
                                </div>
                            </div>

                            {selectedSale.notes && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Notes:</span> {selectedSale.notes}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-200 flex items-center justify-end flex-shrink-0 bg-gray-50">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="btn-secondary"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Sale Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-modal max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-primary-50 rounded-lg">
                                    <ShoppingCart className="h-5 w-5 text-primary-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">New Sale</h2>
                                    <p className="text-sm text-gray-500">Create a new sales transaction</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <XCircle className="h-5 w-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Customer Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Customer Name *</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={formData.customerName}
                                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                                className="input-field pl-9"
                                                placeholder="John Doe"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label">Customer Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="email"
                                                value={formData.customerEmail}
                                                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                                className="input-field pl-9"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label">Customer Phone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="tel"
                                                value={formData.customerPhone}
                                                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                                className="input-field pl-9"
                                                placeholder="+1234567890"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label">Payment Method</label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <select
                                                value={formData.paymentMethod}
                                                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                                className="input-field pl-9 appearance-none"
                                            >
                                                <option value="CASH">Cash</option>
                                                <option value="CARD">Card</option>
                                                <option value="UPI">UPI</option>
                                                <option value="BANK_TRANSFER">Bank Transfer</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Add Product Section */}
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="flex-1 relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search products by name or SKU..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                            />
                                        </div>
                                        <select
                                            className="input-field sm:w-48"
                                            value={selectedProduct?.id || ''}
                                            onChange={(e) => {
                                                const product = products.find(p => p.id === parseInt(e.target.value));
                                                setSelectedProduct(product || null);
                                            }}
                                        >
                                            <option value="">Select product</option>
                                            {filteredProducts.map((product) => (
                                                <option key={product.id} value={product.id}>
                                                    {product.name} ({product.sku}) - ${product.sellingPrice}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={handleAddProduct}
                                            className="btn-primary flex items-center whitespace-nowrap"
                                        >
                                            <PlusIcon className="h-4 w-4 mr-1" />
                                            Add
                                        </button>
                                    </div>
                                </div>

                                {/* Items Table */}
                                {formData.items.length > 0 && (
                                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Discount %</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                                            </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                            {formData.items.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-2.5">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                                                            <p className="text-xs text-gray-500 font-mono">{item.sku}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-sm text-gray-700">
                                                        ${item.unitPrice.toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-2.5">
                                                        <div className="flex items-center space-x-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleItemQuantityChange(index, item.quantity - 1)}
                                                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                            >
                                                                <Minus className="h-3 w-3 text-gray-500" />
                                                            </button>
                                                            <span className="text-sm font-medium text-gray-900 w-8 text-center">
                                  {item.quantity}
                                </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleItemQuantityChange(index, item.quantity + 1)}
                                                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                            >
                                                                <PlusIcon className="h-3 w-3 text-gray-500" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2.5">
                                                        <input
                                                            type="number"
                                                            value={item.discountPercent}
                                                            onChange={(e) => handleItemDiscountChange(index, parseFloat(e.target.value) || 0)}
                                                            className="w-16 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                            min="0"
                                                            max="100"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right text-sm font-semibold text-gray-900">
                                                        ${item.totalPrice.toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveItem(index)}
                                                            className="text-red-500 hover:text-red-700 transition-colors"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Totals */}
                                {formData.items.length > 0 && (
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                        <div className="max-w-xs ml-auto space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Subtotal:</span>
                                                <span className="font-medium text-gray-900">${totals.subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Discount:</span>
                                                <span className="text-red-600">-${totals.totalDiscount.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Tax (10%):</span>
                                                <span className="text-gray-900">${totals.tax.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                                                <span className="text-gray-900">Total:</span>
                                                <span className="text-primary-600">${totals.total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                <div>
                                    <label className="label">Notes</label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            className="input-field pl-9 resize-none"
                                            rows="2"
                                            placeholder="Any additional notes..."
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3 flex-shrink-0 bg-gray-50">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="btn-primary flex items-center"
                                disabled={formData.items.length === 0}
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Sale
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}