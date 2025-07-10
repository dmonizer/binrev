/**
 * BinaryParser Utility Class
 *
 * Purpose: Parses binary data according to defined structure definitions
 *
 * Features:
 * - Supports multiple data types (integers, floats, strings, bytes)
 * - Handles endianness (big/little endian)
 * - Supports nested structures and substructures
 * - Handles repeated fields and dynamic lengths
 * - Executes custom JavaScript scripts for advanced field processing
 * - Applies value mappings for human-readable interpretations
 * - Interprets bit-level flags with descriptive strings
 * - Provides bounds checking and error handling
 *
 * Constructor Parameters:
 * - fileData: FileData object containing the binary data to parse
 * - substructures: Array of SubstructureTemplate objects for reference resolution
 *
 * Key Methods:
 * - parseStructure: Main entry point for parsing a structure definition
 * - parseField: Parses an individual field definition
 * - parseSubstructure: Handles substructure reference parsing
 * - parseRepeatedField: Handles fields with repeat counts
 * - parseScriptField: Executes custom JavaScript for field processing
 * - parseValue: Converts raw bytes to typed values
 * - applyValueMapping: Applies value-to-description mappings
 * - applyBitDescriptions: Interprets individual bits with descriptions
 *
 * Implementation Details:
 * - Uses DataView for efficient binary data access
 * - Maintains a map of parsed fields for reference resolution
 * - Handles insufficient data gracefully
 * - Supports both static and dynamic field lengths
 * - Provides comprehensive error handling for script execution
 * - Applies value mappings and bit descriptions after raw parsing
 *
 * Dependencies:
 * - FileData, FieldDefinition, ParsedField, SubstructureTemplate types
 * - getDataTypeSize utility function
 */

import {
  FieldDefinition,
  FieldValueType,
  FileData,
  ParsedField,
  SubstructureTemplate,
} from '../types/structure';
import { getDataTypeSize } from './dataTypes';
import { readFileSlice } from './fileReader'; // Import the new utility

export class BinaryParser {
  private readonly file: File;
  private readonly fileSize: number;
  private readonly parsedFields: Map<string, ParsedField> = new Map();
  private readonly substructures: SubstructureTemplate[];

  /**
   * Creates a new BinaryParser instance
   * @param fileData - The binary file data (including the File object) to parse
   * @param substructures - Available substructure templates for reference resolution
   */
  constructor(fileData: FileData, substructures: SubstructureTemplate[] = []) {
    console.log(`BinaryParser: Initializing with file ${fileData.name} (${fileData.size} bytes)`);
    this.file = fileData.file;
    this.fileSize = fileData.size;
    this.substructures = substructures;
  }

  /**
   * Parses a complete structure definition asynchronously
   * @param fields - Array of field definitions to parse
   * @returns Promise that resolves to an array of parsed field results
   */
  async parseStructure(fields: FieldDefinition[]): Promise<ParsedField[]> {
    console.log('BinaryParser: Starting structure parsing.');
    const startTime = performance.now();
    this.parsedFields.clear();
    let offset = 0;
    const results: ParsedField[] = [];

    for (const field of fields) {
      const fieldParseTime = `parseField: ${field.name} (${field.id})`;
      console.time(fieldParseTime);
      const parsed = await this.parseField(field, offset, null);
      console.timeEnd(fieldParseTime);

      results.push(parsed);
      this.parsedFields.set(field.id, parsed);
      offset = parsed.offset + parsed.length;

      // Stop parsing if we've reached the end of the file
      if (offset >= this.fileSize) {
        console.log(`BinaryParser: Reached end of file at offset ${offset}. Stopping parse.`);
        break;
      }
    }

    const endTime = performance.now();
    console.log(
      `BinaryParser: Finished structure parsing in ${(endTime - startTime).toFixed(2)}ms.`
    );
    return results;
  }

