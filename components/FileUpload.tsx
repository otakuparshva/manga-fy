import React, { useCallback, useState } from 'react';
import { UploadType, ImageFile } from '../types';
import { PhotoIcon, BookOpenIcon, XCircleIcon, UploadIcon } from './IconComponents';

interface FileUploadProps {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  uploadType: UploadType;
  setUploadType: React.Dispatch<React.SetStateAction<UploadType>>;
}

export const FileUpload: React.FC<FileUploadProps> = ({ files, setFiles, uploadType, setUploadType }) => {
  const [imagePreviews, setImagePreviews] = useState<ImageFile[]>([]);
  
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      const newImageFiles: ImageFile[] = newFiles.map(file => ({
        file: file,
        previewUrl: URL.createObjectURL(file)
      }));
      setFiles(prev => [...prev, ...newFiles]);
      setImagePreviews(prev => [...prev, ...newImageFiles]);
    }
  }, [setFiles]);

  const removeFile = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index].previewUrl);
    setFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  return (
    <div className="space-y-4">
      <p className="text-lg font-semibold text-gray-300">A. Select Image Type</p>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setUploadType('panel')}
          className={`flex items-center justify-center gap-2 p-3 rounded-md text-sm font-medium transition-colors ${uploadType === 'panel' ? 'bg-cyan-500 text-gray-900 shadow-lg' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          <BookOpenIcon /> Manga Panel
        </button>
        <button
          onClick={() => setUploadType('photo')}
          className={`flex items-center justify-center gap-2 p-3 rounded-md text-sm font-medium transition-colors ${uploadType === 'photo' ? 'bg-cyan-500 text-gray-900 shadow-lg' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          <PhotoIcon /> Real Photo
        </button>
      </div>

      <p className="text-lg font-semibold text-gray-300 pt-2">B. Upload Images</p>
      <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-cyan-500 transition-colors">
        <input
          type="file"
          id="file-upload"
          multiple
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <UploadIcon />
          <p className="mt-2 text-sm text-gray-400">
            <span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, WEBP (batch supported)</p>
        </label>
      </div>
      
      {imagePreviews.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-400">Selected Files:</h4>
          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2">
            {imagePreviews.map((img, index) => (
              <div key={index} className="relative group">
                <img src={img.previewUrl} alt={`preview ${index}`} className="w-full h-20 object-cover rounded-md" />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-0 right-0 m-1 p-0.5 bg-gray-900/70 rounded-full text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove file"
                >
                  <XCircleIcon />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
