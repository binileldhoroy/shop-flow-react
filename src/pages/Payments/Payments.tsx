import React from 'react';

const Payments: React.FC = () => {
  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0">
                <i className="bi bi-credit-card me-2"></i>
                Payments
              </h1>
              <p className="text-muted">Track payments and transactions</p>
            </div>
            <button className="btn btn-primary">
              <i className="bi bi-plus-circle me-2"></i>
              Record Payment
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body text-center py-5">
              <i className="bi bi-credit-card fs-1 text-muted"></i>
              <h5 className="mt-3">Payment Management</h5>
              <p className="text-muted">
                Record and track all payments, both incoming and outgoing.
              </p>
              <button className="btn btn-primary mt-2">
                <i className="bi bi-plus-circle me-2"></i>
                Record New Payment
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
              <h6 className="text-muted">Received Today</h6>
              <h3 className="text-success">₹0.00</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Paid Today</h6>
              <h3 className="text-danger">₹0.00</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Pending Receivables</h6>
              <h3>₹0.00</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Pending Payables</h6>
              <h3>₹0.00</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
