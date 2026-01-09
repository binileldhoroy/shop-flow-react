import React from 'react';

const Purchases: React.FC = () => {
  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0">
                <i className="bi bi-bag-check me-2"></i>
                Purchases
              </h1>
              <p className="text-muted">Manage purchase orders and supplier invoices</p>
            </div>
            <button className="btn btn-primary">
              <i className="bi bi-plus-circle me-2"></i>
              New Purchase Order
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body text-center py-5">
              <i className="bi bi-bag-check fs-1 text-muted"></i>
              <h5 className="mt-3">Purchase Management</h5>
              <p className="text-muted">
                Create purchase orders, track deliveries, and manage supplier payments.
              </p>
              <button className="btn btn-primary mt-2">
                <i className="bi bi-plus-circle me-2"></i>
                Create Purchase Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="row mt-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Pending Orders</h6>
              <h3>0</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">This Month</h6>
              <h3>₹0.00</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Received</h6>
              <h3>0</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Total Suppliers</h6>
              <h3>0</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Purchases;
