import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface PaymentModalProps {
  show: boolean;
  total: number;
  onSelectPayment: (method: string) => void;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ show, total, onSelectPayment, onClose }) => {
  const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: 'bi-cash-coin', color: 'success' },
    { id: 'card', label: 'Card', icon: 'bi-credit-card', color: 'primary' },
    { id: 'upi', label: 'UPI/GPay', icon: 'bi-phone', color: 'info' },
    { id: 'net_banking', label: 'Net Banking', icon: 'bi-bank', color: 'warning' },
  ];

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Select Payment Method</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="mb-4 p-3 bg-light rounded text-center">
          <div className="text-muted small">Total Amount</div>
          <div className="h2 mb-0 fw-bold">₹{Math.round(total).toFixed(0)}</div>
        </div>

        <div className="d-grid gap-3">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => onSelectPayment(method.id)}
              className={`btn btn-outline-${method.color} btn-lg d-flex align-items-center justify-content-between`}
            >
              <div className="d-flex align-items-center gap-3">
                <i className={`bi ${method.icon} fs-4`}></i>
                <span className="fw-semibold">{method.label}</span>
              </div>
              <i className="bi bi-chevron-right"></i>
            </button>
          ))}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentModal;
