/**
 * StructureDefinitionPanel Component
 *
 * Purpose: Main component for defining and editing binary structure definitions
 *
 * Features:
 * - Unified structure editing with dropdown selection
 * - Field management (add, edit, remove, reorder)
 * - Substructure template creation and management
 * - Staged editing with apply/discard functionality
 * - Seamless switching between main structure and substructures
 * - Auto-open field editor when adding new fields
 *
 * Props:
 * - structure: Main StructureDefinition object
 * - onStructureChange: Callback when main structure changes
 * - availableFields: Array of fields available for references
 * - substructures: Array of substructure templates
 * - onSubstructuresChange: Callback when substructures change
 *
 * State Management:
 * - editingField: ID of currently editing field
 * - stagedFields: Map of field IDs to staged changes
 * - editingStructureId: ID of currently selected structure (main or substructure)
 *
 * Implementation Details:
 * - Uses staged editing to prevent immediate changes
 * - Unified interface for editing main structure and substructures
 * - Dynamic content based on selected structure
 * - Comprehensive field editing capabilities
 * - Automatically opens editor for newly added fields
 *
 * Dependencies:
 * - React hooks (useState, useCallback)
 * - Lucide React icons (Plus, Settings, ChevronDown)
 * - FieldEditor component
 * - Various types from types/structure
 */

import React, { useState, useCallback } from 'react';
import { Plus, Settings, ChevronDown } from 'lucide-react';
import { FieldDefinition, StructureDefinition, SubstructureTemplate } from '../../types/structure';
import { FieldEditor } from './FieldEditor';

interface StructureDefinitionProps {
  structure: StructureDefinition;
  onStructureChange: (structure: StructureDefinition) => void;
  availableFields: FieldDefinition[];
  substructures: SubstructureTemplate[];
  onSubstructuresChange: (substructures: SubstructureTemplate[]) => void;
}

