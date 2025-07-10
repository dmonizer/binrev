import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePanelInteraction } from './usePanelInteraction';
import { ParsedField } from '../types/structure';
import { HexViewRef } from '../components/HexView';
import React from 'react';

const mockParsedFields: ParsedField[] = [
  {
    definition: { id: 'field1', name: 'one', type: 'uint8', endianness: 'big' },
    value: 1,
    rawValue: new Uint8Array([1]),
    offset: 0,
    length: 1,
  },
  {
    definition: { id: 'field2', name: 'two', type: 'uint16', endianness: 'big' },
    value: 2,
    rawValue: new Uint8Array([0, 2]),
    offset: 1,
    length: 2,
  },
  {
    definition: { id: 'field3', name: 'three', type: 'uint32', endianness: 'big' },
    value: 3,
    rawValue: new Uint8Array([0, 0, 0, 3]),
    offset: 3,
    length: 4,
    children: [
      {
        definition: { id: 'child1', name: 'child', type: 'uint8', endianness: 'big' },
        value: 4,
        rawValue: new Uint8Array([4]),
        offset: 5,
        length: 1,
      },
    ],
  },
];

const mockHexViewRef: React.RefObject<HexViewRef> = {
  current: {
    goToOffset: vi.fn(),
  },
};

describe('usePanelInteraction', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePanelInteraction([], mockHexViewRef));
    expect(result.current.highlightedField).toBeUndefined();
    expect(result.current.structurePanelHeight).toBe(50);
  });

  it('should update highlightedField on handleFieldClick', () => {
    const { result } = renderHook(() => usePanelInteraction([], mockHexViewRef));
    act(() => {
      result.current.handleFieldClick('field2');
    });
    expect(result.current.highlightedField).toBe('field2');
  });

  it('should highlight the correct field on handleOffsetClick', () => {
    const { result } = renderHook(() => usePanelInteraction(mockParsedFields, mockHexViewRef));
    act(() => {
      result.current.handleOffsetClick(2); // Clicks inside field2
    });
    expect(result.current.highlightedField).toBe('field2');
  });

  it('should highlight a nested child field on handleOffsetClick', () => {
    const { result } = renderHook(() => usePanelInteraction(mockParsedFields, mockHexViewRef));
    act(() => {
      result.current.handleOffsetClick(5); // Clicks inside child1
    });
    expect(result.current.highlightedField).toBe('child1');
  });

  it('should call goToOffset on the ref when handleGoToOffset is called', () => {
    const { result } = renderHook(() => usePanelInteraction([], mockHexViewRef));
    act(() => {
      result.current.handleGoToOffset(123);
    });
    expect(mockHexViewRef.current?.goToOffset).toHaveBeenCalledWith(123);
  });
});