  /**
   * Parses an individual field definition asynchronously
   * @param definition - The field definition to parse
   * @param startOffset - Starting byte offset in the data
   * @param repeatCount - Optional repeat count for repeated fields (null for single items)
   * @returns Promise that resolves to a parsed field result
   */
  private async parseField(
    definition: FieldDefinition,
    startOffset: number,
    repeatCount: number | null
  ): Promise<ParsedField> {
    let offset = startOffset;

    // Handle offset override
    if (definition.offset !== undefined) {
      offset = definition.offset;
    }

    // Check if offset is beyond file bounds
    if (offset >= this.fileSize) {
      return {
        definition,
        value: null,
        rawValue: new Uint8Array(0),
        offset,
        length: 0,
      };
    }

    // Handle custom script processing
    if (definition.type === 'script') {
      // Script fields might need to read data, so they should also be async
      return await this.parseScriptField(definition, offset);
    }

    // Handle substructure references
    if (definition.type === 'struct' && definition.substructureRef) {
      return await this.parseSubstructure(definition, offset);
    }

    // Determine field length
    const requestedLength = this.getFieldLength(definition);

    // Calculate available bytes from current offset
    const bytesAvailable = this.fileSize - offset;
    const actualBytesToRead = Math.min(requestedLength, bytesAvailable);

    // For fixed-size data types, check if we have enough bytes
    const typeSize = getDataTypeSize(definition.type);
    if (typeSize !== null && actualBytesToRead < typeSize) {
      // If not enough data, return a partial result
      const rawValue = await readFileSlice(this.file, offset, offset + actualBytesToRead);
      return {
        definition,
        value: null,
        rawValue,
        offset,
        length: requestedLength, // Use requested length for proper highlighting
      };
    }

    // Handle repeat count - only if not already provided
    repeatCount ??= this.getRepeatCount(definition);

    if (repeatCount > 1) {
      return await this.parseRepeatedField(definition, offset, repeatCount);
    }

    // Parse single field with bounds checking
    const rawValue = await readFileSlice(this.file, offset, offset + actualBytesToRead);

    let value: FieldValueType;
    try {
      value = this.parseValue(definition, rawValue);

      // Apply value mapping if defined
      value = this.applyValueMapping(definition, value);

      // Apply bit descriptions if defined
      value = this.applyBitDescriptions(definition, value);
    } catch (e) {
      // If parsing fails due to insufficient data, return null
      const error = e as Error;
      console.warn(
        `BinaryParser: Error parsing value for field ${definition.name}: ${error.message}`
      );
      value = null;
    }

    const parsed: ParsedField = {
      definition,
      value,
      rawValue,
      offset,
      length: requestedLength, // Use requested length for proper highlighting
    };

    // Handle nested structures (legacy children)
    if (definition.type === 'struct' && definition.children && value !== null) {
      const childResults: ParsedField[] = [];
      let childOffset = offset;

      for (const childDef of definition.children) {
        if (childOffset >= this.fileSize) {
          break;
        }

        const childParsed = await this.parseField(childDef, childOffset, null);
        childResults.push(childParsed);
        childOffset = childParsed.offset + childParsed.length;
      }

      parsed.children = childResults;
      parsed.length = childOffset - offset;
    }

    return parsed;
  }

  /**
   * Applies value mapping to convert raw values to descriptive strings
   * @param definition - Field definition containing value mappings
   * @param value - Raw parsed value
   * @returns Mapped value or original value if no mapping found
   */
  private applyValueMapping(definition: FieldDefinition, value: FieldValueType): FieldValueType {
    if (!definition.valueMap || definition.valueMap.length === 0 || value === null) {
      return value;
    }

    // Find matching value mapping
    const mapping = definition.valueMap.find((m) => m.value === value);
    if (mapping) {
      return mapping.description;
    }

    return value;
  }

