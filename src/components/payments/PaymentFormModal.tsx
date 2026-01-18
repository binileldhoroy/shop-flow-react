import React, { useState } from 'react';
import Modal from '../common/Modal/Modal';
import { PaymentFormData } from '../../types/payment.types';

interface PaymentFormModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: PaymentFormData) => void;
  loading?: boolean;
}

const PaymentFormModal: React.FC<PaymentFormModalProps> = ({
  show,
  onHide,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: '',
    payment_mode: 'cash',
    payment_type: 'sale', // Default to Sale (Income)
    reference_number: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      title="Record New Payment"
      size="md"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onHide} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save Payment'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Payment Type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="payment_type"
                value="sale"
                checked={formData.payment_type === 'sale'}
                onChange={handleChange}
                className="text-primary-600"
              />
              <span>Income (Sale)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="payment_type"
                value="purchase"
                checked={formData.payment_type === 'purchase'}
                onChange={handleChange}
                className="text-primary-600"
              />
              <span>Expense (Purchase)</span>
            </label>
          </div>
        </div>

        <div>
           <label className="label">Amount *</label>
           <div className="relative">
             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
             <input
               type="number"
               name="amount"
               className="input-field pl-8"
               value={formData.amount}
               onChange={handleChange}
               required
               min="0.01"
               step="0.01"
             />
           </div>
        </div>

        <div>
           <label className="label">Payment Mode *</label>
           <select
             name="payment_mode"
             className="input-field"
             value={formData.payment_mode}
             onChange={handleChange}
             required
           >
             <option value="cash">Cash</option>
             <option value="card">Card</option>
             <option value="upi">UPI</option>
             <option value="bank_transfer">Bank Transfer</option>
             <option value="cheque">Cheque</option>
             <option value="other">Other</option>
           </select>
        </div>

        <div>
           <label className="label">Reference Number</label>
           <input
             type="text"
             name="reference_number"
             className="input-field"
             placeholder="e.g. Transaction ID, Cheque #"
             value={formData.reference_number || ''}
             onChange={handleChange}
           />
        </div>

        <div>
           <label className="label">Notes</label>
           <textarea
             name="notes"
             className="input-field"
             rows={3}
             value={formData.notes || ''}
             onChange={handleChange}
           />
        </div>
      </form>
    </Modal>
  );
};

export default PaymentFormModal;
