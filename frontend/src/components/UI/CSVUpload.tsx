import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, FileText, CheckCircle, AlertCircle, X, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface CSVTemplate {
  type: string;
  headers: string[];
  required: string[];
  optional: string[];
  sampleData: any[];
}

interface ValidationResult {
  valid: boolean;
  totalRecords: number;
  validRecords: number;
  errors: Array<{
    row: number;
    errors: string[];
  }>;
  errorCount: number;
}

interface UploadResult {
  success: boolean;
  message: string;
  processedRecords: number;
  totalRecords: number;
}

const CSVUpload: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('inventory');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [template, setTemplate] = useState<CSVTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const csvTypes = [
    { value: 'inventory', label: 'Inventory Data', description: 'Upload inventory items, stock levels, and supplier information' },
    { value: 'sales', label: 'Sales Data', description: 'Upload sales transactions and revenue data' },
    { value: 'waste', label: 'Waste Tracking', description: 'Upload waste generation and cost data' },
    { value: 'supplier', label: 'Supplier Data', description: 'Upload supplier contact and performance information' }
  ];

  // Fetch template when type changes
  useEffect(() => {
    fetchTemplate(selectedType);
  }, [selectedType]);

  const fetchTemplate = async (type: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/csv/templates/${type}`);
      if (response.ok) {
        const templateData = await response.json();
        setTemplate(templateData);
      } else {
        toast.error('Failed to fetch template');
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      toast.error('Failed to fetch template');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setValidationResult(null);
        setUploadResult(null);
      } else {
        toast.error('Please select a CSV file');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setValidationResult(null);
        setUploadResult(null);
      } else {
        toast.error('Please select a CSV file');
      }
    }
  };

  const validateFile = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setIsValidating(true);
    const formData = new FormData();
    formData.append('csvFile', selectedFile);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/csv/validate/${selectedType}`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const result = await response.json();

      if (response.ok) {
        setValidationResult(result);
        if (result.valid) {
          toast.success(`Validation successful! ${result.validRecords} valid records found.`);
        } else {
          toast.error(`Validation failed! ${result.errorCount} errors found.`);
        }
      } else {
        toast.error(result.error || 'Validation failed');
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Failed to validate file');
    } finally {
      setIsValidating(false);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('csvFile', selectedFile);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/csv/upload/${selectedType}`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const result = await response.json();

      if (response.ok) {
        setUploadResult(result);
        toast.success(result.message);
        setSelectedFile(null);
        setValidationResult(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast.error(result.error || 'Upload failed');
        if (result.details) {
          console.error('Upload errors:', result.details);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    if (!template) return;

    const headers = template.headers;
    const sampleData = template.sampleData;
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    if (sampleData.length > 0) {
      sampleData.forEach(row => {
        const values = headers.map(header => {
          const value = row[header] || '';
          // Escape commas and quotes
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        });
        csvContent += values.join(',') + '\n';
      });
    }

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedType}_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Template downloaded successfully');
  };

  const previewFile = async () => {
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1, 6).filter(line => line.trim()).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });
      setPreviewData(data);
      setShowPreview(true);
    };
    reader.readAsText(selectedFile);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setValidationResult(null);
    setUploadResult(null);
    setShowPreview(false);
    setPreviewData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold text-text-primary mb-6">CSV Data Upload</h2>
        
        {/* CSV Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Select Data Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {csvTypes.map((type) => (
              <div
                key={type.value}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedType === type.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedType(type.value)}
              >
                <h3 className="font-semibold text-text-primary">{type.label}</h3>
                <p className="text-sm text-text-secondary mt-1">{type.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Template Download */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Download Template
              </h3>
              <p className="text-sm text-text-secondary">
                Download a template with the correct format and sample data
              </p>
            </div>
            <button
              onClick={downloadTemplate}
              disabled={!template}
              className="glass-button-secondary flex items-center gap-2"
            >
              <Download size={16} />
              Download Template
            </button>
          </div>
        </div>

        {/* File Upload Area */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Upload CSV File
          </label>
          <div
            ref={dropRef}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              dragActive
                ? 'border-primary bg-primary/5'
                : selectedFile
                ? 'border-success bg-success/5'
                : 'border-border hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-success">
                  <CheckCircle size={24} />
                  <span className="font-medium">{selectedFile.name}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-text-secondary">
                  <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={previewFile}
                    className="glass-button-secondary flex items-center gap-2"
                  >
                    {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                    {showPreview ? 'Hide Preview' : 'Preview'}
                  </button>
                  <button
                    onClick={clearFile}
                    className="glass-button-secondary flex items-center gap-2"
                  >
                    <X size={16} />
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload size={48} className="mx-auto text-text-secondary" />
                <div>
                  <p className="text-lg font-medium text-text-primary">
                    Drop your CSV file here
                  </p>
                  <p className="text-text-secondary">or</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="glass-button mt-2"
                  >
                    Browse Files
                  </button>
                </div>
                <p className="text-sm text-text-secondary">
                  Maximum file size: 10MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* File Preview */}
        {showPreview && previewData.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text-primary mb-3">File Preview</h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-border rounded-lg">
                <thead>
                  <tr className="bg-background">
                    {Object.keys(previewData[0] || {}).map((header) => (
                      <th key={header} className="px-4 py-2 text-left text-sm font-medium text-text-primary border-b border-border">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, index) => (
                    <tr key={index} className="hover:bg-background/50">
                      {Object.values(row).map((value, cellIndex) => (
                        <td key={cellIndex} className="px-4 py-2 text-sm text-text-secondary border-b border-border">
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Validation Results */}
        {validationResult && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text-primary mb-3">Validation Results</h3>
            <div className={`p-4 rounded-lg ${
              validationResult.valid 
                ? 'bg-success/10 border border-success/20' 
                : 'bg-error/10 border border-error/20'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {validationResult.valid ? (
                  <CheckCircle size={20} className="text-success" />
                ) : (
                  <AlertCircle size={20} className="text-error" />
                )}
                <span className={`font-medium ${
                  validationResult.valid ? 'text-success' : 'text-error'
                }`}>
                  {validationResult.valid ? 'Validation Passed' : 'Validation Failed'}
                </span>
              </div>
              <p className="text-sm text-text-secondary mb-2">
                {validationResult.validRecords} of {validationResult.totalRecords} records are valid
              </p>
              {validationResult.errorCount > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-error mb-2">
                    Errors found ({validationResult.errorCount}):
                  </p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {validationResult.errors.map((error, index) => (
                      <div key={index} className="text-xs text-error bg-error/10 p-2 rounded">
                        <strong>Row {error.row}:</strong> {error.errors.join(', ')}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload Results */}
        {uploadResult && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text-primary mb-3">Upload Results</h3>
            <div className="bg-success/10 border border-success/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={20} className="text-success" />
                <span className="font-medium text-success">Upload Successful</span>
              </div>
              <p className="text-sm text-text-secondary">
                {uploadResult.message} - {uploadResult.processedRecords} records processed
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {selectedFile && (
          <div className="flex items-center gap-4">
            <button
              onClick={validateFile}
              disabled={isValidating}
              className="glass-button-secondary flex items-center gap-2"
            >
              {isValidating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              ) : (
                <FileText size={16} />
              )}
              {isValidating ? 'Validating...' : 'Validate File'}
            </button>
            
            <button
              onClick={uploadFile}
              disabled={isUploading || (validationResult && !validationResult.valid)}
              className="glass-button flex items-center gap-2"
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Upload size={16} />
              )}
              {isUploading ? 'Uploading...' : 'Upload File'}
            </button>
          </div>
        )}

        {/* Template Information */}
        {template && (
          <div className="mt-8 p-4 bg-background/50 rounded-lg">
            <h3 className="text-lg font-semibold text-text-primary mb-3">Template Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-text-primary mb-2">Required Fields</h4>
                <ul className="space-y-1">
                  {template.required.map((field) => (
                    <li key={field} className="text-sm text-text-secondary flex items-center gap-2">
                      <span className="w-2 h-2 bg-error rounded-full"></span>
                      {field}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-text-primary mb-2">Optional Fields</h4>
                <ul className="space-y-1">
                  {template.optional.map((field) => (
                    <li key={field} className="text-sm text-text-secondary flex items-center gap-2">
                      <span className="w-2 h-2 bg-warning rounded-full"></span>
                      {field}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CSVUpload;
