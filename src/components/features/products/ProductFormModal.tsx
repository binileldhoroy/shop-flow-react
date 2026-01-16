import React, { useState, useEffect } from 'react';
import Modal from '../../common/Modal/Modal';
import { Product, Category, ProductFormData } from '../../../types/product.types';

interface ProductFormModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: ProductFormData) => void;
  product: Product | null;
  categories: Category[];
  loading?: boolean;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  show,
  onHide,
  onSubmit,
  product,
  categories,
  loading = false,
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    sku: '',
    barcode: '',
    category: 0,
    unit_price: 0,
    selling_price: 0,
    stock_quantity: 0,
    reorder_level: 0,
    description: '',
    is_active: true,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        category: product.category || 0,
        unit_price: product.unit_price || 0,
        selling_price: product.selling_price || product.unit_price || 0,
        stock_quantity: product.stock_quantity || 0,
        reorder_level: product.reorder_level || 0,
        description: product.description || '',
        is_active: product.is_active ?? true,
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        barcode: '',
        category: 0,
        unit_price: 0,
        selling_price: 0,
        stock_quantity: 0,
        reorder_level: 0,
        description: '',
        is_active: true,
      });
    }
  }, [product, show]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : type === 'number'
        ? parseFloat(value) || 0
        : value,
    }));
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      title={product ? 'Edit Product' : 'Add Product'}
      size="lg"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onHide} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Product Name *</label>
            <input
              type="text"
              name="name"
              className="input-field"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="label">Category *</label>
            <select
              name="category"
              className="input-field"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">SKU *</label>
            <input
              type="text"
              name="sku"
              className="input-field"
              value={formData.sku}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="label">Barcode</label>
            <input
              type="text"
              name="barcode"
              className="input-field"
              value={formData.barcode}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="label">Unit Price *</label>
            <input
              type="number"
              name="unit_price"
              className="input-field"
              value={formData.unit_price}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
            />
          </div>
          <div>
            <label className="label">Selling Price *</label>
            <input
              type="number"
              name="selling_price"
              className="input-field"
              value={formData.selling_price}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
            />
          </div>
          <div>
            <label className="label">Stock Quantity *</label>
            <input
              type="number"
              name="stock_quantity"
              className="input-field"
              value={formData.stock_quantity}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
          <div>
            <label className="label">Reorder Level *</label>
            <input
              type="number"
              name="reorder_level"
              className="input-field"
              value={formData.reorder_level}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            name="description"
            className="input-field"
            rows={3}
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            id="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="w-4 h-4 text-primary-600 rounded"
          />
          <label htmlFor="is_active" className="text-sm text-gray-700">
            Active
          </label>
        </div>
      </form>
    </Modal>
  );
};

export default ProductFormModal;
