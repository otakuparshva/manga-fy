import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { StyleSelector } from './components/StyleSelector';
import { ImageResult } from './components/ImageResult';
import { History } from './components/History';
import { Spinner } from './components/Spinner';
import { processImageBatch } from './services/geminiService';
import { UploadType, ProcessedImage, Style, Genre } from './types';
import { STYLES, GENRES } from './constants';
import { GenerateIcon } from './components/IconComponents';

const App: React.FC = () => {
  const [uploadType, setUploadType] = useState<UploadType>('panel');
  const [files, setFiles] = useState<File[]>([]);
  const [style, setStyle] = useState<Style>(STYLES[0]);
  const [genre, setGenre] = useState<Genre>(GENRES[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<ProcessedImage[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const updateHistory = useCallback((newImageUrls: string[]) => {
    setHistory(prevHistory => {
      const updatedHistory = [...newImageUrls, ...prevHistory].slice(0, 20); // Keep last 20
      return updatedHistory;
    });
  }, []);

  const handleGenerate = async () => {
    if (files.length === 0) {
      setError('Please upload at least one image.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const newResults = await processImageBatch(files, uploadType, style, genre);
      setResults(newResults);
      const newImageUrls = newResults.map(result => result.generatedUrl);
      updateHistory(newImageUrls);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during image generation.';
      setError(`${errorMessage} Please check the console for more details.`);
    } finally {
      setIsLoading(false);
    }
  };

  const isGenerateDisabled = files.length === 0 || isLoading;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-4 bg-gray-800/50 rounded-2xl p-6 shadow-2xl border border-gray-700/50 h-fit">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">1. Configure Your Generation</h2>
            
            <div className="space-y-6">
              <FileUpload 
                files={files} 
                setFiles={setFiles} 
                uploadType={uploadType} 
                setUploadType={setUploadType}
              />
              <StyleSelector 
                style={style}
                setStyle={setStyle}
                genre={genre}
                setGenre={setGenre}
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerateDisabled}
                className={`w-full flex items-center justify-center gap-2 bg-cyan-500 text-gray-900 font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out hover:bg-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 ${isGenerateDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
              >
                {isLoading ? (
                  <>
                    <Spinner /> Generating...
                  </>
                ) : (
                  <>
                    <GenerateIcon />
                    Generate ({files.length})
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-8">
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg mb-6">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}
            
            {isLoading && (
              <div className="flex flex-col items-center justify-center bg-gray-800/50 rounded-2xl p-8 min-h-[400px]">
                <Spinner />
                <p className="text-xl mt-4 text-cyan-400 font-semibold animate-pulse">Processing your images...</p>
                <p className="text-gray-400 mt-2">This may take a moment, especially for large batches.</p>
              </div>
            )}

            {!isLoading && results.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold mb-6 text-cyan-400">Generated Images</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.map((result, index) => (
                    <ImageResult key={index} result={result} />
                  ))}
                </div>
              </div>
            )}
            
            {!isLoading && results.length === 0 && (
                <div className="flex flex-col items-center justify-center bg-gray-800/50 rounded-2xl p-8 min-h-[400px] border-2 border-dashed border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-300">Your results will appear here</h2>
                    <p className="text-gray-500 mt-2">Upload your images and click "Generate" to start.</p>
                </div>
            )}
          </div>
        </div>
        
        <History history={history} />
      </main>
    </div>
  );
};

export default App;