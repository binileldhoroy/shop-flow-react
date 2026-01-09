import React from 'react';
import { SaleOrder } from '../../types/sale.types';
import { useAppSelector } from '@hooks/useRedux';

interface InvoiceTemplateProps {
  saleOrder: SaleOrder;
  invoiceNumber?: string;
  invoiceDate?: string;
  customerDetails?: {
    name?: string;
    gstin?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    phone?: string;
    email?: string;
  };
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({
  saleOrder,
  invoiceNumber,
  invoiceDate,
  customerDetails,
}) => {
  const currentCompany = useAppSelector((state) => state.company.currentCompany);

  if (!currentCompany) {
    return (
      <div className="p-5 text-center">
        <p className="text-muted">Please configure company settings first</p>
      </div>
    );
  }

  const calculateGSTPercentage = (gstAmount: number, subtotal: number) => {
    if (subtotal === 0) return '0.00';
    return ((gstAmount / subtotal) * 100).toFixed(2);
  };

  const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = [
      'Ten',
      'Eleven',
      'Twelve',
      'Thirteen',
      'Fourteen',
      'Fifteen',
      'Sixteen',
      'Seventeen',
      'Eighteen',
      'Nineteen',
    ];

    if (num === 0) return 'Zero';

    const convertLessThanThousand = (n: number): string => {
      if (n === 0) return '';
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100)
        return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
      return (
        ones[Math.floor(n / 100)] +
        ' Hundred' +
        (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '')
      );
    };

    const convertNumber = (n: number): string => {
      if (n < 1000) return convertLessThanThousand(n);
      if (n < 100000)
        return (
          convertLessThanThousand(Math.floor(n / 1000)) +
          ' Thousand' +
          (n % 1000 !== 0 ? ' ' + convertNumber(n % 1000) : '')
        );
      if (n < 10000000)
        return (
          convertLessThanThousand(Math.floor(n / 100000)) +
          ' Lakh' +
          (n % 100000 !== 0 ? ' ' + convertNumber(n % 100000) : '')
        );
      return (
        convertLessThanThousand(Math.floor(n / 10000000)) +
        ' Crore' +
        (n % 10000000 !== 0 ? ' ' + convertNumber(n % 10000000) : '')
      );
    };

    return convertNumber(Math.floor(num)) + ' Rupees Only';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const cgstPercent =
    saleOrder.cgst_amount > 0
      ? calculateGSTPercentage(saleOrder.cgst_amount, saleOrder.subtotal)
      : '0.00';
  const sgstPercent =
    saleOrder.sgst_amount > 0
      ? calculateGSTPercentage(saleOrder.sgst_amount, saleOrder.subtotal)
      : '0.00';
  const igstPercent =
    saleOrder.igst_amount > 0
      ? calculateGSTPercentage(saleOrder.igst_amount, saleOrder.subtotal)
      : '0.00';

