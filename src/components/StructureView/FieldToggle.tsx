import React from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface FieldToggleProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export const FieldToggle: React.FC<FieldToggleProps> = ({ isExpanded, onToggle }) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="text-gray-400 hover:text-whit"
    >
      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
    </button>
  );
};
