import React, { useState } from 'react';
import { useAppDispatch } from '@hooks/useRedux';
import { productService } from '@api/services/product.service';
import { customerService } from '@api/services/customer.service';
import { saleService } from '@api/services/sale.service';
import { addNotification } from '@store/slices/uiSlice';
import { Search, Plus, Minus, Trash2, ShoppingCart, User, Package } from 'lucide-react';
import PaymentModal from '../../components/pos/PaymentModal';
import InvoicePreview from '../../components/pos/InvoicePreview';

interface CartItem {
  id: number;
  product_id: number;
  name: string;
  sku: string;
  unit_price: number;
  selling_price: number;
  quantity: number;
  gst_rate: number;
  hsn_code: string;
  tax_included: boolean;
  stock_quantity?: number;
}

interface CartState {
  items: CartItem[];
  customer_id: number | null;
  billing_state: number | null;
  discount_percentage: number;
}

const POS: React.FC = () => {
  const dispatch = useAppDispatch();
  const [productSearch, setProductSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [showCustomerSelect, setShowCustomerSelect] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [completedSale, setCompletedSale] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [cart, setCart] = useState<CartState>({
    items: [],
    customer_id: null,
    billing_state: null,
    discount_percentage: 0,
  });

  // Fetch products
  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getAll();
        setProducts(data.filter((p: any) => p.stock_quantity > 0));
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  // Fetch customers
  React.useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await customerService.getAll();
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
    fetchCustomers();
  }, []);

  const selectedCustomer = customers.find((c: any) => c.id === cart.customer_id);

  const handleAddToCart = (product: any) => {
    // Check if product has stock
    if (!product.stock_quantity || product.stock_quantity <= 0) {
      dispatch(addNotification({ message: 'Product is out of stock', type: 'error' }));
      return;
    }

    // Check if already in cart
    const existingItem = cart.items.find(item => item.product_id === product.id);
    if (existingItem) {
      // Check if we can add more
      if (existingItem.quantity >= product.stock_quantity) {
        dispatch(addNotification({ message: `Only ${product.stock_quantity} units available`, type: 'error' }));
        return;
      }
      // Update quantity
      setCart(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      }));
    } else {
      // Add new item
      const basePrice = product.tax_included
        ? parseFloat(product.base_price)
        : parseFloat(product.selling_price);

      const newItem: CartItem = {
        id: Date.now(),
        product_id: product.id,
        name: product.name,
        sku: product.sku,
        unit_price: basePrice,
        selling_price: parseFloat(product.selling_price),
        quantity: 1,
        gst_rate: parseFloat(product.gst_rate),
        hsn_code: product.hsn_code,
        tax_included: product.tax_included,
        stock_quantity: product.stock_quantity,
      };

      setCart(prev => ({
        ...prev,
        items: [...prev.items, newItem],
      }));
    }
    setProductSearch('');
  };

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    const item = cart.items.find(i => i.id === itemId);
    if (item && item.stock_quantity && newQuantity > item.stock_quantity) {
      dispatch(addNotification({ message: `Only ${item.stock_quantity} units available`, type: 'error' }));
      return;
    }
    if (newQuantity < 1) return;

    setCart(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ),
    }));
  };

  const handleRemoveItem = (itemId: number) => {
    setCart(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId),
    }));
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

    return { subtotal, gstAmount, discount, total };
  };

  const totals = calculateTotals();

  const filteredProducts = products.filter((p: any) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleInitiateCheckout = () => {
    if (cart.items.length === 0) {
      dispatch(addNotification({ message: 'Cart is empty', type: 'error' }));
      return;
    }

    // Validate stock before checkout
    for (const item of cart.items) {
      if (item.stock_quantity && item.quantity > item.stock_quantity) {
        dispatch(addNotification({ message: `${item.name}: Only ${item.stock_quantity} units available`, type: 'error' }));
        return;
      }
    }

    setShowPaymentModal(true);
  };

  const handlePaymentSelect = async (paymentMethod: string) => {
    setShowPaymentModal(false);
    setIsProcessing(true);

    try {
      let customerId = cart.customer_id;

      // Create guest customer if needed
      if (!customerId && guestName) {
        const guest = await customerService.create({
          name: guestName,
          phone: guestPhone || '',
        });
        customerId = guest.id;
      }

      const saleData = {
        order_number: `SO-${Date.now()}`,
        customer: customerId,
        payment_method: paymentMethod,
        payment_status: 'paid',
        billing_state: cart.billing_state,
        place_of_supply: cart.billing_state,
        discount_percentage: cart.discount_percentage,
        items: cart.items.map(item => ({
          product: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          gst_rate: item.gst_rate,
          hsn_code: item.hsn_code,
        })),
      };

      const sale = await saleService.create(saleData);
      dispatch(addNotification({ message: 'Sale completed successfully!', type: 'success' }));
      setCompletedSale(sale);
      setShowInvoice(true);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error || 'Failed to process sale';
      dispatch(addNotification({ message: errorMsg, type: 'error' }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseInvoice = () => {
    setShowInvoice(false);
    setCompletedSale(null);
    setCart({
      items: [],
      customer_id: null,
      billing_state: null,
      discount_percentage: 0,
    });
    setGuestName('');
    setGuestPhone('');
  };

  return (
    <div className="h-full flex gap-6">
      {/* Left Panel - Products */}
      <div className="flex-1 space-y-4">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Products</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.slice(0, 12).map((product: any) => (
            <button
              key={product.id}
              onClick={() => handleAddToCart(product)}
              className="card hover:shadow-lg transition-shadow text-left p-4"
            >
              <div className="font-medium text-gray-900">{product.name}</div>
              <div className="text-sm text-gray-500 mt-1">{product.sku}</div>
              <div className="text-lg font-bold text-primary-600 mt-2">
                ₹{product.selling_price}
              </div>
              <div className="text-xs text-gray-500">GST: {product.gst_rate}%</div>
              <div className="text-xs font-medium text-success-600 mt-1">
                Stock: {product.stock_quantity} {product.unit}
              </div>
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="card text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No products with stock available</p>
            <p className="text-sm mt-1">Add stock to products in Inventory page</p>
          </div>
        )}
      </div>

      {/* Right Panel - Cart */}
      <div className="w-96 space-y-4">
        {/* Customer Selection */}
        <div className="card">
          <h3 className="font-semibold mb-3">Customer</h3>
          {selectedCustomer ? (
            <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
              <div>
                <div className="font-medium">{selectedCustomer.name}</div>
                <div className="text-sm text-gray-600">{selectedCustomer.phone}</div>
              </div>
              <button
                onClick={() => setCart(prev => ({ ...prev, customer_id: null }))}
                className="text-danger-600 hover:bg-danger-50 p-2 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Guest Name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="input-field"
              />
              <input
                type="tel"
                placeholder="Guest Phone (optional)"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="input-field"
              />
              <button
                onClick={() => setShowCustomerSelect(!showCustomerSelect)}
                className="btn btn-secondary w-full flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                Select Registered Customer
              </button>
              {showCustomerSelect && (
                <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg">
                  {customers.map((customer: any) => (
                    <button
                      key={customer.id}
                      onClick={() => {
                        setCart(prev => ({ ...prev, customer_id: customer.id }));
                        setShowCustomerSelect(false);
                      }}
                      className="w-full text-left p-2 hover:bg-gray-50"
                    >
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-600">{customer.phone}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="card flex-1 overflow-hidden flex flex-col">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Cart ({cart.items.length})
          </h3>

          <div className="flex-1 overflow-y-auto space-y-2">
            {cart.items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Cart is empty
              </div>
            ) : (
              cart.items.map((item) => (
                <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-gray-500">₹{item.unit_price} × {item.quantity}</div>
                      {item.stock_quantity && (
                        <div className="text-xs text-success-600 mt-1">
                          Stock: {item.stock_quantity} available
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-danger-600 hover:bg-danger-50 p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                      className="p-1 bg-white rounded hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="p-1 bg-white rounded hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <div className="ml-auto font-medium">
                      ₹{(item.unit_price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totals */}
          {cart.items.length > 0 && (
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₹{totals.subtotal.toFixed(2)}</span>
              </div>

              {/* GST Breakdown */}
              {totals.gstAmount > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span>CGST ({((totals.gstAmount / 2 / totals.subtotal) * 100).toFixed(2)}%):</span>
                    <span>₹{(totals.gstAmount / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>SGST ({((totals.gstAmount / 2 / totals.subtotal) * 100).toFixed(2)}%):</span>
                    <span>₹{(totals.gstAmount / 2).toFixed(2)}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between items-center text-sm">
                <span>Discount:</span>
                <input
                  type="number"
                  value={cart.discount_percentage}
                  onChange={(e) => setCart(prev => ({ ...prev, discount_percentage: parseFloat(e.target.value) || 0 }))}
                  className="w-20 text-right input-field py-1"
                  min="0"
                  max="100"
                  step="0.1"
                />
                <span>%</span>
              </div>

              {totals.discount > 0 && (
                <div className="flex justify-between text-sm text-success-600">
                  <span>Discount Amount:</span>
                  <span>-₹{totals.discount.toFixed(2)}</span>
                </div>
              )}

              {(() => {
                const calculatedTotal = totals.total;
                const roundedTotal = Math.round(calculatedTotal);
                const roundOff = roundedTotal - calculatedTotal;

                return roundOff !== 0 ? (
                  <div className="flex justify-between text-sm">
                    <span>Round Off:</span>
                    <span>{roundOff > 0 ? '+' : ''}₹{roundOff.toFixed(2)}</span>
                  </div>
                ) : null;
              })()}

              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span>₹{Math.round(totals.total).toFixed(0)}</span>
              </div>
              <button
                onClick={handleInitiateCheckout}
                disabled={isProcessing}
                className="btn btn-primary w-full mt-4"
              >
                {isProcessing ? 'Processing...' : 'Complete Sale'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          total={totals.total}
          onSelectPayment={handlePaymentSelect}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      {/* Invoice Preview */}
      {showInvoice && completedSale && (
        <InvoicePreview
          sale={completedSale}
          onClose={handleCloseInvoice}
        />
      )}
    </div>
  );
};

export default POS;