export const StructureDefinitionPanel: React.FC<StructureDefinitionProps> = ({
  structure,
  onStructureChange,
  availableFields,
  substructures,
  onSubstructuresChange,
}) => {
  // Field editing state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [stagedFields, setStagedFields] = useState<Map<string, FieldDefinition>>(new Map());

  // Structure selection state
  const [editingStructureId, setEditingStructureId] = useState<string>(structure.id);

  /**
   * Gets the currently editing structure (main or substructure)
   */
  const getCurrentStructure = useCallback(() => {
    if (editingStructureId === structure.id) {
      return structure;
    }
    return substructures.find((s) => s.id === editingStructureId) || structure;
  }, [editingStructureId, structure, substructures]);

  /**
   * Updates the currently editing structure
   */
  const updateCurrentStructure = useCallback(
    (updates: Partial<StructureDefinition | SubstructureTemplate>) => {
      if (editingStructureId === structure.id) {
        onStructureChange({ ...structure, ...updates });
      } else {
        const updatedSubstructures = substructures.map((s) =>
          s.id === editingStructureId ? { ...s, ...updates } : s
        );
        onSubstructuresChange(updatedSubstructures);
      }
    },
    [editingStructureId, structure, substructures, onStructureChange, onSubstructuresChange]
  );

  /**
   * Adds a new field to the currently editing structure and opens the editor
   */
  const addField = useCallback(() => {
    const currentStructure = getCurrentStructure();
    const newField: FieldDefinition = {
      id: `field_${Date.now()}`,
      name: `Field ${currentStructure.fields.length + 1}`,
      type: 'uint8',
      endianness: 'little',
      length: 1,
    };

    updateCurrentStructure({
      fields: [...currentStructure.fields, newField],
    });

    // Automatically open the editor for the new field
    setEditingField(newField.id);
  }, [getCurrentStructure, updateCurrentStructure]);

  /**
   * Adds a new substructure template
   */
  const addSubstructure = useCallback(() => {
    const newSubstructure: SubstructureTemplate = {
      id: `substruct_${Date.now()}`,
      name: `Substructure ${substructures.length + 1}`,
      fields: [],
    };

    onSubstructuresChange([...substructures, newSubstructure]);
    setEditingStructureId(newSubstructure.id);
  }, [substructures, onSubstructuresChange]);

  /**
   * Updates a field in the currently editing structure
   */
  const updateField = useCallback(
    (fieldId: string, updates: Partial<FieldDefinition>) => {
      const currentStructure = getCurrentStructure();
      const updatedFields = currentStructure.fields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      );

      updateCurrentStructure({ fields: updatedFields });
    },
    [getCurrentStructure, updateCurrentStructure]
  );

  /**
   * Removes a field from the currently editing structure
   */
  const removeField = useCallback(
    (fieldId: string) => {
      const currentStructure = getCurrentStructure();
      const updatedFields = currentStructure.fields.filter((field) => field.id !== fieldId);

      updateCurrentStructure({ fields: updatedFields });

      if (editingField === fieldId) {
        setEditingField(null);
      }
      setStagedFields((prev) => {
        const newMap = new Map(prev);
        newMap.delete(fieldId);
        return newMap;
      });
    },
    [getCurrentStructure, updateCurrentStructure, editingField]
  );

  /**
   * Moves a field up or down in the currently editing structure
   */
  const moveField = useCallback(
    (fieldId: string, direction: 'up' | 'down') => {
      const currentStructure = getCurrentStructure();
      const fields = currentStructure.fields;
      const currentIndex = fields.findIndex((f) => f.id === fieldId);
      if (currentIndex === -1) return;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= fields.length) return;

      const newFields = [...fields];
      [newFields[currentIndex], newFields[newIndex]] = [
        newFields[newIndex],
        newFields[currentIndex],
      ];

      updateCurrentStructure({ fields: newFields });
    },
    [getCurrentStructure, updateCurrentStructure]
  );

  /**
   * Updates staged field changes
   */
  const updateStagedField = useCallback(
    (fieldId: string, updates: Partial<FieldDefinition>) => {
      setStagedFields((prev) => {
        const currentStructure = getCurrentStructure();
        const currentField =
          prev.get(fieldId) || currentStructure.fields.find((f) => f.id === fieldId)!;
        const newMap = new Map(prev);
        newMap.set(fieldId, { ...currentField, ...updates });
        return newMap;
      });
    },
    [getCurrentStructure]
  );

  /**
   * Applies staged changes to a field
   */
  const applyFieldChanges = useCallback(
    (fieldId: string) => {
      const stagedField = stagedFields.get(fieldId);
      if (stagedField) {
        updateField(fieldId, stagedField);
        setStagedFields((prev) => {
          const newMap = new Map(prev);
          newMap.delete(fieldId);
          return newMap;
        });
      }
      setEditingField(null);
    },
    [stagedFields, updateField]
  );

  /**
   * Discards staged changes for a field
   */
  const discardFieldChanges = useCallback((fieldId: string) => {
    setStagedFields((prev) => {
      const newMap = new Map(prev);
      newMap.delete(fieldId);
      return newMap;
    });
    setEditingField(null);
  }, []);

  /**
   * Handles structure name changes
   */
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateCurrentStructure({ name: e.target.value });
    },
    [updateCurrentStructure]
  );

  // Get current structure data
  const currentStructure = getCurrentStructure();
  const currentFields = currentStructure.fields;
  const currentName = currentStructure.name;

  // Get all available structures for dropdown
  const allStructures = [structure, ...substructures];

  return (
    <div className="bg-gray-900 p-4 flex-1 max-h-196 overflow-auto">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Structure Selection Dropdown */}
          <div className="relative">
            <select
              value={editingStructureId}
              onChange={(e) => setEditingStructureId(e.target.value)}
              className="appearance-none bg-gray-800 border border-gray-600 rounded px-3 py-2 pr-8 text-white font-medium focus:outline-none focus:border-blue-500"
            >
              {allStructures.map((struct) => (
                <option key={struct.id} value={struct.id}>
                  {struct.id === structure.id ? `${struct.name} (Main)` : struct.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Add Substructure Button */}
          <button
            onClick={addSubstructure}
            className="flex items-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Substructure</span>
          </button>

          {/* Add Field Button */}
          <button
            onClick={addField}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            <Plus className="w-4 h-4" />
            <span>Add Field</span>
          </button>
        </div>
      </div>

      {/* Name Input */}
      <div className="mb-4">
        <input
          type="text"
          value={currentName}
          onChange={handleNameChange}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white font-medium"
          placeholder={
            editingStructureId === structure.id ? 'Main Structure Name' : 'Substructure Name'
          }
        />
      </div>

      {/* Fields */}
      <div className="space-y-3">
        {currentFields.map((field) => (
          <FieldEditor
            key={field.id}
            field={field}
            isEditing={editingField === field.id}
            hasChanges={stagedFields.has(field.id)}
            stagedField={stagedFields.get(field.id) || field}
            availableFields={availableFields}
            substructures={substructures}
            onStartEdit={() => setEditingField(field.id)}
            onMoveField={(direction) => moveField(field.id, direction)}
            onRemoveField={() => removeField(field.id)}
            onApplyChanges={() => applyFieldChanges(field.id)}
            onDiscardChanges={() => discardFieldChanges(field.id)}
            onUpdateStaged={(updates) => updateStagedField(field.id, updates)}
          />
        ))}
      </div>

      {/* Empty State */}
      {currentFields.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Settings className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No fields defined</p>
          <p className="text-sm">
            Click "Add Field" to start defining your{' '}
            {editingStructureId === structure.id ? 'main structure' : 'substructure'}
          </p>
        </div>
      )}
    </div>
  );
};
