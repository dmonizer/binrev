import { useState, useCallback } from 'react';
import { FileData } from '../types/structure';

export const useEntropyAnalysis = () => {
  const [showEntropy, setShowEntropy] = useState(false);
  const [entropyData, setEntropyData] = useState<number[]>([]);
  const [isEntropyLoading, setIsEntropyLoading] = useState(false);

  const handleShowEntropy = useCallback((fileData: FileData) => {
    if (!fileData) return;

    console.log('App: handleShowEntropy triggered.');
    setIsEntropyLoading(true);
    setShowEntropy(true);
    setEntropyData([]);

    const entropyWorker = new Worker(new URL('../workers/entropyWorker.ts', import.meta.url), {
      type: 'module',
    });

    entropyWorker.onmessage = (e: MessageEvent<{ entropyData?: number[]; error?: string }>) => {
      if (e.data.entropyData) {
        console.log(
          `App: Entropy calculation complete. Found ${e.data.entropyData.length} data points.`
        );
        setEntropyData(e.data.entropyData);
      } else if (e.data.error) {
        console.error('Failed to calculate entropy:', e.data.error);
        alert(`Failed to calculate entropy: ${e.data.error}`);
        setShowEntropy(false);
      }
      setIsEntropyLoading(false);
      entropyWorker.terminate();
    };

    entropyWorker.onerror = (error) => {
      console.error('Entropy worker error:', error);
      alert('An unexpected error occurred in the entropy worker.');
      setIsEntropyLoading(false);
      setShowEntropy(false);
      entropyWorker.terminate();
    };

    entropyWorker.postMessage({ file: fileData.file, blockSize: 256 });
  }, []);

  const handleCloseEntropy = () => {
    setShowEntropy(false);
    setEntropyData([]);
  };

  return {
    showEntropy,
    entropyData,
    isEntropyLoading,
    handleShowEntropy,
    handleCloseEntropy,
    setShowEntropy, // Exposing for project loading/file changes
    setEntropyData,
  };
};
