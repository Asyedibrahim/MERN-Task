import { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaSpinner, FaFileImport, FaFileExport, FaFilter, FaEdit, FaTrash, FaTimes, FaSave, FaHistory } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import DuplicateModal from '../components/DuplicateModal';
import ProductHistoryModal from './ProductHistoryModal';
import CreateProductModal from './CreateProductModal';

const ProductList = () => {

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [importLoading, setImportLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createFormData, setCreateFormData] = useState({
        name: '',
        unit: '',
        category: '',
        brand: '',
        stock: '',
        status: 'In Stock',
        image: ''
    });
    const [creating, setCreating] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        unit: '',
        category: '',
        brand: '',
        stock: '',
        status: '',
        image: ''
    });
    const [saving, setSaving] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [duplicates, setDuplicates] = useState([]);

    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await axios.get('/api/products/categories');
            setCategories(response.data.categories);
        } catch (err) {
            console.error('Error fetching categories:', err.message);
            toast.error('Failed to fetch categories');
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/products/search', {
                params: {
                    page: currentPage,
                    search: searchTerm,
                    category: categoryFilter,
                },
            });
            setProducts(response.data.products);
            setTotalPages(response.data.totalPages);
            setTotalProducts(response.data.totalProducts);
        } catch (err) {
            console.error('Error fetching products:', err.message);
            toast.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, categoryFilter]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchProducts();
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [fetchProducts]);

    const handleCreateProduct = async () => {
        setCreating(true);
        try {
            const response = await axios.post('/api/products/add-product', createFormData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.status === 201) {
                toast.success('Product created successfully!');
                setShowCreateModal(false);
                setCreateFormData({
                    name: '',
                    unit: '',
                    category: '',
                    brand: '',
                    stock: '',
                    status: 'In Stock',
                    image: ''
                });
                await fetchProducts();
                await fetchCategories();
            } else {
                toast.error('Failed to create product');
            }
        } catch (err) {
            console.error('Error creating product:', err);
            toast.error('Failed to create product');
        } finally {
            setCreating(false);
        }
    };

    // Import functionality
    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setImportLoading(true);
        
        const formData = new FormData();
        formData.append('csvFile', file);
        
        try {
            const response = await axios.post('/api/products/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        
            if (response.data.success) {
                const { added, skipped, duplicates } = response.data;
                
                if (added > 0) {
                    toast.success(`Successfully imported ${added} new products!`);
                }
                
                if (skipped > 0) {
                    toast.info(`Skipped ${skipped} duplicate products.`);
                }
                
                if (duplicates && duplicates.length > 0) {
                    setDuplicates(duplicates);
                    setShowDuplicateModal(true);
                } else {
                    await fetchProducts();
                    await fetchCategories();
                }
            } else {
                toast.error('Failed to import products');
            }
        } catch (error) {
            console.error('Import error:', error);
            toast.error('Error importing products');
        } finally {
            setImportLoading(false);
            e.target.value = '';
        }
    };

    const handleUpdateDuplicates = async (updatedProducts) => {
        try {
            setImportLoading(true);
            const response = await axios.put('/api/products/update-multiple', {
                products: updatedProducts
            });
            
            if (response.data.success) {
                toast.success(`Successfully updated ${updatedProducts.length} products!`);
                setShowDuplicateModal(false);
                await fetchProducts();
                await fetchCategories();
            } else {
                toast.error('Failed to update products');
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Error updating products');
        } finally {
            setImportLoading(false);
        }
    };

    const handleCancelDuplicates = () => {
        setShowDuplicateModal(false);
        toast.info('Duplicate products were not updated.');
    };

    const handleEditClick = (product) => {
        setEditingId(product._id);
        setEditFormData({
            name: product.name || '',
            unit: product.unit || '',
            category: product.category || '',
            brand: product.brand || '',
            stock: product.stock || '',
            status: product.status || '',
            image: product.image || ''
        });
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({
            ...editFormData,
            [name]: value
        });
    };

    const handleCancelClick = () => {
        setEditingId(null);
    };

    const handleSaveClick = async (id) => {
        setSaving(true);
        try {
            const response = await axios.put(`/api/products/${id}`, editFormData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.status === 200) {
                toast.success('Product updated successfully!');
                setProducts(products.map(product => 
                    product._id === id ? { ...product, ...editFormData } : product
                ));
                setEditingId(null);
                await fetchCategories();
            } else {
                toast.error('Failed to update product');
            }
        } catch (err) {
            console.error('Error updating product:', err);
            toast.error('Failed to update product');
        } finally {
            setSaving(false);
        }
    };

    const handleExport = async () => {
        setExportLoading(true);
        try {
            const response = await fetch('/api/products/export');
        
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'products.csv';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert('Failed to export products');
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Error exporting products');
        } finally {
            setExportLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This product will be deleted permanently!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
        try {
            await axios.delete(`/api/products/${id}`);
            toast.success('Product deleted successfully!');
            await fetchProducts();
            await fetchCategories();
        } catch (err) {
            console.error('Error deleting product:', err);
            toast.error('Failed to delete product!');
        }
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

     const handleCategoryFilter = (e) => {
        setCategoryFilter(e.target.value);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setCategoryFilter('');
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleViewHistory = (productId) => {
        setSelectedProductId(productId);
        setShowHistoryModal(true);
    };

  return (
    <div className='min-h-screen w-full mx-auto'>
        <div className="p-2 sm:p-4 lg:ml-68">

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-0">
                <h1 className="text-2xl font-bold mb-4">Product List</h1>
                {/* Import Button */}
                <div className="flex gap-4 w-full sm:w-auto">
                    <label className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 whitespace-nowrap text-center cursor-pointer flex items-center gap-2">
                        <FaFileImport />
                        Import
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleImport}
                            className="hidden"
                            disabled={importLoading}
                        />
                    </label>
                    
                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        disabled={exportLoading}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 whitespace-nowrap text-center flex items-center gap-2 disabled:opacity-50"
                    >
                        {exportLoading ? <FaSpinner className="animate-spin" /> : <FaFileExport />}
                        Export
                    </button>
                </div>
            </div>

            <div className='flex flex-col gap-4 mb-4'>
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2 border border-gray-400 rounded-md focus:outline-none"
                        />
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        {loading && (
                            <FaSpinner className="absolute right-3 top-3 text-gray-400 animate-spin" />
                        )}
                    </div>
                    {/* Category Filter Dropdown */}
                    <div className="relative w-full sm:w-48">
                        <select
                            value={categoryFilter}
                            onChange={handleCategoryFilter}
                            className="w-full pl-10 pr-4 py-2 border border-gray-400 rounded-md focus:outline-none appearance-none"
                        >
                            <option value="">All Categories</option>
                            {categories.map((category, index) => (
                                <option key={index} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                        <FaFilter className="absolute left-3 top-3 text-gray-400" />
                    </div>
                    {/* Add Product Button */}
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-950 whitespace-nowrap text-center cursor-pointer"
                    >
                        Add Product
                    </button>
                </div>

                {/* Clear Filters Button - Only show when filters are active */}
                {(searchTerm || categoryFilter) && (
                    <button 
                        onClick={clearFilters}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 self-start"
                    >
                        Clear filters
                    </button>
                )}
            </div>

            <div className="mb-4 text-sm text-gray-600">
                Showing {(currentPage - 1) * 30 + 1} - {Math.min(currentPage * 30, totalProducts)} of {totalProducts} products
            </div>

            <div className="overflow-x-auto relative">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <FaSpinner className="animate-spin text-blue-500 text-2xl" />
                    </div>
                ) : (
                    <>
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead className="bg-gray-200">
                                <tr className='text-sm text-gray-700'>
                                    <th className="px-4 py-2">S.No</th>
                                    <th className="px-4 py-2">Image</th>
                                    <th className="px-4 py-2">Name</th>
                                    <th className="px-4 py-2">Unit</th>
                                    <th className="px-4 py-2">Category</th>
                                    <th className="px-4 py-2">Brand</th>
                                    <th className="px-4 py-2">Stock</th>
                                    <th className="px-4 py-2">Status</th>
                                    <th className="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length > 0 ? (
                                    products.map((product, index) => (
                                        <tr key={product._id} className="text-center">
                                            <td className="px-4 py-2">{(currentPage - 1) * 30 + index + 1}</td>
                                            <td className="px-4 py-2">
                                                {editingId === product._id ? (
                                                    <input
                                                        type="text"
                                                        name="image"
                                                        value={editFormData.image}
                                                        onChange={handleEditFormChange}
                                                        className="w-full px-2 py-1 border rounded"
                                                    />
                                                ) : (
                                                    <img src={product.image} alt={product.name} className="h-12 w-12 object-cover mx-auto" />
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                {editingId === product._id ? (
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={editFormData.name}
                                                        onChange={handleEditFormChange}
                                                        className="w-full px-2 py-1 border rounded"
                                                    />
                                                ) : (
                                                    product.name
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                {editingId === product._id ? (
                                                    <input
                                                        type="text"
                                                        name="unit"
                                                        value={editFormData.unit}
                                                        onChange={handleEditFormChange}
                                                        className="w-full px-2 py-1 border rounded"
                                                    />
                                                ) : (
                                                    product.unit
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                {editingId === product._id ? (
                                                    <input
                                                        type="text"
                                                        name="category"
                                                        value={editFormData.category}
                                                        onChange={handleEditFormChange}
                                                        className="w-full px-2 py-1 border rounded"
                                                    />
                                                ) : (
                                                    product.category
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                {editingId === product._id ? (
                                                    <input
                                                        type="text"
                                                        name="brand"
                                                        value={editFormData.brand}
                                                        onChange={handleEditFormChange}
                                                        className="w-full px-2 py-1 border rounded"
                                                    />
                                                ) : (
                                                    product.brand
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                {editingId === product._id ? (
                                                    <input
                                                        type="number"
                                                        name="stock"
                                                        value={editFormData.stock}
                                                        onChange={handleEditFormChange}
                                                        className="w-full px-2 py-1 border rounded"
                                                    />
                                                ) : (
                                                    product.stock
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                {editingId === product._id ? (
                                                    <select
                                                        name="status"
                                                        value={editFormData.status}
                                                        onChange={handleEditFormChange}
                                                        className="w-full px-2 py-1 border rounded"
                                                    >
                                                        <option value="In Stock">In Stock</option>
                                                        <option value="Out of Stock">Out of Stock</option>
                                                    </select>
                                                ) : (
                                                    <span className={product.status === "In Stock" ? "text-green-600" : "text-red-600"}>
                                                        {product.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                {editingId === product._id ? (
                                                    <div className="flex justify-center space-x-2">
                                                        <button
                                                            onClick={() => handleSaveClick(product._id)}
                                                            disabled={saving}
                                                            className="text-green-600 hover:text-green-800"
                                                        >
                                                            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                                                        </button>
                                                        <button
                                                            onClick={handleCancelClick}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-center space-x-2">
                                                        <button
                                                            onClick={() => handleViewHistory(product._id)}
                                                            className="text-purple-600 hover:text-purple-800"
                                                            title="View History"
                                                        >
                                                            <FaHistory />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditClick(product)}
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(product._id)} 
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="px-4 py-6 text-center text-gray-500">
                                            No products found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </>
                )}
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <nav className="inline-flex rounded-md shadow">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </nav>
                </div>
            )}
        </div>

        {/* Create Product Modal */}
        <CreateProductModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            formData={createFormData}
            setFormData={setCreateFormData}
            creating={creating}
            onCreateProduct={handleCreateProduct}
        />

        {/* Duplicate Modal */}
        <DuplicateModal
            duplicates={duplicates}
            onUpdate={handleUpdateDuplicates}
            onCancel={handleCancelDuplicates}
            isOpen={showDuplicateModal}
        />

        {/* Product History Modal */}
        <ProductHistoryModal
            productId={selectedProductId}
            isOpen={showHistoryModal}
            onClose={() => setShowHistoryModal(false)}
        />
    </div>
  );
};

export default ProductList;
