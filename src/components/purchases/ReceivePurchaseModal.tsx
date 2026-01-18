import React from 'react';
import Modal from '../common/Modal/Modal';
import { PurchaseOrder } from '../../types/purchase.types';

interface ReceivePurchaseModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  purchase: PurchaseOrder | null;
  loading?: boolean;
}

const ReceivePurchaseModal: React.FC<ReceivePurchaseModalProps> = ({
  show,
  onHide,
  onConfirm,
  purchase,
  loading = false,
}) => {
  if (!purchase) return null;

  return (
    <Modal
      show={show}
      onHide={onHide}
      title="Receive Purchase Order"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onHide} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn btn-success text-white"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Confirm Receipt'}
          </button>
        </>
      }
    >
      <div className="text-gray-700">
        <p className="mb-4">
          Are you sure you want to mark Purchase Order <strong>{purchase.order_number}</strong> as received?
        </p>
        <p className="mb-4 text-sm bg-blue-50 p-3 rounded border border-blue-100 text-blue-800">
          This action will automatically update the stock quantities for all items in this order.
        </p>
        <div className="border rounded p-3 bg-gray-50 text-sm">
          <p className="font-semibold mb-2">Order Summary:</p>
          <ul className="list-disc pl-5 space-y-1">
            {purchase.items.map((item, idx) => (
               <li key={idx}>
                 {item.product_name}: <strong>{item.quantity}</strong> units
               </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default ReceivePurchaseModal;
