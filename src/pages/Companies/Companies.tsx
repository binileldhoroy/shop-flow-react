import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@hooks/useRedux';
import { fetchAllCompanies } from '@store/slices/companySlice';
import { companyService } from '@api/services/company.service';
import { Company } from '../../types/company.types';
import CompanyFormModal from '@components/features/companies/CompanyFormModal';
import DeleteConfirmModal from '@components/common/DeleteConfirmModal/DeleteConfirmModal';
import { addNotification } from '@store/slices/uiSlice';
import { Building2, Plus, Search, Mail, Phone, MapPin, Edit2, Trash2, Play, Pause, Inbox } from 'lucide-react';

const Companies: React.FC = () => {
  const dispatch = useAppDispatch();
  const { companies, loading: reduxLoading } = useAppSelector(state => state.company);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchAllCompanies());
  }, [dispatch]);

  const handleAddCompany = () => {
    setSelectedCompany(null);
    setShowFormModal(true);
  };

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setShowFormModal(true);
  };

  const handleDeleteCompany = (company: Company) => {
    setSelectedCompany(company);
    setShowDeleteModal(true);
  };

  const handleToggleStatus = async (company: Company) => {
    try {
      const formData = new FormData();
      formData.append('is_active', (!company.is_active).toString());

      await companyService.update(company.id, formData as any);
      dispatch(addNotification({
        message: `Company ${company.is_active ? 'deactivated' : 'activated'} successfully`,
        type: 'success',
      }));
      dispatch(fetchAllCompanies());
    } catch (error: any) {
      const errorMessage = error.response?.data?.message
        || error.response?.data?.error
        || error.message
        || 'Failed to update company status';

      dispatch(addNotification({
        message: errorMessage,
        type: 'error',
      }));
    }
  };

  const handleFormSubmit = async (data: FormData) => {
    try {
      setFormLoading(true);

      if (selectedCompany) {
        // Update
        await companyService.update(selectedCompany.id, data as any);
        dispatch(addNotification({
          message: 'Company updated successfully',
          type: 'success',
        }));
      } else {
        // Create
        console.log('Creating new company...');
        await companyService.create(data as any);
        dispatch(addNotification({
          message: 'Company created successfully',
          type: 'success',
        }));
      }

      setShowFormModal(false);
      dispatch(fetchAllCompanies());
    } catch (error: any) {
      console.error('Company operation error:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message
        || error.response?.data?.error
        || error.response?.data?.detail
        || error.message
        || 'Operation failed';

      dispatch(addNotification({
        message: errorMessage,
        type: 'error',
      }));
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCompany) return;

    try {
      setFormLoading(true);
      await companyService.deactivate(selectedCompany.id);
      dispatch(addNotification({
        message: 'Company deleted successfully',
        type: 'success',
      }));
      setShowDeleteModal(false);
      dispatch(fetchAllCompanies());
    } catch (error: any) {
      const errorMessage = error.response?.data?.message
        || error.response?.data?.error
        || error.message
        || 'Failed to delete company';

      dispatch(addNotification({
        message: errorMessage,
        type: 'error',
      }));
    } finally {
      setFormLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter ||
                         (statusFilter === 'active' && company.is_active) ||
                         (statusFilter === 'inactive' && !company.is_active);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-8 h-8" />
            Companies
          </h1>
          <p className="text-gray-600 mt-1">Manage all companies in the system</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddCompany}>
          <Plus className="w-5 h-5 inline mr-2" />
          Add Company
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <select
            className="input-field flex-1"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <span className="text-gray-600 whitespace-nowrap">
            {filteredCompanies.length} compan{filteredCompanies.length !== 1 ? 'ies' : 'y'}
          </span>
        </div>
      </div>

      {/* Companies Grid */}
      {reduxLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="card text-center py-12">
          <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No companies found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map(company => (
            <div key={company.id} className="card">
              <div className="flex items-start gap-3 mb-4">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={company.company_name}
                    className="w-12 h-12 object-cover rounded-lg"
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling;
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center ${company.logo ? 'hidden' : ''}`}>
                  <Building2 className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900">{company.company_name}</h5>
                  <span className={`badge ${company.is_active ? 'badge-success' : 'badge-secondary'} mt-1`}>
                    {company.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  {company.email}
                </p>
                <p className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  {company.phone}
                </p>
                <p className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {company.city}, {company.state}
                </p>

              </div>

              <div className="flex gap-2 mb-3">
                 <button
                   className="btn btn-outline-secondary text-sm w-full"
                   onClick={() => window.location.href = `/companies/${company.id}`}
                 >
                   View Details
                 </button>
              </div>

              <div className="flex gap-2">
                <button
                  className="btn btn-outline-primary text-sm flex-1"
                  onClick={() => handleEditCompany(company)}
                >
                  <Edit2 className="w-4 h-4 inline mr-1" />
                  Edit
                </button>
                <button
                  className={`btn ${company.is_active ? 'btn-outline-warning' : 'btn-outline-success'} text-sm flex-1`}
                  onClick={() => handleToggleStatus(company)}
                >
                  {company.is_active ? (
                    <><Pause className="w-4 h-4 inline mr-1" />Deactivate</>
                  ) : (
                    <><Play className="w-4 h-4 inline mr-1" />Activate</>
                  )}
                </button>
                <button
                  className="btn btn-outline-danger text-sm"
                  onClick={() => handleDeleteCompany(company)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CompanyFormModal
        show={showFormModal}
        onHide={() => setShowFormModal(false)}
        onSubmit={handleFormSubmit}
        company={selectedCompany}
        loading={formLoading}
      />

      <DeleteConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Company"
        message={`Are you sure you want to delete "${selectedCompany?.company_name}"? This will also delete all associated data including users, products, and transactions. This action cannot be undone.`}
        loading={formLoading}
      />
    </div>
  );
};

export default Companies;
