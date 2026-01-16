import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '@hooks/useRedux';
import { useAuth } from '@hooks/useAuth';
import { fetchProfile } from '@store/slices/authSlice';
import { fetchCurrentCompany } from '@store/slices/companySlice';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays } from 'date-fns';
import axiosInstance from '@api/axios';
import { API_ENDPOINTS } from '@api/endpoints';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface DailySalesData {
  total_revenue: string;
  total_orders: number;
}

interface Product {
  id: number;
  name: string;
  category_name?: string;
  is_active: boolean;
  quantity?: number;
  reorder_level?: number;
}

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isSuperUser, isAdmin } = useAuth();

  const [dailySales, setDailySales] = useState<DailySalesData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user profile if not loaded
    if (!user) {
      dispatch(fetchProfile());
    }

    // Fetch company for non-super users
    if (!isSuperUser && user) {
      dispatch(fetchCurrentCompany());
    }

    // Fetch dashboard data
    fetchDashboardData();
  }, [dispatch, user, isSuperUser]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch daily sales report
      const salesResponse = await axiosInstance.get(API_ENDPOINTS.SALES.DAILY_REPORT);
      setDailySales(salesResponse.data);

      // Fetch products
      const productsResponse = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.LIST);
      setProducts(productsResponse.data.results || productsResponse.data || []);

      // Fetch low stock items
      const lowStockResponse = await axiosInstance.get(API_ENDPOINTS.INVENTORY.LOW_STOCK);
      setLowStockItems(lowStockResponse.data.results || lowStockResponse.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate last 7 days data for trend (placeholder data)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      name: format(date, 'EEE'),
      date: format(date, 'yyyy-MM-dd'),
      sales: i === 6 ? (dailySales?.total_orders || 0) : Math.floor(Math.random() * 20),
      revenue: i === 6 ? parseFloat(dailySales?.total_revenue || '0') : Math.floor(Math.random() * 5000),
    };
  });

  // Category breakdown from real products
  const categoryMap = products.reduce((acc: any, product: Product) => {
    const categoryName = product.category_name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = 0;
    }
    acc[categoryName] += 1;
    return acc;
  }, {});

  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value: value as number,
  }));

  const hasCategoryData = categoryData.length > 0;
  const activeProducts = products.filter((p) => p.is_active).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.first_name || user?.username}!
        </h1>
        <p className="text-gray-600">
          {isSuperUser
            ? 'You are logged in as a Super User. You can manage multiple companies.'
            : isAdmin
            ? 'You are logged in as a Company Admin. You have full access to your company.'
            : `You are logged in as ${user?.role.replace('_', ' ')}.`}
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Today's Revenue"
          value={`₹${dailySales?.total_revenue || '0.00'}`}
          change="+12.5%"
          trend="up"
          icon={DollarSign}
          color="primary"
        />
        <MetricCard
          title="Today's Orders"
          value={dailySales?.total_orders?.toString() || '0'}
          change="+8.2%"
          trend="up"
          icon={ShoppingCart}
          color="success"
        />
        <MetricCard
          title="Total Products"
          value={products.length.toString()}
          change={`${activeProducts} active`}
          trend="up"
          icon={Package}
          color="warning"
        />
        <MetricCard
          title="Low Stock Items"
          value={lowStockItems.length.toString()}
          change={lowStockItems.length > 0 ? 'Needs attention' : 'All good'}
          trend={lowStockItems.length > 0 ? 'down' : 'up'}
          icon={AlertTriangle}
          color="danger"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Sales Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#2563eb"
                strokeWidth={2}
                name="Orders"
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2}
                name="Revenue (₹)"
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Historical data will populate as sales are recorded
          </p>
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
          {hasCategoryData ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-sm text-gray-500 mt-2 text-center">
                {products.length} products across {categoryData.length} categories
              </p>
            </>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No products yet</p>
                <p className="text-sm mt-1">Add products to see category distribution</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="card bg-warning-50 border border-warning-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-warning-900">Low Stock Alert</h3>
              <p className="text-sm text-warning-700 mt-1">
                {lowStockItems.length} product(s) are running low on stock
              </p>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="bg-white p-3 rounded-lg border border-warning-200">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-warning-700 mt-1">
                      Only {item.quantity || 0} left (Min: {item.reorder_level || 0})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Today's Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Orders:</span>
              <span className="font-medium">{dailySales?.total_orders || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Revenue:</span>
              <span className="font-medium">₹{dailySales?.total_revenue || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg Order:</span>
              <span className="font-medium">
                ₹
                {dailySales?.total_orders && dailySales.total_orders > 0
                  ? (parseFloat(dailySales.total_revenue) / dailySales.total_orders).toFixed(2)
                  : '0.00'}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Inventory Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Products:</span>
              <span className="font-medium">{products.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Active:</span>
              <span className="font-medium text-success-600">{activeProducts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Low Stock:</span>
              <span className="font-medium text-warning-600">{lowStockItems.length}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Quick Actions</h3>
          <div className="space-y-2">
            {isSuperUser && (
              <button
                onClick={() => navigate('/companies')}
                className="block w-full btn btn-outline-primary text-sm py-2"
              >
                Manage Companies
              </button>
            )}
            <button
              onClick={() => navigate('/pos')}
              className="block w-full btn btn-primary text-sm py-2"
            >
              New Sale
            </button>
            <button
              onClick={() => navigate('/products')}
              className="block w-full btn btn-outline-secondary text-sm py-2"
            >
              Add Product
            </button>
            <button
              onClick={() => navigate('/sales')}
              className="block w-full btn btn-outline-secondary text-sm py-2"
            >
              View Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ElementType;
  color: 'primary' | 'success' | 'warning' | 'danger';
}

function MetricCard({ title, value, change, trend, icon: Icon, color }: MetricCardProps) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    danger: 'bg-danger-50 text-danger-600',
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <div className="flex items-center gap-1 mt-2">
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-success-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-danger-600" />
            )}
            <span
              className={`text-sm font-medium ${
                trend === 'up' ? 'text-success-600' : 'text-danger-600'
              }`}
            >
              {change}
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
