import React from 'react';
import { useCompany } from '@hooks/useCompany';

const Settings: React.FC = () => {
  const { currentCompany } = useCompany();

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h3 mb-0">
            <i className="bi bi-gear me-2"></i>
            Settings
          </h1>
          <p className="text-muted">Manage application settings</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-building me-2"></i>
                Company Information
              </h5>
            </div>
            <div className="card-body">
              {currentCompany ? (
                <div>
                  <div className="mb-3">
                    <label className="form-label">Company Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={currentCompany.company_name}
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={currentCompany.email}
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={currentCompany.phone}
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={`${currentCompany.address_line1}, ${currentCompany.city}, ${currentCompany.state} - ${currentCompany.pincode}`}
                      readOnly
                    />
                  </div>
                  <button className="btn btn-primary">
                    <i className="bi bi-pencil me-2"></i>
                    Edit Company Info
                  </button>
                </div>
              ) : (
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  No company information available
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-sliders me-2"></i>
                Quick Settings
              </h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary text-start">
                  <i className="bi bi-person me-2"></i>
                  Profile Settings
                </button>
                <button className="btn btn-outline-primary text-start">
                  <i className="bi bi-lock me-2"></i>
                  Change Password
                </button>
                <button className="btn btn-outline-primary text-start">
                  <i className="bi bi-bell me-2"></i>
                  Notifications
                </button>
                <button className="btn btn-outline-primary text-start">
                  <i className="bi bi-shield-check me-2"></i>
                  Security
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
