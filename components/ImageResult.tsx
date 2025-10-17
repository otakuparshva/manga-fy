import React, { useEffect } from 'react';
import { ProcessedImage } from '../types';
import { DownloadIcon, ArrowRightIcon } from './IconComponents';

interface ImageResultProps {
  result: ProcessedImage;
}

export const ImageResult: React.FC<ImageResultProps> = ({ result }) => {
  useEffect(() => {
    // Revoke the blob URL when the component unmounts to prevent memory leaks
    return () => {
      if (result.originalUrl && result.originalUrl.startsWith('blob:')) {
        URL.revokeObjectURL(result.originalUrl);
      }
    };
  }, [result.originalUrl]);

  return (
    <div className="bg-gray-800/50 rounded-xl overflow-hidden shadow-lg border border-gray-700/50">
      <div className="relative group">
        <img src={result.generatedUrl} alt="Generated" className="w-full h-auto object-contain" />
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <img src={result.originalUrl} alt="Original" className="w-1/2 h-1/2 object-contain border-2 border-gray-500 rounded-md" />
           <ArrowRightIcon />
           <img src={result.generatedUrl} alt="Generated Thumbnail" className="w-1/2 h-1/2 object-contain border-2 border-cyan-500 rounded-md" />
        </div>
         <span className="absolute top-2 left-2 bg-gray-900/80 text-xs px-2 py-1 rounded">Hover to compare</span>
      </div>
      <div className="p-4 bg-gray-800">
        <a
          href={result.generatedUrl}
          download={`manga-fy-result-${Date.now()}.png`}
          className="w-full flex items-center justify-center gap-2 bg-gray-700 text-gray-200 font-semibold py-2 px-4 rounded-lg transition-colors hover:bg-gray-600"
        >
          <DownloadIcon />
          Download
        </a>
      </div>
    </div>
  );
};