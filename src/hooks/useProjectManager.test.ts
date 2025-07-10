import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProjectManager } from './useProjectManager';
import * as localStorageManager from '../utils/localStorageManager';
import { ProjectStructure } from '../types/structure';

const mockProject: ProjectStructure = {
  mainStructure: { id: 'main', name: 'Test Structure', fields: [] },
  substructures: [],
  version: '1.0',
};

// Mock the localStorageManager module
vi.mock('../utils/localStorageManager', () => ({
  loadCurrentProject: vi.fn(),
  saveCurrentProject: vi.fn(),
  clearCurrentProject: vi.fn(),
  loadNamedProject: vi.fn(),
  saveNamedProject: vi.fn(),
  listSavedProjectNames: vi.fn(),
}));

describe('useProjectManager', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.mocked(localStorageManager.loadCurrentProject).mockReturnValue(null);
    vi.mocked(localStorageManager.listSavedProjectNames).mockReturnValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with a default structure if no project is saved', () => {
    const { result } = renderHook(() => useProjectManager());
    expect(result.current.structure.name).toBe('Main Structure');
    expect(result.current.substructures).toEqual([]);
  });

  it('should initialize with a saved project from localStorage', () => {
    vi.mocked(localStorageManager.loadCurrentProject).mockReturnValue(mockProject);
    const { result } = renderHook(() => useProjectManager());
    expect(result.current.structure).toEqual(mockProject.mainStructure);
  });

  it('should create a new project and clear localStorage', () => {
    vi.mocked(localStorageManager.loadCurrentProject).mockReturnValue(mockProject);
    const { result } = renderHook(() => useProjectManager());

    act(() => {
      result.current.createNewProject();
    });

    expect(result.current.structure.name).toBe('Main Structure');
    expect(result.current.structure.fields).toEqual([]);
    expect(localStorageManager.clearCurrentProject).toHaveBeenCalledTimes(1);
  });

  it('should load a named project', () => {
    vi.mocked(localStorageManager.loadNamedProject).mockReturnValue(mockProject);
    const { result } = renderHook(() => useProjectManager());

    act(() => {
      result.current.handleLoadProject('MyTestProject');
    });

    expect(result.current.structure).toEqual(mockProject.mainStructure);
    expect(result.current.showLoadModal).toBe(false);
  });

  it('should call saveNamedProject on handleSaveAs', () => {
    const { result } = renderHook(() => useProjectManager());
    vi.spyOn(window, 'prompt').mockReturnValue('MySavedProject');
    vi.spyOn(window, 'alert').mockImplementation(() => {}); // Mock alert

    act(() => {
      result.current.handleSaveAs();
    });

    expect(localStorageManager.saveNamedProject).toHaveBeenCalledWith(
      'MySavedProject',
      expect.any(Object)
    );
  });

  it('should trigger debounced auto-save when structure changes', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useProjectManager());

    act(() => {
      result.current.setStructure({ ...result.current.structure, name: 'New Name' });
    });

    // Should not have saved yet
    expect(localStorageManager.saveCurrentProject).not.toHaveBeenCalled();

    // Advance time past the debounce threshold
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(localStorageManager.saveCurrentProject).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
