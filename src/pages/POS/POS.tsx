import React, { useState, useEffect } from 'react';
import { productService } from '@api/services/product.service';
import { customerService } from '@api/services/customer.service';
import { salesService } from '@api/services/sales.service';
import { stateService } from '@api/services/state.service';
import { Product } from '@types/product.types';
import { Customer } from '@types/customer.types';
import { StateMaster } from '@types/state.types';
import { CartItem, SaleOrder } from '@types/sale.types';
import { useAppDispatch, useAppSelector } from '@hooks/useRedux';
import {
  addItem,
  removeItem,
  updateQuantity,
  setCustomer,
  setDiscount,
  setBillingState,
  clearCart,
} from '@store/slices/cartSlice';
import { addNotification } from '@store/slices/uiSlice';
import PaymentModal from '@components/pos/PaymentModal';
import InvoicePreview from '@components/pos/InvoicePreview';

const POS: React.FC = () => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart);

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [states, setStates] = useState<StateMaster[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showCustomerSelect, setShowCustomerSelect] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [completedSale, setCompletedSale] = useState<SaleOrder | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Auto-populate billing state when customer is selected
  useEffect(() => {
    if (cart.customer_id) {
      // Customer is selected - find their state
      const customer = customers.find(c => c.id === cart.customer_id);
      if (customer && customer.state) {
        // Find the state ID from the state name
        const customerState = states.find(s => s.name === customer.state);
        if (customerState) {
          dispatch(setBillingState(customerState.id));
        } else {
          // Customer has a state but it's not in our list, set to null
          dispatch(setBillingState(null));
        }
      } else {
        // Customer exists but has no state - set to null (CGST+SGST)
        dispatch(setBillingState(null));
      }
    } else {
      // No customer selected (walk-in) - set to null (CGST+SGST)
      dispatch(setBillingState(null));
    }
  }, [cart.customer_id, customers, states, dispatch]);

  const loadData = async () => {
    try {
      const [productsData, customersData, statesData] = await Promise.all([
        productService.getAll(),
        customerService.getAll(),
        stateService.getAll(),
      ]);
      setProducts(productsData);
      setCustomers(customersData);
      setStates(statesData);

      // Don't set any default billing state
      // Walk-in customers will have null state (CGST+SGST)
      // Registered customers will auto-populate from their profile
    } catch (error: any) {
      dispatch(addNotification({
        message: error.response?.data?.message || 'Failed to load data',
        type: 'error',
      }));
    }
  };

  const handleAddToCart = (product: Product) => {
    // Check stock
    if (!product.stock_quantity || product.stock_quantity <= 0) {
      dispatch(addNotification({
        message: 'Product is out of stock',
        type: 'error',
      }));
      return;
    }

    // Check if already in cart
    const existingItem = cart.items.find(item => item.product_id === product.id);
    if (existingItem && existingItem.quantity >= product.stock_quantity) {
      dispatch(addNotification({
        message: `Only ${product.stock_quantity} units available`,
        type: 'error',
      }));
      return;
    }

    const sellingPrice = parseFloat(String(product.selling_price || product.unit_price || 0));
    const basePrice = parseFloat(String(product.base_price || sellingPrice));

    const cartItem: CartItem = {
      id: Date.now(),
      product_id: product.id,
      name: product.name,
      sku: product.sku,
      unit_price: product.tax_included ? basePrice : sellingPrice,
      selling_price: sellingPrice,
      quantity: 1,
      gst_rate: product.gst_rate,
      hsn_code: product.hsn_code,
      tax_included: product.tax_included,
      stock_quantity: product.stock_quantity,
    };

    dispatch(addItem(cartItem));
    setProductSearch('');
  };

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const item = cart.items.find(i => i.id === itemId);
    if (item && item.stock_quantity && newQuantity > item.stock_quantity) {
      dispatch(addNotification({
        message: `Only ${item.stock_quantity} units available`,
        type: 'error',
      }));
      return;
    }

    dispatch(updateQuantity({ id: itemId, quantity: newQuantity }));
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let gstAmount = 0;

    cart.items.forEach(item => {
      const quantity = item.quantity;
      const gstRate = item.gst_rate / 100;

      if (item.tax_included) {
        const totalWithTax = item.selling_price * quantity;
        const baseTotal = totalWithTax / (1 + gstRate);
        const gst = totalWithTax - baseTotal;

        subtotal += baseTotal;
        gstAmount += gst;
      } else {
        const baseTotal = item.unit_price * quantity;
        const gst = baseTotal * gstRate;

        subtotal += baseTotal;
        gstAmount += gst;
      }
    });

    const discount = (subtotal * cart.discount_percentage) / 100;
    const total = subtotal + gstAmount - discount;
    const roundedTotal = Math.round(total);
    const roundOff = roundedTotal - total;

    return { subtotal, gstAmount, discount, total, roundOff, roundedTotal };
  };

  const totals = calculateTotals();

  const filteredProducts = products.filter(p =>
    p.stock_quantity > 0 &&
    (p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase()))
  );

  const handleInitiateCheckout = () => {
    if (cart.items.length === 0) {
      dispatch(addNotification({
        message: 'Cart is empty',
        type: 'error',
      }));
      return;
    }

    // Validate stock
    for (const item of cart.items) {
      if (item.stock_quantity && item.quantity > item.stock_quantity) {
        dispatch(addNotification({
          message: `${item.name}: Only ${item.stock_quantity} units available`,
          type: 'error',
        }));
        return;
      }
    }

    setShowPaymentModal(true);
  };

  const handlePaymentSelect = async (paymentMethod: string) => {
    setShowPaymentModal(false);
    setProcessing(true);

    try {
      let customerId = cart.customer_id;

      // Create guest customer if needed
      if (!customerId && guestName) {
        const guest = await customerService.create({
          name: guestName,
          phone: guestPhone,
          is_active: true,
        });
        customerId = guest.id;
      }

      const saleData: any = {
        order_number: `POS-${Date.now()}`, // Auto-generate order number
        payment_method: paymentMethod,
        payment_status: 'paid',
        status: 'completed',
        billing_state: cart.billing_state_id,
        place_of_supply: cart.billing_state_id,
        discount_percentage: cart.discount_percentage,
        items: cart.items.map(item => ({
          product: item.product_id,
          quantity: item.quantity,
          unit_price: parseFloat(String(item.unit_price || 0)),
          gst_rate: item.gst_rate,
          hsn_code: item.hsn_code || '',
        })),
      };

      // Only include customer if it exists
      if (customerId) {
        saleData.customer = customerId;
      }


      const sale = await salesService.create(saleData);
      dispatch(addNotification({
        message: 'Sale completed successfully!',
        type: 'success',
      }));
      setCompletedSale(sale);
      setShowInvoice(true);
    } catch (error: any) {
      dispatch(addNotification({
        message: error.response?.data?.error || 'Failed to process sale',
        type: 'error',
      }));
    } finally {
      setProcessing(false);
    }
  };

  const handleCloseInvoice = () => {
    setShowInvoice(false);
    setCompletedSale(null);
    dispatch(clearCart());
    setGuestName('');
    setGuestPhone('');
  };

  const selectedCustomer = customers.find(c => c.id === cart.customer_id);

  return (
    <div className="container-fluid h-100">
      <div className="row h-100">
        {/* Left Panel - Products */}
        <div className="col-lg-8 h-100 overflow-auto">
          <div className="mb-4">
            <h2 className="h4 mb-3">
              <i className="bi bi-grid me-2"></i>
              Products
            </h2>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search products by name or SKU..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="row g-3">
            {filteredProducts.slice(0, 12).map((product) => (
              <div key={product.id} className="col-md-4 col-lg-3">
                <div
                  className="card h-100 cursor-pointer"
                  onClick={() => handleAddToCart(product)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-body">
                    <h6 className="card-title mb-1">{product.name}</h6>
                    <p className="text-muted small mb-2">{product.sku}</p>
                    <p className="h5 text-primary mb-1">₹{parseFloat(String(product.selling_price || product.unit_price || 0)).toFixed(2)}</p>
                    <p className="text-muted small mb-1">GST: {product.gst_rate}%</p>
                    <p className="small mb-0">
                      <span className={`badge bg-${product.stock_quantity > 10 ? 'success' : 'warning'}`}>
                        Stock: {product.stock_quantity}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-inbox fs-1 text-muted"></i>
              <p className="text-muted mt-2">No products with stock available</p>
            </div>
          )}
        </div>

        {/* Right Panel - Cart */}
        <div className="col-lg-4 border-start h-100 overflow-auto">
          {/* Customer Section */}
          <div className="mb-3">
            <h6 className="fw-semibold mb-2">Customer</h6>
            {selectedCustomer ? (
              <div className="card bg-light">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-semibold">{selectedCustomer.name}</div>
                      <div className="small text-muted">{selectedCustomer.phone}</div>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => dispatch(setCustomer({ id: null, name: '' }))}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  className="form-control form-control-sm mb-2"
                  placeholder="Guest Name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
                <input
                  type="tel"
                  className="form-control form-control-sm mb-2"
                  placeholder="Guest Phone (optional)"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                />
                <button
                  className="btn btn-sm btn-outline-primary w-100"
                  onClick={() => setShowCustomerSelect(!showCustomerSelect)}
                >
                  <i className="bi bi-person me-2"></i>
                  Select Registered Customer
                </button>
                {showCustomerSelect && (
                  <div className="mt-2 border rounded" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    {customers.map((customer) => (
                      <button
                        key={customer.id}
                        className="btn btn-sm btn-light w-100 text-start"
                        onClick={() => {
                          dispatch(setCustomer({ id: customer.id, name: customer.name }));
                          setShowCustomerSelect(false);
                        }}
                      >
                        <div className="fw-semibold">{customer.name}</div>
                        <div className="small text-muted">{customer.phone}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Billing State Section */}
          <div className="mb-3">
            <h6 className="fw-semibold mb-2">Billing State</h6>
            <select
              className="form-select form-select-sm"
              value={cart.billing_state_id || ''}
              onChange={(e) => dispatch(setBillingState(e.target.value ? Number(e.target.value) : null))}
            >
              <option value="">Select State</option>
              {states.map(state => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </select>
            <small className="text-muted">
              Required for GST calculation (IGST vs CGST+SGST)
            </small>
          </div>

          {/* Cart Items */}
          <div className="mb-3">
            <h6 className="fw-semibold mb-2">
              <i className="bi bi-cart me-2"></i>
              Cart ({cart.items.length})
            </h6>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {cart.items.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <i className="bi bi-cart-x fs-1"></i>
                  <p className="mt-2">Cart is empty</p>
                </div>
              ) : (
                cart.items.map((item) => (
                  <div key={item.id} className="card mb-2">
                    <div className="card-body p-2">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="flex-grow-1">
                          <div className="fw-semibold small">{item.name}</div>
                          <div className="text-muted" style={{ fontSize: '11px' }}>
                            ₹{parseFloat(String(item.unit_price || 0)).toFixed(2)} × {item.quantity}
                          </div>
                        </div>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => dispatch(removeItem(item.id))}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                          <i className="bi bi-dash"></i>
                        </button>
                        <span className="fw-semibold">{item.quantity}</span>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <i className="bi bi-plus"></i>
                        </button>
                        <span className="ms-auto fw-semibold">
                          ₹{(parseFloat(String(item.unit_price || 0)) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Totals */}
          {cart.items.length > 0 && (
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between small mb-1">
                  <span>Subtotal:</span>
                  <span>₹{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between small mb-1">
                  <span>
                    CGST @ {totals.subtotal > 0 ? ((totals.gstAmount / 2 / totals.subtotal) * 100).toFixed(2) : '0.00'}%:
                  </span>
                  <span>₹{(totals.gstAmount / 2).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between small mb-1">
                  <span>
                    SGST @ {totals.subtotal > 0 ? ((totals.gstAmount / 2 / totals.subtotal) * 100).toFixed(2) : '0.00'}%:
                  </span>
                  <span>₹{(totals.gstAmount / 2).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center small mb-1">
                  <span>Discount:</span>
                  <div className="input-group input-group-sm" style={{ width: '100px' }}>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={cart.discount_percentage}
                      onChange={(e) => dispatch(setDiscount(parseFloat(e.target.value) || 0))}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span className="input-group-text">%</span>
                  </div>
                </div>
                {totals.discount > 0 && (
                  <div className="d-flex justify-content-between small text-success mb-1">
                    <span>Discount Amount:</span>
                    <span>-₹{totals.discount.toFixed(2)}</span>
                  </div>
                )}
                {totals.roundOff !== 0 && (
                  <div className="d-flex justify-content-between small mb-1">
                    <span>Round Off:</span>
                    <span>{totals.roundOff > 0 ? '+' : ''}₹{totals.roundOff.toFixed(2)}</span>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between fw-bold">
                  <span>TOTAL:</span>
                  <span className="fs-5">₹{totals.roundedTotal.toFixed(0)}</span>
                </div>
                <button
                  className="btn btn-primary w-100 mt-3"
                  onClick={handleInitiateCheckout}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Complete Sale'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <PaymentModal
        show={showPaymentModal}
        total={totals.total}
        onSelectPayment={handlePaymentSelect}
        onClose={() => setShowPaymentModal(false)}
      />

      {completedSale && (
        <InvoicePreview
          show={showInvoice}
          sale={completedSale}
          onClose={handleCloseInvoice}
        />
      )}
    </div>
  );
};

export default POS;
