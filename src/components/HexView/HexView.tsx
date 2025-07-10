/**
 * HexView Component
 *
 * Purpose: Displays binary file data in hexadecimal format with field highlighting
 *
 * Features:
 * - Hexadecimal representation of binary data
 * - ASCII representation alongside hex
 * - Color-coded field highlighting based on parsed structure
 * - Interactive byte selection
 * - Offset display and navigation
 * - Precise highlighting for nested fields
 *
 * Props:
 * - fileData: Optional FileData object containing the binary data to display
 * - parsedFields: Array of ParsedField objects for highlighting
 * - highlightedField: ID of the currently highlighted field
 * - onOffsetClick: Callback function when a byte offset is clicked
 *
 * Implementation Details:
 * - Uses memoization for performance optimization
 * - Displays 16 bytes per row (standard hex editor format)
 * - Color-codes different fields with distinct background colors
 * - Provides hover effects for better user interaction
 * - Prioritizes exact field ID matches for highlighting over parent structures
 *
 * Dependencies:
 * - React hooks (useMemo)
 * - FileData and ParsedField types from types/structure
 */

import React, { JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FileData, ParsedField } from '../../types/structure';
import { readFileSlice } from '../../utils/fileReader'; // Import the new utility

export interface HexViewRef {
  goToOffset: (offset: number) => void;
}

interface HexViewProps {
  fileData?: FileData;
  parsedFields?: ParsedField[];
  highlightedField?: string;
  onOffsetClick?: (offset: number) => void;
}

const BYTES_PER_ROW = 16;
const ROW_HEIGHT = 20; // Approximate height of a row in pixels

