import { useEffect, useRef, useState } from 'react';
import {
  FileData,
  ParsedField,
  StructureDefinition,
  SubstructureTemplate,
} from '../types/structure';
import { BinaryParser } from '../utils/binaryParser';

export const useFileHandler = (
  structure: StructureDefinition,
  substructures: SubstructureTemplate[]
) => {
  const [fileData, setFileData] = useState<FileData>();
  const [parsedFields, setParsedFields] = useState<ParsedField[]>([]);
  const lastStructureRef = useRef<string>('');
  const lastSubstructuresRef = useRef<string>('');
  const lastFileDataRef = useRef<FileData | undefined>(undefined);

  useEffect(() => {
    const parseFile = async () => {
      if (fileData && structure.fields.length > 0) {
        console.log('App: Starting full structure parse due to fileData or structure change.');
        const parser = new BinaryParser(fileData, substructures);
        try {
          const results = await parser.parseStructure(structure.fields);
          setParsedFields(results);
        } catch (error) {
          console.error('App: Parse error:', error);
          setParsedFields([]);
        }
      } else {
        setParsedFields([]);
      }
    };

    // Check if anything actually changed
    const structureString = JSON.stringify(structure);
    const substructuresString = JSON.stringify(substructures);

    const structureChanged = lastStructureRef.current !== structureString;
    const substructuresChanged = lastSubstructuresRef.current !== substructuresString;
    const fileDataChanged = lastFileDataRef.current !== fileData;

    if (structureChanged || substructuresChanged || fileDataChanged) {
      lastStructureRef.current = structureString;
      lastSubstructuresRef.current = substructuresString;
      lastFileDataRef.current = fileData;
      console.log('useEffect: Something changed, parsing file...');
      parseFile();
    }
  }, [fileData, structure, substructures]);

  const handleFileLoad = (newFileData: FileData) => {
    console.log(`App: File loaded: ${newFileData.name} (${newFileData.size} bytes)`);
    setFileData(newFileData);
  };

  return {
    fileData,
    parsedFields,
    handleFileLoad,
    setFileData,
    setParsedFields,
  };
};
