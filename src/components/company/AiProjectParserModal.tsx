import React, { useState, useRef } from 'react';
import { api } from '../../lib/api';
import { Button } from '../ui/Button';
import { toast } from 'sonner';
import { IParsedProjectBrief } from '../../types';
import {
  FileText,
  Upload,
  Loader2,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileUp,
  BrainCircuit,
} from 'lucide-react';

interface AiProjectParserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: IParsedProjectBrief, fileName: string) => void;
}

export function AiProjectParserModal({ isOpen, onClose, onSuccess }: AiProjectParserModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

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
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcess(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcess(file);
    }
  };

  const validateAndProcess = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'doc', 'txt'].includes(ext || '')) {
      toast.error('Please upload a valid PDF, Word (.docx), or Text document');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds the 10MB limit');
      return;
    }
    setSelectedFile(file);
    uploadAndAnalyze(file);
  };

  const uploadAndAnalyze = async (file: File) => {
    setIsUploading(true);

    const formData = new FormData();
    formData.append('document', file);

    try {
      const res = await api.post('/projects/parse-ai', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });

      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to analyze project document');
      }

      const parsedData: IParsedProjectBrief = res.data.data;
      toast.success(
        res.data.usedAI
          ? 'Project brief parsed with Gemini AI! Review and edit fields below.'
          : 'Project brief text analyzed successfully! Review and edit fields below.'
      );

      onSuccess(parsedData, file.name);
      onClose();
    } catch (err: any) {
      console.error('Project document parsing error:', err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          'Failed to read and parse the project document. Please try again or paste details directly.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-all">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shrink-0">
              <Sparkles className="h-5 w-5 text-emerald-600 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200/60 mb-0.5">
                <BrainCircuit className="h-3 w-3 text-emerald-600" /> Powered by Gemini AI
              </div>
              <h2 className="text-base font-bold text-slate-900">Auto-Fill from Project Brief</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Upload your company&apos;s project specification document, PRD, or RFP (PDF or Word). Gemini AI will read it and automatically map its scope, problem statement, required skills, deliverables, and duration into the form fields.
          </p>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50/50'
            } ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                {isUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                ) : (
                  <FileUp className="h-6 w-6" />
                )}
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800">
                  {isUploading
                    ? 'Gemini AI is analyzing document...'
                    : selectedFile
                    ? selectedFile.name
                    : 'Click to select or drag and drop your document'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Supported formats: PDF, Word (.docx, .doc), or Text • Up to 10MB
                </p>
              </div>

              {selectedFile && !isUploading && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                  <FileText className="h-3.5 w-3.5 text-slate-500" />
                  <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                </div>
              )}
            </div>
          </div>

          {/* Loading status steps */}
          {isUploading && (
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 space-y-2 text-xs text-emerald-900">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                <span>Reading document specifications...</span>
              </div>
              <ul className="space-y-1 text-[11px] text-emerald-700/90 pl-5 list-disc">
                <li>Extracting problem statement & architecture specification</li>
                <li>Deriving technical skills and toolchain requirements</li>
                <li>Generating key objectives, expected deliverables & team capacity</li>
              </ul>
            </div>
          )}

          {/* Features note */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5 flex items-start gap-2.5 text-xs text-slate-600">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>100% Editable:</strong> After AI fills the form, you can freely review, edit, or customize any of the fields before publishing the project to the marketplace.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/40 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Browse File
          </Button>
        </div>
      </div>
    </div>
  );
}
