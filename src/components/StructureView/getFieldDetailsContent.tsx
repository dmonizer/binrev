import React from 'react';
import { ParsedField } from '../../types/structure';

interface FieldDetailsContent {
  nameType: JSX.Element;
  offset: JSX.Element;
  length: JSX.Element;
  value: JSX.Element;
}

const formatValue = (
  value: number | string | boolean | Array<unknown> | null | undefined,
  type: string
) => {
  if (value === null || value === undefined) return 'null';

  switch (type) {
    case 'uint64':
    case 'int64':
      return value.toString();
    case 'float32':
    case 'float64':
      return typeof value === 'number' ? value.toFixed(6) : value.toString();
    case 'string':
      return `"${value}"`;
    case 'bytes':
      return value.toString();
    default:
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return value.toString();
  }
};

export function getFieldDetailsContent(
  field: ParsedField,
  showValue: boolean
): FieldDetailsContent {
  return {
    nameType: (
      <div className="flex items-center space-x-1 truncate">
        <span className="font-medium">{field.definition.name}</span>
        <span className="text-gray-500">({field.definition.type})</span>
      </div>
    ),
    offset: (
      <div className="text-xs text-gray-400 text-right">
        @{field.offset.toString(16).padStart(4, '0')}
      </div>
    ),
    length: <div className="text-xs text-gray-400 text-right">{field.length}B</div>,
    value: showValue ? (
      <div className="font-mono text-xs truncate">
        {formatValue(field.value, field.definition.type)}
      </div>
    ) : (
      <div></div>
    ),
  };
}
