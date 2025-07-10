import React from 'react';
import { Download, Upload, Save, FolderOpen, Plus } from 'lucide-react';

interface AppHeaderProps {
  hasSavedProjects: boolean;
  onCreateNewProject: () => void;
  onSaveAs: () => void;
  onShowLoadModal: () => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  hasSavedProjects,
  onCreateNewProject,
  onSaveAs,
  onShowLoadModal,
  onExport,
  onImport,
}) => {
  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs">
          <h1 className="text-2xl font-bold">BinRev</h1> Binary Format Reverse Engineer -{' '}
          <a href="https://github.com/dmonizer/binrev">GitHub</a>
        </span>
        <div className="flex space-x-2">
          <button
            onClick={onCreateNewProject}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>

          <button
            onClick={onSaveAs}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save As</span>
          </button>

          <button
            onClick={onShowLoadModal}
            disabled={!hasSavedProjects}
            className={`flex items-center space-x-2 px-3 py-2 text-white rounded text-sm ${
              hasSavedProjects
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-gray-600 cursor-not-allowed opacity-50'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Load Project</span>
          </button>

          <button
            onClick={onExport}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export Project</span>
          </button>

          <label className="flex items-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Import Project</span>
            <input type="file" accept=".json" onChange={onImport} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};
