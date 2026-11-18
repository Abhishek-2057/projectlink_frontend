import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Avatar } from '../../components/ui/Avatar';
import { AiResumeParserModal } from '../../components/student/AiResumeParserModal';
import { toast } from 'sonner';
import { Save, ArrowLeft, Upload, FileText, CheckCircle2, Sparkles } from 'lucide-react';

export function EditStudentProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser, updateProfile } = useAuthStore();

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('');
  const [graduationYear, setGraduationYear] = useState('2026');
  const [cgpa, setCgpa] = useState('');
  const [bio, setBio] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [existingResumeUrl, setExistingResumeUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setUploadingAvatar(true);
    try {
      const res = await api.post('/students/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setAvatar(res.data.avatarUrl);
        updateUser({ avatar: res.data.avatarUrl });
        toast.success('Photo uploaded and stored in MongoDB!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error uploading photo');
    } finally {
      setUploadingAvatar(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/students/me');
        if (res.data.success) {
          const p = res.data.data;
          setName(p.user?.name || user?.name || '');
          setAvatar(p.user?.avatar || user?.avatar || '');
          setCollege(p.college || '');
          setDegree(p.degree || '');
          setGraduationYear(String(p.graduationYear || ''));
          setCgpa(p.cgpa ? String(p.cgpa) : '');
          setBio(p.bio || '');
          setSkillsText(p.skills ? p.skills.join(', ') : '');
          setGithubUrl(p.githubUrl || '');
          setLinkedinUrl(p.linkedinUrl || '');
          setPortfolioUrl(p.portfolioUrl || '');
          setExistingResumeUrl(p.resumeUrl || '');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const skills = skillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      // 1. Update Profile info
      const res = await api.put('/students/me', {
        name,
        avatar,
        college,
        degree,
        graduationYear: Number(graduationYear),
        cgpa: Number(cgpa),
        bio,
        skills,
        githubUrl,
        linkedinUrl,
        portfolioUrl,
      });

      if (res.data.success) {
        updateUser({ name, avatar });

        // 2. Upload resume if selected
        if (resumeFile) {
          const formData = new FormData();
          formData.append('resume', resumeFile);
          await api.post('/students/me/resume', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 60000,
          });
        }

        toast.success('Profile updated successfully!');
        navigate('/student/profile');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAiAutoFillSuccess = (p: any, u: any) => {
    if (u?.name) setName(u.name);
    if (p?.college) setCollege(p.college);
    if (p?.degree) setDegree(p.degree);
    if (p?.graduationYear) setGraduationYear(String(p.graduationYear));
    if (p?.cgpa) setCgpa(String(p.cgpa));
    if (p?.bio) setBio(p.bio);
    if (p?.skills && Array.isArray(p.skills)) setSkillsText(p.skills.join(', '));
    if (p?.githubUrl) setGithubUrl(p.githubUrl);
    if (p?.linkedinUrl) setLinkedinUrl(p.linkedinUrl);
    if (p?.portfolioUrl) setPortfolioUrl(p.portfolioUrl);
    if (p?.resumeUrl) setExistingResumeUrl(p.resumeUrl);
  };

  if (loading) {
    return <div className="py-12 text-center text-sm text-slate-500">Loading editor...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={() => navigate('/student/profile')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Profile
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Edit Professional Profile</h1>
        </div>
      </div>

      {/* Resume Quick Auto-Fill Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 p-5 rounded-xl border border-emerald-900/40 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
            <Sparkles className="h-3 w-3 text-emerald-400" /> Resume Auto-Fill
          </div>
          <h3 className="text-sm font-bold text-white">
            Have an updated resume? Auto-fill all fields in one click.
          </h3>
          <p className="text-[11px] text-slate-300">
            Automatically extract your coursework, CGPA, skills, links, and projects directly into your profile.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setIsAiModalOpen(true)}
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 px-4 shrink-0 shadow-sm"
        >
          <Upload className="mr-1.5 h-3.5 w-3.5" /> Import from Resume
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Personal Details */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-700">Profile Photo</label>
              <div className="flex items-center gap-3">
                <Avatar src={avatar} alt={name} size="md" />
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                  <Upload className="h-3.5 w-3.5 text-slate-500" />
                  {uploadingAvatar ? 'Saving to MongoDB...' : 'Upload Image'}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleAvatarFileSelect}
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>
            </div>
          </div>

          <Textarea
            label="Professional Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Introduce your engineering interests and final-year aspirations..."
          />
        </div>

        {/* Academic Details */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            Academic Information
          </h2>

          <Input
            label="College / Institute Name *"
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Degree / Major *"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              required
            />
            <Input
              label="Graduation Year *"
              type="number"
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              required
            />
            <Input
              label="Current CGPA *"
              type="number"
              step="0.01"
              value={cgpa}
              onChange={(e) => setCgpa(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Technical Skills */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            Technical Stack & Skills
          </h2>

          <Input
            label="Skills (Comma-separated) *"
            placeholder="e.g. React, Node.js, Python, Docker, Kubernetes, PostgreSQL"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            required
          />
          <p className="text-[11px] text-slate-500">
            These skills are used to automatically match you and your team with incoming industry projects.
          </p>
        </div>

        {/* Social & Portfolio Links */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            Social & Portfolio Links
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="GitHub Profile URL"
              placeholder="https://github.com/..."
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
            />
            <Input
              label="LinkedIn URL"
              placeholder="https://linkedin.com/in/..."
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
            />
            <Input
              label="Personal Website"
              placeholder="https://yourname.dev"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
            />
          </div>
        </div>

        {/* Resume Upload */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            Resume / Curriculum Vitae
          </h2>

          {existingResumeUrl && (
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-emerald-900 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Active Resume on File
              </span>
              <a href={existingResumeUrl} target="_blank" rel="noreferrer" className="text-emerald-700 underline font-bold">
                View PDF
              </a>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Upload New Resume (PDF / DOCX)
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setResumeFile(e.target.files[0]);
                }
              }}
              className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/student/profile')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            className="font-bold bg-slate-900 text-white hover:bg-slate-800"
            isLoading={saving}
          >
            <Save className="mr-1.5 h-4 w-4" /> Save Changes
          </Button>
        </div>
      </form>

      {/* AI Resume Parser Dialog */}
      <AiResumeParserModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onSuccess={handleAiAutoFillSuccess}
      />
    </div>
  );
}
