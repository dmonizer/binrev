/**
 * Web Worker for calculating Shannon entropy of a file.
 *
 * This worker runs in a separate thread to prevent the UI from freezing during
 * the intensive process of reading a large file and calculating its entropy.
 *
 * Message to Worker:
 * {
 *   file: File;      // The file to analyze
 *   blockSize: number; // The size of blocks for entropy calculation
 * }
 *
 * Message from Worker (Success):
 * {
 *   entropyData: number[]; // Array of entropy values for each block
 * }
 *
 * Message from Worker (Error):
 * {
 *   error: string; // Error message
 * }
 */

/**
 * Reads a slice of a file asynchronously.
 */
const readFileSlice = (file: File, start: number, end: number): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const blob = file.slice(start, end);
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(new Uint8Array(e.target.result as ArrayBuffer));
      } else {
        reject(new Error('Failed to read file slice.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(blob);
  });
};

/**
 * Calculates Shannon entropy for a single block of data.
 */
function calculateBlockEntropy(block: Uint8Array): number {
  if (block.length === 0) return 0;
  const frequencies = new Array(256).fill(0);
  for (const byte of block) {
    frequencies[byte]++;
  }
  let entropy = 0;
  const blockLength = block.length;
  for (const frequency of frequencies) {
    if (frequency > 0) {
      const probability = frequency / blockLength;
      entropy -= probability * Math.log2(probability);
    }
  }
  return entropy;
}

/**
 * Calculates Shannon entropy for each block of binary data.
 */
function calculateEntropy(data: Uint8Array, blockSize: number = 256): number[] {
  const entropyValues: number[] = [];
  for (let i = 0; i < data.length; i += blockSize) {
    const blockEnd = Math.min(i + blockSize, data.length);
    const block = data.slice(i, blockEnd);
    const entropy = calculateBlockEntropy(block);
    entropyValues.push(entropy);
  }
  return entropyValues;
}

// Main worker message handler
self.onmessage = async (e: MessageEvent<{ file: File; blockSize: number }>) => {
  const { file, blockSize } = e.data;

  try {
    // Read the entire file. This is a heavy operation, but it happens off the main thread.
    const fileData = await readFileSlice(file, 0, file.size);

    // Calculate entropy. This is also a heavy operation.
    const entropyData = calculateEntropy(fileData, blockSize);

    // Post the result back to the main thread.
    self.postMessage({ entropyData });
  } catch (error) {
    console.error('Error in entropy worker:', error);
    self.postMessage({ error: (error as Error).message });
  }
};