  /**
   * Applies bit descriptions to interpret individual bits in numeric values
   * @param definition - Field definition containing bit descriptions
   * @param value - Raw parsed numeric value
   * @returns Array of bit descriptions or original value
   */
  private applyBitDescriptions(definition: FieldDefinition, value: FieldValueType): FieldValueType {
    if (
      !definition.bitDescriptions ||
      definition.bitDescriptions.length === 0 ||
      value === null ||
      typeof value !== 'number'
    ) {
      return value;
    }

    const bitDescriptions: string[] = [];

    for (const bitDesc of definition.bitDescriptions) {
      const bitValue = (value >> bitDesc.bitIndex) & 1;

      if (bitValue === 1 && bitDesc.descriptionIfSet) {
        bitDescriptions.push(bitDesc.descriptionIfSet);
      } else if (bitValue === 0 && bitDesc.descriptionIfUnset) {
        bitDescriptions.push(bitDesc.descriptionIfUnset);
      }
    }

    // If any bit descriptions were applied, return them as an array
    // Otherwise, return the original value
    return bitDescriptions.length > 0 ? bitDescriptions : value;
  }

  /**
   * Parses a field using custom JavaScript code asynchronously
   * @param definition - Field definition with script property
   * @param offset - Starting byte offset
   * @returns Promise that resolves to a parsed field result from script execution
   */
  private async parseScriptField(
    definition: FieldDefinition,
    offset: number
  ): Promise<ParsedField> {
    if (!definition.script) {
      return {
        definition,
        value: null,
        rawValue: new Uint8Array(0),
        offset,
        length: 0,
      };
    }

    try {
      // Create a safe execution context for the script
      // The script will need access to readFileSlice to get data
      const scriptFunction = new Function(
        'file',
        'fileSize',
        'offset',
        'parsedFields',
        'readFileSlice',
        definition.script
      );

      // Execute the script with the current context
      const result = await scriptFunction(
        this.file,
        this.fileSize,
        offset,
        this.parsedFields,
        readFileSlice
      );

      // Validate the result format
      if (!result || typeof result !== 'object' || !('value' in result) || !('length' in result)) {
        throw new Error('Script must return an object with "value" and "length" properties');
      }

      const { value, length } = result;

      // Validate length is a non-negative number
      if (typeof length !== 'number' || length < 0) {
        throw new Error('Script "length" must be a non-negative number');
      }

      // Calculate actual bytes to read (bounded by available data)
      const bytesAvailable = this.fileSize - offset;
      const actualLength = Math.min(length, bytesAvailable);
      const rawValue = await readFileSlice(this.file, offset, offset + actualLength);

      return {
        definition,
        value,
        rawValue,
        offset,
        length: actualLength,
      };
    } catch (e) {
      // Return error information in the parsed field
      const error = e as Error;
      const errorMessage = error.message;

      return {
        definition,
        value: `Script Error: ${errorMessage}`,
        rawValue: new Uint8Array(0),
        offset,
        length: 0,
      };
    }
  }

  /**
   * Parses a substructure reference asynchronously
   * @param definition - Field definition with substructure reference
   * @param offset - Starting byte offset
   * @returns Promise that resolves to a parsed field with substructure children
   */
  private async parseSubstructure(
    definition: FieldDefinition,
    offset: number
  ): Promise<ParsedField> {
    const substructure = this.substructures.find((s) => s.id === definition.substructureRef);
    if (!substructure) {
      return {
        definition,
        value: null,
        rawValue: new Uint8Array(0),
        offset,
        length: 0,
      };
    }

    const childResults: ParsedField[] = [];
    let childOffset = offset;

    for (const childDef of substructure.fields) {
      if (childOffset >= this.fileSize) {
        break;
      }

      const childParsed = await this.parseField(childDef, childOffset, null);
      childResults.push(childParsed);
      childOffset = childParsed.offset + childParsed.length;
    }

    const totalLength = childOffset - offset;
    const actualBytesToRead = Math.min(totalLength, this.fileSize - offset);
    const rawValue = await readFileSlice(this.file, offset, offset + actualBytesToRead);

    return {
      definition,
      value: childResults.map((child) => child.value),
      rawValue,
      offset,
      length: actualBytesToRead,
      children: childResults,
    };
  }

