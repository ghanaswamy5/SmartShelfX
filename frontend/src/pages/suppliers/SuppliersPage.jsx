import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, RefreshCw, Mail, Phone, MapPin } from 'lucide-react';
import { supplierApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
    });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const response = await supplierApi.getAll();
            setSuppliers(response.data || []);
        } catch (error) {
            toast.error('Failed to load suppliers');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSupplier) {
                await supplierApi.update(editingSupplier.id, formData);
                toast.success('Supplier updated successfully');
            } else {
                await supplierApi.create(formData);
                toast.success('Supplier created successfully');
            }
            setShowModal(false);
            setEditingSupplier(null);
            setFormData({ name: '', contactName: '', email: '', phone: '', address: '' });
            fetchSuppliers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this supplier?')) return;
        try {
            await supplierApi.delete(id);
            toast.success('Supplier deleted successfully');
            fetchSuppliers();
        } catch (error) {
            toast.error('Failed to delete supplier');
        }
    };

    const handleEdit = (supplier) => {
        setEditingSupplier(supplier);
        setFormData({
            name: supplier.name,
            contactName: supplier.contactName || '',
            email: supplier.email || '',
            phone: supplier.phone || '',
            address: supplier.address || '',
        });
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
                    <p className="text-gray-600">Manage your product suppliers</p>
                </div>
                <button
                    onClick={() => {
                        setEditingSupplier(null);
                        setFormData({ name: '', contactName: '', email: '', phone: '', address: '' });
                        setShowModal(true);
                    }}
                    className="btn-primary flex items-center"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Supplier
                </button>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suppliers.map((supplier) => (
                    <div key={supplier.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                                {supplier.contactName && (
                                    <p className="text-sm text-gray-600">Contact: {supplier.contactName}</p>
                                )}
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEdit(supplier)}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(supplier.id)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2">
                            {supplier.email && (
                                <div className="flex items-center text-sm text-gray-600">
                                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                    {supplier.email}
                                </div>
                            )}
                            {supplier.phone && (
                                <div className="flex items-center text-sm text-gray-600">
                                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                    {supplier.phone}
                                </div>
                            )}
                            {supplier.address && (
                                <div className="flex items-start text-sm text-gray-600">
                                    <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                                    <span>{supplier.address}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">
                {supplier.productCount || 0} products
              </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="label">Contact Name</label>
                                <input
                                    type="text"
                                    value={formData.contactName}
                                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="label">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="label">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="label">Address</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="input-field"
                                    rows="3"
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingSupplier ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}