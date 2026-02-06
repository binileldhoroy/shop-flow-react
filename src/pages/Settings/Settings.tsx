import React, { useState } from 'react';
import { User, Building2, Tag } from 'lucide-react';
import ProfileSettings from '../../components/features/settings/ProfileSettings';
import CompanySettings from '../../components/features/settings/CompanySettings';
import PriceTiersSettings from '../../components/features/settings/PriceTiersSettings';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'tiers'>('profile');

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-white">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and company preferences</p>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50/50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Tabs */}
          <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 inline-flex">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'profile'
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <User className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('company')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'company'
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Company
            </button>
            <button
              onClick={() => setActiveTab('tiers')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'tiers'
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Tag className="w-4 h-4" />
              Price Tiers
            </button>
          </div>

          {/* Content */}
          <div className="min-h-[400px]">
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'company' && <CompanySettings />}
            {activeTab === 'tiers' && <PriceTiersSettings />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
