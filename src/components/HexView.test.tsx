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
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { HexView, HexViewRef } from './HexView';
import React from 'react';
import { FileData } from '../types/structure';

// Mock the Worker
let mockWorker: Worker;
const mockPostMessage = vi.fn();
const mockTerminate = vi.fn();
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();
const mockDispatchEvent = vi.fn();

beforeEach(() => {
  mockWorker = {
    postMessage: mockPostMessage,
    terminate: mockTerminate,
    onmessage: null,
    onerror: null,
    onmessageerror: null,
    addEventListener: mockAddEventListener,
    removeEventListener: mockRemoveEventListener,
    dispatchEvent: mockDispatchEvent,
  } as Worker;
  window.Worker = vi.fn(() => mockWorker) as unknown as typeof Worker;
});

afterEach(() => {
  vi.restoreAllMocks();
});

const mockFile = new File(['Hello World'], 'test.bin');
const mockFileData: FileData = { name: 'test.bin', size: 11, file: mockFile };

describe('HexView', () => {
  it('renders "No file loaded" message when no fileData is provided', () => {
    render(<HexView />);
    expect(screen.getByText('No file loaded')).toBeInTheDocument();
  });

  it('requests the first chunk of data when a file is provided', () => {
    render(<HexView fileData={mockFileData} />);
    expect(window.Worker).toHaveBeenCalled();
    expect(mockPostMessage).toHaveBeenCalledWith({
      file: mockFileData.file,
      start: 0,
      end: 11, // Since file size is small, it requests the whole file
    });
  });

  it('renders rows when data is received from the worker', async () => {
    const { container } = render(<HexView fileData={mockFileData} />);

    const scrollContainer = container.querySelector('.overflow-auto');
    if (scrollContainer) {
      Object.defineProperty(scrollContainer, 'clientHeight', { value: 500 });
      fireEvent.scroll(scrollContainer, { target: { scrollTop: 0 } });
    }

    const mockRows = [
      { offset: '00000000', hex: ['48', '65', '6C', '6C', '6F'], ascii: ['H', 'e', 'l', 'l', 'o'] },
    ];

    await act(async () => {
      if (mockWorker.onmessage) {
        mockWorker.onmessage({ data: { rows: mockRows, start: 0 } } as MessageEvent);
      }
    });

    expect(screen.getByText('00000000')).toBeInTheDocument();
    expect(screen.getByText('48')).toBeInTheDocument();
    expect(screen.getByText('H')).toBeInTheDocument();
  });

  it('calls onOffsetClick when a hex byte is clicked', async () => {
    const onOffsetClick = vi.fn();
    const { container } = render(<HexView fileData={mockFileData} onOffsetClick={onOffsetClick} />);

    const scrollContainer = container.querySelector('.overflow-auto');
    if (scrollContainer) {
      Object.defineProperty(scrollContainer, 'clientHeight', { value: 500 });
      fireEvent.scroll(scrollContainer, { target: { scrollTop: 0 } });
    }

    const mockRows = [{ offset: '00000000', hex: ['48', '65'], ascii: ['H', 'e'] }];

    await act(async () => {
      if (mockWorker.onmessage) {
        mockWorker.onmessage({ data: { rows: mockRows, start: 0 } } as MessageEvent);
      }
    });

    const byteElement = screen.getByText('65'); // Hex for 'e'
    fireEvent.click(byteElement);

    expect(onOffsetClick).toHaveBeenCalledWith(1);
  });

  it('imperatively calls goToOffset', async () => {
    const ref = React.createRef<HexViewRef>();
    render(<HexView fileData={mockFileData} ref={ref} />);

    // Mock the container div to have a scrollHeight
    const container = screen.getByText(/bytes/).parentElement?.nextSibling as HTMLDivElement;
    Object.defineProperty(container, 'scrollTop', { writable: true, value: 0 });

    act(() => {
      ref.current?.goToOffset(160); // Go to 10th row (160 / 16)
    });

    // 10th row * 24px row height
    expect(container.scrollTop).toBe(240);
  });
});
