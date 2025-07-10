/**
 * Web Worker for processing file chunks into a hex view format.
 *
 * This worker runs in a separate thread, preventing the UI from freezing when
 * handling large files. It reads a specified slice of a file, formats it into
 * hex and ASCII representations, and sends the structured data back to the main thread.
 *
 * Message to Worker:
 * {
 *   file: File;      // The file to process
 *   start: number;   // The starting byte offset of the slice to read
 *   end: number;     // The ending byte offset of the slice to read
 * }
 *
 * Message from Worker:
 * {
 *   rows: FormattedRow[]; // The array of formatted row data
 *   start: number;        // The starting offset of the processed chunk
 *   end: number;          // The ending offset of the processed chunk
 * }
 *
 * Type FormattedRow:
 * {
 *   offset: string;
 *   hex: string[];
 *   ascii: string[];
 * }
 */

interface FormattedRow {
  offset: string;
  hex: string[];
  ascii: string[];
}

/**
 * Reads a slice of a file asynchronously.
 * @param file The file to read from.
 * @param start The starting byte offset.
 * @param end The ending byte offset.
 * @returns A Promise that resolves with a Uint8Array of the file slice.
 */
const readFileSlice = (file: File, start: number, end: number): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const blob = file.slice(start, end);

    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(new Uint8Array(e.target.result as ArrayBuffer));
      } else {
        reject(new Error('Failed to read file slice: target result is null.'));
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(blob);
  });
};

/**
 * Formats a raw byte array into structured hex and ASCII rows.
 * @param data The Uint8Array data chunk.
 * @param startOffset The starting offset of this chunk within the original file.
 * @returns An array of formatted rows.
 */
const formatHex = (data: Uint8Array, startOffset: number): FormattedRow[] => {
  const rows: FormattedRow[] = [];
  const bytesPerRow = 16;

  for (let i = 0; i < data.length; i += bytesPerRow) {
    const rowData = data.slice(i, i + bytesPerRow);
    const offset = (startOffset + i).toString(16).padStart(8, '0').toUpperCase();

    const hex = Array.from(rowData).map((byte) => byte.toString(16).padStart(2, '0').toUpperCase());
    const ascii = Array.from(rowData).map((byte) =>
      byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.'
    );

    rows.push({ offset, hex, ascii });
  }

  return rows;
};

// Main worker message handler
self.onmessage = async (e: MessageEvent<{ file: File; start: number; end: number }>) => {
  const { file, start, end } = e.data;

  try {
    const data = await readFileSlice(file, start, end);
    const rows = formatHex(data, start);
    self.postMessage({ rows, start, end });
  } catch (error) {
    console.error('Error in hex worker:', error);
    // Optionally, post an error message back to the main thread
    self.postMessage({ error: (error as Error).message, start, end });
  }
};
