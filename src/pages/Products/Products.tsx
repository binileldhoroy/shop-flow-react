import React, { useState, useEffect, useCallback } from 'react';
import { productService, categoryService } from '@api/services/product.service';
import { Product, Category, ProductFormData } from '../../types/product.types';
import ProductFormModal from '@components/features/products/ProductFormModal';
import DeleteConfirmModal from '@components/common/DeleteConfirmModal/DeleteConfirmModal';
import { useAppDispatch } from '@hooks/useRedux';
import { addNotification } from '@store/slices/uiSlice';
import { Package, Plus, Search, Edit2, Trash2, Inbox, AlertTriangle } from 'lucide-react';

const Products: React.FC = () => {
  const dispatch = useAppDispatch();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Build query params for API search
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter) params.category = categoryFilter;

      const [productsResponse, categoriesData] = await Promise.all([
        productService.getAll(params),
        categoryService.getAll(),
      ]);
      // Handle paginated response - extract results array
      const productsData = productsResponse.results || productsResponse;
      let filteredData = Array.isArray(productsData) ? productsData : [];

      // Apply stock filter on frontend (since backend doesn't have this filter)
      if (stockFilter) {
        filteredData = filteredData.filter(product => {
          if (stockFilter === 'low') return product.stock_quantity <= product.reorder_level && product.stock_quantity > 0;
          if (stockFilter === 'out') return product.stock_quantity === 0;
          if (stockFilter === 'in') return product.stock_quantity > 0;
          return true;
        });
      }

      setProducts(filteredData);
      setCategories(categoriesData);
    } catch (error: any) {
      dispatch(addNotification({
        message: error.response?.data?.message || 'Failed to load data',
        type: 'error',
      }));
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryFilter, stockFilter, dispatch]);

  // Debounced search effect - also handles initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300); // 300ms debounce (reduced from 500ms for faster response)

    return () => clearTimeout(timer);
  }, [searchTerm, categoryFilter, stockFilter, loadData]);


  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowFormModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowFormModal(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleFormSubmit = async (data: ProductFormData) => {
    try {
      setFormLoading(true);

      if (selectedProduct) {
        await productService.update(selectedProduct.id, data);
        dispatch(addNotification({
          message: 'Product updated successfully',
          type: 'success',
        }));
      } else {
        await productService.create(data);
        dispatch(addNotification({
          message: 'Product created successfully',
          type: 'success',
        }));
      }

      setShowFormModal(false);
      loadData();
    } catch (error: any) {
      dispatch(addNotification({
        message: error.response?.data?.message || 'Operation failed',
        type: 'error',
      }));
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;

    try {
      setFormLoading(true);
      await productService.delete(selectedProduct.id);
      dispatch(addNotification({
        message: 'Product deleted successfully',
        type: 'success',
      }));
      setShowDeleteModal(false);
      loadData();
    } catch (error: any) {
      dispatch(addNotification({
        message: error.response?.data?.message || 'Failed to delete product',
        type: 'error',
      }));
    } finally {
      setFormLoading(false);
    }
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-8 h-8" />
            Products
          </h1>
          <p className="text-gray-600 mt-1">Manage your product inventory</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddProduct}>
          <Plus className="w-5 h-5 inline mr-2" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="md:col-span-3">
          <select
            className="input-field"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <select
            className="input-field"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="">All Stock</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
        <div className="md:col-span-3 flex items-center justify-end">
          <span className="text-gray-600">
            {products.length} product{products.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Products Table */}
      <div className="card" style={{ height: 'calc(100vh - 320px)', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No products found</p>
          </div>
        ) : (
          <div className="table-container" style={{ flex: 1, overflow: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>HSN Code</th>
                  <th>Unit</th>
                  <th>Cost Price</th>
                  <th>Selling Price</th>
                  <th>GST Rate</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product: Product) => (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.sku}</strong>
                      {product.barcode && (
                        <div className="text-gray-500 text-xs">{product.barcode}</div>
                      )}
                    </td>
                    <td>{product.name}</td>
                    <td>
                      <span className="badge badge-secondary">
                        {getCategoryName(product.category)}
                      </span>
                    </td>
                    <td>{product.hsn_code || '-'}</td>
                    <td>
                      <span className="text-gray-600 capitalize">{product.unit || 'piece'}</span>
                    </td>
                    <td>₹{parseFloat(String(product.cost_price || 0)).toFixed(2)}</td>
                    <td>
                      <strong>₹{parseFloat(String(product.selling_price || 0)).toFixed(2)}</strong>
                    </td>
                    <td>
                      <span className="badge badge-info">{product.gst_rate || 0}%</span>
                    </td>
                    <td>
                      <span className={`badge ${
                        product.stock_quantity === 0 ? 'badge-danger' :
                        product.stock_quantity <= product.reorder_level ? 'badge-warning' :
                        'badge-success'
                      }`}>
                        {product.stock_quantity} units
                      </span>
                      {product.stock_quantity <= product.reorder_level && product.stock_quantity > 0 && (
                        <div className="text-warning-600 text-xs mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Low stock
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${product.is_active ? 'badge-success' : 'badge-secondary'}`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-outline-primary text-sm"
                          onClick={() => handleEditProduct(product)}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="btn btn-outline-danger text-sm"
                          onClick={() => handleDeleteProduct(product)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProductFormModal
        show={showFormModal}
        onHide={() => setShowFormModal(false)}
        onSubmit={handleFormSubmit}
        product={selectedProduct}
        categories={categories}
        loading={formLoading}
      />

      <DeleteConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
        loading={formLoading}
      />
    </div>
  );
};

export default Products;
