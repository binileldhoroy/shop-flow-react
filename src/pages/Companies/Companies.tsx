import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@hooks/useRedux';
import { fetchAllCompanies } from '@store/slices/companySlice';
import { companyService } from '@api/services/company.service';
import { Company } from '@types/company.types';
import CompanyFormModal from '@components/features/companies/CompanyFormModal';
import DeleteConfirmModal from '@components/common/DeleteConfirmModal/DeleteConfirmModal';
import { addNotification } from '@store/slices/uiSlice';

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

      await companyService.update(company.id, formData);
      dispatch(addNotification({
        message: `Company ${company.is_active ? 'deactivated' : 'activated'} successfully`,
        type: 'success',
      }));
      dispatch(fetchAllCompanies());
    } catch (error: any) {
      dispatch(addNotification({
        message: error.response?.data?.message || 'Failed to update company status',
        type: 'error',
      }));
    }
  };

  const handleFormSubmit = async (data: FormData) => {
    try {
      setFormLoading(true);

      if (selectedCompany) {
        // Update
        await companyService.update(selectedCompany.id, data);
        dispatch(addNotification({
          message: 'Company updated successfully',
          type: 'success',
        }));
      } else {
        // Create
        await companyService.create(data);
        dispatch(addNotification({
          message: 'Company created successfully',
          type: 'success',
        }));
      }

      setShowFormModal(false);
      dispatch(fetchAllCompanies());
    } catch (error: any) {
      dispatch(addNotification({
        message: error.response?.data?.message || 'Operation failed',
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
      await companyService.delete(selectedCompany.id);
      dispatch(addNotification({
        message: 'Company deleted successfully',
        type: 'success',
      }));
      setShowDeleteModal(false);
      dispatch(fetchAllCompanies());
    } catch (error: any) {
      dispatch(addNotification({
        message: error.response?.data?.message || 'Failed to delete company',
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
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0">
                <i className="bi bi-building me-2"></i>
                Companies
              </h1>
              <p className="text-muted">Manage all companies in the system</p>
            </div>
            <button className="btn btn-primary" onClick={handleAddCompany}>
              <i className="bi bi-plus-circle me-2"></i>
              Add Company
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="col-md-3 text-end">
          <span className="text-muted">
            {filteredCompanies.length} compan{filteredCompanies.length !== 1 ? 'ies' : 'y'}
          </span>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="row">
        {reduxLoading ? (
          <div className="col-12">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-inbox fs-1 text-muted"></i>
                <p className="text-muted mt-2">No companies found</p>
              </div>
            </div>
          </div>
        ) : (
          filteredCompanies.map(company => (
            <div key={company.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-3">
                      {company.logo && (
                        <img
                          src={company.logo}
                          alt={company.company_name}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                      )}
                      <div>
                        <h5 className="mb-0">{company.company_name}</h5>
                        <span className={`badge bg-${company.is_active ? 'success' : 'secondary'} mt-1`}>
                          {company.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="mb-1">
                      <i className="bi bi-envelope me-2 text-muted"></i>
                      <small>{company.email}</small>
                    </p>
                    <p className="mb-1">
                      <i className="bi bi-telephone me-2 text-muted"></i>
                      <small>{company.phone}</small>
                    </p>
                    <p className="mb-0">
                      <i className="bi bi-geo-alt me-2 text-muted"></i>
                      <small>{company.city}, {company.state}</small>
                    </p>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary flex-fill"
                      onClick={() => handleEditCompany(company)}
                    >
                      <i className="bi bi-pencil me-1"></i>
                      Edit
                    </button>
                    <button
                      className={`btn btn-sm btn-outline-${company.is_active ? 'warning' : 'success'} flex-fill`}
                      onClick={() => handleToggleStatus(company)}
                    >
                      <i className={`bi bi-${company.is_active ? 'pause' : 'play'}-circle me-1`}></i>
                      {company.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteCompany(company)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

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
