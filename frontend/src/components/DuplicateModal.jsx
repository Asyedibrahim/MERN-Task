import { useState, useEffect } from 'react';

const DuplicateModal = ({ duplicates, onUpdate, onCancel, isOpen }) => {
    const [editedProducts, setEditedProducts] = useState([]);

    // Initialize editedProducts when duplicates change or modal opens
    useEffect(() => {
        if (duplicates && duplicates.length > 0) {
            setEditedProducts(duplicates.map(product => ({ ...product })));
        }
    }, [duplicates, isOpen]);

    const handleChange = (index, field, value) => {
        const updated = [...editedProducts];
        updated[index] = {
            ...updated[index],
            [field]: value
        };
        setEditedProducts(updated);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Duplicate Products Found</h2>
                <p className="mb-4">Found {duplicates.length} duplicate products. Please review and update them.</p>
                
                <div className="space-y-4">
                    {editedProducts.map((product, index) => (
                        <div key={index} className="border border-gray-700 bg-gray-50 p-4 rounded">
                            <h3 className="font-semibold mb-2">{product.name}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={product.name || ''}
                                        onChange={(e) => handleChange(index, 'name', e.target.value)}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1">Unit</label>
                                    <input
                                        type="text"
                                        value={product.unit || ''}
                                        onChange={(e) => handleChange(index, 'unit', e.target.value)}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1">Category</label>
                                    <input
                                        type="text"
                                        value={product.category || ''}
                                        onChange={(e) => handleChange(index, 'category', e.target.value)}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1">Brand</label>
                                    <input
                                        type="text"
                                        value={product.brand || ''}
                                        onChange={(e) => handleChange(index, 'brand', e.target.value)}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1">Stock</label>
                                    <input
                                        type="number"
                                        value={product.stock || 0}
                                        onChange={(e) => handleChange(index, 'stock', parseInt(e.target.value) || 0)}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1">Status</label>
                                    <select
                                        value={product.status || 'In Stock'}
                                        onChange={(e) => handleChange(index, 'status', e.target.value)}
                                        className="w-full p-2 border rounded"
                                    >
                                        <option value="In Stock">In Stock</option>
                                        <option value="Out of Stock">Out of Stock</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold mb-1">Image URL</label>
                                    <input
                                        type="text"
                                        value={product.image || ''}
                                        onChange={(e) => handleChange(index, 'image', e.target.value)}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onUpdate(editedProducts)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Update All
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DuplicateModal;