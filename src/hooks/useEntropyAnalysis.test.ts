import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEntropyAnalysis } from './useEntropyAnalysis';
import { FileData } from '../types/structure';

// Mock the Worker
interface MockWorker {
  postMessage: (message: unknown) => void;
  terminate: () => void;
  onmessage?: (event: MessageEvent) => void;
  onerror?: (event: ErrorEvent) => void;
}

let mockWorker: MockWorker;
const mockPostMessage = vi.fn();
const mockTerminate = vi.fn();

beforeEach(() => {
  mockWorker = {
    postMessage: mockPostMessage,
    terminate: mockTerminate,
  };
  window.Worker = vi.fn(() => mockWorker) as unknown as typeof Worker;
  vi.spyOn(window, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

const mockFile = new File(['test'], 'test.bin');
const mockFileData: FileData = { name: 'test.bin', size: 4, file: mockFile };

describe('useEntropyAnalysis', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useEntropyAnalysis());
    expect(result.current.showEntropy).toBe(false);
    expect(result.current.entropyData).toEqual([]);
    expect(result.current.isEntropyLoading).toBe(false);
  });

  it('should start analysis on handleShowEntropy', () => {
    const { result } = renderHook(() => useEntropyAnalysis());

    act(() => {
      result.current.handleShowEntropy(mockFileData);
    });

    expect(result.current.isEntropyLoading).toBe(true);
    expect(result.current.showEntropy).toBe(true);
    expect(window.Worker).toHaveBeenCalledWith(expect.any(URL), { type: 'module' });
    expect(mockPostMessage).toHaveBeenCalledWith({ file: mockFileData.file, blockSize: 256 });
  });

  it('should update state on successful worker message', () => {
    const { result } = renderHook(() => useEntropyAnalysis());
    const mockEntropyData = [1, 2, 3];

    act(() => {
      result.current.handleShowEntropy(mockFileData);
    });

    act(() => {
      mockWorker.onmessage?.(
        new MessageEvent('message', { data: { entropyData: mockEntropyData } })
      );
    });

    expect(result.current.isEntropyLoading).toBe(false);
    expect(result.current.entropyData).toEqual(mockEntropyData);
    expect(mockTerminate).toHaveBeenCalled();
  });

  it('should handle worker error message', () => {
    const { result } = renderHook(() => useEntropyAnalysis());

    act(() => {
      result.current.handleShowEntropy(mockFileData);
    });

    act(() => {
      mockWorker.onmessage?.(new MessageEvent('message', { data: { error: 'Test Error' } }));
    });

    expect(result.current.isEntropyLoading).toBe(false);
    expect(result.current.showEntropy).toBe(false);
    expect(window.alert).toHaveBeenCalledWith('Failed to calculate entropy: Test Error');
    expect(mockTerminate).toHaveBeenCalled();
  });

  it('should handle worker onerror event', () => {
    const { result } = renderHook(() => useEntropyAnalysis());

    act(() => {
      result.current.handleShowEntropy(mockFileData);
    });

    act(() => {
      mockWorker.onerror?.(new ErrorEvent('error', { error: new Error('Worker Crash') }));
    });

    expect(result.current.isEntropyLoading).toBe(false);
    expect(result.current.showEntropy).toBe(false);
    expect(window.alert).toHaveBeenCalledWith(
      'An unexpected error occurred in the entropy worker.'
    );
    expect(mockTerminate).toHaveBeenCalled();
  });

  it('should reset state on handleCloseEntropy', () => {
    const { result } = renderHook(() => useEntropyAnalysis());

    act(() => {
      result.current.handleShowEntropy(mockFileData);
    });

    act(() => {
      result.current.handleCloseEntropy();
    });

    expect(result.current.showEntropy).toBe(false);
    expect(result.current.entropyData).toEqual([]);
  });
});
