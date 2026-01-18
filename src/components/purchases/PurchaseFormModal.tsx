import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal/Modal';
import { PurchaseOrder, PurchaseOrderCreate, PurchaseStatus } from '../../types/purchase.types';
import { Supplier } from '../../types/supplier.types';
import { Product } from '../../types/product.types';
import { Plus, Trash2 } from 'lucide-react';

interface PurchaseFormModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: PurchaseOrderCreate) => void;
  purchase: PurchaseOrder | null;
  suppliers: Supplier[];
  products: Product[];
  loading?: boolean;
}

interface PurchaseItemFormData {
  product: number | string;
  product_name: string;
  quantity: number | string;
  unit_price: number | string;
  tax_rate: number | string;
}

const PurchaseFormModal: React.FC<PurchaseFormModalProps> = ({
  show,
  onHide,
  onSubmit,
  purchase,
  suppliers,
  products,
  loading = false,
}) => {
  const [formData, setFormData] = useState<{
    supplier: number | string;
    order_date: string;
    expected_delivery_date: string;
    status: PurchaseStatus;
    notes: string;
  }>({
    supplier: '',
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    status: 'draft',
    notes: '',
  });

  const [items, setItems] = useState<PurchaseItemFormData[]>([]);

  useEffect(() => {
    if (purchase) {
      setFormData({
        supplier: purchase.supplier,
        order_date: purchase.order_date,
        expected_delivery_date: purchase.expected_delivery_date || '',
        status: purchase.status,
        notes: purchase.notes || '',
      });
      setItems(purchase.items.map(item => ({
        product: item.product || '',
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: item.tax_rate,
      })));
    } else {
      resetForm();
    }
  }, [purchase, show]);

  const resetForm = () => {
    setFormData({
      supplier: '',
      order_date: new Date().toISOString().split('T')[0],
      expected_delivery_date: '',
      status: 'draft',
      notes: '',
    });
    setItems([{
      product: '',
      product_name: '',
      quantity: 1,
      unit_price: 0,
      tax_rate: 0,
    }]);
  };

  const handleAddItem = () => {
    setItems([...items, {
      product: '',
      product_name: '',
      quantity: 1,
      unit_price: 0,
      tax_rate: 0,
    }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: keyof PurchaseItemFormData, value: any) => {
    const newItems = [...items];
    const item = newItems[index];

    if (field === 'product') {
      const selectedProduct = products.find(p => p.id === Number(value));
      if (selectedProduct) {
        item.product = selectedProduct.id;
        item.product_name = selectedProduct.name;
        item.unit_price = selectedProduct.cost_price || 0;
        item.tax_rate = selectedProduct.gst_rate || 0;
      } else {
        item.product = '';
        item.product_name = '';
        item.unit_price = 0;
        item.tax_rate = 0;
      }
    } else {
      (item as any)[field] = value;
    }

    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unit_price) || 0;
      const tax = Number(item.tax_rate) || 0;
      const itemTotal = qty * price;
      const taxAmount = (itemTotal * tax) / 100;
      return total + itemTotal + taxAmount;
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData: PurchaseOrderCreate = {
      supplier: Number(formData.supplier),
      order_date: formData.order_date,
      expected_delivery_date: formData.expected_delivery_date || undefined,
      status: formData.status,
      notes: formData.notes,
      items: items.map(item => ({
        product: Number(item.product) || null,
        product_name: item.product_name,
        quantity: Number(item.quantity) || 0,
        unit_price: Number(item.unit_price) || 0,
        tax_rate: Number(item.tax_rate) || 0,
      })),
    };

    onSubmit(submitData);
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      title={purchase ? 'Edit Purchase Order' : 'New Purchase Order'}
      size="xl"
      footer={
        <>
          <div className="mr-auto text-lg font-bold">
            Total: ₹{calculateTotal().toFixed(2)}
          </div>
          <button className="btn btn-secondary" onClick={onHide} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Purchase Order'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="label">Supplier *</label>
            <select
              className="input-field"
              value={formData.supplier}
              onChange={(e) => setFormData(p => ({ ...p, supplier: e.target.value }))}
              required
            >
              <option value="">Select Supplier</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Order Date *</label>
            <input
              type="date"
              className="input-field"
              value={formData.order_date}
              onChange={(e) => setFormData(p => ({ ...p, order_date: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Expected Delivery</label>
            <input
              type="date"
              className="input-field"
              value={formData.expected_delivery_date}
              onChange={(e) => setFormData(p => ({ ...p, expected_delivery_date: e.target.value }))}
            />
          </div>
          <div>
             <label className="label">Status *</label>
             <select
               className="input-field"
               value={formData.status}
               onChange={(e) => setFormData(p => ({ ...p, status: e.target.value as PurchaseStatus }))}
               required
             >
               <option value="draft">Draft</option>
               <option value="ordered">Ordered</option>
               <option value="cancelled">Cancelled</option>
               {/* Received status should be set via the 'Receive' action to ensure stock updates */}
             </select>
          </div>
        </div>

        {/* Items Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">Order Items</h3>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm flex items-center gap-1"
              onClick={handleAddItem}
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3 min-w-[200px]">Product *</th>
                  <th className="px-4 py-3 w-24">Qty *</th>
                  <th className="px-4 py-3 w-32">Unit Price *</th>
                  <th className="px-4 py-3 w-24">Tax %</th>
                  <th className="px-4 py-3 w-32 text-right">Total</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                   const qty = Number(item.quantity) || 0;
                   const price = Number(item.unit_price) || 0;
                   const tax = Number(item.tax_rate) || 0;
                   const total = (qty * price) * (1 + tax / 100);

                  return (
                    <tr key={index} className="border-b last:border-b-0">
                      <td className="px-4 py-2">
                        <select
                          className="input-field text-sm"
                          value={item.product}
                          onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                          required
                        >
                          <option value="">Select Product</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          className="input-field text-sm"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          min="0.01"
                          step="0.01"
                          required
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          className="input-field text-sm"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                          min="0"
                          step="0.01"
                          required
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          className="input-field text-sm"
                          value={item.tax_rate}
                          onChange={(e) => handleItemChange(index, 'tax_rate', e.target.value)}
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-4 py-2 text-right font-medium">
                        ₹{total.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {items.length > 1 && (
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveItem(index)}
                            title="Remove Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="label">Notes</label>
          <textarea
            className="input-field"
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
            placeholder="Additional notes..."
          />
        </div>
      </form>
    </Modal>
  );
};

export default PurchaseFormModal;
