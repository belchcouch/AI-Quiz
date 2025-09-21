
import React, { useRef } from 'react';
import { UploadIcon } from './icons';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  onGenerate: () => void;
  file: File | null;
  error: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, onGenerate, file, error }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFileChange(files[0]);
    }
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      if(files[0].type === 'application/pdf') {
        onFileChange(files[0]);
      } else {
        onFileChange(null);
        alert('Please drop a PDF file.');
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div 
        className="w-full border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors duration-300"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleBrowseClick}
      >
        <input
          type="file"
          accept=".pdf"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="flex flex-col items-center text-gray-400">
          <UploadIcon className="w-12 h-12 mb-4" />
          {file ? (
            <>
              <p className="font-semibold text-gray-200">{file.name}</p>
              <p className="text-sm">({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
            </>
          ) : (
            <>
              <p className="font-semibold text-gray-200">Drag & drop your PDF here</p>
              <p className="text-sm mt-1">or click to browse</p>
            </>
          )}
        </div>
      </div>
      
      {error && <p className="text-red-400 text-sm">{error}</p>}
      
      <button
        onClick={onGenerate}
        disabled={!file}
        className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
      >
        Generate Quiz
      </button>
    </div>
  );
};

export default FileUpload;
