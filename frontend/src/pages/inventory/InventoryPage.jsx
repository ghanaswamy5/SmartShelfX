import { useEffect, useState } from 'react';
import { RefreshCw, Package, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';
import { inventoryApi, productApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function InventoryPage() {
    const [movements, setMovements] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes] = await Promise.all([
                productApi.getAll({ size: 100 }),
            ]);
            setProducts(productsRes.data.content || []);

            if (selectedProduct) {
                const movementsRes = await inventoryApi.getByProduct(selectedProduct);
                setMovements(movementsRes.data || []);
            }
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleProductChange = async (productId) => {
        setSelectedProduct(productId);
        if (productId) {
            try {
                const response = await inventoryApi.getByProduct(productId);
                setMovements(response.data || []);
            } catch (error) {
                toast.error('Failed to load movements');
            }
        } else {
            setMovements([]);
        }
    };

    const getMovementIcon = (type) => {
        switch (type) {
            case 'IN': return <ArrowUp className="h-4 w-4 text-green-600" />;
            case 'OUT': return <ArrowDown className="h-4 w-4 text-red-600" />;
            default: return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
        }
    };

    const getMovementColor = (type) => {
        switch (type) {
            case 'IN': return 'bg-green-50 text-green-800';
            case 'OUT': return 'bg-red-50 text-red-800';
            default: return 'bg-yellow-50 text-yellow-800';
        }
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
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Inventory Movements</h1>
                <p className="text-gray-600">Track all inventory movements</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="label">Select Product</label>
                        <select
                            value={selectedProduct}
                            onChange={(e) => handleProductChange(e.target.value)}
                            className="input-field"
                        >
                            <option value="">All Products</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name} ({product.sku})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={fetchData}
                            className="btn-secondary flex items-center"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Movements Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Change</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {movements.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                    No movements found for this product
                                </td>
                            </tr>
                        ) : (
                            movements.map((movement) => (
                                <tr key={movement.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(movement.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{movement.productName}</td>
                                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMovementColor(movement.movementType)}`}>
                        {movement.movementType}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{movement.quantity}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex items-center space-x-2">
                                            {getMovementIcon(movement.movementType)}
                                            <span>
                          {movement.previousStock} → {movement.newStock}
                        </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{movement.referenceId || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{movement.username}</td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}