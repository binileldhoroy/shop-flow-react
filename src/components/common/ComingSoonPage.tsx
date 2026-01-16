import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ComingSoonPageProps {
  pageName: string;
  description?: string;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ pageName, description }) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <div className="bg-warning-100 p-6 rounded-full inline-block mb-6">
          <AlertCircle className="w-16 h-16 text-warning-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">{pageName}</h2>
        <p className="text-gray-600 mb-6">
          {description || 'This page is being converted to Tailwind CSS and will be available soon.'}
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> The layout components (Header, Sidebar, Login, Dashboard) have been successfully converted to Tailwind CSS.
            Remaining pages are in progress.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage;
