import React, { useState, useEffect, useCallback } from 'react';
import { supplierService } from '../../api/services/supplier.service';
import { Supplier, SupplierFormData } from '../../types/supplier.types';
import { useAppDispatch } from '../../hooks/useRedux';
import { addNotification } from '../../store/slices/uiSlice';
import { Truck, Plus, Search } from 'lucide-react';

import SupplierList from '../../components/suppliers/SupplierList';
import SupplierFormModal from '../../components/suppliers/SupplierFormModal';

const Suppliers: React.FC = () => {
  const dispatch = useAppDispatch();

  // Data States
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal States
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await supplierService.getAllSuppliers();
      setSuppliers(data);
    } catch (error: any) {
      dispatch(addNotification({
        message: 'Failed to load suppliers',
        type: 'error',
      }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered Suppliers
  const filteredSuppliers = suppliers.filter(s => {
    if (statusFilter === 'active' && !s.is_active) return false;
    if (statusFilter === 'inactive' && s.is_active) return false;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const nameMatch = s.name.toLowerCase().includes(search);
      const phoneMatch = s.phone.includes(search);
      const emailMatch = (s.email || '').toLowerCase().includes(search);
      if (!nameMatch && !phoneMatch && !emailMatch) return false;
    }

    return true;
  });

  const handleCreate = () => {
    setSelectedSupplier(null);
    setShowFormModal(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowFormModal(true);
  };

  const onFormSubmit = async (data: SupplierFormData) => {
    try {
      setActionLoading(true);
      if (selectedSupplier) {
        await supplierService.updateSupplier(selectedSupplier.id, data);
        dispatch(addNotification({ message: 'Supplier updated successfully', type: 'success' }));
      } else {
        await supplierService.createSupplier(data);
        dispatch(addNotification({ message: 'Supplier created successfully', type: 'success' }));
      }
      setShowFormModal(false);
      loadData();
    } catch (error: any) {
      dispatch(addNotification({
        message: error.response?.data?.message || 'Operation failed',
        type: 'error',
      }));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-8 h-8" />
            Suppliers
          </h1>
          <p className="text-gray-600 mt-1">Manage product suppliers and vendors</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>
          <Plus className="w-5 h-5 inline mr-2" />
          Add Supplier
        </button>
      </div>

      {/* Filters */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            className="input-field w-40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="card" style={{ height: 'calc(100vh - 280px)', display: 'flex', flexDirection: 'column' }}>
        <SupplierList
          suppliers={filteredSuppliers}
          loading={loading}
          onEdit={handleEdit}
        />
      </div>

      {/* Modals */}
      <SupplierFormModal
        show={showFormModal}
        onHide={() => setShowFormModal(false)}
        onSubmit={onFormSubmit}
        supplier={selectedSupplier}
        loading={actionLoading}
      />
    </div>
  );
};

export default Suppliers;
