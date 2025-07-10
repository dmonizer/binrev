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
import React from 'react';
import { ParsedField } from '../../types/structure';
import { FieldRow } from './FieldRow';
import { StructureHeader } from './StructureHeader';
import { NoDataMessage } from './NoDataMessage';

interface StructureViewProps {
  parsedFields: ParsedField[];
  onFieldClick?: (fieldId: string) => void;
  highlightedField?: string;
}

export const StructureView: React.FC<StructureViewProps> = ({
  parsedFields,
  onFieldClick,
  highlightedField,
}) => {
  const [expandedFields, setExpandedFields] = React.useState<Set<string>>(new Set());

  const toggleExpanded = (fieldId: string) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(fieldId)) {
      newExpanded.delete(fieldId);
    } else {
      newExpanded.add(fieldId);
    }
    setExpandedFields(newExpanded);
  };

  return (
    <div className="bg-gray-900 p-4 flex-1">
      <StructureHeader parsedFieldsCount={parsedFields.length} />

      <div className="bg-gray-800 rounded-lg">
        {parsedFields.length === 0 ? (
          <NoDataMessage />
        ) : (
          <div className="space-y-1">
            {parsedFields.map((field) => (
              <FieldRow
                key={field.definition.id}
                field={field}
                depth={0}
                onFieldClick={onFieldClick}
                toggleExpanded={toggleExpanded}
                expandedFields={expandedFields}
                highlightedField={highlightedField}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
