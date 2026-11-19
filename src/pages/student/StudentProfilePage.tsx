import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import {
  IStudentProfile,
  IEducationItem,
  IWorkExperienceItem,
  ITrainingCourseItem,
  IProjectItem,
  IPortfolioItem,
} from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { AiResumeParserModal } from '../../components/student/AiResumeParserModal';
import { PortfolioSocialMediaLinks, PLATFORMS } from '../../components/student/PortfolioSocialMediaLinks';
import { toast } from 'sonner';
import {
  FileText,
  Pencil,
  Trash2,
  Plus,
  ExternalLink,
  Award,
  Calendar,
  Upload,
  FileUp,
  X,
  Check,
  Camera,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Sparkles,
  Globe,
  Copy,
} from 'lucide-react';

function renderPointwise(text?: string) {
  if (!text) return null;
  const raw = text.trim();
  if (!raw) return null;

  // Split lines: by newline, or bullet characters (\n, •, -, *)
  let lines: string[] = [];
  if (raw.includes('\n')) {
    lines = raw
      .split(/\r?\n/)
      .map((l) => l.replace(/^[•\-\*\s]+/, '').trim())
      .filter(Boolean);
  } else if (raw.includes('•')) {
    lines = raw
      .split('•')
      .map((l) => l.trim())
      .filter(Boolean);
  } else {
    // Split sentences ending in a period followed by space and capital letter or numbers
    const sentenceSplit = raw
      .split(/(?<=\.)\s+(?=[A-Z0-9•\-])/g)
      .map((s) => s.replace(/^[•\-\*\s]+/, '').trim())
      .filter(Boolean);
    if (sentenceSplit.length > 1) {
      lines = sentenceSplit;
    } else {
      lines = [raw];
    }
  }

  return (
    <ul className="space-y-1.5 pt-1.5 list-disc list-outside pl-4.5 text-xs text-slate-600 leading-relaxed marker:text-slate-400">
      {lines.map((line, idx) => (
        <li key={idx} className="pl-0.5">
          {line}
        </li>
      ))}
    </ul>
  );
}

