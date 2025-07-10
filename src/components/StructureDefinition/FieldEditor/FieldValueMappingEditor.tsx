import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { ValueMapping } from '../../../types/structure';

interface FieldValueMappingEditorProps {
  valueMap: ValueMapping[] | undefined;
  addValueMapping: () => void;
  updateValueMapping: (index: number, updates: Partial<ValueMapping>) => void;
  removeValueMapping: (index: number) => void;
}

export const FieldValueMappingEditor: React.FC<FieldValueMappingEditorProps> = ({
  valueMap,
  addValueMapping,
  updateValueMapping,
  removeValueMapping,
}) => {
  return (
    <div className="col-span-2">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-300">Value Mappings</label>
        <button
          type="button"
          onClick={addValueMapping}
          className="flex items-center space-x-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
        >
          <Plus className="w-3 h-3" />
          <span>Add Mapping</span>
        </button>
      </div>

      {valueMap && valueMap.length > 0 ? (
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {valueMap.map((mapping, index) => (
            <div key={index} className="flex items-center space-x-2 p-2 bg-gray-700 rounded">
              <input
                type="text"
                value={mapping.value}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = parseFloat(value);
                  const finalValue = !isNaN(numValue) && value.trim() !== '' ? numValue : value;
                  updateValueMapping(index, { value: finalValue });
                }}
                placeholder="Value"
                className="flex-1 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
              />
              <span className="text-gray-400">→</span>
              <input
                type="text"
                value={mapping.description}
                onChange={(e) => updateValueMapping(index, { description: e.target.value })}
                placeholder="Description"
                className="flex-1 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
              />
              <button
                type="button"
                onClick={() => removeValueMapping(index)}
                className="text-red-400 hover:text-red-300"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">No value mappings defined</p>
      )}
    </div>
  );
};
