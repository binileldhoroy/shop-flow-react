import React from 'react';
import { X, Printer } from 'lucide-react';

interface InvoicePreviewProps {
  sale: any;
  onClose: () => void;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ sale, onClose }) => {
  const handlePrint = () => {
    window.print();
  };
console.log(sale);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full max-h-[90vh] overflow-y-auto">
        {/* Header - Hidden on print */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 print:hidden">
          <h2 className="text-lg font-bold text-gray-900">Invoice Preview</h2>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="btn btn-primary flex items-center gap-2 text-sm">
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Thermal Receipt Content */}
        <div className="p-4 font-mono text-sm" id="thermal-receipt">
          {/* Company Header */}
          <div className="text-center border-b-2 border-dashed border-gray-400 pb-3 mb-3">
            <h1 className="text-lg font-bold">{sale.company?.company_name || 'COMPANY NAME'}</h1>
            <p className="text-xs mt-1">{sale.company?.address_line1}</p>
            <p className="text-xs">{sale.company?.city}, {sale.company?.state}</p>
            <p className="text-xs">Ph: {sale.company?.phone}</p>
            <p className="text-xs">GSTIN: {sale.company?.gstin}</p>
          </div>

          {/* Invoice Details */}
          <div className="text-xs space-y-1 mb-3">
            <div className="flex justify-between">
              <span>Invoice:</span>
              <span className="font-bold">#{sale.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{new Date(sale.created_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span>{sale.customer?.name || 'Guest'}</span>
            </div>
            {sale.customer?.phone && (
              <div className="flex justify-between">
                <span>Phone:</span>
                <span>{sale.customer.phone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Payment:</span>
              <span className="uppercase">{sale.payment_method}</span>
            </div>
          </div>

          {/* Items */}
          <div className="border-t-2 border-dashed border-gray-400 pt-2 mb-2">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-1">Item</th>
                  <th className="text-center py-1">Qty</th>
                  <th className="text-right py-1">Rate</th>
                  <th className="text-right py-1">Amt</th>
                </tr>
              </thead>
              <tbody>
                {sale.items?.map((item: any, index: number) => (
                  <React.Fragment key={index}>
                    <tr className="border-b border-gray-200">
                      <td className="py-1">{item.product_name || item.product}</td>
                      <td className="text-center py-1">{item.quantity}</td>
                      <td className="text-right py-1">₹{parseFloat(item.unit_price).toFixed(2)}</td>
                      <td className="text-right py-1 font-medium">
                        ₹{(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="text-xs text-gray-600 pb-1">
                        HSN: {item.hsn_code} | GST: {item.gst_rate}%
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t-2 border-dashed border-gray-400 pt-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{parseFloat(sale.subtotal || 0).toFixed(2)}</span>
            </div>

            {sale.cgst_amount > 0 && (
              <>
                <div className="flex justify-between">
                  <span>CGST:</span>
                  <span>₹{parseFloat(sale.cgst_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST:</span>
                  <span>₹{parseFloat(sale.sgst_amount).toFixed(2)}</span>
                </div>
              </>
            )}

            {sale.igst_amount > 0 && (
              <div className="flex justify-between">
                <span>IGST:</span>
                <span>₹{parseFloat(sale.igst_amount).toFixed(2)}</span>
              </div>
            )}

            {sale.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({sale.discount_percentage}%):</span>
                <span>-₹{parseFloat(sale.discount_amount).toFixed(2)}</span>
              </div>
            )}

            {sale.round_off !== 0 && (
              <div className="flex justify-between">
                <span>Round Off:</span>
                <span>{sale.round_off > 0 ? '+' : ''}₹{parseFloat(sale.round_off).toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-base font-bold pt-1 border-t border-gray-400">
              <span>TOTAL:</span>
              <span>₹{parseFloat(sale.total_amount || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-dashed border-gray-400 mt-3 pt-3 text-center text-xs">
            <p className="font-bold mb-1">Thank You! Visit Again</p>
            {sale.company?.terms_and_conditions && (
              <p className="text-xs text-gray-600 mt-2">{sale.company.terms_and_conditions}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Powered by ShopFlow POS
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
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
            font-size: 12px;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoicePreview;
