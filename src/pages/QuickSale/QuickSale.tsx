import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '@hooks/useRedux';
import { useDebounce } from '@hooks/useDebounce';
import { productService } from '@api/services/product.service';
import { saleService } from '@api/services/sale.service';
import { addNotification } from '@store/slices/uiSlice';
import { Search, ShoppingCart, Trash2, CreditCard, Banknote, User, Package, Plus, Minus, Receipt, Smartphone, Building2 } from 'lucide-react';
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

const QuickSale: React.FC = () => {
  const dispatch = useAppDispatch();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [products, setProducts] = useState<any[]>([]);
  // const [filteredProducts, setFilteredProducts] = useState<any[]>([]); // No longer needed, products will be the filtered list

  const [cart, setCart] = useState<CartState>({
    items: [],
    customer_id: null,
    billing_state: null,
    discount_percentage: 0,
  });
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedSale, setCompletedSale] = useState<any>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Server-side search effect
  useEffect(() => {
    const searchProducts = async () => {
      // If search is empty, don't load anything (User request for efficiency)
      if (!debouncedSearchTerm.trim()) {
          setProducts([]);
          return;
      }

      setIsLoading(true);
      try {
        const params: any = { search: debouncedSearchTerm };
        const response = await productService.getAll(params);
        const data = response.results || response;
        setProducts(data.filter((p: any) => p.stock_quantity > 0));
      } catch (error) {
        console.error('Error searching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    searchProducts();
  }, [debouncedSearchTerm]);

  // Focus search on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);


  const handleAddToCart = (product: any) => {
    const existingItem = cart.items.find(item => item.product_id === product.id);

    if (existingItem) {
      if (existingItem.quantity >= product.stock_quantity) {
        dispatch(addNotification({ message: `Only ${product.stock_quantity} available`, type: 'error' }));
        return;
      }
      setCart(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
        )
      }));
    } else {
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
      setCart(prev => ({ ...prev, items: [...prev.items, newItem] }));
    }
    // Optional: Clear search after selection to be ready for next scan?
    // User might want to search again.
    setSearchTerm('');
    if(searchInputRef.current) searchInputRef.current.focus();
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!searchTerm.trim()) return;

      // Immediate search for scanning behavior
      try {
         const response = await productService.getAll({ search: searchTerm });
         const results = response.results || response;

         const validResults = results.filter((p: any) => p.stock_quantity > 0);
         setProducts(validResults);

         // Check exact match
         const exactMatch = validResults.find((p: any) =>
            p.sku.toLowerCase() === searchTerm.toLowerCase() ||
            (p.barcode && p.barcode.toLowerCase() === searchTerm.toLowerCase())
         );

         if (exactMatch) {
            handleAddToCart(exactMatch);
         } else if (validResults.length === 1) {
             // Optional: if only one result found but not exact string match, auto add?
             // Maybe safer to only auto-add on exact barcode/sku match.
             // handleAddToCart(validResults[0]);
         }
      } catch (err) {
         console.error("Scan error", err);
      }
    }
  };

  const removeItem = (id: number) => {
    setCart(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          if (newQty < 1) return item;
          if (item.stock_quantity && newQty > item.stock_quantity) {
             // dispatch(addNotification(...)); // Optional: notify
             return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    }));
  };

  // Calculations
  const calculateTotals = () => {
    let subtotal = 0;
    let gstAmount = 0;
    cart.items.forEach(item => {
      const q = item.quantity;
      const rate = item.gst_rate / 100;
      if (item.tax_included) {
        const totalWithTax = item.selling_price * q;
        const base = totalWithTax / (1 + rate);
        subtotal += base;
        gstAmount += (totalWithTax - base);
      } else {
        const base = item.unit_price * q;
        subtotal += base;
        gstAmount += base * rate;
      }
    });

    const discount = (subtotal * cart.discount_percentage) / 100;
    const total = subtotal + gstAmount - discount;
    return { subtotal, gstAmount, discount, total };
  };

  const totals = calculateTotals();

  // Payment
  const processPayment = async (method: string) => {
    if (cart.items.length === 0) return;
    setIsProcessing(true);

    try {
      // If no customer selected, create guest or use null depending on backend req
      // POS.tsx used Guest Name inputs. We'll simplify to 'Walk-in Customer' or null if allowed.
      // Or we can just default to null and backend handles it?
      // POS.tsx created a guest customer if name was provided.
      // User said "One click".
      // We'll proceed with null customer (Walk-in) if none selected.

      const saleData = {
        order_number: `QS-${Date.now()}`,
        customer: cart.customer_id,
        payment_method: method,
        payment_status: 'paid',
        billing_state: cart.billing_state, // Default?
        place_of_supply: cart.billing_state,
        discount_percentage: cart.discount_percentage,
        items: cart.items.map(item => ({
            product: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            gst_rate: item.gst_rate,
            hsn_code: item.hsn_code,
        }))
      };

      const sale = await saleService.create(saleData);
      setCompletedSale(sale);
      setShowInvoice(true);
      dispatch(addNotification({ message: 'Sale Completed', type: 'success' }));
    } catch (err: any) {
      dispatch(addNotification({ message: err?.response?.data?.error || 'Payment Failed', type: 'error' }));
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
      discount_percentage: 0
    });
    setSelectedCustomer(null);
    setSearchTerm('');
    if (searchInputRef.current) searchInputRef.current.focus(); // Refocus for next sale
  };

  // Render
  return (
    <div className="h-full flex gap-6 p-4">
      {/* Left Panel: Search & Results */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
           <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
             <input
               ref={searchInputRef}
               type="text"
               placeholder="Scan barcode or type product name..."
               className="w-full pl-12 pr-4 py-4 text-xl border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all outline-none"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
               onKeyDown={handleKeyDown}
               autoFocus
             />
           </div>
        </div>

        {/* Results List */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h2 className="font-semibold text-gray-700 flex items-center gap-2">
              <Package className="w-5 h-5"/>
              Available Products
            </h2>
            <span className="text-sm text-gray-500">
              {products.length} results
            </span>
          </div>

          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {products.map(product => (
              <button
                key={product.id}
                onClick={() => handleAddToCart(product)}
                className="w-full flex items-center justify-between p-4 hover:bg-primary-50 border border-transparent hover:border-primary-100 rounded-lg group transition-all"
              >
                <div className="text-left">
                  <div className="font-bold text-gray-800 text-lg">{product.name}</div>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                    <span className="bg-gray-100 px-2 py-0.5 rounded">SKU: {product.sku}</span>
                    {product.barcode && <span>{product.barcode}</span>}
                    {/* Placeholder for Batch if it existed */}
                    {/* <span className="text-blue-600">Batch: A101</span> */}
                  </div>
                </div>
                <div className="text-right">
                   <div className="font-bold text-xl text-primary-600">₹{parseFloat(product.selling_price).toFixed(2)}</div>
                   <div className="text-sm font-medium text-success-600">
                     {product.stock_quantity} available
                   </div>
                </div>
              </button>
            ))}
            {products.length === 0 && searchTerm && !isLoading && (
              <div className="text-center py-12 text-gray-400">
                No products found
              </div>
            )}
            {!searchTerm && (
                <div className="text-center py-12 text-gray-400">
                    Type or scan to search products...
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel: Receipt / Cart */}
      <div className="w-[450px] bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
           <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Current Sale
              </h2>
              <div className="text-sm bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-medium">
                 {cart.items.reduce((acc, i) => acc + i.quantity, 0)} Items
              </div>
           </div>

           {/* Customer Selector (Simplified) */}
           <div className="relative">
             <button
                onClick={() => setSelectedCustomer(null)} // Reset logic if needed or open modal
                className="w-full flex items-center justify-between p-2 bg-white border rounded-lg hover:border-primary-300"
             >
                <span className="flex items-center gap-2 text-gray-700">
                   <User className="w-4 h-4"/>
                   {selectedCustomer ? selectedCustomer.name : 'Walk-in Customer'}
                </span>
                {/* Maybe a clear button or default logic */}
             </button>
             {/* Note: Full customer search can be added here, keeping it simple for "Quick Sale" */}
           </div>
        </div>

        {/* Cart Items (Receipt Style) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono">
           {cart.items.map(item => (
             <div key={item.id} className="flex justify-between items-start pb-3 border-b border-dashed border-gray-200 last:border-0">
               <div className="flex-1">
                 <div className="font-semibold text-gray-800">{item.name}</div>
                 <div className="text-xs text-gray-500 mt-1">
                    {item.quantity} x ₹{item.unit_price.toFixed(2)}
                 </div>
               </div>
               <div className="flex flex-col items-end gap-1">
                 <div className="font-bold">₹{(item.unit_price * item.quantity).toFixed(2)}</div>
                 <div className="flex items-center gap-1 bg-gray-100 rounded p-0.5">
                   <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white rounded"><Minus className="w-3 h-3"/></button>
                   <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white rounded"><Plus className="w-3 h-3"/></button>
                   <button onClick={() => removeItem(item.id)} className="p-1 hover:bg-red-50 text-red-500 rounded"><Trash2 className="w-3 h-3"/></button>
                 </div>
               </div>
             </div>
           ))}
           {cart.items.length === 0 && (
             <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
               <ShoppingCart className="w-12 h-12 mb-2"/>
               <p>Cart is empty</p>
             </div>
           )}
        </div>
        {/* Totals & Payments */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{totals.subtotal.toFixed(2)}</span>
              </div>

              {totals.gstAmount > 0 && (
                <>
                  <div className="flex justify-between text-gray-600">
                    <span>CGST ({totals.subtotal > 0 ? ((totals.gstAmount / 2 / totals.subtotal) * 100).toFixed(2) : '0'}%)</span>
                    <span>₹{(totals.gstAmount / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>SGST ({totals.subtotal > 0 ? ((totals.gstAmount / 2 / totals.subtotal) * 100).toFixed(2) : '0'}%)</span>
                    <span>₹{(totals.gstAmount / 2).toFixed(2)}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between items-center text-sm pt-2 border-t border-dashed">
                <span>Discount</span>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={cart.discount_percentage}
                    onChange={(e) => setCart(prev => ({ ...prev, discount_percentage: parseFloat(e.target.value) || 0 }))}
                    className="w-16 text-right border rounded px-1 py-0.5 text-sm"
                    min="0"
                    max="100"
                  />
                  <span className="ml-1">%</span>
                </div>
              </div>
              {totals.discount > 0 && (
                 <div className="flex justify-between text-success-600 text-xs">
                   <span>Discount Amount</span>
                   <span>-₹{totals.discount.toFixed(2)}</span>
                 </div>
              )}

              <div className="flex justify-between font-bold text-xl text-gray-900 border-t pt-2 mt-2">
                <span>Total</span>
                <span>₹{Math.round(totals.total).toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={isProcessing || cart.items.length === 0}
                onClick={() => processPayment('cash')}
                className="flex flex-col items-center justify-center py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
              >
                <Banknote className="w-5 h-5 mb-1"/>
                <span className="font-bold text-sm">CASH</span>
              </button>
              <button
                disabled={isProcessing || cart.items.length === 0}
                onClick={() => processPayment('card')}
                className="flex flex-col items-center justify-center py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
              >
                <CreditCard className="w-5 h-5 mb-1"/>
                <span className="font-bold text-sm">CARD</span>
              </button>
              <button
                disabled={isProcessing || cart.items.length === 0}
                onClick={() => processPayment('upi')}
                className="flex flex-col items-center justify-center py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
              >
                <Smartphone className="w-5 h-5 mb-1"/>
                <span className="font-bold text-sm">UPI</span>
              </button>
              <button
                disabled={isProcessing || cart.items.length === 0}
                onClick={() => processPayment('net_banking')}
                className="flex flex-col items-center justify-center py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
              >
                <Building2 className="w-5 h-5 mb-1"/>
                <span className="font-bold text-sm">NET BANKING</span>
              </button>
            </div>
        </div>
      </div>

      {/* Invisible Invoice for Printing (or Modal if preferred) */}
      {showInvoice && completedSale && (
        <InvoicePreview sale={completedSale} onClose={handleCloseInvoice} />
      )}
    </div>
  );
};

export default QuickSale;
