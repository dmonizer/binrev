import React from 'react';
import { FieldDefinition, SubstructureTemplate } from '../../../types/structure';
import { DATA_TYPES } from '../../../utils/dataTypes';

interface FieldFormInputsProps {
  stagedField: FieldDefinition;
  availableFields: FieldDefinition[];
  substructures: SubstructureTemplate[];
  onUpdateStaged: (updates: Partial<FieldDefinition>) => void;
  isLengthDisabled: () => boolean;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleLengthChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLengthRefChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleEndiannessChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleOffsetChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRepeatsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRepeatRefChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const FieldFormInputs: React.FC<FieldFormInputsProps> = ({
  stagedField,
  availableFields,
  substructures,
  isLengthDisabled,
  handleNameChange,
  handleTypeChange,
  handleLengthChange,
  handleLengthRefChange,
  handleEndiannessChange,
  handleOffsetChange,
  handleRepeatsChange,
  handleRepeatRefChange,
  handleDescriptionChange,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Field Name */}
      <div>
        <label htmlFor="field-name" className="block text-sm font-medium text-gray-300 mb-1">
          Name
        </label>
        <input
          id="field-name"
          type="text"
          value={stagedField.name}
          onChange={handleNameChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          autoFocus
        />
      </div>

      {/* Field Type */}
      <div>
        <label htmlFor="field-type" className="block text-sm font-medium text-gray-300 mb-1">
          Type
        </label>
        <select
          id="field-type"
          value={stagedField.substructureRef || stagedField.type}
          onChange={handleTypeChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
        >
          <optgroup label="Basic Types">
            {Object.entries(DATA_TYPES).map(([key, value]) => (
              <option key={key} value={key}>
                {value.name}
              </option>
            ))}
          </optgroup>
          {substructures.length > 0 && (
            <optgroup label="Substructures">
              {substructures.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      {/* Field Length */}
      <div>
        <label htmlFor="field-length" className="block text-sm font-medium text-gray-300 mb-1">
          Length
          {isLengthDisabled() && <span className="ml-1 text-xs text-gray-500">(auto)</span>}
        </label>
        <input
          id="field-length"
          type="number"
          value={stagedField.length || ''}
          onChange={handleLengthChange}
          className={`w-full px-3 py-2 border border-gray-600 rounded text-white ${
            isLengthDisabled() ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-gray-700'
          }`}
          placeholder="Auto"
          disabled={isLengthDisabled()}
        />
      </div>

      {/* Length Reference */}
      <div>
        <label htmlFor="field-length-ref" className="block text-sm font-medium text-gray-300 mb-1">
          Length Reference
          {isLengthDisabled() && <span className="ml-1 text-xs text-gray-500">(auto)</span>}
        </label>
        <select
          id="field-length-ref"
          value={stagedField.lengthRef || ''}
          onChange={handleLengthRefChange}
          className={`w-full px-3 py-2 border border-gray-600 rounded text-white ${
            isLengthDisabled() ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-gray-700'
          }`}
          disabled={isLengthDisabled()}
        >
          <option value="">None</option>
          {availableFields.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      {/* Endianness */}
      <div>
        <label htmlFor="field-endianness" className="block text-sm font-medium text-gray-300 mb-1">
          Endianness
        </label>
        <select
          id="field-endianness"
          value={stagedField.endianness}
          onChange={handleEndiannessChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          disabled={stagedField.type === 'script'}
        >
          <option value="little">Little Endian</option>
          <option value="big">Big Endian</option>
        </select>
      </div>

      {/* Offset */}
      <div>
        <label htmlFor="field-offset" className="block text-sm font-medium text-gray-300 mb-1">
          Offset
        </label>
        <input
          id="field-offset"
          type="number"
          value={stagedField.offset || ''}
          onChange={handleOffsetChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          placeholder="Auto"
        />
      </div>

      {/* Repeats */}
      <div>
        <label htmlFor="field-repeats" className="block text-sm font-medium text-gray-300 mb-1">
          Repeats
        </label>
        <input
          id="field-repeats"
          type="number"
          value={stagedField.repeats || ''}
          onChange={handleRepeatsChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          placeholder="1"
          disabled={stagedField.type === 'script'}
        />
      </div>

      {/* Repeat Reference */}
      <div>
        <label htmlFor="field-repeat-ref" className="block text-sm font-medium text-gray-300 mb-1">
          Repeat Reference
        </label>
        <select
          id="field-repeat-ref"
          value={stagedField.repeatRef || ''}
          onChange={handleRepeatRefChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          disabled={stagedField.type === 'script'}
        >
          <option value="">None</option>
          {availableFields.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className="col-span-2">
        <label htmlFor="field-description" className="block text-sm font-medium text-gray-300 mb-1">
          Description
        </label>
        <textarea
          id="field-description"
          value={stagedField.description || ''}
          onChange={handleDescriptionChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          rows={2}
          placeholder="Optional description..."
        />
      </div>
    </div>
  );
};
