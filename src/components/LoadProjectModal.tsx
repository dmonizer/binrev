/*
 * This file is part of BinRev.
 *
 * BinRev is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * BinRev is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
/**
 * LoadProjectModal Component
 *
 * Purpose: Modal dialog for loading and managing saved projects
 *
 * Features:
 * - Lists all saved projects with timestamps
 * - Load project functionality
 * - Delete project functionality with confirmation
 * - Responsive modal design
 * - Empty state handling
 *
 * Props:
 * - isOpen: Boolean indicating if modal is visible
 * - onClose: Callback to close the modal
 * - onLoadProject: Callback when a project is selected to load
 *
 * Dependencies:
 * - React hooks (useState, useEffect)
 * - Lucide React icons (X, Trash2, Calendar, FolderOpen)
 * - Local Storage Manager utilities
 */

import React, { useState, useEffect } from 'react';
import { X, Trash2, Calendar, FolderOpen } from 'lucide-react';
import { listSavedProjectNames, deleteNamedProject } from '../utils/localStorageManager';

interface LoadProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadProject: (projectName: string) => void;
}

export const LoadProjectModal: React.FC<LoadProjectModalProps> = ({
  isOpen,
  onClose,
  onLoadProject,
}) => {
  const [savedProjects, setSavedProjects] = useState<Array<{ name: string; savedAt: string }>>([]);
  const [deletingProject, setDeletingProject] = useState<string | null>(null);

  /**
   * Load saved projects when modal opens
   */
  useEffect(() => {
    if (isOpen) {
      setSavedProjects(listSavedProjectNames());
    }
  }, [isOpen]);

  /**
   * Handles project loading
   */
  const handleLoadProject = (projectName: string) => {
    onLoadProject(projectName);
    onClose();
  };

  /**
   * Handles project deletion with confirmation
   */
  const handleDeleteProject = async (projectName: string) => {
    if (deletingProject === projectName) {
      // Confirm deletion
      try {
        deleteNamedProject(projectName);
        setSavedProjects((prev) => prev.filter((p) => p.name !== projectName));
        setDeletingProject(null);
      } catch (error) {
        alert('Failed to delete project. Please try again.');
        console.error('Error deleting project:', error);
      }
    } else {
      // First click - show confirmation
      setDeletingProject(projectName);
    }
  };

  /**
   * Formats the saved date for display
   */
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return (
        date.toLocaleDateString() +
        ' ' +
        date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    } catch {
      return 'Unknown';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Load Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {savedProjects.length === 0 ? (
            // Empty state
            <div className="text-center py-8 text-gray-400">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg mb-2">No saved projects</p>
              <p className="text-sm">Use "Save As" to save your current project</p>
            </div>
          ) : (
            // Project list
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {savedProjects.map((project) => (
                <div
                  key={project.name}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{project.name}</h3>
                    <div className="flex items-center text-xs text-gray-400 mt-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{formatDate(project.savedAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-3">
                    <button
                      onClick={() => handleLoadProject(project.name)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.name)}
                      className={`px-2 py-1 rounded text-sm transition-colors ${
                        deletingProject === project.name
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                      }`}
                      title={
                        deletingProject === project.name
                          ? 'Click again to confirm'
                          : 'Delete project'
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
