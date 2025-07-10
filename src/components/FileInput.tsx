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
import React, { useCallback } from 'react';
import { Upload, File, RefreshCw, BarChart3 } from 'lucide-react';
import { FileData } from '../types/structure';
import { logExecution } from '../utils/utils';

interface FileInputProps {
  onFileLoad: (fileData: FileData) => void;
  currentFile?: FileData;
  onShowEntropy?: (fileData: FileData) => void;
}

export const FileInput: React.FC<FileInputProps> = ({ onFileLoad, currentFile, onShowEntropy }) => {
  const handleFileSelect = useCallback(
    (file: File) => {
      const fileData: FileData = {
        name: file.name,
        size: file.size,
        file: file,
      };
      logExecution(onFileLoad)(fileData);
    },
    [onFileLoad]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset the input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const triggerFileSelect = () => {
    const input = document.getElementById('file-input') as HTMLInputElement;
    input?.click();
  };

  const handleShowEntropy = () => {
    if (currentFile && onShowEntropy) {
      logExecution(onShowEntropy)(currentFile);
    }
  };

  if (currentFile) {
    return (
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">File Selection</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-300 text-sm">
              <File className="w-4 h-4 mr-2" />
              <span>{currentFile.name}</span>
              <span className="ml-2 text-gray-400">({currentFile.size} bytes)</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleShowEntropy}
                className="flex items-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Show Entropy</span>
              </button>
              <button
                onClick={triggerFileSelect}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Load Another</span>
              </button>
            </div>
          </div>
        </div>
        <input type="file" onChange={handleFileChange} className="hidden" id="file-input" />
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">File Selection</h2>
      </div>

      <div
        className="mt-4 border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-gray-400 mb-2">Drag and drop a file here, or click to select</p>
        <input type="file" onChange={handleFileChange} className="hidden" id="file-input" />
        <label
          htmlFor="file-input"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer transition-colors"
        >
          Select File
        </label>
      </div>
    </div>
  );
};
