import React from 'react';

interface StructureHeaderProps {
  parsedFieldsCount: number;
}

export const StructureHeader: React.FC<StructureHeaderProps> = ({ parsedFieldsCount }) => {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-white">Parsed structure</h3>
      <p className="text-sm text-gray-400">{parsedFieldsCount} fields parsed</p>
    </div>
  );
};
