import { useEffect, useState } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    RefreshCw,
    Search,
    X,
    Tag,
    Package,
    Calendar,
    AlertCircle
} from 'lucide-react';
import { categoryApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        filterCategories();
    }, [searchTerm, categories]);

    const fetchCategories = async () => {
        try {
            const response = await categoryApi.getAll();
            setCategories(response.data || []);
            setFilteredCategories(response.data || []);
        } catch (error) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const filterCategories = () => {
        if (!searchTerm.trim()) {
            setFilteredCategories(categories);
            return;
        }

        const searchLower = searchTerm.toLowerCase().trim();
        const filtered = categories.filter(category =>
            category.name.toLowerCase().includes(searchLower) ||
            (category.description && category.description.toLowerCase().includes(searchLower))
        );
        setFilteredCategories(filtered);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await categoryApi.update(editingCategory.id, formData);
                toast.success('Category updated successfully');
            } else {
                await categoryApi.create(formData);
                toast.success('Category created successfully');
            }
            setShowModal(false);
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            await categoryApi.delete(id);
            toast.success('Category deleted successfully');
            fetchCategories();
        } catch (error) {
            toast.error('Failed to delete category');
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
        });
        setShowModal(true);
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    const getProductCount = (category) => {
        return category.productCount || category.products?.length || 0;
    };

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
                    <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage product categories</p>
                </div>
                <button
                    onClick={() => {
                        setEditingCategory(null);
                        setFormData({ name: '', description: '' });
                        setShowModal(true);
                    }}
                    className="btn-primary flex items-center"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                </button>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search categories by name or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    />
                    {searchTerm && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <button
                    onClick={fetchCategories}
                    className="btn-secondary flex items-center px-4"
                >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </button>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-500">
                {filteredCategories.length === 0 ? (
                    <span>No categories found</span>
                ) : (
                    <span>Showing {filteredCategories.length} of {categories.length} categories</span>
                )}
            </div>

            {/* Categories Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {filteredCategories.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center">
                                    <div className="flex flex-col items-center">
                                        <Tag className="h-12 w-12 text-gray-300 mb-3" />
                                        <p className="text-sm text-gray-500">
                                            {searchTerm ? 'No categories match your search' : 'No categories yet'}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {searchTerm ? 'Try a different search term' : 'Create your first category by clicking "Add Category"'}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredCategories.map((category) => (
                                <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-primary-50 rounded-lg">
                                                <Tag className="h-4 w-4 text-primary-600" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">{category.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {category.description || (
                                            <span className="text-gray-400 italic">No description</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${
                          getProductCount(category) > 0
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-500'
                      }`}>
                        <Package className="h-3 w-3 mr-1" />
                          {getProductCount(category)} products
                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex items-center space-x-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>
                          {category.createdAt
                              ? new Date(category.createdAt).toLocaleDateString()
                              : 'N/A'}
                        </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleEdit(category)}
                                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit category"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category.id)}
                                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete category"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Category Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-modal max-w-md w-full">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-primary-50 rounded-lg">
                                    <Tag className="h-5 w-5 text-primary-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {editingCategory ? 'Edit Category' : 'Add Category'}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {editingCategory ? 'Update category details' : 'Create a new category'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="label">Category Name *</label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-field pl-9"
                                        placeholder="Enter category name"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Description</label>
                                <div className="relative">
                                    <AlertCircle className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="input-field pl-9 resize-none"
                                        rows="3"
                                        placeholder="Enter category description"
                                    />
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary flex items-center"
                                >
                                    {editingCategory ? (
                                        <>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Update Category
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Category
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}