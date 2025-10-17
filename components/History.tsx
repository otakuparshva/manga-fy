import React from 'react';
import { DownloadIcon } from './IconComponents';

interface HistoryProps {
  history: string[];
}

export const History: React.FC<HistoryProps> = ({ history }) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold mb-6 text-cyan-400">Generation History</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {history.map((imageUrl, index) => (
          <div key={index} className="relative group rounded-lg overflow-hidden shadow-lg border border-gray-700/50">
            <img src={imageUrl} alt={`History ${index}`} className="w-full h-48 object-cover" />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <a
                href={imageUrl}
                download={`manga-fy-history-${index}.png`}
                className="p-3 bg-cyan-500/80 text-gray-900 rounded-full hover:bg-cyan-400 transition-colors"
                aria-label="Download image"
              >
                <DownloadIcon />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
