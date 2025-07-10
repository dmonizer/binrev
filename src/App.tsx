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
import { useRef } from 'react';
import { FileInput } from './components/FileInput';
import { LoadProjectModal } from './components/LoadProjectModal';
import { EntropyDisplay } from './components/EntropyDisplay';
import { AppHeader } from './components/Header/AppHeader';
import { Workspace } from './components/Workspace';
import { HexViewRef } from './components/HexView';

import { useProjectManager } from './hooks/useProjectManager';
import { useFileHandler } from './hooks/useFileHandler';
import { useEntropyAnalysis } from './hooks/useEntropyAnalysis';
import { usePanelInteraction } from './hooks/usePanelInteraction';
import { FileData } from './types/structure.ts';

function App() {
  // --- Custom Hooks ---
  const {
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
    handleLoadProject: loadProject,
    exportStructure,
    importStructure,
  } = useProjectManager();

  const { fileData, parsedFields, handleFileLoad, setFileData, setParsedFields } = useFileHandler(
    structure,
    substructures
  );

  const {
    showEntropy,
    entropyData,
    isEntropyLoading,
    handleShowEntropy,
    handleCloseEntropy,
    setShowEntropy,
    setEntropyData,
  } = useEntropyAnalysis();

  const hexViewRef = useRef<HexViewRef>(null);
  const {
    highlightedField,
    setHighlightedField,
    structurePanelHeight,
    handleFieldClick,
    handleOffsetClick,
    handleGoToOffset,
    handleMouseDown,
  } = usePanelInteraction(parsedFields, hexViewRef);

  // --- Composite Actions ---
  // Actions that need to coordinate between multiple hooks
  const handleCreateNewProject = () => {
    createNewProject();
    setFileData(undefined);
    setParsedFields([]);
    setHighlightedField(undefined);
    setShowEntropy(false);
    setEntropyData([]);
  };

  const handleLoadProject = (projectName: string) => {
    loadProject(projectName);
    setFileData(undefined);
    setParsedFields([]);
    setHighlightedField(undefined);
    setShowEntropy(false);
    setEntropyData([]);
  };

  const onFileSelected = (newFileData: FileData) => {
    handleFileLoad(newFileData);
    setShowEntropy(false);
    setEntropyData([]);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="h-screen flex flex-col">
        <AppHeader
          hasSavedProjects={hasSavedProjects}
          onCreateNewProject={handleCreateNewProject}
          onSaveAs={handleSaveAs}
          onShowLoadModal={() => setShowLoadModal(true)}
          onExport={exportStructure}
          onImport={importStructure}
        />

        <FileInput
          onFileLoad={onFileSelected}
          currentFile={fileData}
          onShowEntropy={() => fileData && handleShowEntropy(fileData)}
        />

        {showEntropy && (
          <EntropyDisplay
            entropyData={entropyData}
            isLoading={isEntropyLoading}
            blockSize={256}
            onClose={handleCloseEntropy}
            onBlockClick={handleGoToOffset}
          />
        )}

        <Workspace
          ref={hexViewRef}
          fileData={fileData}
          parsedFields={parsedFields}
          highlightedField={highlightedField}
          onOffsetClick={handleOffsetClick}
          structurePanelHeight={structurePanelHeight}
          onMouseDown={handleMouseDown}
          structure={structure}
          onStructureChange={setStructure}
          availableFields={availableFields}
          substructures={substructures}
          onSubstructuresChange={setSubstructures}
          onFieldClick={handleFieldClick}
        />

        <LoadProjectModal
          isOpen={showLoadModal}
          onClose={() => setShowLoadModal(false)}
          onLoadProject={handleLoadProject}
        />
      </div>
    </div>
  );
}

export default App;
