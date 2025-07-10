import React from 'react';
import { ParsedField } from '../../types/structure';
import { FieldToggle } from './FieldToggle';
import { getFieldDetailsContent } from './getFieldDetailsContent';

interface FieldRowProps {
  field: ParsedField;
  depth: number;
  onFieldClick?: (fieldId: string) => void;
  toggleExpanded: (fieldId: string) => void;
  expandedFields: Set<string>;
  highlightedField?: string;
}

export const FieldRow: React.FC<FieldRowProps> = ({
  field,
  depth,
  onFieldClick,
  toggleExpanded,
  expandedFields,
  highlightedField,
}) => {
  const hasChildren = field.children && field.children.length > 0;
  const isExpanded = expandedFields.has(field.definition.id);
  const isHighlighted = highlightedField === field.definition.id;

  const fieldContent = getFieldDetailsContent(field, !hasChildren);

  return (
    <div className="text-sm">
      <div
        className={`grid items-center gap-x-2 py-2 px-3 rounded cursor-pointer border border-gray-700 transition-colors ${
          isHighlighted ? 'bg-blue-600 text-white' : 'hover:bg-gray-800 text-gray-300'
        }`}
        style={{
          paddingLeft: `${12 + depth * 16}px`,
          gridTemplateColumns: hasChildren ? '24px 30% 5% 5% 60%' : '30% 5% 5% 60%',
        }}
        onClick={() => onFieldClick?.(field.definition.id)}
      >
        {hasChildren && (
          <div className="col-span-1">
            <FieldToggle
              isExpanded={isExpanded}
              onToggle={() => toggleExpanded(field.definition.id)}
            />
          </div>
        )}
        {fieldContent.nameType}
        {fieldContent.offset}
        {fieldContent.length}
        {fieldContent.value}
      </div>

      {hasChildren && isExpanded && (
        <div>
          {field.children!.map((child) => (
            <FieldRow
              key={child.definition.id}
              field={child}
              depth={depth + 1}
              onFieldClick={onFieldClick}
              toggleExpanded={toggleExpanded}
              expandedFields={expandedFields}
              highlightedField={highlightedField}
            />
          ))}
        </div>
      )}
    </div>
  );
};
