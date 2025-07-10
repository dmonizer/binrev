import { describe, it, expect } from 'vitest';
import { BinaryParser } from './binaryParser';
import { FieldDefinition, FileData, SubstructureTemplate } from '../types/structure';

// Helper function to create a File object from a Uint8Array for testing
const createFile = (data: Uint8Array, name = 'test.bin'): File => {
  return new File([data.buffer], name, { type: 'application/octet-stream' });
};

describe('BinaryParser', () => {
  it('should parse basic unsigned integers in big-endian format', async () => {
    const data = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);
    const file = createFile(data);
    const fileData: FileData = { name: file.name, size: file.size, file };

    const fields: FieldDefinition[] = [
      { id: 'f1', name: 'uint8', type: 'uint8', endianness: 'big' },
      { id: 'f2', name: 'uint16', type: 'uint16', endianness: 'big' },
      { id: 'f3', name: 'uint32', type: 'uint32', endianness: 'big' },
    ];

    const parser = new BinaryParser(fileData);
    const result = await parser.parseStructure(fields);

    expect(result.length).toBe(3);
    expect(result[0].value).toBe(0x01);
    expect(result[1].value).toBe(0x0203);
    expect(result[2].value).toBe(0x04050607);
  });

  it('should parse basic unsigned integers in little-endian format', async () => {
    const data = new Uint8Array([0x01, 0x03, 0x02, 0x07, 0x06, 0x05, 0x04]);
    const file = createFile(data);
    const fileData: FileData = { name: file.name, size: file.size, file };

    const fields: FieldDefinition[] = [
      { id: 'f1', name: 'uint8', type: 'uint8', endianness: 'little' },
      { id: 'f2', name: 'uint16', type: 'uint16', endianness: 'little' },
      { id: 'f3', name: 'uint32', type: 'uint32', endianness: 'little' },
    ];

    const parser = new BinaryParser(fileData);
    const result = await parser.parseStructure(fields);

    expect(result.length).toBe(3);
    expect(result[0].value).toBe(0x01);
    expect(result[1].value).toBe(0x0203);
    expect(result[2].value).toBe(0x04050607);
  });

  it('should parse a string with a fixed length', async () => {
    const data = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // "Hello"
    const file = createFile(data);
    const fileData: FileData = { name: file.name, size: file.size, file };

    const fields: FieldDefinition[] = [
      { id: 'f1', name: 'greeting', type: 'string', length: 5, endianness: 'big' },
    ];

    const parser = new BinaryParser(fileData);
    const result = await parser.parseStructure(fields);

    expect(result[0].value).toBe('Hello');
  });

  it('should handle insufficient data gracefully', async () => {
    const data = new Uint8Array([0x01, 0x02]); // Not enough for a uint32
    const file = createFile(data);
    const fileData: FileData = { name: file.name, size: file.size, file };

    const fields: FieldDefinition[] = [
      { id: 'f1', name: 'uint32', type: 'uint32', endianness: 'big' },
    ];

    const parser = new BinaryParser(fileData);
    const result = await parser.parseStructure(fields);

    expect(result.length).toBe(1);
    expect(result[0].value).toBe(null); // Should fail to parse
    expect(result[0].length).toBe(4); // Should still report the requested length
    expect(result[0].rawValue).toEqual(new Uint8Array([0x01, 0x02]));
  });

  it('should use lengthRef to parse a dynamic length string', async () => {
    const data = new Uint8Array([0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f]); // len=5, "Hello"
    const file = createFile(data);
    const fileData: FileData = { name: file.name, size: file.size, file };

    const fields: FieldDefinition[] = [
      { id: 'len', name: 'length', type: 'uint8', endianness: 'big' },
      { id: 'str', name: 'string', type: 'string', lengthRef: 'len', endianness: 'big' },
    ];

    const parser = new BinaryParser(fileData);
    const result = await parser.parseStructure(fields);

    expect(result.length).toBe(2);
    expect(result[0].value).toBe(5);
    expect(result[1].value).toBe('Hello');
    expect(result[1].offset).toBe(1);
    expect(result[1].length).toBe(5);
  });

  it('should parse a repeated field with a fixed count', async () => {
    const data = new Uint8Array([0x12, 0x34, 0x56, 0x78]);
    const file = createFile(data);
    const fileData: FileData = { name: file.name, size: file.size, file };

    const fields: FieldDefinition[] = [
      { id: 'f1', name: 'shorts', type: 'uint16', repeats: 2, endianness: 'big' },
    ];

    const parser = new BinaryParser(fileData);
    const result = await parser.parseStructure(fields);

    expect(result.length).toBe(1);
    expect(result[0].children).toBeDefined();
    expect(result[0].children?.length).toBe(2);
    expect(result[0].children?.[0].value).toBe(0x1234);
    expect(result[0].children?.[1].value).toBe(0x5678);
  });

  it('should parse a substructure', async () => {
    const data = new Uint8Array([0x01, 0x12, 0x34]); // type=1, val=0x1234
    const file = createFile(data);
    const fileData: FileData = { name: file.name, size: file.size, file };

    const substructure: SubstructureTemplate = {
      id: 'sub1',
      name: 'MySub',
      fields: [
        { id: 's_type', name: 'type', type: 'uint8', endianness: 'big' },
        { id: 's_val', name: 'value', type: 'uint16', endianness: 'big' },
      ],
    };

    const fields: FieldDefinition[] = [
      {
        id: 'f1',
        name: 'sub_instance',
        type: 'struct',
        substructureRef: 'sub1',
        endianness: 'big',
      },
    ];

    const parser = new BinaryParser(fileData, [substructure]);
    const result = await parser.parseStructure(fields);

    expect(result.length).toBe(1);
    const subResult = result[0];
    expect(subResult.children).toBeDefined();
    expect(subResult.children?.length).toBe(2);
    expect(subResult.children?.[0].value).toBe(0x01);
    expect(subResult.children?.[1].value).toBe(0x1234);
    expect(subResult.length).toBe(3);
  });
});
