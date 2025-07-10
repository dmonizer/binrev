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
import React, { useState, useEffect, useRef } from 'react';
import { X, BarChart3 } from 'lucide-react';
import { getEntropyColor } from '../utils/entropyCalculator';

interface EntropyDisplayProps {
  entropyData: number[];
  blockSize: number;
  onClose: () => void;
  isLoading: boolean;
  onBlockClick?: (offset: number) => void;
}

export const EntropyDisplay: React.FC<EntropyDisplayProps> = ({
  entropyData,
  blockSize,
  onClose,
  isLoading,
  onBlockClick,
}) => {
  const [hoveredInfo, setHoveredInfo] = useState<{ index: number; value: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [startBlock, setStartBlock] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);

  const maxEntropy =
    entropyData.length > 0 ? entropyData.reduce((max, val) => Math.max(max, val), -Infinity) : 0;

  // Reset zoom and pan when a new file's data arrives
  useEffect(() => {
    setZoom(1);
    setStartBlock(0);
  }, [entropyData]);

  // Effect to measure container width for responsive bar sizing
  useEffect(() => {
    const chartElement = chartRef.current;
    if (!chartElement) return;

    const resizeObserver = new ResizeObserver(() => {
      setContainerWidth(chartElement.clientWidth);
    });
    resizeObserver.observe(chartElement);

    setContainerWidth(chartElement.clientWidth);

    return () => resizeObserver.disconnect();
  }, [entropyData]);

  const handleWheel = (e: React.WheelEvent) => {
    const zoomSpeed = 0.5;
    const newZoom = e.deltaY < 0 ? zoom * (1 + zoomSpeed) : zoom / (1 + zoomSpeed);
    const clampedZoom = Math.max(1, Math.min(newZoom, entropyData.length / 10));

    if (chartRef.current) {
      const rect = chartRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mousePercent = mouseX / rect.width;

      const totalBlocks = entropyData.length;
      const visibleBlocks = Math.floor(totalBlocks / zoom);
      const mouseAtBlock = startBlock + Math.floor(mousePercent * visibleBlocks);

      const newStartBlock = Math.round(mouseAtBlock - mousePercent * (totalBlocks / clampedZoom));
      setStartBlock(
        Math.max(0, Math.min(newStartBlock, totalBlocks - Math.floor(totalBlocks / clampedZoom)))
      );
    }

    setZoom(clampedZoom);
  };

  const header = (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <BarChart3 className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">File Entropy Analysis</h3>
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
        <X className="w-5 h-5" />
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        {header}
        <div className="flex items-center justify-center h-64 bg-gray-900 rounded-lg">
          <div className="text-white animate-pulse">Calculating Entropy...</div>
        </div>
      </div>
    );
  }

  if (entropyData.length === 0) {
    return null;
  }

  const renderChart = () => {
    const totalBlocks = entropyData.length;
    const visibleBlocks = Math.floor(totalBlocks / zoom);
    const endBlock = Math.min(startBlock + visibleBlocks, totalBlocks);

    const bars = [];
    const displayWidth = containerWidth;

    if (displayWidth <= 0) return null;

    const blocksPerPixel = visibleBlocks / displayWidth;

    if (blocksPerPixel < 1) {
      // Zoomed in: Render individual bars
      const dataSlice = entropyData.slice(startBlock, endBlock);
      const barWidth = displayWidth / visibleBlocks;
      for (let i = 0; i < dataSlice.length; i++) {
        const originalIndex = startBlock + i;
        bars.push({
          value: dataSlice[i],
          width: barWidth,
          originalIndex: originalIndex,
          isAggregated: false,
        });
      }
    } else {
      // Zoomed out: Aggregate bars
      for (let i = 0; i < displayWidth; i++) {
        const aggStart = startBlock + Math.floor(i * blocksPerPixel);
        const aggEnd = startBlock + Math.floor((i + 1) * blocksPerPixel);
        const chunk = entropyData.slice(aggStart, aggEnd);
        if (chunk.length > 0) {
          const maxValue = chunk.reduce((max, val) => Math.max(max, val), -Infinity);
          bars.push({
            value: maxValue,
            width: 1,
            originalIndex: aggStart,
            isAggregated: true,
            count: chunk.length,
          });
        }
      }
    }

    return bars.map((bar, index) => {
      const height = maxEntropy > 0 ? (bar.value / maxEntropy) * 100 : 0;
      const color = getEntropyColor(bar.value);
      const isHovered = hoveredInfo?.index === bar.originalIndex;

      return (
        <div
          key={index}
          className="relative flex-shrink-0 cursor-pointer"
          style={{ width: `${bar.width}px`, height: '100%' }}
          onMouseEnter={() => setHoveredInfo({ index: bar.originalIndex, value: bar.value })}
          onMouseLeave={() => setHoveredInfo(null)}
          onClick={() => onBlockClick?.(bar.originalIndex * blockSize)}
        >
          <div
            className="absolute bottom-0 w-full"
            style={{
              height: `${height}%`,
              backgroundColor: color,
              boxShadow: isHovered ? '0 0 8px rgba(255,255,255,0.7)' : 'none',
              zIndex: isHovered ? 10 : 1,
            }}
          />
          {isHovered && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-20">
              <div className="bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                {bar.isAggregated ? (
                  <div>~{bar.count} blocks</div>
                ) : (
                  <div>Block: {bar.originalIndex}</div>
                )}
                <div>Offset: 0x{(bar.originalIndex * blockSize).toString(16)}</div>
                <div>Entropy: {bar.value.toFixed(3)}</div>
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4">
      {header}
      <div className="bg-gray-900 rounded-lg p-4" onWheel={handleWheel}>
        <div className="mb-2 text-sm text-gray-400">
          Block Size: {blockSize} bytes | Scroll to zoom, click to navigate
        </div>
        <div ref={chartRef} className="relative h-32 overflow-hidden bg-gray-800">
          <div className="flex items-end h-full w-full">{renderChart()}</div>
        </div>
      </div>
    </div>
  );
};
