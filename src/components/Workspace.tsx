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
import React, { forwardRef } from 'react';
import { HexView, HexViewRef } from './HexView';
import { StructureDefinitionPanel } from './StructureDefinition';
import { StructureView } from './StructureView';
import {
  FileData,
  ParsedField,
  StructureDefinition,
  SubstructureTemplate,
  FieldDefinition,
} from '../types/structure';

interface WorkspaceProps {
  fileData?: FileData;
  parsedFields: ParsedField[];
  highlightedField?: string;
  onOffsetClick: (offset: number) => void;
  structurePanelHeight: number;
  onMouseDown: (e: React.MouseEvent) => void;
  structure: StructureDefinition;
  onStructureChange: (structure: StructureDefinition) => void;
  availableFields: FieldDefinition[];
  substructures: SubstructureTemplate[];
  onSubstructuresChange: (substructures: SubstructureTemplate[]) => void;
  onFieldClick: (fieldId: string) => void;
}

export const Workspace = forwardRef<HexViewRef, WorkspaceProps>((props, ref) => {
  const {
    fileData,
    parsedFields,
    highlightedField,
    onOffsetClick,
    structurePanelHeight,
    onMouseDown,
    structure,
    onStructureChange,
    availableFields,
    substructures,
    onSubstructuresChange,
    onFieldClick,
  } = props;

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left Panel - Hex View */}
      <div className="w-2/5 flex flex-col border-r border-gray-700">
        <HexView
          ref={ref}
          fileData={fileData}
          parsedFields={parsedFields}
          highlightedField={highlightedField}
          onOffsetClick={onOffsetClick}
        />
      </div>

      {/* Right Panel - Structure Definition and View */}
      <div className="w-3/5 flex flex-col">
        {/* Structure Definition Panel - Resizable */}
        <div
          className="border-b border-gray-700 overflow-auto"
          style={{ height: `${structurePanelHeight}%` }}
        >
          <StructureDefinitionPanel
            structure={structure}
            onStructureChange={onStructureChange}
            availableFields={availableFields}
            substructures={substructures}
            onSubstructuresChange={onSubstructuresChange}
          />
        </div>

        {/* Resize Handle */}
        <div
          className="h-1 bg-gray-700 hover:bg-gray-600 cursor-row-resize flex-shrink-0"
          onMouseDown={onMouseDown}
        />

        {/* Structure View Panel */}
        <div className="overflow-auto" style={{ height: `${100 - structurePanelHeight}%` }}>
          <StructureView
            parsedFields={parsedFields}
            onFieldClick={onFieldClick}
            highlightedField={highlightedField}
          />
        </div>
      </div>
    </div>
  );
});
