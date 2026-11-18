import React, { useState, useRef } from 'react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import { toast } from 'sonner';
import {
  FileText,
  Upload,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  FileUp,
} from 'lucide-react';

interface AiResumeParserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (profile: any, user: any) => void;
}

export function AiResumeParserModal({ isOpen, onClose, onSuccess }: AiResumeParserModalProps) {
  const { updateUser, updateProfile } = useAuthStore();
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
    if (!['pdf', 'docx', 'doc'].includes(ext || '')) {
      toast.error('Please upload a valid PDF or Word document (.pdf, .docx)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }
    setSelectedFile(file);
    uploadAndImport(file);
  };

  const uploadAndImport = async (file: File) => {
    setIsUploading(true);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      // 1. Parse resume text and extract sections (giving 60s for AI to process)
      const parseRes = await api.post('/students/resume/parse-ai', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });

      if (!parseRes.data.success) {
        throw new Error(parseRes.data.message || 'Failed to parse resume');
      }

      const parsedData = parseRes.data.data;

      // 2. Automatically save structured sections directly to database
      const applyRes = await api.post('/students/resume/apply-parsed', parsedData, {
        timeout: 30000,
      });

      if (applyRes.data.success) {
        const savedProfile = applyRes.data.profile || applyRes.data.data;
        const savedUser = applyRes.data.user;

        if (savedUser) updateUser(savedUser);
        if (savedProfile) updateProfile(savedProfile);

        toast.success('Resume imported and profile updated successfully!');
        if (onSuccess) {
          onSuccess(savedProfile, savedUser);
        }
        onClose();
      } else {
        throw new Error(applyRes.data.message || 'Error saving profile to database');
      }
    } catch (err: any) {
      console.error('Resume import error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to import resume. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-all">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100/80 border border-emerald-200/60 flex items-center justify-center text-emerald-700">
              <FileUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Import Resume</h2>
              <p className="text-xs text-slate-500">Auto-fill your profile sections directly from your resume</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {isUploading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
                <FileText className="h-6 w-6 text-emerald-600 absolute inset-0 m-auto" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Analyzing Resume...</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Extracting your education, work experience, projects, skills, and accomplishments directly into your profile.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Dropzone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-emerald-600 bg-emerald-50/50 scale-[0.99]'
                    : 'border-slate-200 hover:border-emerald-500 hover:bg-slate-50/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80 shadow-2xs">
                    <Upload className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">
                      Click to upload or drag & drop your resume
                    </p>
                    <p className="text-xs text-slate-400">
                      Supports PDF and Word Documents (.pdf, .docx) up to 10MB
                    </p>
                  </div>
                </div>
              </div>

              {/* What happens next notes */}
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-2">
                <p className="text-xs font-bold text-slate-700">How auto-fill works:</p>
                <ul className="text-xs text-slate-500 space-y-1.5 list-disc list-inside">
                  <li>Extracts and accurately maps education, projects, skills, and internships.</li>
                  <li>Sections not found in your resume are left empty for you to add manually.</li>
                  <li>You can review, edit, or delete any section directly on your profile.</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isUploading}
            className="text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white"
          >
            Select Resume File
          </Button>
        </div>
      </div>
    </div>
  );
}
