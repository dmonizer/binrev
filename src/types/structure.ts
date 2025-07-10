/**
 * Structure Definition Types
 *
 * Purpose: Defines TypeScript types for binary structure definitions and parsing
 *
 * Core Types:
 * - FieldDefinition: Defines a single field in a binary structure
 * - ParsedField: Result of parsing a field from binary data
 * - StructureDefinition: Complete structure definition with metadata
 * - SubstructureTemplate: Reusable structure template
 * - ProjectStructure: Complete project with main structure and substructures
 * - DataType: Union type of all supported data types
 * - FileData: Binary file data container
 * - ValueMapping: Maps specific values to descriptive strings
 * - BitDescription: Describes individual bits within numeric fields
 *
 * Key Features:
 * - Support for nested structures and substructures
 * - Dynamic field lengths and repeat counts via references
 * - Custom JavaScript processing for advanced field calculations
 * - Value mapping for human-readable field interpretations
 * - Bit-level flag descriptions for detailed binary analysis
 * - Comprehensive metadata for documentation
 * - Endianness specification for multi-byte types
 * - Offset override capabilities
 *
 * Dependencies: None (pure TypeScript types)
 */

/**
 * Maps a specific value to a descriptive string
 */
export interface ValueMapping {
  /** The value to match (can be number or string) */
  value: number | string;

  /** The descriptive string for this value */
  description: string;
}

/**
 * Describes individual bits within a numeric field
 */
export interface BitDescription {
  /** The bit index (0-based, where 0 is the least significant bit) */
  bitIndex: number;

  /** Description to show when this bit is set (1) */
  descriptionIfSet: string;

  /** Optional description to show when this bit is unset (0) */
  descriptionIfUnset?: string;
}

/**
 * Defines a single field in a binary structure
 */
export interface FieldDefinition {
  /** Unique identifier for the field */
  id: string;

  /** Human-readable field name */
  name: string;

  /** Data type of the field */
  type: DataType;

  /** Fixed length in bytes (optional, auto-determined if not specified) */
  length?: number;

  /** Reference to another field's value for dynamic length */
  lengthRef?: string;

  /** Byte order for multi-byte types */
  endianness: 'big' | 'little';

  /** Override automatic offset calculation */
  offset?: number;

  /** Optional field description for documentation */
  description?: string;

  /** Number of times to repeat this field */
  repeats?: number;

  /** Reference to another field's value for dynamic repeat count */
  repeatRef?: string;

  /** Child fields for nested structures (legacy) */
  children?: FieldDefinition[];

  /** Reference to a substructure template */
  substructureRef?: string;

  /** Custom JavaScript code for field processing */
  script?: string;

  /** Array of value-to-description mappings */
  valueMap?: ValueMapping[];

  /** Array of bit descriptions for interpreting individual bits */
  bitDescriptions?: BitDescription[];
}

/**
 * Result of parsing a field from binary data
 */
export interface ParsedField {
  /** Original field definition */
  definition: FieldDefinition;

  /** Parsed value (type depends on field type) */
  value: number | string | boolean | bigint | Uint8Array | Array<unknown> | null | undefined;

  /** Raw binary data for this field */
  rawValue: Uint8Array;

  /** Byte offset where this field starts */
  offset: number;

  /** Length of this field in bytes */
  length: number;

  /** Parsed child fields for nested structures */
  children?: ParsedField[];
}

/**
 * Complete structure definition with metadata
 */
export interface StructureDefinition {
  /** Unique identifier for the structure */
  id: string;

  /** Human-readable structure name */
  name: string;

  /** Optional structure description */
  description?: string;

  /** Array of field definitions */
  fields: FieldDefinition[];

  /** ID of parent structure for inheritance (future feature) */
  extends?: string;
}

/**
 * Reusable structure template for substructures
 */
export interface SubstructureTemplate {
  /** Unique identifier for the template */
  id: string;

  /** Human-readable template name */
  name: string;

  /** Optional template description */
  description?: string;

  /** Array of field definitions in this template */
  fields: FieldDefinition[];
}

/**
 * Complete project structure containing main structure and substructures
 */
export interface ProjectStructure {
  /** Main structure definition */
  mainStructure: StructureDefinition;

  /** Array of available substructure templates */
  substructures: SubstructureTemplate[];

  /** Project format version for compatibility */
  version: string;

  savedAt?: string; // Optional timestamp for when the project was saved
}

/**
 * Union type of all supported binary data types
 */
export type DataType =
  | 'uint8' // Unsigned 8-bit integer
  | 'uint16' // Unsigned 16-bit integer
  | 'uint32' // Unsigned 32-bit integer
  | 'uint64' // Unsigned 64-bit integer
  | 'int8' // Signed 8-bit integer
  | 'int16' // Signed 16-bit integer
  | 'int32' // Signed 32-bit integer
  | 'int64' // Signed 64-bit integer
  | 'float32' // 32-bit floating point
  | 'float64' // 64-bit floating point
  | 'string' // Variable-length string
  | 'bytes' // Raw byte data
  | 'struct' // Nested structure
  | 'script'; // Custom JavaScript processing

/**
 * Container for binary file data
 */
export interface FileData {
  /** Original filename */
  name: string;

  /** File size in bytes */
  size: number;

  /** The File object itself, allowing for chunked reading */
  file: File;
}

export type FieldValueType = number | string | boolean | unknown[] | bigint | null | undefined;
