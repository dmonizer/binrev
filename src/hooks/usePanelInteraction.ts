import { useState, RefObject } from 'react';
import { ParsedField } from '../types/structure';
import { HexViewRef } from '../components/HexView';

export const usePanelInteraction = (
  parsedFields: ParsedField[],
  hexViewRef: RefObject<HexViewRef>
) => {
  const [highlightedField, setHighlightedField] = useState<string>();
  const [structurePanelHeight, setStructurePanelHeight] = useState(50);

  const handleFieldClick = (fieldId: string) => {
    setHighlightedField(fieldId);
  };

  const findFieldAtOffset = (fields: ParsedField[], offset: number): ParsedField | undefined => {
    for (const field of fields) {
      if (offset >= field.offset && offset < field.offset + field.length) {
        if (field.children) {
          const childField = findFieldAtOffset(field.children, offset);
          if (childField) return childField;
        }
        return field;
      }
    }
    return undefined;
  };

  const handleOffsetClick = (offset: number) => {
    const field = findFieldAtOffset(parsedFields, offset);
    if (field) {
      setHighlightedField(field.definition.id);
    }
  };

  const handleGoToOffset = (offset: number) => {
    console.log('Going to offset:', offset);
    hexViewRef.current?.goToOffset(offset);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const startY = e.clientY;
    const startHeight = structurePanelHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const containerHeight = window.innerHeight - 200; // Approximate height
      const deltaPercent = (deltaY / containerHeight) * 100;
      const newHeight = Math.max(20, Math.min(80, startHeight + deltaPercent));
      setStructurePanelHeight(newHeight);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return {
    highlightedField,
    setHighlightedField,
    structurePanelHeight,
    handleFieldClick,
    handleOffsetClick,
    handleGoToOffset,
    handleMouseDown,
  };
};
