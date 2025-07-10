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
import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { FileData, ParsedField } from '../types/structure';

interface HexViewProps {
  fileData?: FileData;
  parsedFields?: ParsedField[];
  highlightedField?: string;
  onOffsetClick?: (offset: number) => void;
}

interface FormattedRow {
  offset: string;
  hex: string[];
  ascii: string[];
}

export interface HexViewRef {
  goToOffset: (offset: number) => void;
}

const ROW_HEIGHT = 24; // Height of a single row in pixels
const BYTES_PER_ROW = 16;
const CHUNK_SIZE = 65536; // 64KB chunks

export const HexView = forwardRef<HexViewRef, HexViewProps>(
  ({ fileData, parsedFields = [], highlightedField, onOffsetClick }, ref) => {
    const [formattedRows, setFormattedRows] = useState<Map<number, FormattedRow>>(new Map());
    const [visibleRows, setVisibleRows] = useState({ start: 0, end: 0 });
    const [isLoading, setIsLoading] = useState<Set<number>>(new Set());

    const workerRef = useRef<Worker | null>(null);

    // Refs to hold current state for callbacks without causing re-renders
    const isLoadingRef = useRef(isLoading);
    isLoadingRef.current = isLoading;
    const formattedRowsRef = useRef(formattedRows);
    formattedRowsRef.current = formattedRows;
    const containerRef = useRef<HTMLDivElement | null>(null);

    useImperativeHandle(ref, () => ({
      goToOffset: (offset: number) => {
        if (containerRef.current) {
          const targetScrollTop = Math.floor(offset / BYTES_PER_ROW) * ROW_HEIGHT;
          containerRef.current.scrollTop = targetScrollTop;
        }
      },
    }));

    // Memoize field range info for styling
    const fieldRanges = useMemo(() => {
      const ranges: Array<{ start: number; end: number; field: ParsedField; color: string }> = [];
      const colors = [
        'bg-red-500/20 border-red-500/50',
        'bg-green-500/20 border-green-500/50',
        'bg-blue-500/20 border-blue-500/50',
        'bg-yellow-500/20 border-yellow-500/50',
        'bg-purple-500/20 border-purple-500/50',
        'bg-pink-500/20 border-pink-500/50',
      ];
      const addFieldRange = (field: ParsedField, colorIndex: number) => {
        ranges.push({
          start: field.offset,
          end: field.offset + field.length - 1,
          field,
          color: colors[colorIndex % colors.length],
        });
        if (field.children) {
          field.children.forEach((child, index) => addFieldRange(child, colorIndex + index + 1));
        }
      };
      parsedFields.forEach((field, index) => addFieldRange(field, index));
      return ranges;
    }, [parsedFields]);

    // Function to get style for a specific byte offset
    const getByteStyle = useCallback(
      (offset: number) => {
        const range = fieldRanges.find((r) => offset >= r.start && offset <= r.end);
        if (!range) return '';
        const isHighlighted = highlightedField === range.field.definition.id;
        return `${range.color} ${isHighlighted ? 'ring-2 ring-white' : ''}`;
      },
      [fieldRanges, highlightedField]
    );

    // Setup and teardown the web worker
    useEffect(() => {
      workerRef.current = new Worker(new URL('../workers/hexWorker.ts', import.meta.url), {
        type: 'module',
      });

      workerRef.current.onmessage = (e: MessageEvent<{ rows: FormattedRow[]; start: number }>) => {
        const { rows: newRows, start } = e.data;
        setFormattedRows((prev) => {
          const updated = new Map(prev);
          newRows.forEach((row, i) => {
            const rowOffset = start + i * BYTES_PER_ROW;
            updated.set(rowOffset, row);
          });
          return updated;
        });
        setIsLoading((prev) => {
          const newLoading = new Set(prev);
          newLoading.delete(start);
          return newLoading;
        });
      };

      return () => {
        workerRef.current?.terminate();
      };
    }, []);

    // Function to request a chunk of data from the worker
    const requestChunk = useCallback(
      (startOffset: number) => {
        // Use refs to check current state without adding them as dependencies
        if (!fileData || !workerRef.current || isLoadingRef.current.has(startOffset)) {
          return;
        }
        setIsLoading((prev) => new Set(prev).add(startOffset));
        const endOffset = Math.min(startOffset + CHUNK_SIZE, fileData.size);
        workerRef.current.postMessage({ file: fileData.file, start: startOffset, end: endOffset });
      },
      [fileData]
    ); // Dependency array is now stable

    // Effect to handle scrolling and request necessary chunks
    useEffect(() => {
      const container = containerRef.current;
      if (!container || !fileData) return;

      const handleScroll = () => {
        const scrollTop = container.scrollTop;
        const containerHeight = container.clientHeight;
        const startRow = Math.floor(scrollTop / ROW_HEIGHT);
        const endRow = Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT);
        setVisibleRows({ start: startRow, end: endRow });

        // Determine which chunks are needed for the visible area
        const startByte = startRow * BYTES_PER_ROW;
        const endByte = endRow * BYTES_PER_ROW;
        const startChunkOffset = Math.floor(startByte / CHUNK_SIZE) * CHUNK_SIZE;
        const endChunkOffset = Math.floor(endByte / CHUNK_SIZE) * CHUNK_SIZE;

        requestChunk(startChunkOffset);
        if (startChunkOffset !== endChunkOffset) {
          requestChunk(endChunkOffset);
        }
      };

      handleScroll(); // Initial load
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }, [fileData, requestChunk]);

    // Reset state when a new file is loaded
    useEffect(() => {
      setFormattedRows(new Map());
      setIsLoading(new Set());
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
      if (fileData) {
        requestChunk(0); // Load the first chunk of the new file
      }
    }, [fileData, requestChunk]);

    if (!fileData) {
      return (
        <div className="bg-gray-900 flex-1 p-4 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <p>No file loaded</p>
            <p className="text-sm mt-2">Select a file to view its hex representation</p>
          </div>
        </div>
      );
    }

    const totalRows = Math.ceil(fileData.size / BYTES_PER_ROW);
    const totalHeight = totalRows * ROW_HEIGHT;

    const renderedRows = [];
    for (let i = visibleRows.start; i < visibleRows.end && i < totalRows; i++) {
      const rowOffset = i * BYTES_PER_ROW;
      const rowData = formattedRows.get(rowOffset);

      renderedRows.push(
        <div key={i} className="flex items-center space-x-4 text-sm" style={{ height: ROW_HEIGHT }}>
          {rowData ? (
            <>
              <span className="text-gray-400 font-mono w-20">{rowData.offset}</span>
              <div className="flex space-x-1 flex-1 min-w-0">
                {rowData.hex.map((hex, byteIndex) => {
                  const globalOffset = rowOffset + byteIndex;
                  return (
                    <span
                      key={byteIndex}
                      className={`font-mono cursor-pointer hover:bg-gray-600 px-0.5 rounded ${getByteStyle(globalOffset)}`}
                      onClick={() => onOffsetClick?.(globalOffset)}
                    >
                      {hex}
                    </span>
                  );
                })}
              </div>
              <div className="flex border-l border-gray-600 pl-4">
                {rowData.ascii.map((char, byteIndex) => {
                  const globalOffset = rowOffset + byteIndex;
                  return (
                    <span
                      key={byteIndex}
                      className={`font-mono cursor-pointer hover:bg-gray-600 ${getByteStyle(globalOffset)}`}
                      onClick={() => onOffsetClick?.(globalOffset)}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
            </>
          ) : (
            <span className="text-gray-500 font-mono w-20">Loading...</span>
          )}
        </div>
      );
    }

    return (
      <div className="bg-gray-900 flex-1 p-4 flex flex-col overflow-hidden">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Hex View</h3>
          <div className="text-sm text-gray-400">{fileData.size} bytes</div>
        </div>
        <div
          ref={containerRef}
          className="bg-gray-800 rounded-lg p-4 flex-1 overflow-auto relative"
        >
          <div style={{ height: totalHeight }}>
            <div
              style={{
                position: 'absolute',
                top: visibleRows.start * ROW_HEIGHT,
                width: 'calc(100% - 2rem)',
              }}
            >
              {renderedRows}
            </div>
          </div>
        </div>
      </div>
    );
  }
);
