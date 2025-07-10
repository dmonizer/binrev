import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { BitDescription } from '../../../types/structure';

interface FieldBitDescriptionEditorProps {
  bitDescriptions: BitDescription[] | undefined;
  addBitDescription: () => void;
  updateBitDescription: (index: number, updates: Partial<BitDescription>) => void;
  removeBitDescription: (index: number) => void;
}

export const FieldBitDescriptionEditor: React.FC<FieldBitDescriptionEditorProps> = ({
  bitDescriptions,
  addBitDescription,
  updateBitDescription,
  removeBitDescription,
}) => {
  return (
    <div className="col-span-2">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-300">Bit Descriptions</label>
        <button
          type="button"
          onClick={addBitDescription}
          className="flex items-center space-x-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
        >
          <Plus className="w-3 h-3" />
          <span>Add Bit</span>
        </button>
      </div>

      {bitDescriptions && bitDescriptions.length > 0 ? (
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {bitDescriptions.map((bitDesc, index) => (
            <div key={index} className="flex items-center space-x-2 p-2 bg-gray-700 rounded">
              <div className="flex items-center space-x-1">
                <label htmlFor={`bit-index-${index}`} className="text-xs text-gray-400">
                  Bit
                </label>
                <input
                  id={`bit-index-${index}`}
                  type="number"
                  value={bitDesc.bitIndex}
                  onChange={(e) =>
                    updateBitDescription(index, { bitIndex: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  max="63"
                  className="w-16 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                />
              </div>
              <input
                type="text"
                value={bitDesc.descriptionIfSet}
                onChange={(e) => updateBitDescription(index, { descriptionIfSet: e.target.value })}
                placeholder="Description if set"
                className="flex-1 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
              />
              <input
                type="text"
                value={bitDesc.descriptionIfUnset || ''}
                onChange={(e) =>
                  updateBitDescription(index, { descriptionIfUnset: e.target.value || undefined })
                }
                placeholder="Description if unset (optional)"
                className="flex-1 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
              />
              <button
                type="button"
                onClick={() => removeBitDescription(index)}
                className="text-red-400 hover:text-red-300"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">No bit descriptions defined</p>
      )}
    </div>
  );
};
