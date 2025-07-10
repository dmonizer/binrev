import { useState, useEffect, useMemo, useCallback } from 'react';
import { StructureDefinition, SubstructureTemplate, ProjectStructure } from '../types/structure';
import {
  saveCurrentProject,
  loadCurrentProject,
  clearCurrentProject,
  saveNamedProject,
  loadNamedProject,
  listSavedProjectNames,
} from '../utils/localStorageManager';
import { debounce } from '../utils/debounce';

const initializeState = () => {
  const savedProject = loadCurrentProject();
  if (savedProject) {
    return {
      structure: savedProject.mainStructure,
      substructures: savedProject.substructures,
    };
  }

  return {
    structure: {
      id: 'main',
      name: 'Main Structure',
      fields: [],
    } as StructureDefinition,
    substructures: [] as SubstructureTemplate[],
  };
};

export const useProjectManager = () => {
  const initialState = initializeState();
  const [structure, setStructure] = useState<StructureDefinition>(initialState.structure);
  const [substructures, setSubstructures] = useState<SubstructureTemplate[]>(
    initialState.substructures
  );
  const [showLoadModal, setShowLoadModal] = useState(false);

  const autoSave = useCallback((projectData: ProjectStructure) => {
    console.log('Auto-saving project...');
    saveCurrentProject(projectData);
  }, []);

  const debouncedAutoSave = useMemo(() => debounce(autoSave, 1000), [autoSave]);

  useEffect(() => {
    const projectData: ProjectStructure = {
      mainStructure: structure,
      substructures: substructures,
      version: '1.0',
    };
    debouncedAutoSave(projectData);
  }, [structure, substructures, debouncedAutoSave]);

  const createNewProject = () => {
    const defaultStructure: StructureDefinition = {
      id: 'main',
      name: 'Main Structure',
      fields: [],
    };
    setStructure(defaultStructure);
    setSubstructures([]);
    clearCurrentProject();
    // Note: Other state resets (fileData, etc.) will be handled in the component
  };

  const handleSaveAs = () => {
    const currentName = structure.name === 'Main Structure' ? '' : structure.name;
    const projectName = prompt('Enter project name:', currentName);

    if (projectName && projectName.trim()) {
      try {
        const projectData: ProjectStructure = {
          mainStructure: structure,
          substructures: substructures,
          version: '1.0',
        };
        saveNamedProject(projectName.trim(), projectData);
        alert('Project saved successfully!');
      } catch (e) {
        const error = e as Error;
        alert(`Failed to save project. Please try again. Error: ${error.message}`);
      }
    }
  };

  const handleLoadProject = (projectName: string) => {
    const projectData = loadNamedProject(projectName);
    if (projectData) {
      setStructure(projectData.mainStructure);
      setSubstructures(projectData.substructures);
    } else {
      alert('Failed to load project. The project may have been corrupted.');
    }
    setShowLoadModal(false);
  };

  const exportStructure = () => {
    const projectData: ProjectStructure = {
      mainStructure: structure,
      substructures: substructures,
      version: '1.0',
    };
    const dataStr = JSON.stringify(projectData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${structure.name.replace(/\s+/g, '_')}_project.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importStructure = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          if (imported.version && imported.mainStructure && imported.substructures) {
            setStructure(imported.mainStructure);
            setSubstructures(imported.substructures);
          } else {
            setStructure(imported);
            setSubstructures([]);
          }
        } catch (e) {
          const error = e as Error;
          alert(`Invalid structure file: ${error.message}`);
        }
      };
      reader.readAsText(file);
    }
  };

  const availableFields = useMemo(() => {
    return structure.fields.filter((field) =>
      ['uint8', 'uint16', 'uint32', 'uint64', 'int8', 'int16', 'int32', 'int64'].includes(
        field.type
      )
    );
  }, [structure.fields]);

  const hasSavedProjects = listSavedProjectNames().length > 0;

  return {
    structure,
    setStructure,
    substructures,
    setSubstructures,
    showLoadModal,
    setShowLoadModal,
    availableFields,
    hasSavedProjects,
    createNewProject,
    handleSaveAs,
    handleLoadProject,
    exportStructure,
    importStructure,
  };
};
