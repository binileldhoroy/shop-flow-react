import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { SaleOrder } from '../../types/sale.types';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';

interface InvoicePreviewProps {
  show: boolean;
  sale: SaleOrder;
  onClose: () => void;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ show, sale, onClose }) => {
  const currentCompany = useSelector((state: RootState) => state.company.currentCompany);

  const handlePrint = () => {
    window.print();
  };

  const paymentMethodLabels: Record<string, string> = {
    cash: 'Cash',
    card: 'Card',
    upi: 'UPI/GPay',
    net_banking: 'Net Banking',
    other: 'Other',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Modal show={show} onHide={onClose} size="md" centered>
        <Modal.Header closeButton className="print-hide">
          <Modal.Title>Receipt</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div id="thermal-receipt" style={{ fontFamily: 'monospace', fontSize: '14px' }}>
            {/* Store Header */}
            <div className="text-center mb-3">
              <div className="fw-bold fs-5">{currentCompany?.company_name || 'SHOPFLOW POS'}</div>
              <div className="small">Point of Sale System</div>
              <div className="small">GST Invoice</div>
            </div>

            <hr className="border-dashed" />

            {/* Invoice Info */}
            <div className="small mb-3">
              <div className="d-flex justify-content-between">
                <span>Invoice:</span>
                <span className="fw-semibold">{sale.order_number}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Date:</span>
                <span>{formatDate(sale.sale_date)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Customer:</span>
                <span>{sale.customer_name || 'Walk-in'}</span>
              </div>
            </div>

            <hr className="border-dashed" />

            {/* Items */}
            <div className="mb-3">
              {sale.items?.map((item, index) => (
                <div key={index} className="mb-2 small">
                  <div className="fw-semibold">{item.product_name}</div>
                  <div className="d-flex justify-content-between">
                    <span>
                      {item.quantity} × ₹{parseFloat(String(item.unit_price || 0)).toFixed(2)}
                      {item.gst_rate > 0 && ` (GST ${item.gst_rate}%)`}
                    </span>
                    <span className="fw-semibold">
                      ₹{(parseFloat(String(item.unit_price || 0)) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  {item.hsn_code && (
                    <div className="text-muted" style={{ fontSize: '10px' }}>
                      HSN: {item.hsn_code}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <hr className="border-dashed" />

            {/* Totals */}
            <div className="small mb-3">
              <div className="d-flex justify-content-between">
                <span>Subtotal:</span>
                <span>₹{parseFloat(String(sale.subtotal || 0)).toFixed(2)}</span>
              </div>

              {/* GST Breakdown */}
              {sale.igst_amount > 0 ? (
                <div className="d-flex justify-content-between">
                  <span>IGST ({((parseFloat(String(sale.igst_amount || 0)) / parseFloat(String(sale.subtotal || 1))) * 100).toFixed(2)}%):</span>
                  <span>₹{parseFloat(String(sale.igst_amount || 0)).toFixed(2)}</span>
                </div>
              ) : (
                <>
                  <div className="d-flex justify-content-between">
                    <span>CGST ({((parseFloat(String(sale.cgst_amount || 0)) / parseFloat(String(sale.subtotal || 1))) * 100).toFixed(2)}%):</span>
                    <span>₹{parseFloat(String(sale.cgst_amount || 0)).toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>SGST ({((parseFloat(String(sale.sgst_amount || 0)) / parseFloat(String(sale.subtotal || 1))) * 100).toFixed(2)}%):</span>
                    <span>₹{parseFloat(String(sale.sgst_amount || 0)).toFixed(2)}</span>
                  </div>
                </>
              )}

              {sale.discount_amount > 0 && (
                <div className="d-flex justify-content-between">
                  <span>Discount ({sale.discount_percentage}%):</span>
                  <span>-₹{parseFloat(String(sale.discount_amount || 0)).toFixed(2)}</span>
                </div>
              )}

              {sale.round_off !== 0 && (
                <div className="d-flex justify-content-between">
                  <span>Round Off:</span>
                  <span>
                    {parseFloat(String(sale.round_off || 0)) > 0 ? '+' : ''}₹{parseFloat(String(sale.round_off || 0)).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <hr className="border-dark" />

            {/* Grand Total */}
            <div className="d-flex justify-content-between fw-bold mb-3">
              <span>TOTAL:</span>
              <span>₹{Math.round(parseFloat(String(sale.total_amount || 0))).toFixed(0)}</span>
            </div>

            {/* Payment Method */}
            <div className="text-center small mb-3">
              Payment: {paymentMethodLabels[sale.payment_method]}
            </div>

            <hr className="border-dashed" />

            {/* Footer */}
            <div className="text-center small">
              <div className="mb-1">Thank you for your business!</div>
              <div className="text-muted">Visit again</div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="print-hide">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handlePrint}>
            <i className="bi bi-printer me-2"></i>
            Print
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body * {
            visibility: hidden;
          }
          #thermal-receipt, #thermal-receipt * {
            visibility: visible;
          }
          #thermal-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 5mm;
          }
          .print-hide {
            display: none !important;
          }
        }
        .border-dashed {
          border-style: dashed !important;
        }
      `}</style>
    </>
  );
};

export default InvoicePreview;
