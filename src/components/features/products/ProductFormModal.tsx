import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Product, ProductFormData, Category } from '@types/product.types';

interface ProductFormModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: ProductFormData) => void;
  product?: Product | null;
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
    description: '',
    sku: '',
    barcode: '',
    category: 0,
    unit_price: 0,
    cost_price: 0,
    stock_quantity: 0,
    reorder_level: 10,
    is_active: true,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        sku: product.sku,
        barcode: product.barcode || '',
        category: product.category,
        unit_price: product.unit_price,
        cost_price: product.cost_price || 0,
        stock_quantity: product.stock_quantity,
        reorder_level: product.reorder_level,
        is_active: product.is_active,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        sku: '',
        barcode: '',
        category: categories.length > 0 ? categories[0].id : 0,
        unit_price: 0,
        cost_price: 0,
        stock_quantity: 0,
        reorder_level: 10,
        is_active: true,
      });
    }
  }, [product, categories, show]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 :
              type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              value,
    }));
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className={`bi bi-${product ? 'pencil' : 'plus-circle'} me-2`}></i>
          {product ? 'Edit Product' : 'Add New Product'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="row">
            {/* Product Name */}
            <div className="col-md-6 mb-3">
              <Form.Group>
                <Form.Label>Product Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter product name"
                />
              </Form.Group>
            </div>

            {/* SKU */}
            <div className="col-md-6 mb-3">
              <Form.Group>
                <Form.Label>SKU *</Form.Label>
                <Form.Control
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                  placeholder="Product SKU"
                />
              </Form.Group>
            </div>

            {/* Category */}
            <div className="col-md-6 mb-3">
              <Form.Group>
                <Form.Label>Category *</Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>

            {/* Barcode */}
            <div className="col-md-6 mb-3">
              <Form.Group>
                <Form.Label>Barcode</Form.Label>
                <Form.Control
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  placeholder="Product barcode"
                />
              </Form.Group>
            </div>

            {/* Unit Price */}
            <div className="col-md-4 mb-3">
              <Form.Group>
                <Form.Label>Unit Price *</Form.Label>
                <Form.Control
                  type="number"
                  name="unit_price"
                  value={formData.unit_price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </Form.Group>
            </div>

            {/* Cost Price */}
            <div className="col-md-4 mb-3">
              <Form.Group>
                <Form.Label>Cost Price</Form.Label>
                <Form.Control
                  type="number"
                  name="cost_price"
                  value={formData.cost_price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </Form.Group>
            </div>

            {/* Stock Quantity */}
            <div className="col-md-4 mb-3">
              <Form.Group>
                <Form.Label>Stock Quantity *</Form.Label>
                <Form.Control
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="0"
                />
              </Form.Group>
            </div>

            {/* Reorder Level */}
            <div className="col-md-6 mb-3">
              <Form.Group>
                <Form.Label>Reorder Level *</Form.Label>
                <Form.Control
                  type="number"
                  name="reorder_level"
                  value={formData.reorder_level}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="10"
                />
                <Form.Text className="text-muted">
                  Alert when stock falls below this level
                </Form.Text>
              </Form.Group>
            </div>

            {/* Active Status */}
            <div className="col-md-6 mb-3">
              <Form.Group>
                <Form.Check
                  type="checkbox"
                  name="is_active"
                  label="Active"
                  checked={formData.is_active}
                  onChange={handleChange}
                />
              </Form.Group>
            </div>

            {/* Description */}
            <div className="col-12 mb-3">
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Product description"
                />
              </Form.Group>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                {product ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <i className={`bi bi-${product ? 'check' : 'plus'}-circle me-2`}></i>
                {product ? 'Update Product' : 'Create Product'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProductFormModal;
