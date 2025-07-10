import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useFileHandler } from './useFileHandler';
import { BinaryParser } from '../utils/binaryParser';
import { FileData, ParsedField, StructureDefinition } from '../types/structure';

const mockStructure: StructureDefinition = {
  id: 'main',
  name: 'Test Structure',
  fields: [{ id: 'f1', name: 'field1', type: 'uint8', endianness: 'big' }],
};

const mockFile = new File(['test'], 'test.bin');
const mockFileData: FileData = { name: 'test.bin', size: 4, file: mockFile };

const mockParsedFields: ParsedField[] = [
  {
    definition: { id: 'f1', name: 'field1', type: 'uint8', endianness: 'big' },
    value: 1,
    rawValue: new Uint8Array([1]),
    offset: 0,
    length: 1,
  },
];

describe('useFileHandler', () => {
  let parseStructureSpy: MockInstance;

  beforeEach(() => {
    parseStructureSpy = vi
      .spyOn(BinaryParser.prototype, 'parseStructure')
      .mockResolvedValue(mockParsedFields);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with empty fileData and parsedFields', () => {
    const { result } = renderHook(() => useFileHandler(mockStructure, []));
    expect(result.current.fileData).toBeUndefined();
    expect(result.current.parsedFields).toEqual([]);
  });

  it('should update fileData when handleFileLoad is called', () => {
    const { result } = renderHook(() => useFileHandler(mockStructure, []));
    act(() => {
      result.current.handleFileLoad(mockFileData);
    });
    expect(result.current.fileData).toEqual(mockFileData);
  });

  it('should not call BinaryParser if fileData is not present', () => {
    renderHook(() => useFileHandler(mockStructure, []));
    expect(parseStructureSpy).not.toHaveBeenCalled();
  });

  it('should call BinaryParser when fileData is set', async () => {
    const { result } = renderHook(() => useFileHandler(mockStructure, []));

    act(() => {
      result.current.handleFileLoad(mockFileData);
    });

    await waitFor(() => {
      expect(parseStructureSpy).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(result.current.parsedFields).toEqual(mockParsedFields);
    });
  });

  it('should clear parsedFields when fileData is unset', async () => {
    const { result } = renderHook(() => useFileHandler(mockStructure, []));

    act(() => {
      result.current.handleFileLoad(mockFileData);
    });

    await waitFor(() => {
      expect(result.current.parsedFields.length).toBe(1);
    });

    act(() => {
      result.current.setFileData(undefined);
    });

    await waitFor(() => {
      expect(result.current.parsedFields.length).toBe(0);
    });
  });
});