  return (
    <div
      className="bg-white p-4"
      style={{
        maxWidth: '210mm',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
      }}
    >
      {/* Main Border */}
      <div style={{ border: '2px solid black' }}>
        {/* Company Header */}
        <div
          className="text-center p-3"
          style={{ borderBottom: '2px solid black' }}
        >
          <h1 className="fw-bold mb-1" style={{ fontSize: '24px' }}>
            {currentCompany.company_name}
          </h1>
          <p className="mb-0" style={{ fontSize: '13px' }}>
            {currentCompany.address_line1}
            {currentCompany.address_line2 && `, ${currentCompany.address_line2}`}
            <br />
            {currentCompany.city}, {currentCompany.state_name || ''} - {currentCompany.pincode}
            <br />
            Phone: {currentCompany.phone} | Email: {currentCompany.email}
            {currentCompany.website && <> | {currentCompany.website}</>}
          </p>
          <p className="fw-semibold mt-1 mb-0" style={{ fontSize: '13px' }}>
            GSTIN: {currentCompany.gstin}
          </p>
        </div>

        {/* Tax Invoice Title */}
        <div
          className="text-center p-2 bg-light"
          style={{ borderBottom: '2px solid black' }}
        >
          <h2 className="fw-bold mb-0" style={{ fontSize: '20px' }}>
            TAX INVOICE
          </h2>
        </div>

        {/* Invoice Details & Customer Details */}
        <div className="row g-0" style={{ borderBottom: '2px solid black' }}>
          {/* Left: Customer Details */}
          <div className="col-6 p-3" style={{ borderRight: '2px solid black' }}>
            <p className="fw-semibold mb-2">Bill To:</p>
            <p className="fw-bold mb-1">
              {customerDetails?.name || saleOrder.customer_name || 'Walk-in Customer'}
            </p>
            {customerDetails?.gstin && (
              <p className="mb-1" style={{ fontSize: '13px' }}>
                <span className="fw-semibold">GSTIN:</span> {customerDetails.gstin}
              </p>
            )}
            {customerDetails?.address && (
              <p className="mb-1" style={{ fontSize: '13px' }}>
                {customerDetails.address}
              </p>
            )}
            {(customerDetails?.city || customerDetails?.state || customerDetails?.pincode) && (
              <p className="mb-1" style={{ fontSize: '13px' }}>
                {[customerDetails?.city, customerDetails?.state, customerDetails?.pincode]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
            {customerDetails?.phone && (
              <p className="mb-1" style={{ fontSize: '13px' }}>
                <span className="fw-semibold">Phone:</span> {customerDetails.phone}
              </p>
            )}
            {customerDetails?.email && (
              <p className="mb-1" style={{ fontSize: '13px' }}>
                <span className="fw-semibold">Email:</span> {customerDetails.email}
              </p>
            )}
            <p className="mb-0 mt-2" style={{ fontSize: '13px' }}>
              <span className="fw-semibold">Place of Supply:</span>{' '}
              {customerDetails?.state || saleOrder.place_of_supply || currentCompany.state_name || ''}
            </p>
          </div>

          {/* Right: Invoice Details */}
          <div className="col-6 p-3">
            <table className="w-100" style={{ fontSize: '13px' }}>
              <tbody>
                <tr>
                  <td className="fw-semibold py-1">Invoice No:</td>
                  <td className="text-end">{invoiceNumber || 'DRAFT'}</td>
                </tr>
                <tr>
                  <td className="fw-semibold py-1">Invoice Date:</td>
                  <td className="text-end">
                    {invoiceDate ? formatDate(invoiceDate) : formatDate(new Date().toISOString())}
                  </td>
                </tr>
                <tr>
                  <td className="fw-semibold py-1">Order No:</td>
                  <td className="text-end">{saleOrder.order_number}</td>
                </tr>
                <tr>
                  <td className="fw-semibold py-1">Order Date:</td>
                  <td className="text-end">{formatDate(saleOrder.sale_date)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-100" style={{ fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid black', backgroundColor: '#f8f9fa' }}>
              <th className="p-2 text-start" style={{ width: '50px', borderRight: '1px solid black' }}>
                S.No
              </th>
              <th className="p-2 text-start" style={{ borderRight: '1px solid black' }}>
                Description of Goods
              </th>
              <th
                className="p-2 text-center"
                style={{ width: '100px', borderRight: '1px solid black' }}
              >
                HSN/SAC
              </th>
              <th
                className="p-2 text-center"
                style={{ width: '60px', borderRight: '1px solid black' }}
              >
                Qty
              </th>
              <th
                className="p-2 text-end"
                style={{ width: '100px', borderRight: '1px solid black' }}
              >
                Rate
              </th>
              <th className="p-2 text-end" style={{ width: '120px', borderRight: '1px solid black' }}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {saleOrder.items?.map((item, index) => (
              <tr key={item.id} style={{ borderBottom: '1px solid black' }}>
                <td className="p-2 text-center" style={{ borderRight: '1px solid black' }}>
                  {index + 1}
                </td>
                <td className="p-2" style={{ borderRight: '1px solid black' }}>
                  {item.product_name}
                </td>
                <td className="p-2 text-center" style={{ borderRight: '1px solid black' }}>
                  {item.hsn_code || '-'}
                </td>
                <td className="p-2 text-center" style={{ borderRight: '1px solid black' }}>
                  {item.quantity}
                </td>
                <td className="p-2 text-end" style={{ borderRight: '1px solid black' }}>
                  ₹{Number(item.unit_price).toFixed(2)}
                </td>
                <td className="p-2 text-end" style={{ borderRight: '1px solid black' }}>
                  ₹{Number(item.line_total).toFixed(2)}
                </td>
              </tr>
            ))}

            {/* Spacer rows */}
            {saleOrder.items && saleOrder.items.length < 5 &&
              Array.from({ length: 5 - saleOrder.items.length }).map((_, i) => (
                <tr key={`spacer-${i}`} style={{ borderBottom: '1px solid black' }}>
                  <td className="p-2" style={{ borderRight: '1px solid black' }}>
                    &nbsp;
                  </td>
                  <td className="p-2" style={{ borderRight: '1px solid black' }}>
                    &nbsp;
                  </td>
                  <td className="p-2" style={{ borderRight: '1px solid black' }}>
                    &nbsp;
                  </td>
                  <td className="p-2" style={{ borderRight: '1px solid black' }}>
                    &nbsp;
                  </td>
                  <td className="p-2" style={{ borderRight: '1px solid black' }}>
                    &nbsp;
                  </td>
                  <td className="p-2" style={{ borderRight: '1px solid black' }}>
                    &nbsp;
                  </td>
                </tr>
              ))}

            {/* Totals Section */}
            <tr style={{ borderBottom: '1px solid black' }}>
              <td
                colSpan={5}
                className="p-2 text-end fw-semibold"
                style={{ borderRight: '1px solid black' }}
              >
                Subtotal:
              </td>
              <td
                className="p-2 text-end fw-semibold"
                style={{ borderRight: '1px solid black' }}
              >
                ₹{Number(saleOrder.subtotal).toFixed(2)}
              </td>
            </tr>

            {/* GST Breakdown */}
            {saleOrder.igst_amount > 0 ? (
              <tr style={{ borderBottom: '1px solid black' }}>
                <td
                  colSpan={5}
                  className="p-2 text-end"
                  style={{ borderRight: '1px solid black' }}
                >
                  IGST @ {igstPercent}%:
                </td>
                <td className="p-2 text-end" style={{ borderRight: '1px solid black' }}>
                  ₹{Number(saleOrder.igst_amount).toFixed(2)}
                </td>
              </tr>
            ) : (
              <>
                <tr style={{ borderBottom: '1px solid black' }}>
                  <td
                    colSpan={5}
                    className="p-2 text-end"
                    style={{ borderRight: '1px solid black' }}
                  >
                    CGST @ {cgstPercent}%:
                  </td>
                  <td className="p-2 text-end" style={{ borderRight: '1px solid black' }}>
                    ₹{Number(saleOrder.cgst_amount).toFixed(2)}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid black' }}>
                  <td
                    colSpan={5}
                    className="p-2 text-end"
                    style={{ borderRight: '1px solid black' }}
                  >
                    SGST @ {sgstPercent}%:
                  </td>
                  <td className="p-2 text-end" style={{ borderRight: '1px solid black' }}>
                    ₹{Number(saleOrder.sgst_amount).toFixed(2)}
                  </td>
                </tr>
              </>
            )}

            {saleOrder.discount_amount > 0 && (
              <tr style={{ borderBottom: '1px solid black' }}>
                <td
                  colSpan={5}
                  className="p-2 text-end"
                  style={{ borderRight: '1px solid black' }}
                >
                  Discount ({saleOrder.discount_percentage}%):
                </td>
                <td
                  className="p-2 text-end text-success"
                  style={{ borderRight: '1px solid black' }}
                >
                  -₹{Number(saleOrder.discount_amount).toFixed(2)}
                </td>
              </tr>
            )}

            {saleOrder.round_off !== 0 && (
              <tr style={{ borderBottom: '1px solid black' }}>
                <td
                  colSpan={5}
                  className="p-2 text-end"
                  style={{ borderRight: '1px solid black' }}
                >
                  Round Off:
                </td>
                <td className="p-2 text-end" style={{ borderRight: '1px solid black' }}>
                  {Number(saleOrder.round_off) > 0 ? '+' : ''}₹{Number(saleOrder.round_off).toFixed(2)}
                </td>
              </tr>
            )}

            <tr style={{ borderBottom: '2px solid black', backgroundColor: '#f8f9fa' }}>
              <td
                colSpan={5}
                className="p-2 text-end fw-bold"
                style={{ fontSize: '16px', borderRight: '1px solid black' }}
              >
                Grand Total:
              </td>
              <td
                className="p-2 text-end fw-bold"
                style={{ fontSize: '16px', borderRight: '1px solid black' }}
              >
                ₹{Math.round(saleOrder.total_amount)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Amount in Words */}
        <div className="p-3" style={{ borderBottom: '2px solid black' }}>
          <p className="fw-semibold mb-1">Amount in Words:</p>
          <p className="fst-italic mb-0">{numberToWords(saleOrder.total_amount)}</p>
        </div>

        {/* Bank Details & Terms */}
        <div className="row g-0" style={{ borderBottom: '2px solid black' }}>
          <div className="col-6 p-3" style={{ borderRight: '2px solid black' }}>
            <p className="fw-semibold mb-2">Bank Details:</p>
            <table style={{ fontSize: '13px', width: '100%' }}>
              <tbody>
                <tr>
                  <td className="py-1">Bank Name:</td>
                  <td className="fw-medium">{currentCompany.bank_name || '-'}</td>
                </tr>
                <tr>
                  <td className="py-1">A/c No:</td>
                  <td className="fw-medium">{currentCompany.account_number || '-'}</td>
                </tr>
                <tr>
                  <td className="py-1">IFSC Code:</td>
                  <td className="fw-medium">{currentCompany.ifsc_code || '-'}</td>
                </tr>
                <tr>
                  <td className="py-1">Branch:</td>
                  <td className="fw-medium">{currentCompany.branch || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="col-6 p-3">
            <p className="fw-semibold mb-2">Terms & Conditions:</p>
            <p style={{ fontSize: '12px', whiteSpace: 'pre-line' }} className="mb-0">
              {currentCompany.terms_and_conditions || 'Thank you for your business!'}
            </p>
          </div>
        </div>

        {/* Signature */}
        <div className="p-4 text-end">
          <p className="fw-semibold mb-5">For {currentCompany.company_name}</p>
          <p className="d-inline-block border-top border-dark px-4 pt-1 mb-1">
            Authorized Signatory
          </p>
          <p style={{ fontSize: '13px' }} className="mb-0">
            {currentCompany.authorized_signatory_name || ''}
          </p>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center mt-3" style={{ fontSize: '11px', color: '#6c757d' }}>
        <p className="mb-0">
          This is a computer-generated invoice and does not require a physical signature
        </p>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
