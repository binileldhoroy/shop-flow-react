export interface Payment {
  id: number;
  payment_number: string;
  amount: string | number;
  payment_mode: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'cheque' | 'other';
  payment_type: 'sale' | 'purchase';
  payment_date: string;
  notes?: string;
  reference_number?: string;

  // Relations
  company: number;
  sale_order?: number;
  purchase_order?: number;
  received_by?: number;

  // Read-only fields from serializer
  sale_order_number?: string;
  purchase_order_number?: string;
  received_by_name?: string;
  created_at: string;
}

export interface PaymentSearchParams {
  mode?: string;
  type?: string;
  search?: string; // If implemented in backend
}

export interface PaymentFormData {
  amount: number | string;
  payment_mode: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'cheque' | 'other';
  payment_type: 'sale' | 'purchase';
  reference_number?: string;
  notes?: string;
  // For manual entry we might only support basic fields initially,
  // or simple ID entry for orders if needed.
}