  /**
   * Parses a field with repeat count asynchronously
   * @param definition - Field definition
   * @param offset - Starting byte offset
   * @param count - Number of repetitions
   * @returns Promise that resolves to a parsed field with repeated children
   */
  private async parseRepeatedField(
    definition: FieldDefinition,
    offset: number,
    count: number
  ): Promise<ParsedField> {
    const children: ParsedField[] = [];
    let currentOffset = offset;

    for (let i = 0; i < count; i++) {
      // Stop if we've reached the end of the file
      if (currentOffset >= this.fileSize) {
        break;
      }

      // Create a definition for a single item, removing repeat properties to prevent recursion
      const { ...singleItemDef } = definition;
      const itemDef = { ...singleItemDef, id: `${definition.id}[${i}]` };
      const itemParsed = await this.parseField(itemDef, currentOffset, 1); // Pass 1 for single item

      // If the item couldn't be parsed (null value), stop further repetitions
      if (itemParsed.value === null && itemParsed.length === 0) {
        break;
      }

      children.push(itemParsed);
      currentOffset = itemParsed.offset + itemParsed.length;
    }

    const totalLength = currentOffset - offset;
    const actualBytesToRead = Math.min(totalLength, this.fileSize - offset);
    const rawValue = await readFileSlice(this.file, offset, offset + actualBytesToRead);

    return {
      definition,
      value: children.map((child) => child.value),
      rawValue,
      offset,
      length: actualBytesToRead,
      children,
    };
  }

  /**
   * Determines the length of a field
   * @param definition - Field definition
   * @returns Field length in bytes
   */
  private getFieldLength(definition: FieldDefinition): number {
    if (definition.lengthRef) {
      const refField = this.parsedFields.get(definition.lengthRef);
      if (refField && typeof refField.value === 'number') {
        return refField.value;
      }
    }

    if (definition.length !== undefined) {
      return definition.length;
    }

    const typeSize = getDataTypeSize(definition.type);
    if (typeSize !== null) {
      return typeSize;
    }

    // Default fallback
    return 1;
  }

  /**
   * Determines the repeat count for a field
   * @param definition - Field definition
   * @returns Number of repetitions
   */
  private getRepeatCount(definition: FieldDefinition): number {
    if (definition.repeatRef) {
      const refField = this.parsedFields.get(definition.repeatRef);
      if (refField && typeof refField.value === 'number') {
        return refField.value;
      }
    }

    return definition.repeats || 1;
  }

  /**
   * Parses raw bytes into typed values
   * @param definition - Field definition specifying the data type
   * @param data - Raw byte data to parse
   * @returns Parsed value of appropriate type
   */
  private parseValue(
    definition: FieldDefinition,
    data: Uint8Array
  ): number | string | boolean | Array<unknown> | bigint | null | undefined {
    // Check if we have enough data for the requested type
    const typeSize = getDataTypeSize(definition.type);
    if (typeSize !== null && data.length < typeSize) {
      throw new Error(`Insufficient data: need ${typeSize} bytes, got ${data.length}`);
    }

    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const isLittleEndian = definition.endianness === 'little';

    switch (definition.type) {
      case 'uint8':
        return view.getUint8(0);
      case 'uint16':
        return view.getUint16(0, isLittleEndian);
      case 'uint32':
        return view.getUint32(0, isLittleEndian);
      case 'uint64':
        return view.getBigUint64(0, isLittleEndian);
      case 'int8':
        return view.getInt8(0);
      case 'int16':
        return view.getInt16(0, isLittleEndian);
      case 'int32':
        return view.getInt32(0, isLittleEndian);
      case 'int64':
        return view.getBigInt64(0, isLittleEndian);
      case 'float32':
        return view.getFloat32(0, isLittleEndian);
      case 'float64':
        return view.getFloat64(0, isLittleEndian);
      case 'string':
        return new TextDecoder().decode(data);
      case 'bytes':
        return Array.from(data)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join(' ');
      default:
        return data as unknown as unknown[];
    }
  }
}
