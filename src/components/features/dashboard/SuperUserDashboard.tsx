import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, TrendingUp, Activity, ExternalLink } from 'lucide-react';
import { companyService } from '../../../api/services/company.service';
import { Company } from '../../../types/company.types';
import { useAppDispatch } from '../../../hooks/useRedux';
import { addNotification } from '../../../store/slices/uiSlice';

const SuperUserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await companyService.getAll();
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      dispatch(addNotification({
        message: 'Failed to fetch companies data',
        type: 'error',
      }));
    } finally {
      setLoading(false);
    }
  };

  const activeCompanies = companies.filter(c => c.is_active).length;

  const recentCompanies = [...companies]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Platform Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 mb-1">Total Companies</p>
              <h3 className="text-3xl font-bold">{companies.length}</h3>
            </div>
            <div className="p-2 bg-white/20 rounded-lg">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-blue-100">
            <Activity className="w-4 h-4 mr-1" />
            <span>{activeCompanies} Active</span>
          </div>
        </div>

        <div className="card bg-white border shadow-sm">
           <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 mb-1">Platform Revenue</p>
              <h3 className="text-3xl font-bold text-gray-900">₹0.00</h3>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
             <span>Platform metrics placeholder</span>
          </div>
        </div>

        <div className="card bg-white border shadow-sm">
           <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 mb-1">Quick Actions</p>
              <button
                onClick={() => navigate('/companies')}
                className="btn btn-primary w-full mt-2 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Company
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Companies */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Recently Onboarded Companies</h2>
          <button
            onClick={() => navigate('/companies')}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
          >
            View All <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase">
                <th className="py-3 font-semibold">Company Name</th>
                <th className="py-3 font-semibold">Admin</th>
                <th className="py-3 font-semibold">Created</th>
                <th className="py-3 font-semibold">Status</th>
                <th className="py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentCompanies.map(company => (
                <tr key={company.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-xs">
                        {company.company_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{company.company_name}</div>
                        <div className="text-xs text-gray-500">{company.city}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-gray-600">
                    {company.admin_username || <span className="text-gray-400 italic">Not set</span>}
                  </td>
                  <td className="py-4 text-sm text-gray-600">
                    {new Date(company.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      company.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {company.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => navigate(`/companies/${company.id}`)}
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {recentCompanies.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No companies found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperUserDashboard;
