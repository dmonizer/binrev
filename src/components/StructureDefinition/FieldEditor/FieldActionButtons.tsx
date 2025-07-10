import React from 'react';
import { Save, X } from 'lucide-react';

interface FieldActionButtonsProps {
  onApplyChanges: () => void;
  onDiscardChanges: () => void;
}

export const FieldActionButtons: React.FC<FieldActionButtonsProps> = ({
  onApplyChanges,
  onDiscardChanges,
}) => {
  return (
    <div className="mt-4 flex justify-end space-x-2">
      <button
        onClick={onApplyChanges}
        className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
      >
        <Save className="w-4 h-4" />
        <span>Save</span>
      </button>
      <button
        onClick={onDiscardChanges}
        className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
      >
        <X className="w-4 h-4" />
        <span>Discard</span>
      </button>
    </div>
  );
};
