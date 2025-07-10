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
 * FileInput Component
 *
 * Purpose: Handles file selection and loading for binary data analysis
 *
 * Features:
 * - Drag and drop file upload
 * - Click to select file
 * - File information display
 * - File replacement functionality
 *
 * Props:
 * - onFileLoad: Callback function that receives FileData when a file is loaded
 * - currentFile: Optional FileData object representing the currently loaded file
 *
 * Dependencies:
 * - React hooks (useCallback)
 * - Lucide React icons (Upload, File, RefreshCw)
 * - FileData type from types/structure
 */

import React, { useCallback } from 'react';
import { Upload, File, RefreshCw } from 'lucide-react';
import { FileData } from '../../types/structure';

interface FileInputProps {
  onFileLoad: (fileData: FileData) => void;
  currentFile?: FileData;
  onShowEntropy: (fileData: FileData) => void; // Add this prop
}

export const FileInput: React.FC<FileInputProps> = ({ onFileLoad, currentFile }) => {
  /**
   * Handles file selection and conversion to FileData format
   * Stores the File object and reads a small initial chunk for preview/initial display.
   */
  const handleFileSelect = useCallback(
    (file: File) => {
      console.log(`FileInput: Selected file: ${file.name}, size: ${file.size}`);
      // No need to read any part of the file here anymore.
      // The HexView component will handle reading the chunks it needs.
      const fileData: FileData = {
        name: file.name,
        size: file.size,
        file: file, // Store the File object
      };
      console.log('FileInput: Calling onFileLoad with new FileData object.');
      onFileLoad(fileData);
    },
    [onFileLoad]
  );

  /**
   * Handles file input change event
   * Resets input value to allow selecting the same file again
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset the input value to allow selecting the same file again
    e.target.value = '';
  };

  /**
   * Handles drag and drop file selection
   */
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

  /**
   * Prevents default drag over behavior to enable drop functionality
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  /**
   * Programmatically triggers the hidden file input
   */
  const triggerFileSelect = () => {
    const input = document.getElementById('file-input') as HTMLInputElement;
    input?.click();
  };

  // Render file information and replacement option when file is loaded
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
            <button
              onClick={triggerFileSelect}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Load Another</span>
            </button>
          </div>
        </div>
        <input type="file" onChange={handleFileChange} className="hidden" id="file-input" />
      </div>
    );
  }

  // Render file selection interface when no file is loaded
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
