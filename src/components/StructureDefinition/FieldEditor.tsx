/*
 * This file is part of BinRev.
 *
 * BinRev is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * BinRev is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useCallback } from 'react';
import {
  FieldDefinition,
  DataType,
  SubstructureTemplate,
  ValueMapping,
  BitDescription,
} from '../../types/structure';
import { getDataTypeSize, DATA_TYPES } from '../../utils/dataTypes';
import { FieldDisplay } from './FieldEditor/FieldDisplay';
import { FieldFormInputs } from './FieldEditor/FieldFormInputs';
import { FieldScriptEditor } from './FieldEditor/FieldScriptEditor';
import { FieldValueMappingEditor } from './FieldEditor/FieldValueMappingEditor';
import { FieldBitDescriptionEditor } from './FieldEditor/FieldBitDescriptionEditor';
import { FieldActionButtons } from './FieldEditor/FieldActionButtons';

interface FieldEditorProps {
  field: FieldDefinition;
  isEditing: boolean;
  hasChanges: boolean;
  stagedField: FieldDefinition;
  availableFields: FieldDefinition[];
  substructures: SubstructureTemplate[];
  onStartEdit: () => void;
  onMoveField: (direction: 'up' | 'down') => void;
  onRemoveField: () => void;
  onApplyChanges: () => void;
  onDiscardChanges: () => void;
  onUpdateStaged: (updates: Partial<FieldDefinition>) => void;
}

export const FieldEditor: React.FC<FieldEditorProps> = React.memo(
  ({
    isEditing,
    hasChanges,
    stagedField,
    availableFields,
    substructures,
    onStartEdit,
    onMoveField,
    onRemoveField,
    onApplyChanges,
    onDiscardChanges,
    onUpdateStaged,
  }) => {
    const handleNameChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdateStaged({ name: e.target.value });
      },
      [onUpdateStaged]
    );

    const handleTypeChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value;
        const isSubstructure = substructures.some((s) => s.id === newType);

        if (isSubstructure) {
          onUpdateStaged({
            type: 'struct' as DataType,
            substructureRef: newType,
            script: undefined,
            length: undefined,
          });
        } else if (newType === 'script') {
          onUpdateStaged({
            type: 'script' as DataType,
            substructureRef: undefined,
            script:
              stagedField.script ||
              '// Custom field processing\nreturn { value: null, length: 1 };',
            length: undefined,
          });
        } else {
          const typeSize = getDataTypeSize(newType as DataType);
          onUpdateStaged({
            type: newType as DataType,
            substructureRef: undefined,
            script: undefined,
            length: typeSize || undefined,
          });
        }
      },
      [onUpdateStaged, substructures, stagedField.script]
    );

    const handleLengthChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdateStaged({ length: parseInt(e.target.value) || undefined });
      },
      [onUpdateStaged]
    );

    const handleLengthRefChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        onUpdateStaged({ lengthRef: e.target.value || undefined });
      },
      [onUpdateStaged]
    );

    const handleEndiannessChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        onUpdateStaged({ endianness: e.target.value as 'big' | 'little' });
      },
      [onUpdateStaged]
    );

    const handleOffsetChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdateStaged({ offset: parseInt(e.target.value) || undefined });
      },
      [onUpdateStaged]
    );

    const handleRepeatsChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdateStaged({ repeats: parseInt(e.target.value) || undefined });
      },
      [onUpdateStaged]
    );

    const handleRepeatRefChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        onUpdateStaged({ repeatRef: e.target.value || undefined });
      },
      [onUpdateStaged]
    );

    const handleDescriptionChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onUpdateStaged({ description: e.target.value || undefined });
      },
      [onUpdateStaged]
    );

    const handleScriptChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onUpdateStaged({ script: e.target.value });
      },
      [onUpdateStaged]
    );

    const addValueMapping = useCallback(() => {
      const currentMappings = stagedField.valueMap || [];
      const newMapping: ValueMapping = { value: '', description: '' };
      onUpdateStaged({ valueMap: [...currentMappings, newMapping] });
    }, [stagedField.valueMap, onUpdateStaged]);

    const updateValueMapping = useCallback(
      (index: number, updates: Partial<ValueMapping>) => {
        const currentMappings = stagedField.valueMap || [];
        const updatedMappings = currentMappings.map((mapping, i) =>
          i === index ? { ...mapping, ...updates } : mapping
        );
        onUpdateStaged({ valueMap: updatedMappings });
      },
      [stagedField.valueMap, onUpdateStaged]
    );

    const removeValueMapping = useCallback(
      (index: number) => {
        const currentMappings = stagedField.valueMap || [];
        const updatedMappings = currentMappings.filter((_, i) => i !== index);
        onUpdateStaged({ valueMap: updatedMappings.length > 0 ? updatedMappings : undefined });
      },
      [stagedField.valueMap, onUpdateStaged]
    );

    const addBitDescription = useCallback(() => {
      const currentDescriptions = stagedField.bitDescriptions || [];
      const newDescription: BitDescription = { bitIndex: 0, descriptionIfSet: '' };
      onUpdateStaged({ bitDescriptions: [...currentDescriptions, newDescription] });
    }, [stagedField.bitDescriptions, onUpdateStaged]);

    const updateBitDescription = useCallback(
      (index: number, updates: Partial<BitDescription>) => {
        const currentDescriptions = stagedField.bitDescriptions || [];
        const updatedDescriptions = currentDescriptions.map((desc, i) =>
          i === index ? { ...desc, ...updates } : desc
        );
        onUpdateStaged({ bitDescriptions: updatedDescriptions });
      },
      [stagedField.bitDescriptions, onUpdateStaged]
    );

    const removeBitDescription = useCallback(
      (index: number) => {
        const currentDescriptions = stagedField.bitDescriptions || [];
        const updatedDescriptions = currentDescriptions.filter((_, i) => i !== index);
        onUpdateStaged({
          bitDescriptions: updatedDescriptions.length > 0 ? updatedDescriptions : undefined,
        });
      },
      [stagedField.bitDescriptions, onUpdateStaged]
    );

    const isLengthDisabled = () => {
      const typeInfo = DATA_TYPES[stagedField.type];
      return (
        typeInfo?.size !== null || stagedField.type === 'struct' || stagedField.type === 'script'
      );
    };

    const shouldShowValueMappings = () => {
      return stagedField.type !== 'struct' && stagedField.type !== 'script';
    };

    const shouldShowBitDescriptions = () => {
      const integerTypes = [
        'uint8',
        'uint16',
        'uint32',
        'uint64',
        'int8',
        'int16',
        'int32',
        'int64',
      ];
      return integerTypes.includes(stagedField.type);
    };

    if (!isEditing) {
      return (
        <FieldDisplay
          stagedField={stagedField}
          hasChanges={hasChanges}
          substructures={substructures}
          onStartEdit={onStartEdit}
          onMoveField={onMoveField}
          onRemoveField={onRemoveField}
        />
      );
    }

    return (
      <div className="bg-gray-800 p-4 rounded border border-gray-600 max-h-auto overflow-y-scroll">
        <FieldFormInputs
          stagedField={stagedField}
          availableFields={availableFields}
          substructures={substructures}
          onUpdateStaged={onUpdateStaged}
          isLengthDisabled={isLengthDisabled}
          handleNameChange={handleNameChange}
          handleTypeChange={handleTypeChange}
          handleLengthChange={handleLengthChange}
          handleLengthRefChange={handleLengthRefChange}
          handleEndiannessChange={handleEndiannessChange}
          handleOffsetChange={handleOffsetChange}
          handleRepeatsChange={handleRepeatsChange}
          handleRepeatRefChange={handleRepeatRefChange}
          handleDescriptionChange={handleDescriptionChange}
        />

        {stagedField.type === 'script' && (
          <FieldScriptEditor script={stagedField.script} onScriptChange={handleScriptChange} />
        )}

        {shouldShowValueMappings() && (
          <FieldValueMappingEditor
            valueMap={stagedField.valueMap}
            addValueMapping={addValueMapping}
            updateValueMapping={updateValueMapping}
            removeValueMapping={removeValueMapping}
          />
        )}

        {shouldShowBitDescriptions() && (
          <FieldBitDescriptionEditor
            bitDescriptions={stagedField.bitDescriptions}
            addBitDescription={addBitDescription}
            updateBitDescription={updateBitDescription}
            removeBitDescription={removeBitDescription}
          />
        )}

        <FieldActionButtons onApplyChanges={onApplyChanges} onDiscardChanges={onDiscardChanges} />
      </div>
    );
  }
);
