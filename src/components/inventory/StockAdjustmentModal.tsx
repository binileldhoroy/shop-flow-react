import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { StockAdjustmentFormData, StockItem } from '../../types/inventory.types';

interface StockAdjustmentModalProps {
  product: StockItem;
  onSave: (data: StockAdjustmentFormData) => void;
  onClose: () => void;
}

const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({ product, onSave, onClose }) => {
  const [formData, setFormData] = useState<StockAdjustmentFormData>({
    product: product.product,
    movement_type: 'purchase',
    quantity: '' as any, // Allow empty string initially
    reference_number: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert quantity to number before submitting
    const submitData = {
      ...formData,
      quantity: Number(formData.quantity)
    };
    onSave(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? value : value // Keep as string for quantity input
    }));
  };

  return (
    <Modal show={true} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Adjust Stock</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Product</Form.Label>
            <Form.Control
              type="text"
              value={product.product_name}
              disabled
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-muted">
              Current Stock: <strong>{product.quantity}</strong>
            </Form.Label>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Movement Type <span className="text-danger">*</span></Form.Label>
            <Form.Select
              name="movement_type"
              value={formData.movement_type}
              onChange={handleChange}
              required
            >
              <option value="purchase">Purchase (Stock In)</option>
              <option value="sale">Sale (Stock Out)</option>
              <option value="adjustment">Adjustment</option>
              <option value="return">Return</option>
              <option value="damage">Damage/Loss</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Quantity <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Reference Number</Form.Label>
            <Form.Control
              type="text"
              name="reference_number"
              value={formData.reference_number}
              onChange={handleChange}
              placeholder="e.g., PO-123, INV-456"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Reason for adjustment..."
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Adjust Stock
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default StockAdjustmentModal;
