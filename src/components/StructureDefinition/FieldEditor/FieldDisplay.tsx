import React from 'react';
import { Trash2 } from 'lucide-react';
import { FieldDefinition, SubstructureTemplate } from '../../../types/structure';
import { DATA_TYPES } from '../../../utils/dataTypes';

interface FieldDisplayProps {
  stagedField: FieldDefinition;
  hasChanges: boolean;
  substructures: SubstructureTemplate[];
  onStartEdit: () => void;
  onMoveField: (direction: 'up' | 'down') => void;
  onRemoveField: () => void;
}

export const FieldDisplay: React.FC<FieldDisplayProps> = ({
  stagedField,
  hasChanges,
  substructures,
  onStartEdit,
  onMoveField,
  onRemoveField,
}) => {
  const getFieldTypeDisplay = () => {
    if (stagedField.substructureRef) {
      const substructure = substructures.find((s) => s.id === stagedField.substructureRef);
      return substructure ? substructure.name : 'Unknown Substructure';
    }
    return DATA_TYPES[stagedField.type]?.name || stagedField.type;
  };

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMoveField('up');
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMoveField('down');
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemoveField();
  };

  return (
    <div
      className={`bg-gray-800 p-3 rounded border cursor-pointer hover:bg-gray-750 transition-colors ${
        hasChanges ? 'border-yellow-500/50 bg-yellow-900/10' : 'border-gray-700'
      }`}
      onClick={onStartEdit}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-white">{stagedField.name}</span>
          <span className="text-sm text-gray-400">{getFieldTypeDisplay()}</span>
          {stagedField.substructureRef && (
            <span className="text-xs text-purple-400 bg-purple-900/30 px-1 rounded">
              substructure
            </span>
          )}
          {stagedField.type === 'script' && (
            <span className="text-xs text-green-400 bg-green-900/30 px-1 rounded">script</span>
          )}
          {stagedField.valueMap && stagedField.valueMap.length > 0 && (
            <span className="text-xs text-blue-400 bg-blue-900/30 px-1 rounded">mapped</span>
          )}
          {stagedField.bitDescriptions && stagedField.bitDescriptions.length > 0 && (
            <span className="text-xs text-orange-400 bg-orange-900/30 px-1 rounded">bits</span>
          )}
          {hasChanges && (
            <span className="text-xs text-yellow-400 bg-yellow-900/30 px-1 rounded">modified</span>
          )}
        </div>
        <div className="flex space-x-2">
          <button onClick={handleMoveUp} className="text-gray-400 hover:text-white text-sm">
            ↑
          </button>
          <button onClick={handleMoveDown} className="text-gray-400 hover:text-white text-sm">
            ↓
          </button>
          <button onClick={handleRemove} className="text-red-400 hover:text-red-300">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
