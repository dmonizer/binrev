import React from 'react';

export const NoDataMessage: React.FC = () => {
  return (
    <div className="p-8 text-center text-gray-400">
      <p>No data parsed</p>
      <p className="text-sm mt-2">Define fields and load a file to see parsed structure</p>
    </div>
  );
};
