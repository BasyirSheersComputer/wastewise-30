// FileUpload.tsx - Universal drag & drop file upload component
import React, { useState, useRef, useCallback } from 'react';
import { Upload, File, X, CheckCircle2, AlertCircle, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';

interface FileUploadProps {
  feature: string;
  acceptedTypes?: string[];
  maxSizeMB?: number;
  onUploadComplete?: (result: any) => void;
  onUploadError?: (error: string) => void;
  className?: string;
}

export default function FileUpload({
  feature,
  acceptedTypes = ['.csv', '.pdf'],
  maxSizeMB = 10,
  onUploadComplete,
  onUploadError,
  className = ''
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): string | null => {
    // Check file type
    const fileType = file.name.split('.').pop()?.toLowerCase();
    const accepted = acceptedTypes.map(t => t.replace('.', ''));
    
    if (!fileType || !accepted.includes(fileType)) {
      return `File type not supported. Please upload ${acceptedTypes.join(' or ')} files.`;
    }

    // Check file size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `File too large. Maximum size is ${maxSizeMB}MB.`;
    }

    return null;
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setError(null);
    setUploadResult(null);

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      if (onUploadError) onUploadError(validationError);
      return;
    }

    setUploadedFile(file);
    setUploading(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('feature', feature);

      // Get API URL from environment
      const getEnvVar = (key: string) => {
        if (import.meta.env[key]) return import.meta.env[key];
        if (typeof window !== 'undefined' && (window as any).__ENV__?.[key]) {
          return (window as any).__ENV__[key];
        }
        return undefined;
      };

      const apiUrl = getEnvVar('VITE_API_URL') || getEnvVar('VITE_API_BASE_URL') || 'http://localhost:5000/api';

      // Upload to backend
      const response = await fetch(`${apiUrl}/ai/upload-and-analyze`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      
      setUploadResult(result);
      if (onUploadComplete) onUploadComplete(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      if (onUploadError) onUploadError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setUploadResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'csv') return <FileSpreadsheet className="w-8 h-8 text-success-500" />;
    if (ext === 'pdf') return <FileText className="w-8 h-8 text-error" />;
    return <File className="w-8 h-8 text-neutral-500" />;
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      {!uploadedFile && (
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-neutral-300 hover:border-primary-400 hover:bg-neutral-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={acceptedTypes.join(',')}
            onChange={handleChange}
          />

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-primary-500" />
            </div>

            <p className="text-lg font-medium text-neutral-900 mb-2">
              Drop your file here or click to browse
            </p>
            <p className="text-sm text-neutral-600 mb-4">
              Supports {acceptedTypes.join(', ')} files up to {maxSizeMB}MB
            </p>

            <button
              onClick={onButtonClick}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              Select File
            </button>

            <p className="text-xs text-neutral-500 mt-4">
              AI-powered analysis will extract insights automatically
            </p>
          </div>
        </div>
      )}

      {/* Uploading State */}
      {uploading && (
        <div className="border-2 border-primary-500 rounded-xl p-8 bg-primary-50">
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
            <p className="text-lg font-medium text-neutral-900 mb-2">Analyzing your file...</p>
            <p className="text-sm text-neutral-600">
              AI is extracting insights and identifying cost-saving opportunities
            </p>
          </div>
        </div>
      )}

      {/* Upload Success */}
      {uploadedFile && !uploading && !error && (
        <div className="border-2 border-success-500 rounded-xl p-6 bg-success-50">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {getFileIcon(uploadedFile.name)}
              <div>
                <p className="font-medium text-neutral-900">{uploadedFile.name}</p>
                <p className="text-sm text-neutral-600">
                  {(uploadedFile.size / 1024).toFixed(2)} KB • Uploaded successfully
                </p>
              </div>
            </div>
            <button
              onClick={resetUpload}
              className="p-2 hover:bg-success-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-neutral-600" />
            </button>
          </div>

          {/* Analysis Results */}
          {uploadResult && (
            <div className="mt-4 pt-4 border-t border-success-200">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-success-600" />
                <h3 className="font-bold text-neutral-900">AI Analysis Complete</h3>
              </div>

              {uploadResult.analysis && (
                <div className="bg-white rounded-lg p-4 mb-3">
                  <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                    {typeof uploadResult.analysis === 'string' 
                      ? uploadResult.analysis 
                      : JSON.stringify(uploadResult.analysis, null, 2)}
                  </p>
                </div>
              )}

              {uploadResult.recordCount && (
                <p className="text-sm text-neutral-600">
                  <strong>{uploadResult.recordCount}</strong> records processed
                </p>
              )}

              {uploadResult.estimatedSavings && (
                <p className="text-sm font-medium text-success-700 mt-2">
                  💰 Potential Savings: {uploadResult.estimatedSavings}
                </p>
              )}

              <button
                onClick={resetUpload}
                className="mt-4 w-full py-2 bg-white border border-success-300 text-success-700 rounded-lg hover:bg-success-100 transition-colors font-medium"
              >
                Upload Another File
              </button>
            </div>
          )}
        </div>
      )}

      {/* Upload Error */}
      {error && (
        <div className="border-2 border-error rounded-xl p-6 bg-error/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-error flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-neutral-900 mb-2">Upload Failed</p>
              <p className="text-sm text-neutral-700">{error}</p>
              <button
                onClick={resetUpload}
                className="mt-4 px-4 py-2 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

