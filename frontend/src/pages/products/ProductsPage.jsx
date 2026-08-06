import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, RefreshCw } from 'lucide-react';
import { productApi, categoryApi, supplierApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        sku: '',
        barcode: '',
        name: '',
        description: '',
        categoryId: '',
        supplierId: '',
        costPrice: '',
        sellingPrice: '',
        currentStock: '',
        reorderLevel: '',
        unit: 'pcs',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes, categoriesRes, suppliersRes] = await Promise.all([
                productApi.getAll({ size: 100 }),
                categoryApi.getAll(),
                supplierApi.getAll(),
            ]);
            setProducts(productsRes.data.content || []);
            setCategories(categoriesRes.data || []);
            setSuppliers(suppliersRes.data || []);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                costPrice: parseFloat(formData.costPrice),
                sellingPrice: parseFloat(formData.sellingPrice),
                currentStock: parseInt(formData.currentStock),
                reorderLevel: parseInt(formData.reorderLevel),
                categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
                supplierId: formData.supplierId ? parseInt(formData.supplierId) : null,
            };

            if (editingProduct) {
                await productApi.update(editingProduct.id, data);
                toast.success('Product updated successfully');
            } else {
                await productApi.create(data);
                toast.success('Product created successfully');
            }

            setShowModal(false);
            setEditingProduct(null);
            setFormData({
                sku: '',
                barcode: '',
                name: '',
                description: '',
                categoryId: '',
                supplierId: '',
                costPrice: '',
                sellingPrice: '',
                currentStock: '',
                reorderLevel: '',
                unit: 'pcs',
            });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await productApi.delete(id);
            toast.success('Product deleted successfully');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            sku: product.sku,
            barcode: product.barcode || '',
            name: product.name,
            description: product.description || '',
            categoryId: product.categoryId || '',
            supplierId: product.supplierId || '',
            costPrice: product.costPrice,
            sellingPrice: product.sellingPrice,
            currentStock: product.currentStock,
            reorderLevel: product.reorderLevel,
            unit: product.unit || 'pcs',
        });
        setShowModal(true);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-600">Manage your inventory products</p>
                </div>
                <button
                    onClick={() => {
                        setEditingProduct(null);
                        setFormData({
                            sku: '',
                            barcode: '',
                            name: '',
                            description: '',
                            categoryId: '',
                            supplierId: '',
                            costPrice: '',
                            sellingPrice: '',
                            currentStock: '',
                            reorderLevel: '',
                            unit: 'pcs',
                        });
                        setShowModal(true);
                    }}
                    className="btn-primary flex items-center"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                </button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products by name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
                <button onClick={fetchData} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                    <RefreshCw className="h-4 w-4 text-gray-600" />
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {filteredProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-mono text-gray-900">{product.sku}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{product.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{product.categoryName || '-'}</td>
                                <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.currentStock <= product.reorderLevel
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                    }`}>
                      {product.currentStock}
                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">${product.sellingPrice}</td>
                                <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {editingProduct ? 'Edit Product' : 'Add Product'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">SKU *</label>
                                    <input
                                        type="text"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">Barcode</label>
                                    <input
                                        type="text"
                                        value={formData.barcode}
                                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                            </div>

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
                                <label className="label">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input-field"
                                    rows="2"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Category</label>
                                    <select
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                        className="input-field"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Supplier</label>
                                    <select
                                        value={formData.supplierId}
                                        onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                                        className="input-field"
                                    >
                                        <option value="">Select Supplier</option>
                                        {suppliers.map((sup) => (
                                            <option key={sup.id} value={sup.id}>{sup.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Cost Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.costPrice}
                                        onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">Selling Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.sellingPrice}
                                        onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Current Stock</label>
                                    <input
                                        type="number"
                                        value={formData.currentStock}
                                        onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">Reorder Level</label>
                                    <input
                                        type="number"
                                        value={formData.reorderLevel}
                                        onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Unit</label>
                                <input
                                    type="text"
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    className="input-field"
                                    placeholder="pcs, kg, box, etc."
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
                                    {editingProduct ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}