export function StudentProfilePage() {
  const { user, updateUser, updateProfile } = useAuthStore();
  const [profile, setProfile] = useState<IStudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Active section modal states
  const [activeModal, setActiveModal] = useState<
    | null
    | 'header'
    | 'career_objective'
    | 'education'
    | 'work_experience'
    | 'extra_curricular'
    | 'training_course'
    | 'project'
    | 'skill'
    | 'portfolio'
    | 'accomplishment'
  >(null);

  // Editing item reference (null for new item)
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form states for modals
  const [headerForm, setHeaderForm] = useState<{
    name: string;
    degree: string;
    college: string;
    cgpa: string;
    graduationYear: string;
    availability: 'immediate' | 'part_time' | 'full_time' | 'not_available';
    phone: string;
  }>({
    name: '',
    degree: '',
    college: '',
    cgpa: '',
    graduationYear: '',
    availability: 'immediate',
    phone: '',
  });

  const [careerObjectiveText, setCareerObjectiveText] = useState('');

  const [educationForm, setEducationForm] = useState<IEducationItem>({
    degree: '',
    college: '',
    duration: '',
    cgpa: '',
  });

  const [workForm, setWorkForm] = useState<IWorkExperienceItem>({
    role: '',
    company: '',
    duration: '',
    description: '',
    type: 'job',
  });

  const [extraCurricularText, setExtraCurricularText] = useState('');

  const [trainingForm, setTrainingForm] = useState<ITrainingCourseItem>({
    title: '',
    organization: '',
    year: '',
    certificateUrl: '',
    link: '',
  });

  const [projectForm, setProjectForm] = useState<{
    title: string;
    description: string;
    technologies: string;
    link?: string;
    githubUrl?: string;
  }>({
    title: '',
    description: '',
    technologies: '',
    link: '',
    githubUrl: '',
  });

  const [skillInput, setSkillInput] = useState('');

  const [portfolioForm, setPortfolioForm] = useState<IPortfolioItem>({
    name: '',
    url: '',
  });

  const [accomplishmentText, setAccomplishmentText] = useState('');

  // Fetch student profile on mount
  const loadProfile = async () => {
    try {
      const res = await api.get('/students/me');
      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching student profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Sync profile update helper to MongoDB
  const saveProfileData = async (patch: Partial<IStudentProfile>, successMsg: string) => {
    try {
      const res = await api.put('/students/me', patch);
      if (res.data.success) {
        setProfile(res.data.data);
        updateProfile(res.data.data);
        toast.success(successMsg);
        setActiveModal(null);
        setEditingIndex(null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error updating profile');
    }
  };

  // Avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        updateUser({ avatar: res.data.avatarUrl });
        toast.success('Profile picture updated successfully!');
        loadProfile();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // 1. Header Save
  const handleSaveHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (headerForm.name && headerForm.name !== user?.name) {
      updateUser({ name: headerForm.name });
    }
    await saveProfileData(
      {
        college: headerForm.college,
        degree: headerForm.degree,
        cgpa: headerForm.cgpa ? Number(headerForm.cgpa) : undefined,
        graduationYear: headerForm.graduationYear ? Number(headerForm.graduationYear) : undefined,
        availability: headerForm.availability,
        phone: headerForm.phone,
      },
      'Profile header updated successfully!'
    );
  };

  // 2. Career Objective Save & Delete
  const handleSaveCareerObjective = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProfileData(
      { careerObjective: careerObjectiveText.trim() || undefined },
      'Career objective updated!'
    );
  };

  const handleDeleteCareerObjective = async () => {
    if (!window.confirm('Are you sure you want to delete your career objective?')) return;
    await saveProfileData({ careerObjective: undefined }, 'Career objective removed');
  };

  // 3. Education Save & Delete
  const handleSaveEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentList = [...(profile?.educationList || [])];
    if (editingIndex !== null) {
      currentList[editingIndex] = educationForm;
    } else {
      currentList.push({ ...educationForm, id: Date.now().toString() });
    }
    await saveProfileData(
      {
        educationList: currentList,
        degree: currentList[0]?.degree || profile?.degree,
        college: currentList[0]?.college || profile?.college,
      },
      'Education saved successfully!'
    );
  };

  const handleDeleteEducation = async (idx: number) => {
    if (!window.confirm('Delete this education entry?')) return;
    const currentList = (profile?.educationList || []).filter((_, i) => i !== idx);
    await saveProfileData({ educationList: currentList }, 'Education entry deleted');
  };

  // 4. Work Experience Save & Delete
  const handleSaveWorkExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentList = [...(profile?.workExperienceList || [])];
    if (editingIndex !== null) {
      currentList[editingIndex] = workForm;
    } else {
      currentList.push({ ...workForm, id: Date.now().toString() });
    }
    await saveProfileData({ workExperienceList: currentList }, 'Work experience saved successfully!');
  };

  const handleDeleteWorkExperience = async (idx: number) => {
    if (!window.confirm('Delete this work experience entry?')) return;
    const currentList = (profile?.workExperienceList || []).filter((_, i) => i !== idx);
    await saveProfileData({ workExperienceList: currentList }, 'Work experience entry deleted');
  };

  // 5. Extra Curricular Save & Delete
  const handleSaveExtraCurricular = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extraCurricularText.trim()) return;
    const currentList = [...(profile?.extraCurricular || [])];
    if (editingIndex !== null) {
      currentList[editingIndex] = extraCurricularText.trim();
    } else {
      currentList.push(extraCurricularText.trim());
    }
    await saveProfileData({ extraCurricular: currentList }, 'Extra curricular activity saved!');
  };

  const handleDeleteExtraCurricular = async (idx: number) => {
    if (!window.confirm('Delete this activity?')) return;
    const currentList = (profile?.extraCurricular || []).filter((_, i) => i !== idx);
    await saveProfileData({ extraCurricular: currentList }, 'Activity removed');
  };

  // 6. Trainings / Courses Save & Delete
  const handleSaveTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentList = [...(profile?.trainingsCourses || [])];
    const itemToSave: ITrainingCourseItem = {
      ...trainingForm,
      certificateUrl: trainingForm.certificateUrl ? trainingForm.certificateUrl.trim() : undefined,
      link: trainingForm.certificateUrl ? trainingForm.certificateUrl.trim() : trainingForm.link,
    };
    if (editingIndex !== null) {
      currentList[editingIndex] = itemToSave;
    } else {
      currentList.push({ ...itemToSave, id: Date.now().toString() });
    }
    await saveProfileData({ trainingsCourses: currentList }, 'Training / Course saved successfully!');
  };

  const handleDeleteTraining = async (idx: number) => {
    if (!window.confirm('Delete this course entry?')) return;
    const currentList = (profile?.trainingsCourses || []).filter((_, i) => i !== idx);
    await saveProfileData({ trainingsCourses: currentList }, 'Course entry removed');
  };

  // 7. Projects Save & Delete
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const techArray = projectForm.technologies
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const projectItem: IProjectItem = {
      title: projectForm.title,
      description: projectForm.description,
      technologies: techArray,
      link: projectForm.link ? projectForm.link.trim() : undefined,
      githubUrl: projectForm.githubUrl ? projectForm.githubUrl.trim() : undefined,
    };

    const currentList = [...(profile?.projectList || [])];
    if (editingIndex !== null) {
      currentList[editingIndex] = projectItem;
    } else {
      currentList.push({ ...projectItem, id: Date.now().toString() });
    }

    await saveProfileData({ projectList: currentList }, 'Project saved successfully!');
  };

  const handleDeleteProject = async (idx: number) => {
    if (!window.confirm('Delete this project?')) return;
    const currentList = (profile?.projectList || []).filter((_, i) => i !== idx);
    await saveProfileData({ projectList: currentList }, 'Project entry removed');
  };

  // 8. Skills Add & Remove
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    const skill = skillInput.trim();
    if (!skill) return;
    const current = profile?.skills || [];
    if (current.includes(skill)) {
      toast.error('Skill already added');
      return;
    }
    const updated = [...current, skill];
    await saveProfileData({ skills: updated }, `Added ${skill}!`);
    setSkillInput('');
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    const updated = (profile?.skills || []).filter((s) => s !== skillToRemove);
    await saveProfileData({ skills: updated }, `Removed ${skillToRemove}`);
  };

  // 9. Portfolio Save & Delete
  const handleSavePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentList = [...(profile?.portfolioList || [])];
    if (editingIndex !== null) {
      currentList[editingIndex] = portfolioForm;
    } else {
      currentList.push({ ...portfolioForm, id: Date.now().toString() });
    }
    await saveProfileData({ portfolioList: currentList }, 'Portfolio link saved!');
  };

  const handleDeletePortfolio = async (idx: number) => {
    if (!window.confirm('Delete this portfolio link?')) return;
    const currentList = (profile?.portfolioList || []).filter((_, i) => i !== idx);
    await saveProfileData({ portfolioList: currentList }, 'Portfolio link removed');
  };

  // Social Links Interactive Bar Save & Delete (Images 2, 3, 4, 5)
  const handleSaveSocialLink = async (platformId: string, url: string) => {
    const platform = PLATFORMS.find((p) => p.id === platformId);
    const platformName = platform?.name || 'Custom Link';

    const currentList = [...(profile?.portfolioList || [])];
    const existingIndex = currentList.findIndex(
      (p) =>
        p.name.toLowerCase() === platformName.toLowerCase() ||
        p.name.toLowerCase().includes(platformId) ||
        p.url.toLowerCase().includes(platformId)
    );

    if (existingIndex !== -1) {
      currentList[existingIndex] = {
        ...currentList[existingIndex],
        url,
        name: platformName,
      };
    } else {
      currentList.push({
        id: Date.now().toString(),
        name: platformName,
        url,
      });
    }

    const patch: Partial<IStudentProfile> = {
      portfolioList: currentList,
    };
    if (platformId === 'linkedin') patch.linkedinUrl = url;
    if (platformId === 'github') patch.githubUrl = url;
    if (platformId === 'custom') patch.portfolioUrl = url;

    await saveProfileData(patch, `${platformName} link saved!`);
  };

  const handleDeleteSocialLink = async (platformId: string) => {
    const platform = PLATFORMS.find((p) => p.id === platformId);
    const platformName = platform?.name || 'Link';

    const currentList = (profile?.portfolioList || []).filter(
      (p) =>
        !(
          p.name.toLowerCase() === platformName.toLowerCase() ||
          p.name.toLowerCase().includes(platformId) ||
          p.url.toLowerCase().includes(platformId)
        )
    );

    const patch: Partial<IStudentProfile> = {
      portfolioList: currentList,
    };
    if (platformId === 'linkedin') patch.linkedinUrl = '';
    if (platformId === 'github') patch.githubUrl = '';
    if (platformId === 'custom') patch.portfolioUrl = '';

    await saveProfileData(patch, `${platformName} link removed`);
  };

  // 10. Accomplishments Save & Delete
  const handleSaveAccomplishment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accomplishmentText.trim()) return;
    const currentList = [...(profile?.accomplishments || [])];
    if (editingIndex !== null) {
      currentList[editingIndex] = accomplishmentText.trim();
    } else {
      currentList.push(accomplishmentText.trim());
    }
    await saveProfileData({ accomplishments: currentList }, 'Accomplishment saved!');
  };

  const handleDeleteAccomplishment = async (idx: number) => {
    if (!window.confirm('Delete this accomplishment?')) return;
    const currentList = (profile?.accomplishments || []).filter((_, i) => i !== idx);
    await saveProfileData({ accomplishments: currentList }, 'Accomplishment removed');
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 text-sm">
        Loading profile details...
      </div>
    );
  }

  // Derive display values
  const studentName = user?.name || 'Student Candidate';
  const degree = profile?.degree || (profile?.educationList?.[0]?.degree) || 'Enter your Education';
  const college = profile?.college || (profile?.educationList?.[0]?.college) || 'Enter your Course';
  const cgpaDisplay = profile?.cgpa || profile?.educationList?.[0]?.cgpa || '0.0';
  const gradYear = profile?.graduationYear || 'Enter your passing year';

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left pb-16">
      {/* ------------------------------------------------------------- */}
      {/* TOP PROFILE HEADER CARD (IMAGE 0)                             */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar with photo change hover button */}
            <div className="relative group shrink-0">
              <Avatar
                src={user?.avatar}
                alt={studentName}
                size="xl"
                className="h-20 w-20 sm:h-22 sm:w-22 ring-4 ring-slate-50"
              />
              <label className="absolute inset-0 bg-slate-950/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white">
                <Camera className="h-5 w-5" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              </label>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {studentName}
              </h1>
              <p className="text-sm font-semibold text-emerald-700">
                {degree} • {college}
              </p>
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-slate-400" /> CGPA: <strong>{cgpaDisplay}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" /> Class of {gradYear}
                </span>
                <span>•</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  {profile?.availability?.replace('_', ' ') || 'IMMEDIATE'}
                </span>
                {profile?.studentIdNumber && (
                  <>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(profile.studentIdNumber || '');
                        toast.success(`Copied Student ID: ${profile.studentIdNumber}`);
                      }}
                      title="Click to copy your Student ID"
                      className="cursor-pointer inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-300 transition-all"
                    >
                      ID: <strong className="text-emerald-700">{profile.studentIdNumber}</strong>
                      <Copy className="h-2.5 w-2.5 text-slate-400" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsResumeModalOpen(true)}
              className="font-bold border-slate-300 text-slate-800 hover:bg-slate-50 shadow-2xs"
            >
              <FileUp className="mr-1.5 h-4 w-4 text-emerald-700" /> Import Resume
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setHeaderForm({
                  name: user?.name || '',
                  degree: profile?.degree || '',
                  college: profile?.college || '',
                  cgpa: profile?.cgpa ? String(profile.cgpa) : '',
                  graduationYear: profile?.graduationYear ? String(profile.graduationYear) : '',
                  availability: profile?.availability || 'immediate',
                  phone: profile?.phone || '',
                });
                setActiveModal('header');
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-2xs"
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 9 SECTIONS LONG-PAGE CONTAINER (IMAGE 1)                      */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs divide-y divide-slate-100">
        {/* ========================================================= */}
        {/* 1. CAREER OBJECTIVE                                       */}
        {/* ========================================================= */}
        <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-56 shrink-0">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              CAREER OBJECTIVE
            </h2>
          </div>
          <div className="flex-1 space-y-3">
            {profile?.careerObjective ? (
              <div className="group relative rounded-xl border border-slate-200 bg-white p-4.5 shadow-2xs hover:border-slate-300 transition-all">
                <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCareerObjectiveText(profile.careerObjective || '');
                      setActiveModal('career_objective');
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteCareerObjective}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pr-14">
                  {profile.careerObjective}
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setCareerObjectiveText('');
                  setActiveModal('career_objective');
                }}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add your career objective
              </button>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. EDUCATION                                              */}
        {/* ========================================================= */}
        <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-56 shrink-0">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              EDUCATION
            </h2>
          </div>
          <div className="flex-1 space-y-4">
            {profile?.educationList && profile.educationList.length > 0 ? (
              <div className="space-y-3">
                {profile.educationList.map((edu, idx) => (
                  <div
                    key={edu.id || idx}
                    className="group relative rounded-xl border border-slate-200 bg-white p-4.5 shadow-2xs hover:border-slate-300 transition-all space-y-1"
                  >
                    <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEducationForm(edu);
                          setEditingIndex(idx);
                          setActiveModal('education');
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEducation(idx)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 pr-14">{edu.degree}</h3>
                    <p className="text-xs text-slate-600 font-medium">{edu.college}</p>
                    <p className="text-xs text-slate-400 pt-0.5">
                      {edu.duration}
                      {edu.cgpa ? ` • CGPA: ${edu.cgpa}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => {
                setEducationForm({ degree: '', college: '', duration: '', cgpa: '' });
                setEditingIndex(null);
                setActiveModal('education');
              }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add education
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. WORK EXPERIENCE                                        */}
        {/* ========================================================= */}
        <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-56 shrink-0">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              WORK EXPERIENCE
            </h2>
          </div>
          <div className="flex-1 space-y-4">
            {profile?.workExperienceList && profile.workExperienceList.length > 0 ? (
              <div className="space-y-3">
                {profile.workExperienceList.map((work, idx) => (
                  <div
                    key={work.id || idx}
                    className="group relative rounded-xl border border-slate-200 bg-white p-4.5 shadow-2xs hover:border-slate-300 transition-all space-y-1.5"
                  >
                    <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setWorkForm(work);
                          setEditingIndex(idx);
                          setActiveModal('work_experience');
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteWorkExperience(idx)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 pr-14">
                      <h3 className="text-sm font-bold text-slate-900">{work.role}</h3>
                      {work.type && (
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {work.type}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-600">
                      {work.company} {work.duration ? `• ${work.duration}` : ''}
                    </p>
                    {work.description && renderPointwise(work.description)}
                  </div>
                ))}
              </div>
            ) : null}

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setWorkForm({ role: '', company: '', duration: '', description: '', type: 'job' });
                  setEditingIndex(null);
                  setActiveModal('work_experience');
                }}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add job
              </button>
              <button
                type="button"
                onClick={() => {
                  setWorkForm({ role: '', company: '', duration: '', description: '', type: 'internship' });
                  setEditingIndex(null);
                  setActiveModal('work_experience');
                }}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add internship
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. EXTRA CURRICULAR ACTIVITIES                            */}
        {/* ========================================================= */}
        <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-56 shrink-0">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              EXTRA CURRICULAR ACTIVITIES
            </h2>
          </div>
          <div className="flex-1 space-y-4">
            {profile?.extraCurricular && profile.extraCurricular.length > 0 ? (
              <div className="space-y-2.5">
                {profile.extraCurricular.map((act, idx) => (
                  <div
                    key={idx}
                    className="group relative rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 transition-all flex items-start justify-between gap-4"
                  >
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pr-6">{act}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setExtraCurricularText(act);
                          setEditingIndex(idx);
                          setActiveModal('extra_curricular');
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteExtraCurricular(idx)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => {
                setExtraCurricularText('');
                setEditingIndex(null);
                setActiveModal('extra_curricular');
              }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add extra curricular activities
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 5. TRAININGS/ COURSES                                     */}
        {/* ========================================================= */}
        <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-56 shrink-0">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              TRAININGS/ COURSES
            </h2>
          </div>
          <div className="flex-1 space-y-4">
            {profile?.trainingsCourses && profile.trainingsCourses.length > 0 ? (
              <div className="space-y-3">
                {profile.trainingsCourses.map((tc, idx) => (
                  <div
                    key={tc.id || idx}
                    className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 transition-all space-y-1"
                  >
                    <div className="absolute top-3.5 right-3.5 flex items-center gap-2">
                      {(tc.certificateUrl || tc.link) && (
                        <a
                          href={(tc.certificateUrl || tc.link)!.startsWith('http') ? (tc.certificateUrl || tc.link)! : `https://${tc.certificateUrl || tc.link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/90 transition-all shadow-2xs"
                        >
                          <Award className="h-3.5 w-3.5" />
                          <span>View Certificate</span>
                          <ExternalLink className="h-3 w-3 opacity-70" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setTrainingForm({
                            title: tc.title,
                            organization: tc.organization || '',
                            year: tc.year || '',
                            certificateUrl: tc.certificateUrl || tc.link || '',
                            link: tc.link || '',
                          });
                          setEditingIndex(idx);
                          setActiveModal('training_course');
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTraining(idx)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 pr-52">{tc.title}</h3>
                    <p className="text-xs text-slate-600">
                      {tc.organization} {tc.year ? `• ${tc.year}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => {
                setTrainingForm({ title: '', organization: '', year: '', certificateUrl: '', link: '' });
                setEditingIndex(null);
                setActiveModal('training_course');
              }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add training/ course
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 6. ACADEMICS/ PERSONAL PROJECTS                           */}
        {/* ========================================================= */}
        <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-56 shrink-0">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              ACADEMICS/ PERSONAL PROJECTS
            </h2>
          </div>
          <div className="flex-1 space-y-4">
            {profile?.projectList && profile.projectList.length > 0 ? (
              <div className="space-y-3.5">
                {profile.projectList.map((proj, idx) => (
                  <div
                    key={proj.id || idx}
                    className="group relative rounded-xl border border-slate-200 bg-white p-4.5 shadow-2xs hover:border-slate-300 transition-all space-y-2"
                  >
                    <div className="absolute top-3.5 right-3.5 flex items-center gap-2">
                      {proj.link && (
                        <a
                          href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 transition-all shadow-2xs"
                        >
                          <Globe className="h-3.5 w-3.5" />
                          <span>View Website</span>
                          <ExternalLink className="h-3 w-3 opacity-70" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setProjectForm({
                            title: proj.title,
                            description: proj.description,
                            technologies: proj.technologies ? proj.technologies.join(', ') : '',
                            link: proj.link || '',
                            githubUrl: proj.githubUrl || '',
                          });
                          setEditingIndex(idx);
                          setActiveModal('project');
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(idx)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 pr-52">{proj.title}</h3>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {proj.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    {proj.description && renderPointwise(proj.description)}
                  </div>
                ))}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => {
                setProjectForm({ title: '', description: '', technologies: '', link: '', githubUrl: '' });
                setEditingIndex(null);
                setActiveModal('project');
              }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add academic/ personal project
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 7. SKILLS                                                 */}
        {/* ========================================================= */}
        <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-56 shrink-0">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              SKILLS
            </h2>
          </div>
          <div className="flex-1 space-y-4">
            {profile?.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 transition-all group"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove skill"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}

            <form onSubmit={handleAddSkill} className="flex items-center gap-2 max-w-sm">
              <input
                type="text"
                placeholder="Enter skill (e.g. React.js, Python)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              />
              <Button type="submit" size="sm" variant="outline" className="text-xs shrink-0 font-bold">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add
              </Button>
            </form>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 8. PORTFOLIO/ WORK SAMPLES                                */}
        {/* ========================================================= */}
        <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-56 shrink-0">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              PORTFOLIO/ WORK SAMPLES
            </h2>
          </div>
          <div className="flex-1 space-y-4">
            <PortfolioSocialMediaLinks
              portfolioList={profile?.portfolioList || []}
              githubUrl={profile?.githubUrl}
              linkedinUrl={profile?.linkedinUrl}
              portfolioUrl={profile?.portfolioUrl}
              onSaveLink={handleSaveSocialLink}
              onDeleteLink={handleDeleteSocialLink}
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* 9. ACCOMPLISHMENTS/ ADDITIONAL DETAILS                    */}
        {/* ========================================================= */}
        <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-56 shrink-0">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              ACCOMPLISHMENTS/ ADDITIONAL DETAILS
            </h2>
          </div>
          <div className="flex-1 space-y-4">
            {profile?.accomplishments && profile.accomplishments.length > 0 ? (
              <div className="space-y-2.5">
                {profile.accomplishments.map((acc, idx) => (
                  <div
                    key={idx}
                    className="group relative rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 transition-all flex items-start justify-between gap-4"
                  >
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pr-6">{acc}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setAccomplishmentText(acc);
                          setEditingIndex(idx);
                          setActiveModal('accomplishment');
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAccomplishment(idx)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => {
                setAccomplishmentText('');
                setEditingIndex(null);
                setActiveModal('accomplishment');
              }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add accomplishment/ additional detail
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RESUME IMPORT MODAL                                           */}
      {/* ------------------------------------------------------------- */}
      <AiResumeParserModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        onSuccess={() => {
          loadProfile();
        }}
      />

      {/* ------------------------------------------------------------- */}
      {/* SECTION EDITING MODALS                                        */}
      {/* ------------------------------------------------------------- */}
      {/* Header Modal */}
      {activeModal === 'header' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Edit Profile Header</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveHeader} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={headerForm.name}
                  onChange={(e) => setHeaderForm({ ...headerForm, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Degree</label>
                  <input
                    type="text"
                    value={headerForm.degree}
                    onChange={(e) => setHeaderForm({ ...headerForm, degree: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">College</label>
                  <input
                    type="text"
                    value={headerForm.college}
                    onChange={(e) => setHeaderForm({ ...headerForm, college: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current CGPA</label>
                  <input
                    type="text"
                    value={headerForm.cgpa}
                    onChange={(e) => setHeaderForm({ ...headerForm, cgpa: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Graduation Year</label>
                  <input
                    type="text"
                    value={headerForm.graduationYear}
                    onChange={(e) => setHeaderForm({ ...headerForm, graduationYear: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Availability</label>
                  <select
                    value={headerForm.availability}
                    onChange={(e) => setHeaderForm({ ...headerForm, availability: e.target.value as any })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="immediate">Immediate</option>
                    <option value="part_time">Part Time</option>
                    <option value="full_time">Full Time</option>
                    <option value="not_available">Not Available</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={headerForm.phone}
                    onChange={(e) => setHeaderForm({ ...headerForm, phone: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setActiveModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Career Objective Modal */}
      {activeModal === 'career_objective' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Career Objective</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveCareerObjective} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Objective</label>
                <textarea
                  rows={4}
                  required
                  placeholder="State your career objectives, goals, and passions..."
                  value={careerObjectiveText}
                  onChange={(e) => setCareerObjectiveText(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setActiveModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold">
                  Save Objective
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Education Modal */}
      {activeModal === 'education' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingIndex !== null ? 'Edit Education' : 'Add Education'}
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEducation} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Degree / Course</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Tech Computer Science"
                  value={educationForm.degree}
                  onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">College / Institute</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BITS Pilani, Goa Campus"
                  value={educationForm.college}
                  onChange={(e) => setEducationForm({ ...educationForm, college: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration / Years</label>
                  <input
                    type="text"
                    placeholder="e.g. 2026 - 2030"
                    value={educationForm.duration}
                    onChange={(e) => setEducationForm({ ...educationForm, duration: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CGPA / Percentage</label>
                  <input
                    type="text"
                    placeholder="e.g. 9.0"
                    value={educationForm.cgpa}
                    onChange={(e) => setEducationForm({ ...educationForm, cgpa: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setActiveModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold">
                  Save Education
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Work Experience Modal */}
      {activeModal === 'work_experience' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingIndex !== null ? 'Edit Experience' : 'Add Experience'}
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveWorkExperience} className="p-6 space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Designation / Role</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Full Stack Developer Intern"
                    value={workForm.role}
                    onChange={(e) => setWorkForm({ ...workForm, role: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                  <select
                    value={workForm.type || 'job'}
                    onChange={(e) => setWorkForm({ ...workForm, type: e.target.value as any })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="job">Job</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bot2do Technologies"
                    value={workForm.company}
                    onChange={(e) => setWorkForm({ ...workForm, company: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. June 2025 – Dec 2025"
                    value={workForm.duration}
                    onChange={(e) => setWorkForm({ ...workForm, duration: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Key Responsibilities / Impact</label>
                <textarea
                  rows={4}
                  placeholder="• Developed production features&#10;• Built REST APIs using Node.js"
                  value={workForm.description}
                  onChange={(e) => setWorkForm({ ...workForm, description: e.target.value })}
                  className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setActiveModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold">
                  Save Experience
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Extra Curricular Modal */}
      {activeModal === 'extra_curricular' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingIndex !== null ? 'Edit Activity' : 'Add Extra Curricular Activity'}
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveExtraCurricular} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Activity Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Competitive Programming & DSA – Solving problems regularly..."
                  value={extraCurricularText}
                  onChange={(e) => setExtraCurricularText(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setActiveModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold">
                  Save Activity
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Training / Course Modal */}
      {activeModal === 'training_course' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingIndex !== null ? 'Edit Training / Course' : 'Add Training / Course'}
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveTraining} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Course / Training Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Introduction to Machine Learning"
                  value={trainingForm.title}
                  onChange={(e) => setTrainingForm({ ...trainingForm, title: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Organization / Platform</label>
                  <input
                    type="text"
                    placeholder="e.g. IIT Madras - NPTEL"
                    value={trainingForm.organization}
                    onChange={(e) => setTrainingForm({ ...trainingForm, organization: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Year / Period</label>
                  <input
                    type="text"
                    placeholder="e.g. 2024"
                    value={trainingForm.year}
                    onChange={(e) => setTrainingForm({ ...trainingForm, year: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Certificate URL / Credential Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://nptel.ac.in/certificate/... or https://coursera.org/verify/..."
                  value={trainingForm.certificateUrl || ''}
                  onChange={(e) => setTrainingForm({ ...trainingForm, certificateUrl: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setActiveModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold">
                  Save Training
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Modal */}
      {activeModal === 'project' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingIndex !== null ? 'Edit Project' : 'Add Academic / Personal Project'}
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveProject} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IPL Vision"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Technologies (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Flask, React.js, Pandas, Chart.js"
                  value={projectForm.technologies}
                  onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Live Website / Deployed URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://appointment-booking.vercel.app"
                  value={projectForm.link || ''}
                  onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Key Features</label>
                <textarea
                  rows={4}
                  placeholder="• Developed cricket analytics platform&#10;• Built REST APIs..."
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setActiveModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold">
                  Save Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Portfolio Modal */}
      {activeModal === 'portfolio' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingIndex !== null ? 'Edit Portfolio Link' : 'Add Portfolio / Work Sample'}
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSavePortfolio} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Platform / Work Sample Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GitHub Profile, Live App, Behance"
                  value={portfolioForm.name}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">URL Link</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={portfolioForm.url}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, url: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setActiveModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold">
                  Save Link
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Accomplishment Modal */}
      {activeModal === 'accomplishment' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingIndex !== null ? 'Edit Accomplishment' : 'Add Accomplishment / Additional Detail'}
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveAccomplishment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Accomplishment Detail</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Winner of VSM Tech Hackathon, MHT-CET 94.20 Percentile..."
                  value={accomplishmentText}
                  onChange={(e) => setAccomplishmentText(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setActiveModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold">
                  Save Accomplishment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
