import React from 'react';

export default {
  title: 'Test/Tailwind',
};

export const Default = () => (
  <div className="p-8 space-y-4">
    <div className="bg-gray-800 text-white p-4 rounded-lg">
      Gray-800
    </div>
    <div className="bg-blue-600 text-white p-4 rounded-lg">
      Blue-600
    </div>
    <div className="bg-red-600 text-white p-4 rounded-lg">
      Red-600
    </div>
  </div>
);
