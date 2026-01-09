import React, { useEffect } from 'react';
import { useAppDispatch } from '@hooks/useRedux';
import { useAuth } from '@hooks/useAuth';
import { fetchProfile } from '@store/slices/authSlice';
import { fetchCurrentCompany } from '@store/slices/companySlice';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isSuperUser, isAdmin } = useAuth();

  useEffect(() => {
    // Fetch user profile if not loaded
    if (!user) {
      dispatch(fetchProfile());
    }

    // Fetch company for non-super users
    if (!isSuperUser && user) {
      dispatch(fetchCurrentCompany());
    }
  }, [dispatch, user, isSuperUser]);

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h3 mb-0">
            <i className="bi bi-speedometer2 me-2"></i>
            Dashboard
          </h1>
          <p className="text-muted">Welcome back, {user?.first_name || user?.username}!</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Stats Cards */}
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Total Sales</p>
                  <h3 className="mb-0">₹0</h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-cart-check fs-4 text-primary"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Products</p>
                  <h3 className="mb-0">0</h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <i className="bi bi-box-seam fs-4 text-success"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Customers</p>
                  <h3 className="mb-0">0</h3>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <i className="bi bi-people fs-4 text-info"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Low Stock</p>
                  <h3 className="mb-0">0</h3>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <i className="bi bi-exclamation-triangle fs-4 text-warning"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                System Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Role:</strong> {user?.role.replace('_', ' ').toUpperCase()}</p>
                  <p><strong>Username:</strong> {user?.username}</p>
                  <p><strong>Email:</strong> {user?.email || 'Not set'}</p>
                </div>
                <div className="col-md-6">
                  {isSuperUser ? (
                    <div className="alert alert-info mb-0">
                      <i className="bi bi-star-fill me-2"></i>
                      You are logged in as a <strong>Super User</strong>. You can manage multiple companies.
                    </div>
                  ) : isAdmin ? (
                    <div className="alert alert-success mb-0">
                      <i className="bi bi-shield-check me-2"></i>
                      You are logged in as a <strong>Company Admin</strong>. You have full access to your company.
                    </div>
                  ) : (
                    <div className="alert alert-secondary mb-0">
                      <i className="bi bi-person-badge me-2"></i>
                      You are logged in as <strong>{user?.role.replace('_', ' ')}</strong>.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-lightning-charge me-2"></i>
                Quick Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {isSuperUser && (
                  <div className="col-md-3">
                    <button
                      className="btn btn-outline-primary w-100"
                      onClick={() => navigate('/companies')}
                    >
                      <i className="bi bi-building me-2"></i>
                      Manage Companies
                    </button>
                  </div>
                )}
                <div className="col-md-3">
                  <button
                    className="btn btn-outline-success w-100"
                    onClick={() => navigate('/products')}
                  >
                    <i className="bi bi-box-seam me-2"></i>
                    Manage Products
                  </button>
                </div>
                <div className="col-md-3">
                  <button
                    className="btn btn-outline-info w-100"
                    onClick={() => navigate('/sales')}
                  >
                    <i className="bi bi-cart-check me-2"></i>
                    View Sales
                  </button>
                </div>
                <div className="col-md-3">
                  <button
                    className="btn btn-outline-warning w-100"
                    onClick={() => navigate('/inventory')}
                  >
                    <i className="bi bi-boxes me-2"></i>
                    Check Inventory
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
