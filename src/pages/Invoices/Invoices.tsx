import React, { useState, useRef } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import { invoiceService } from '../../api/services/invoice.service';
import { salesService } from '../../api/services/sales.service';
import { customerService } from '../../api/services/customer.service';
import { stateService } from '../../api/services/state.service';
import { TaxInvoice, TaxInvoiceCreate } from '../../types/invoice.types';
import { SaleOrder } from '../../types/sale.types';
import { Customer } from '../../types/customer.types';
import { StateMaster } from '../../types/state.types';
import InvoiceTemplate from '../../components/invoices/InvoiceTemplate';
import { useAppDispatch } from '@hooks/useRedux';
import { addNotification } from '@store/slices/uiSlice';
import { useReactToPrint } from 'react-to-print';

const Invoices: React.FC = () => {
  const dispatch = useAppDispatch();
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [invoices, setInvoices] = useState<TaxInvoice[]>([]);
  const [sales, setSales] = useState<SaleOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [states, setStates] = useState<StateMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [customerStateId, setCustomerStateId] = useState<number | null>(null);
  const [customerPincode, setCustomerPincode] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewSale, setPreviewSale] = useState<SaleOrder | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<TaxInvoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data on mount
  React.useEffect(() => {
    fetchData();
  }, []);

  // Auto-fill customer details when sale order is selected
  React.useEffect(() => {
    if (selectedSaleId) {
      const sale = sales.find(s => s.id === selectedSaleId);
      if (sale && sale.customer_name) {
        // Auto-fill customer name from sale order if not already filled
        if (!customerName) {
          setCustomerName(sale.customer_name);
        }
      }
    }
  }, [selectedSaleId, sales]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invoicesData, salesData, customersData, statesData] = await Promise.all([
        invoiceService.getInvoices(),
        salesService.getAll(),
        customerService.getAll(),
        stateService.getAll(),
      ]);
      setInvoices(invoicesData);
      setSales(salesData);
      setCustomers(customersData);
      setStates(statesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      dispatch(addNotification({ message: 'Failed to load data', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  // Print handler
  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: viewingInvoice?.invoice_number || 'Invoice',
  });

  // Handle customer selection to auto-fill address fields
  const handleCustomerSelect = (customerId: number) => {
    setSelectedCustomerId(customerId);
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setCustomerName(customer.name || '');
      setCustomerGstin(''); // Customer type doesn't have GSTIN field
      setCustomerPhone(customer.phone || '');
      setCustomerEmail(customer.email || '');
      // Find state by name and set ID
      const state = states.find(s => s.name === customer.state);
      setCustomerStateId(state?.id || null);
      setCustomerCity(customer.city || '');
      setCustomerPincode(customer.pincode || '');
      setCustomerAddress(customer.address || '');
    }
  };

  const handleShowPreview = () => {
    if (!selectedSaleId) {
      dispatch(addNotification({ message: 'Please select a sale order', type: 'error' }));
      return;
    }

    // Find the selected sale
    const sale = sales.find(s => s.id === selectedSaleId);
    if (!sale) {
      dispatch(addNotification({ message: 'Sale order not found', type: 'error' }));
      return;
    }

    // Create a preview sale object with customer details
    const saleWithCustomer = {
      ...sale,
      customer_name: customerName || sale.customer_name,
    };

    setPreviewSale(saleWithCustomer);
    setShowCreateModal(false);
    setShowPreviewModal(true);
  };

  const handleGenerateInvoice = async () => {
    if (!selectedSaleId) {
      dispatch(addNotification({ message: 'Please select a sale order', type: 'error' }));
      return;
    }

    setCreating(true);
    try {
      const data: TaxInvoiceCreate = {
        sale_order_id: selectedSaleId,
      };

      // Add customer details if provided
      if (customerName) data.customer_name = customerName;
      if (customerGstin) data.customer_gstin = customerGstin;
      if (customerAddress) data.customer_address = customerAddress;
      if (customerCity) data.customer_city = customerCity;
      if (customerStateId) data.customer_state = customerStateId;
      if (customerPincode) data.customer_pincode = customerPincode;
      if (customerPhone) data.customer_phone = customerPhone;
      if (customerEmail) data.customer_email = customerEmail;

      await invoiceService.createInvoice(data);
      dispatch(addNotification({ message: 'Invoice created successfully!', type: 'success' }));
      setShowPreviewModal(false);
      resetForm();
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.sale_order_id?.[0] ||
        'Failed to create invoice';
      dispatch(addNotification({ message: errorMessage, type: 'error' }));
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setSelectedSaleId(null);
    setSelectedCustomerId(null);
    setCustomerName('');
    setCustomerGstin('');
    setCustomerAddress('');
    setCustomerCity('');
    setCustomerStateId(null);
    setCustomerPincode('');
    setCustomerPhone('');
    setCustomerEmail('');
    setSearchTerm('');
  };

  const handleViewInvoice = (invoice: TaxInvoice) => {
    setViewingInvoice(invoice);
  };

  // Filter sales that don't have invoices yet
  const availableSales = sales.filter(
    (sale) => !invoices.some((inv) => inv.sale_order === sale.id && !inv.is_cancelled)
  );

  // Filter sales based on search term
  const filteredSales = availableSales.filter((sale) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      sale.order_number.toLowerCase().includes(searchLower) ||
      sale.customer_name?.toLowerCase().includes(searchLower) ||
      sale.total_amount.toString().includes(searchLower)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-3">Loading invoices...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0">
                <i className="bi bi-file-earmark-text me-2"></i>
                Tax Invoices
              </h1>
              <p className="text-muted">Generate and manage GST invoices</p>
            </div>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <i className="bi bi-plus-circle me-2"></i>
              Generate Invoice
            </Button>
          </div>
        </Col>
      </Row>

      {/* Invoices List */}
      <Row>
        <Col>
          <Card>
            <Card.Body>
              {invoices.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-file-earmark-text fs-1 text-muted"></i>
                  <p className="text-muted mt-3">No invoices generated yet</p>
                  <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                    Generate First Invoice
                  </Button>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Sale Order</th>
                        <th className="text-end">Amount</th>
                        <th className="text-center">Status</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr key={invoice.id}>
                          <td className="fw-medium">{invoice.invoice_number}</td>
                          <td>{formatDate(invoice.invoice_date)}</td>
                          <td>{invoice.customer_name}</td>
                          <td>{invoice.sale_order_data?.order_number}</td>
                          <td className="text-end">
                            ₹{Math.round(invoice.sale_order_data?.total_amount || 0)}
                          </td>
                          <td className="text-center">
                            {invoice.is_cancelled ? (
                              <Badge bg="danger">Cancelled</Badge>
                            ) : (
                              <Badge bg="success">Active</Badge>
                            )}
                          </td>
                          <td className="text-center">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleViewInvoice(invoice)}
                            >
                              <i className="bi bi-eye me-1"></i>
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Create Invoice Modal */}
      <Modal
        show={showCreateModal}
        onHide={() => { setShowCreateModal(false); resetForm(); }}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Generate Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Sale Order Selection with Search */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Select Sale Order <span className="text-danger">*</span>
              </Form.Label>

              {/* Search Field */}
              <div className="position-relative mb-3">
                <i className="bi bi-search position-absolute top-50 translate-middle-y ms-3 text-muted"></i>
                <Form.Control
                  type="text"
                  placeholder="Search by order number, customer name, or amount..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ps-5"
                />
              </div>

              {/* Sales Cards */}
              <div
                style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  border: '1px solid #dee2e6',
                  borderRadius: '0.375rem',
                  padding: '0.5rem'
                }}
              >
                {filteredSales.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                    {availableSales.length === 0 ? (
                      <>
                        <p className="mb-0">No sale orders available for invoicing</p>
                        <small>All sales already have invoices</small>
                      </>
                    ) : (
                      <p className="mb-0">No sales match your search</p>
                    )}
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {filteredSales.map((sale) => (
                      <Card
                        key={sale.id}
                        className={`cursor-pointer ${
                          selectedSaleId === sale.id ? 'border-primary border-2 bg-primary bg-opacity-10' : ''
                        }`}
                        onClick={() => setSelectedSaleId(sale.id)}
                        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <Card.Body className="p-3">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center gap-2 mb-1">
                                <span className="badge bg-secondary">{sale.order_number}</span>
                                {selectedSaleId === sale.id && (
                                  <i className="bi bi-check-circle-fill text-primary"></i>
                                )}
                              </div>
                              <div className="text-muted small">
                                <i className="bi bi-person me-1"></i>
                                {sale.customer_name || 'Walk-in Customer'}
                              </div>
                              <div className="text-muted small">
                                <i className="bi bi-calendar me-1"></i>
                                {formatDate(sale.sale_date)}
                              </div>
                            </div>
                            <div className="text-end">
                              <div className="fw-bold text-primary fs-5">
                                ₹{Math.round(sale.total_amount)}
                              </div>
                              <Badge bg={sale.payment_status === 'paid' ? 'success' : 'warning'}>
                                {sale.payment_status}
                              </Badge>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {filteredSales.length > 0 && (
                <Form.Text className="text-muted">
                  Showing {filteredSales.length} of {availableSales.length} available orders
                </Form.Text>
              )}
            </Form.Group>

            <hr />
            <h6 className="mb-3">Customer Details (Optional)</h6>

            {/* Customer Selection */}
            <Form.Group className="mb-3">
              <Form.Label>Select Customer</Form.Label>
              <Form.Select
                value={selectedCustomerId || ''}
                onChange={(e) => handleCustomerSelect(Number(e.target.value))}
              >
                <option value="">-- Select a customer to auto-fill details --</option>
                {customers
                  .filter((c) => !c.is_guest)
                  .map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Or manually enter customer details below
              </Form.Text>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Customer Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>GSTIN</Form.Label>
                  <Form.Control
                    type="text"
                    value={customerGstin}
                    onChange={(e) => setCustomerGstin(e.target.value)}
                    placeholder="Enter GSTIN"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Enter address"
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    placeholder="City"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>State</Form.Label>
                  <Form.Select
                    value={customerStateId || ''}
                    onChange={(e) => setCustomerStateId(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">Select State</option>
                    {states.map(state => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Pincode</Form.Label>
                  <Form.Control
                    type="text"
                    value={customerPincode}
                    onChange={(e) => setCustomerPincode(e.target.value)}
                    placeholder="Pincode"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Phone number"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Email address"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowCreateModal(false); resetForm(); }}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleShowPreview}
            disabled={!selectedSaleId}
          >
            <i className="bi bi-eye me-2"></i>
            Preview Invoice
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Preview Invoice Modal (before generation) */}
      {showPreviewModal && previewSale && (
        <Modal
          show={true}
          onHide={() => { setShowPreviewModal(false); setShowCreateModal(true); }}
          size="xl"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Invoice Preview
              <small className="text-muted ms-2">
                {previewSale.order_number}
              </small>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: '70vh', overflow: 'auto', backgroundColor: '#f8f9fa' }}>
            <div ref={invoiceRef}>
              <InvoiceTemplate
                saleOrder={previewSale}
                invoiceNumber="DRAFT"
                invoiceDate={new Date().toISOString()}
                customerDetails={{
                  name: customerName,
                  gstin: customerGstin,
                  address: customerAddress,
                  city: customerCity,
                  state: states.find(s => s.id === customerStateId)?.name || '',
                  pincode: customerPincode,
                  phone: customerPhone,
                  email: customerEmail,
                }}
              />
            </div>
          </Modal.Body>
          <Modal.Footer className="d-flex justify-content-between">
            <div className="text-muted small">
              Review the invoice and click "Generate & Save" to create the invoice record
            </div>
            <div>
              <Button
                variant="secondary"
                onClick={() => { setShowPreviewModal(false); setShowCreateModal(true); }}
                className="me-2"
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to Edit
              </Button>
              <Button variant="primary" onClick={handlePrint} className="me-2">
                <i className="bi bi-printer me-2"></i>
                Print Preview
              </Button>
              <Button
                variant="success"
                onClick={handleGenerateInvoice}
                disabled={creating}
              >
                <i className="bi bi-file-earmark-check me-2"></i>
                {creating ? 'Generating...' : 'Generate & Save Invoice'}
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      )}

      {/* View Invoice Modal */}
      {viewingInvoice && (
        <Modal
          show={true}
          onHide={() => setViewingInvoice(null)}
          size="xl"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {viewingInvoice.invoice_number}
              <small className="text-muted ms-2">
                {formatDate(viewingInvoice.invoice_date)}
              </small>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: '70vh', overflow: 'auto', backgroundColor: '#f8f9fa' }}>
            <div ref={invoiceRef}>
              <InvoiceTemplate
                saleOrder={viewingInvoice.sale_order_data}
                invoiceNumber={viewingInvoice.invoice_number}
                invoiceDate={viewingInvoice.invoice_date}
                customerDetails={{
                  name: viewingInvoice.customer_name,
                  gstin: viewingInvoice.customer_gstin,
                  address: viewingInvoice.customer_address,
                  city: viewingInvoice.customer_city,
                  state: states.find(s => s.id === viewingInvoice.customer_state)?.name || '',
                  pincode: viewingInvoice.customer_pincode,
                  phone: viewingInvoice.customer_phone,
                  email: viewingInvoice.customer_email,
                }}
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setViewingInvoice(null)}>
              Close
            </Button>
            <Button variant="primary" onClick={handlePrint}>
              <i className="bi bi-printer me-2"></i>
              Print
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default Invoices;
