import React, { useState, useEffect, useCallback } from 'react';
import { paymentService } from '../../api/services/payment.service';
import { Payment, PaymentFormData } from '../../types/payment.types';
import { useAppDispatch } from '../../hooks/useRedux';
import { addNotification } from '../../store/slices/uiSlice';
import { Banknote, Plus, Search } from 'lucide-react';

import PaymentList from '../../components/payments/PaymentList';
import PaymentDetailModal from '../../components/payments/PaymentDetailModal';
import PaymentFormModal from '../../components/payments/PaymentFormModal';

const Payments: React.FC = () => {
  const dispatch = useAppDispatch();

  // Data
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (typeFilter) params.type = typeFilter;
      if (modeFilter) params.mode = modeFilter;
      if (searchTerm) params.search = searchTerm;

      const data = await paymentService.getAll(params);
      setPayments(data);
    } catch (error: any) {
      dispatch(addNotification({
        message: 'Failed to load payments',
        type: 'error',
      }));
    } finally {
      setLoading(false);
    }
  }, [typeFilter, modeFilter, searchTerm, dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
        loadData();
    }, 500);
    return () => clearTimeout(timer);
  }, [loadData, searchTerm]);

  const handleCreate = () => {
    setShowFormModal(true);
  };

  const handleCreateSubmit = async (data: PaymentFormData) => {
    try {
        setActionLoading(true);
        await paymentService.create(data);
        dispatch(addNotification({ message: 'Payment recorded successfully', type: 'success' }));
        setShowFormModal(false);
        loadData();
    } catch (error: any) {
        dispatch(addNotification({
            message: error.response?.data?.message || 'Failed to record payment',
            type: 'error'
        }));
    } finally {
        setActionLoading(false);
    }
  };

  const handleView = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Banknote className="w-8 h-8" />
            Payments
          </h1>
          <p className="text-gray-600 mt-1">Track processed transaction history</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>
          <Plus className="w-5 h-5 inline mr-2" />
          Record Payment
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center justify-between">
         <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Search by ID, amount, or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex gap-4">
            <select
              className="input-field w-40"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="sale">Sale (Income)</option>
              <option value="purchase">Purchase (Expense)</option>
            </select>

            <select
              className="input-field w-40"
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
            >
              <option value="">All Modes</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="other">Other</option>
            </select>
         </div>
      </div>

      {/* List */}
      <div className="card" style={{ height: 'calc(100vh - 280px)', display: 'flex', flexDirection: 'column' }}>
        <PaymentList
          payments={payments}
          loading={loading}
          onView={handleView}
        />
      </div>

      {/* Detail Modal */}
      <PaymentDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        payment={selectedPayment}
      />

      {/* Form Modal */}
      <PaymentFormModal
        show={showFormModal}
        onHide={() => setShowFormModal(false)}
        onSubmit={handleCreateSubmit}
        loading={actionLoading}
      />
    </div>
  );
};

export default Payments;
