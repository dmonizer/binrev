/**
 * Entropy Calculator Utility
 *
 * Purpose: Calculates Shannon entropy for binary data visualization
 *
 * Features:
 * - Block-based entropy calculation for large files
 * - Shannon entropy formula implementation
 * - Configurable block size for different granularities
 * - Efficient processing of binary data
 *
 * Shannon Entropy Formula:
 * H(X) = -Σ(p(x) * log2(p(x)))
 * where p(x) is the probability of byte value x occurring in the block
 *
 * Dependencies:
 * - None (pure JavaScript implementation)
 */

/**
 * Calculates Shannon entropy for each block of binary data
 * @param data - The binary data to analyze
 * @param blockSize - Size of each block in bytes (default: 256)
 * @returns Array of entropy values (0-8 bits) for each block
 */
export function calculateEntropy(data: Uint8Array, blockSize: number = 256): number[] {
  const entropyValues: number[] = [];

  // Process data in blocks
  for (let i = 0; i < data.length; i += blockSize) {
    const blockEnd = Math.min(i + blockSize, data.length);
    const block = data.slice(i, blockEnd);

    // Calculate entropy for this block
    const entropy = calculateBlockEntropy(block);
    entropyValues.push(entropy);
  }

  return entropyValues;
}

/**
 * Calculates Shannon entropy for a single block of data
 * @param block - The block of data to analyze
 * @returns Entropy value in bits (0-8)
 */
function calculateBlockEntropy(block: Uint8Array): number {
  if (block.length === 0) return 0;

  // Count frequency of each byte value (0-255)
  const frequencies = new Array(256).fill(0);
  for (const byte of block) {
    frequencies[byte]++;
  }

  // Calculate probabilities and entropy
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
 * Gets a color representation for an entropy value
 * @param entropy - Entropy value (0-8)
 * @returns CSS color string
 */
export function getEntropyColor(entropy: number): string {
  // Normalize entropy to 0-1 range (max entropy is 8 bits)
  const normalized = Math.min(entropy / 8, 1);

  // Color gradient from blue (low entropy) to red (high entropy)
  if (normalized < 0.5) {
    // Blue to yellow
    const intensity = normalized * 2;
    return `rgb(${Math.round(intensity * 255)}, ${Math.round(intensity * 255)}, 255)`;
  } else {
    // Yellow to red
    const intensity = (normalized - 0.5) * 2;
    return `rgb(255, ${Math.round((1 - intensity) * 255)}, 0)`;
  }
}
