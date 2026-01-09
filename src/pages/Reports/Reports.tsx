import React from 'react';

const Reports: React.FC = () => {
  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h3 mb-0">
            <i className="bi bi-graph-up me-2"></i>
            Reports
          </h1>
          <p className="text-muted">View business analytics and reports</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-calendar-range me-2"></i>
                Sales Reports
              </h5>
            </div>
            <div className="card-body">
              <p className="text-muted">Daily, weekly, and monthly sales reports</p>
              <button className="btn btn-primary btn-sm">
                <i className="bi bi-file-earmark-text me-2"></i>
                Generate Report
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-boxes me-2"></i>
                Inventory Reports
              </h5>
            </div>
            <div className="card-body">
              <p className="text-muted">Stock levels and movement reports</p>
              <button className="btn btn-primary btn-sm">
                <i className="bi bi-file-earmark-text me-2"></i>
                Generate Report
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-cash-stack me-2"></i>
                Financial Reports
              </h5>
            </div>
            <div className="card-body">
              <p className="text-muted">Revenue, expenses, and profit reports</p>
              <button className="btn btn-primary btn-sm">
                <i className="bi bi-file-earmark-text me-2"></i>
                Generate Report
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-people me-2"></i>
                Customer Reports
              </h5>
            </div>
            <div className="card-body">
              <p className="text-muted">Customer activity and purchase history</p>
              <button className="btn btn-primary btn-sm">
                <i className="bi bi-file-earmark-text me-2"></i>
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
