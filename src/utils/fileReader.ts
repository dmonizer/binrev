/**
 * Asynchronous File Reader Utility
 *
 * Purpose: Provides functions to read specific byte ranges from a File object.
 * This is crucial for handling large files efficiently by only loading necessary chunks
 * into memory, rather than the entire file.
 *
 * Features:
 * - Reads a specified byte range (slice) from a File.
 * - Returns the data as a Uint8Array.
 * - Supports asynchronous operations using Promises.
 */

export const readFileSlice = (file: File, start: number, end: number): Promise<Uint8Array> => {
  const operation = `readFileSlice from ${start} to ${end}`;
  console.time(operation);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const blob = file.slice(start, end);

    reader.onload = (e) => {
      if (e.target?.result) {
        const result = new Uint8Array(e.target.result as ArrayBuffer);
        console.timeEnd(operation);
        resolve(result);
      } else {
        const error = new Error('Failed to read file slice: target result is null.');
        console.error(error);
        console.timeEnd(operation);
        reject(error);
      }
    };

    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      console.timeEnd(operation);
      reject(error);
    };

    reader.readAsArrayBuffer(blob);
  });
};
