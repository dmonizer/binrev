import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface FieldScriptEditorProps {
  script: string | undefined;
  onScriptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const FieldScriptEditor: React.FC<FieldScriptEditorProps> = ({ script, onScriptChange }) => {
  const [showScriptHelp, setShowScriptHelp] = useState(false);

  return (
    <div className="col-span-2">
      <div className="flex items-center space-x-2 mb-1">
        <label className="block text-sm font-medium text-gray-300">JavaScript Code</label>
        <button
          type="button"
          onClick={() => setShowScriptHelp(!showScriptHelp)}
          className="text-blue-400 hover:text-blue-300"
          title="Show help"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {showScriptHelp && (
        <div className="mb-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded text-sm text-blue-100">
          <h4 className="font-medium mb-2">Script Parameters:</h4>
          <ul className="list-disc list-inside space-y-1 mb-3">
            <li>
              <code className="bg-gray-700 px-1 rounded">data</code> - Uint8Array of the entire file
              content
            </li>
            <li>
              <code className="bg-gray-700 px-1 rounded">offset</code> - Current byte offset for
              this field
            </li>
            <li>
              <code className="bg-gray-700 px-1 rounded">parsedFields</code> - Map of string to
              ParsedField of all previously parsed fields (accessible by field ID)
            </li>
          </ul>
          <h4 className="font-medium mb-2">Required Return Format:</h4>
          <p className="mb-2">Your script must return an object with:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <code className="bg-gray-700 px-1 rounded">value</code> - The parsed value for this
              field (any type)
            </li>
            <li>
              <code className="bg-gray-700 px-1 rounded">length</code> - Number of bytes consumed by
              this field
            </li>
          </ul>
          <div className="mt-3 p-2 bg-gray-800 rounded">
            <p className="text-xs text-gray-300 mb-1">Example:</p>
            <code className="text-xs">
              {`// Calculate CRC32 of previous 4 bytes
const view = new DataView(data.buffer, offset - 4, 4);
const value = view.getUint32(0, true);
return { value: value, length: 0 };`}
            </code>
          </div>
        </div>
      )}

      <textarea
        value={script || ''}
        onChange={onScriptChange}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white font-mono text-sm"
        rows={8}
        placeholder="// Your JavaScript code here
// Must return { value: any, length: number }
return { value: null, length: 1 };"
      />
    </div>
  );
};
