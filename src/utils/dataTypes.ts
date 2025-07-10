/**
 * Data Types Utility Module
 *
 * Purpose: Defines and manages binary data type information
 *
 * Features:
 * - Comprehensive data type definitions with metadata
 * - Size information for fixed-size types
 * - Human-readable names and descriptions
 * - Utility functions for type information retrieval
 * - Support for custom JavaScript processing
 *
 * Supported Data Types:
 * - Unsigned integers: uint8, uint16, uint32, uint64
 * - Signed integers: int8, int16, int32, int64
 * - Floating point: float32, float64
 * - Variable length: string, bytes, struct
 * - Custom processing: script
 *
 * Type Information Structure:
 * - name: Human-readable display name
 * - size: Size in bytes (null for variable-length types)
 * - description: Detailed description of the data type
 *
 * Utility Functions:
 * - getDataTypeSize: Returns the size of a data type
 * - getDataTypeName: Returns the display name of a data type
 *
 * Dependencies:
 * - DataType type from types/structure
 */

import { DataType } from '../types/structure';

/**
 * Comprehensive data type definitions with metadata
 * Each type includes display name, size information, and description
 */
export const DATA_TYPES: Record<
  DataType,
  { name: string; size: number | null; description: string }
> = {
  // Unsigned integer types
  uint8: { name: 'UInt8', size: 1, description: 'Unsigned 8-bit integer' },
  uint16: { name: 'UInt16', size: 2, description: 'Unsigned 16-bit integer' },
  uint32: { name: 'UInt32', size: 4, description: 'Unsigned 32-bit integer' },
  uint64: { name: 'UInt64', size: 8, description: 'Unsigned 64-bit integer' },

  // Signed integer types
  int8: { name: 'Int8', size: 1, description: 'Signed 8-bit integer' },
  int16: { name: 'Int16', size: 2, description: 'Signed 16-bit integer' },
  int32: { name: 'Int32', size: 4, description: 'Signed 32-bit integer' },
  int64: { name: 'Int64', size: 8, description: 'Signed 64-bit integer' },

  // Floating point types
  float32: { name: 'Float32', size: 4, description: '32-bit floating point' },
  float64: { name: 'Float64', size: 8, description: '64-bit floating point' },

  // Variable length types
  string: { name: 'String', size: null, description: 'String data' },
  bytes: { name: 'Bytes', size: null, description: 'Raw byte data' },
  struct: { name: 'Struct', size: null, description: 'Nested structure' },

  // Custom processing type
  script: { name: 'Script', size: null, description: 'Custom JavaScript processing' },
};

/**
 * Gets the size in bytes for a given data type
 * @param type - The data type to get size for
 * @returns Size in bytes, or null for variable-length types
 */
export function getDataTypeSize(type: DataType): number | null {
  return DATA_TYPES[type].size;
}

/**
 * Gets the human-readable display name for a data type
 * @param type - The data type to get name for
 * @returns Display name string
 */
export function getDataTypeName(type: DataType): string {
  return DATA_TYPES[type].name;
}
