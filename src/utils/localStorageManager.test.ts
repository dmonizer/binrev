import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearCurrentProject,
  listSavedProjectNames,
  loadCurrentProject,
  loadNamedProject,
  saveCurrentProject,
  saveNamedProject,
} from './localStorageManager';
import { ProjectStructure } from '../types/structure';

// Mock localStorage
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

const mockProject: ProjectStructure = {
  mainStructure: { id: 'main', name: 'Test Structure', fields: [] },
  substructures: [],
  version: '1.0',
};

describe('localStorageManager', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    vi.spyOn(window, 'localStorage', 'get').mockReturnValue(localStorageMock as unknown as Storage);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Current Project', () => {
    it('should save and load the current project', () => {
      saveCurrentProject(mockProject);
      const loaded = loadCurrentProject();
      expect(loaded).toEqual(mockProject);
    });

    it('should return null if no current project is saved', () => {
      const loaded = loadCurrentProject();
      expect(loaded).toBeNull();
    });

    it('should clear the current project', () => {
      saveCurrentProject(mockProject);
      clearCurrentProject();
      const loaded = loadCurrentProject();
      expect(loaded).toBeNull();
    });
  });

  describe('Named Projects', () => {
    it('should save and load a named project', () => {
      saveNamedProject('MyTestProject', mockProject);
      const loaded = loadNamedProject('MyTestProject');

      expect(loaded?.mainStructure).toEqual(mockProject.mainStructure);
      expect(loaded?.substructures).toEqual(mockProject.substructures);
      expect(loaded?.savedAt).toBeDefined();
    });

    it('should return null for a non-existent named project', () => {
      const loaded = loadNamedProject('NonExistent');
      expect(loaded).toBeNull();
    });

    it('should list saved project names', () => {
      saveNamedProject('Project A', mockProject);
      saveNamedProject('Project B', mockProject);
      const projects = listSavedProjectNames();
      const names = projects.map((p) => p.name);
      expect(names).toEqual(['Project A', 'Project B']);
    });

    it('should return an empty array if no named projects are saved', () => {
      const names = listSavedProjectNames();
      expect(names).toEqual([]);
    });

    it('should handle saving over an existing project', () => {
      const newProject: ProjectStructure = { ...mockProject, version: '2.0' };
      saveNamedProject('MyTestProject', mockProject);
      saveNamedProject('MyTestProject', newProject);
      const loaded = loadNamedProject('MyTestProject');
      expect(loaded?.mainStructure).toEqual(newProject.mainStructure);
      expect(loaded?.substructures).toEqual(newProject.substructures);
      expect(loaded?.savedAt).toBeDefined();
    });
  });

  it('should handle JSON parsing errors gracefully', () => {
    localStorageMock.setItem('binrev_current_project', 'invalid json');
    const loaded = loadCurrentProject();
    expect(loaded).toBeNull();
  });
});
