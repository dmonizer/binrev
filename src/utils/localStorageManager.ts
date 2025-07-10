/**
 * Local Storage Manager Utility
 *
 * Purpose: Manages project data persistence in browser Local Storage
 *
 * Features:
 * - Current project auto-save and load
 * - Named project save/load functionality
 * - Project listing and deletion
 * - Error handling and data validation
 *
 * Storage Structure:
 * - 'binrev_current_project': Current working project
 * - 'binrev_saved_projects': Object containing all named projects
 *
 * Dependencies:
 * - ProjectStructure type from types/structure
 */

import { ProjectStructure } from '../types/structure';

const CURRENT_PROJECT_KEY = 'binrev_current_project';
const SAVED_PROJECTS_KEY = 'binrev_saved_projects';

/**
 * Saves the current working project to Local Storage
 * @param projectData - The project data to save
 */
export function saveCurrentProject(projectData: ProjectStructure): void {
  try {
    console.log('Saving current project:', projectData);
    const dataStr = JSON.stringify(projectData);
    localStorage.setItem(CURRENT_PROJECT_KEY, dataStr);
  } catch (error) {
    console.error('Failed to save current project:', error);
  }
}

/**
 * Loads the current working project from Local Storage
 * @returns The loaded project data or null if not found
 */
export function loadCurrentProject(): ProjectStructure | null {
  try {
    const dataStr = localStorage.getItem(CURRENT_PROJECT_KEY);
    if (!dataStr) return null;

    const projectData = JSON.parse(dataStr);

    // Validate the loaded data structure
    if (!projectData.mainStructure || !projectData.substructures || !projectData.version) {
      console.warn('Invalid current project data structure');
      return null;
    }

    return projectData;
  } catch (error) {
    console.error('Failed to load current project:', error);
    return null;
  }
}

/**
 * Clears the current working project from Local Storage
 */
export function clearCurrentProject(): void {
  try {
    localStorage.removeItem(CURRENT_PROJECT_KEY);
  } catch (error) {
    console.error('Failed to clear current project:', error);
  }
}

/**
 * Saves a project under a specific name
 * @param name - The name to save the project under
 * @param projectData - The project data to save
 */
export function saveNamedProject(name: string, projectData: ProjectStructure): void {
  try {
    const savedProjects = getSavedProjects();
    savedProjects[name] = {
      ...projectData,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(SAVED_PROJECTS_KEY, JSON.stringify(savedProjects));
  } catch (error) {
    console.error('Failed to save named project:', error);
    throw new Error('Failed to save project. Please try again.');
  }
}

/**
 * Loads a project by its name
 * @param name - The name of the project to load
 * @returns The loaded project data or null if not found
 */
export function loadNamedProject(name: string): ProjectStructure | null {
  try {
    const savedProjects = getSavedProjects();
    const projectData = savedProjects[name];

    if (!projectData) return null;

    // Remove the savedAt timestamp before returning
    const { ...cleanProjectData } = projectData;
    return cleanProjectData;
  } catch (error) {
    console.error('Failed to load named project:', error);
    return null;
  }
}

/**
 * Returns an array of names of all saved projects
 * @returns Array of project names with metadata
 */
export function listSavedProjectNames(): Array<{ name: string; savedAt: string }> {
  try {
    const savedProjects = getSavedProjects();
    return Object.entries(savedProjects).map(([name, data]) => ({
      name,
      savedAt: data.savedAt || 'Unknown',
    }));
  } catch (error) {
    console.error('Failed to list saved projects:', error);
    return [];
  }
}

/**
 * Deletes a named project from Local Storage
 * @param name - The name of the project to delete
 */
export function deleteNamedProject(name: string): void {
  try {
    const savedProjects = getSavedProjects();
    delete savedProjects[name];
    localStorage.setItem(SAVED_PROJECTS_KEY, JSON.stringify(savedProjects));
  } catch (error) {
    console.error('Failed to delete named project:', error);
    throw new Error('Failed to delete project. Please try again.');
  }
}

/**
 * Helper function to get all saved projects from Local Storage
 * @returns Object containing all saved projects
 */
function getSavedProjects(): Record<string, ProjectStructure & { savedAt?: string }> {
  try {
    const dataStr = localStorage.getItem(SAVED_PROJECTS_KEY);
    return dataStr ? JSON.parse(dataStr) : {};
  } catch (error) {
    console.error('Failed to get saved projects:', error);
    return {};
  }
}
