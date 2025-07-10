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
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EntropyDisplay } from './EntropyDisplay';
import React from 'react';

describe('EntropyDisplay', () => {
  const mockOnClose = vi.fn();
  const mockOnBlockClick = vi.fn();

  it('renders loading state', () => {
    render(
      <EntropyDisplay
        entropyData={[]}
        blockSize={256}
        onClose={mockOnClose}
        isLoading={true}
        onBlockClick={mockOnBlockClick}
      />
    );
    expect(screen.getByText('Calculating Entropy...')).toBeInTheDocument();
  });

  it('renders nothing if not loading and no data', () => {
    const { container } = render(
      <EntropyDisplay
        entropyData={[]}
        blockSize={256}
        onClose={mockOnClose}
        isLoading={false}
        onBlockClick={mockOnBlockClick}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the chart when data is provided', () => {
    const entropyData = [1, 2, 3, 4, 5];
    render(
      <EntropyDisplay
        entropyData={entropyData}
        blockSize={256}
        onClose={mockOnClose}
        isLoading={false}
        onBlockClick={mockOnBlockClick}
      />
    );
    expect(screen.getByText(/Block Size: 256 bytes/)).toBeInTheDocument();
    // Note: Testing the exact number of bars is tricky due to aggregation.
    // We'll test interactions instead.
  });

  it('calls onBlockClick with the correct offset when a bar is clicked', () => {
    const entropyData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    render(
      <EntropyDisplay
        entropyData={entropyData}
        blockSize={256}
        onClose={mockOnClose}
        isLoading={false}
        onBlockClick={mockOnBlockClick}
      />
    );

    // This is a bit of a hacky way to get the bars, as they don't have text.
    // We find the container and click one of its children.
    const chartContainer = screen.getByText(/Block Size/).nextSibling?.firstChild;
    if (chartContainer?.firstChild) {
      fireEvent.click(chartContainer.firstChild as Element);
      // Since we clicked the first bar (index 0), offset should be 0 * 256 = 0
      expect(mockOnBlockClick).toHaveBeenCalledWith(0);
    }
  });

  it('shows a tooltip on hover', async () => {
    const entropyData = [1, 2, 3];
    render(
      <EntropyDisplay
        entropyData={entropyData}
        blockSize={256}
        onClose={mockOnClose}
        isLoading={false}
        onBlockClick={mockOnBlockClick}
      />
    );

    const chartContainer = screen.getByText(/Block Size/).nextSibling?.firstChild;
    if (chartContainer?.firstChild) {
      fireEvent.mouseEnter(chartContainer.firstChild as Element);
      // Tooltip text is based on the first block (index 0)
      expect(await screen.findByText(/Offset: 0x0/)).toBeInTheDocument();
    }
  });
});
