import { describe, it, expect } from 'vitest';
import { calculateEntropy } from './entropyCalculator';

describe('calculateEntropy', () => {
  it('should return 0 for a block of identical bytes (zero entropy)', () => {
    const data = new Uint8Array(256).fill(0xaa);
    const result = calculateEntropy(data, 256);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(0);
  });

  it('should return 1 for a block with two equally likely bytes', () => {
    const data = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      data[i] = i % 2 === 0 ? 0xaa : 0xbb;
    }
    const result = calculateEntropy(data, 256);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(1);
  });

  it('should return 2 for a block with four equally likely bytes', () => {
    const data = new Uint8Array(256);
    const values = [0xaa, 0xbb, 0xcc, 0xdd];
    for (let i = 0; i < 256; i++) {
      data[i] = values[i % 4];
    }
    const result = calculateEntropy(data, 256);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(2);
  });

  it('should return approximately 8 for a block of random-like data', () => {
    // Create data where each byte value from 0-255 appears once
    const data = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      data[i] = i;
    }
    const result = calculateEntropy(data, 256);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(8);
  });

  it('should handle multiple blocks correctly', () => {
    const block1 = new Uint8Array(256).fill(0xaa); // Entropy 0
    const block2 = new Uint8Array(256); // Entropy 1
    for (let i = 0; i < 256; i++) {
      block2[i] = i % 2 === 0 ? 0xaa : 0xbb;
    }
    const data = new Uint8Array([...block1, ...block2]);
    const result = calculateEntropy(data, 256);
    expect(result.length).toBe(2);
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(1);
  });

  it('should handle an empty data array', () => {
    const data = new Uint8Array([]);
    const result = calculateEntropy(data, 256);
    expect(result.length).toBe(0);
  });

  it('should handle data smaller than the block size', () => {
    const data = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
    const result = calculateEntropy(data, 256);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(2); // 4 unique values in a block of 4
  });
});