export const HexView: React.FC<HexViewProps> = ({
  fileData,
  parsedFields = [],
  highlightedField,
  onOffsetClick,
}) => {
  const [visibleData, setVisibleData] = useState<Uint8Array>(new Uint8Array());
  const [startOffset, setStartOffset] = useState(0);
  const hexViewRef = useRef<HTMLDivElement>(null);

  const totalRows = fileData ? Math.ceil(fileData.size / BYTES_PER_ROW) : 0;

  /**
   * Memoized calculation of field ranges for highlighting
   * Creates color-coded ranges for each parsed field and its children
   */
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

    /**
     * Recursively adds field ranges including nested children
     */
    const addFieldRange = (field: ParsedField, colorIndex: number) => {
      ranges.push({
        start: field.offset,
        end: field.offset + field.length - 1,
        field,
        color: colors[colorIndex % colors.length],
      });

      if (field.children) {
        field.children.forEach((child, index) => {
          addFieldRange(child, colorIndex + index + 1);
        });
      }
    };

    parsedFields.forEach((field, index) => {
      addFieldRange(field, index);
    });

    return ranges;
  }, [parsedFields]);

  /**
   * Determines the styling for a byte at a specific offset
   * Returns CSS classes for background color and highlighting
   * Prioritizes exact field ID matches for highlighting over parent structures
   */
  const getByteStyle = (offset: number) => {
    // Find all ranges that contain this offset
    const containingRanges = fieldRanges.filter((r) => offset >= r.start && offset <= r.end);

    if (containingRanges.length === 0) return '';

    // If we have a highlighted field, check if any of the containing ranges match it exactly
    if (highlightedField) {
      const exactMatch = containingRanges.find((r) => r.field.definition.id === highlightedField);
      if (exactMatch) {
        return `${exactMatch.color} ring-2 ring-white`;
      }
    }

    // If no exact match for highlighted field, find the most specific (smallest) range
    // This ensures nested fields show their own colors rather than their parent's
    const mostSpecificRange = containingRanges.reduce((smallest, current) => {
      const currentSize = current.end - current.start + 1;
      const smallestSize = smallest.end - smallest.start + 1;
      return currentSize < smallestSize ? current : smallest;
    });

    return mostSpecificRange.color;
  };

  /**
   * Fetches and sets the visible data chunk based on scroll position
   */
  const fetchVisibleData = useCallback(
    async (force = false) => {
      if (!fileData || !hexViewRef.current) {
        console.log('HexView: No file data or ref, clearing visible data.');
        setVisibleData(new Uint8Array());
        setStartOffset(0);
        return;
      }

      const { scrollTop, clientHeight } = hexViewRef.current;
      const visibleRows = Math.ceil(clientHeight / ROW_HEIGHT);
      const bufferRows = 50; // Load extra rows above and below for smoother scrolling

      const firstVisibleRow = Math.floor(scrollTop / ROW_HEIGHT);
      const startRow = Math.max(0, firstVisibleRow - bufferRows);
      const endRow = Math.min(totalRows, firstVisibleRow + visibleRows + bufferRows);

      const newStartOffset = startRow * BYTES_PER_ROW;
      const newEndOffset = Math.min(fileData.size, endRow * BYTES_PER_ROW);

      if (force || newStartOffset !== startOffset || !visibleData.length) {
        console.log(
          `HexView: Fetching data. Force: ${force}, Current Offset: ${startOffset}, New Offset: ${newStartOffset}, Visible Data Length: ${visibleData.length}`
        );
        console.log(`HexView: ScrollTop: ${scrollTop}, ClientHeight: ${clientHeight}`);
        console.log(`HexView: Fetching slice from ${newStartOffset} to ${newEndOffset}`);
        try {
          const data = await readFileSlice(fileData.file, newStartOffset, newEndOffset);
          console.log(`HexView: Successfully fetched ${data.length} bytes.`);
          setVisibleData(data);
          setStartOffset(newStartOffset);
        } catch (error) {
          console.error('Error reading file slice for HexView:', error);
          setVisibleData(new Uint8Array());
        }
      }
    },
    [fileData, totalRows, startOffset, visibleData.length]
  );

  // Effect to fetch data on fileData change or initial render
  useEffect(() => {
    console.log('HexView: fileData changed, forcing data fetch.');
    fetchVisibleData(true);
  }, [fileData, fetchVisibleData]);

  // Handle scroll event for virtualization
  const handleScroll = useCallback(() => {
    fetchVisibleData();
  }, [fetchVisibleData]);

  /**
   * Formats binary data into hexadecimal rows with ASCII representation
   * Creates interactive elements for each byte
   */
  const formatHexRows = () => {
    const rows: JSX.Element[] = [];

    for (let i = 0; i < visibleData.length; i += BYTES_PER_ROW) {
      const globalRowOffset = startOffset + i;
      const rowData = visibleData.slice(i, i + BYTES_PER_ROW);
      const offsetHex = globalRowOffset.toString(16).padStart(8, '0').toUpperCase();

      // Create hex byte elements with styling and click handlers
      const hexBytes = Array.from(rowData).map((byte, byteIndex) => {
        const globalOffset = globalRowOffset + byteIndex;
        const hex = byte.toString(16).padStart(2, '0').toUpperCase();
        const style = getByteStyle(globalOffset);

        return (
          <span
            key={byteIndex}
            className={`font-mono cursor-pointer hover:bg-gray-600 px-0.5 rounded ${style}`}
            onClick={() => onOffsetClick?.(globalOffset)}
          >
            {hex}
          </span>
        );
      });

      // Create ASCII representation elements
      const ascii = Array.from(rowData).map((byte, byteIndex) => {
        const globalOffset = globalRowOffset + byteIndex;
        const char = byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.';
        const style = getByteStyle(globalOffset);

        return (
          <span
            key={byteIndex}
            className={`font-mono cursor-pointer hover:bg-gray-600 ${style}`}
            onClick={() => onOffsetClick?.(globalOffset)}
          >
            {char}
          </span>
        );
      });

      // Create complete row with offset, hex, and ASCII
      rows.push(
        <div
          key={globalRowOffset}
          className="flex items-center space-x-4 text-sm"
          style={{ height: ROW_HEIGHT }}
        >
          <span className="text-gray-400 font-mono w-20">{offsetHex}</span>
          <div className="flex space-x-1 flex-1 min-w-0">{hexBytes}</div>
          <div className="flex border-l border-gray-600 pl-4">{ascii}</div>
        </div>
      );
    }

    return rows;
  };

  // Render empty state when no file is loaded
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

  // Render hex view with file data
  return (
    <div className="bg-gray-900 flex-1 p-4 flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Hex View</h3>
        <div className="text-sm text-gray-400">{fileData.size} bytes</div>
      </div>

      <div
        ref={hexViewRef}
        className="bg-gray-800 rounded-lg p-4 overflow-auto flex-1"
        onScroll={handleScroll}
      >
        <div style={{ height: totalRows * ROW_HEIGHT, position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              top: (startOffset / BYTES_PER_ROW) * ROW_HEIGHT,
              width: '100%',
            }}
          >
            {formatHexRows()}
          </div>
        </div>
      </div>
    </div>
  );
};
