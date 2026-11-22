import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { api } from '../../lib/api';
import { IStudentProfile, IProject } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { Avatar, Skeleton } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  GraduationCap,
  Github,
  Linkedin,
  Globe,
  Mail,
  Send,
  Building2,
  ExternalLink,
  X,
  Award,
  BookOpen,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

function normalizeSkill(s: string): string {
  return (s || '')
    .toLowerCase()
    .trim()
    .replace(/\.js$/i, '')
    .replace(/js$/i, '')
    .replace(/\.ts$/i, '')
    .replace(/ts$/i, '')
    .trim();
}

export function isSkillMatch(candidateSkill?: string, filterSkill?: string): boolean {
  if (!candidateSkill || !filterSkill) return false;
  const cNorm = candidateSkill.toLowerCase().trim();
  const fNorm = filterSkill.toLowerCase().trim();

  // 1. Exact match (case-insensitive)
  if (cNorm === fNorm) return true;

  // 2. Normalized without .js / js / .ts / ts (e.g. 'react' matches 'react.js' or 'reactjs')
  const cBase = normalizeSkill(cNorm);
  const fBase = normalizeSkill(fNorm);
  if (cBase === fBase && cBase.length > 0) return true;

  // 3. Known language aliases
  if ((fNorm === 'go' && cNorm === 'golang') || (fNorm === 'golang' && cNorm === 'go')) return true;
  if ((fNorm === 'cpp' && cNorm === 'c++') || (fNorm === 'c++' && cNorm === 'cpp')) return true;
  if ((fNorm === 'csharp' && cNorm === 'c#') || (fNorm === 'c#' && cNorm === 'csharp')) return true;
  if ((fNorm === 'py' && cNorm === 'python') || (fNorm === 'python' && cNorm === 'py')) return true;

  // 4. Protect specific distinct languages from false substring matches:
  // 'java' should never match 'javascript'
  if (
    (fNorm === 'java' && cNorm.startsWith('javascript')) ||
    (cNorm === 'java' && fNorm.startsWith('javascript'))
  ) {
    return false;
  }

  // 5. Short skills (<= 3 chars, like 'go', 'c', 'r', 'sql') must NOT do broad substring matching
  if (fNorm.length <= 3 || cNorm.length <= 3) {
    return false;
  }

  // 6. Word-based matching for multi-word technologies (e.g. 'tailwind' matches 'tailwind css')
  const wordsC = cNorm.split(/[\s/,\-_]+/);
  const wordsF = fNorm.split(/[\s/,\-_]+/);
  if (wordsC.includes(fNorm) || wordsF.includes(cNorm)) return true;

  return false;
}

function getStudentHighlights(student: IStudentProfile): string[] {
  if (student.keyHighlights && student.keyHighlights.length > 0) {
    return student.keyHighlights;
  }

  // Synthesize top 3-4 highlights if not yet parsed from resume
  const points: string[] = [];

  if (student.skills && student.skills.length > 0) {
    const topSkills = student.skills.slice(0, 5).join(', ');
    points.push(`Specialized expertise in core engineering & development stack: ${topSkills}.`);
  }

  const projectItems = student.projectList || student.projects || [];
  if (projectItems.length > 0) {
    const projTitle = projectItems[0].title;
    points.push(`Hands-on experience architecting full-lifecycle project solutions like "${projTitle}".`);
  }

  if (student.cgpa && Number(student.cgpa) > 0) {
    points.push(`Consistent academic excellence with a ${student.cgpa} CGPA in ${student.degree || 'Engineering'}.`);
  }

  const workItems = student.workExperienceList || (student.experience as any) || [];
  if (workItems.length > 0) {
    const exp = workItems[0];
    const role = exp.role || exp.title || 'Engineer';
    const company = exp.company || exp.organization || 'Internship';
    points.push(`Practical industry experience as ${role} at ${company}.`);
  }

  if (points.length < 3 && student.college) {
    points.push(`Strong engineering fundamentals and collaborative track record at ${student.college}.`);
  }

  return points.slice(0, 4);
}

function renderPointwise(text?: string) {
  if (!text) return null;
  const raw = text.trim();
  if (!raw) return null;

  // Split lines: by newline, bullet character (•), hyphen or asterisk
  let lines: string[] = [];
  if (raw.includes('•') || raw.includes('\n')) {
    lines = raw
      .split(/[•\r\n]+/)
      .map((l) => l.replace(/^[\-\*\s]+/, '').trim())
      .filter(Boolean);
  } else {
    // Split sentences ending in a period followed by space and capital letter or numbers
    const sentenceSplit = raw
      .split(/(?<=\.)\s+(?=[A-Z0-9•\-])/g)
      .map((s) => s.replace(/^[\-\*\s]+/, '').trim())
      .filter(Boolean);
    lines = sentenceSplit.length > 1 ? sentenceSplit : [raw];
  }

  return (
    <ul className="space-y-0.5 pt-1 list-disc list-outside pl-4.5 text-xs text-slate-600 leading-5 marker:text-slate-400">
      {lines.map((line, idx) => (
        <li key={idx} className="pl-0.5">
          {line}
        </li>
      ))}
    </ul>
  );
}

export function ExploreStudentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { user } = useAuthStore();

  const [students, setStudents] = useState<IStudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Selected student for detail modal
  const [selectedStudent, setSelectedStudent] = useState<IStudentProfile | null>(null);

  // Company invitation state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [targetStudentForInvite, setTargetStudentForInvite] = useState<IStudentProfile | null>(null);
  const [companyProjects, setCompanyProjects] = useState<IProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviting, setInviting] = useState(false);

  // Search input from URL
  const search = searchParams.get('search') || '';
  const page = Number(searchParams.get('page') || '1');
  const [searchInput, setSearchInput] = useState(search);

  // 1. Minimum CGPA filter state (default 1.0 = All / No Minimum)
  const [minCgpaValue, setMinCgpaValue] = useState<number>(() => {
    const p = searchParams.get('minCgpa');
    return p ? parseFloat(p) : 1.0;
  });

  // 2. Technical skills filter state (case-insensitive array)
  const [selectedSkills, setSelectedSkills] = useState<string[]>(() => {
    const raw = searchParams.get('skills') || searchParams.get('skill') || '';
    return raw
      ? raw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  });
  const [skillInputText, setSkillInputText] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const skillDropdownRef = useRef<HTMLDivElement>(null);

  // Skills loaded from database
  const [dbSkills, setDbSkills] = useState<{ _id?: string; name: string; category?: string }[]>([]);

  // Close skill dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        skillDropdownRef.current &&
        !skillDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSkillDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch categorized skills from backend API
  useEffect(() => {
    async function fetchSkills() {
      try {
        const res = await api.get('/skills');
        if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setDbSkills(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching skills from API:', err);
      }
    }
    fetchSkills();
  }, []);

  // Master sorted list of all available skills fetched dynamically from database API
  const availableSkillsList = useMemo(() => {
    const list = dbSkills.map((s) => s.name).filter(Boolean);
    return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
  }, [dbSkills]);

  // Filter skills for dropdown matching user input, omitting already selected skills
  const filteredDropdownSkills = useMemo(() => {
    const q = skillInputText.toLowerCase().trim();
    return availableSkillsList.filter((s) => {
      const isSelected = selectedSkills.some(
        (sk) => sk.toLowerCase().trim() === s.toLowerCase().trim()
      );
      if (isSelected) return false;
      if (!q) return true;
      return s.toLowerCase().includes(q);
    });
  }, [availableSkillsList, skillInputText, selectedSkills]);

  // 3. Internship experience filter state
  const [hasInternshipChecked, setHasInternshipChecked] = useState<boolean>(() => {
    const p = searchParams.get('internship');
    return p === 'has' || p === 'true';
  });
  const [fresherChecked, setFresherChecked] = useState<boolean>(() => {
    const p = searchParams.get('internship');
    return p === 'fresher' || p === 'false';
  });

  // Sync state to URL search parameters
  const syncParamsToUrl = (
    newCgpa: number,
    newSkills: string[],
    newHasIntern: boolean,
    newFresher: boolean
  ) => {
    const next = new URLSearchParams(searchParams);

    if (newCgpa > 1.0) {
      next.set('minCgpa', newCgpa.toFixed(1));
    } else {
      next.delete('minCgpa');
    }

    if (newSkills.length > 0) {
      next.set('skills', newSkills.join(','));
      next.delete('skill');
    } else {
      next.delete('skills');
      next.delete('skill');
    }

    if (newHasIntern && !newFresher) {
      next.set('internship', 'has');
    } else if (newFresher && !newHasIntern) {
      next.set('internship', 'fresher');
    } else {
      next.delete('internship');
    }

    next.set('page', '1');
    setSearchParams(next);
  };

  const handleCgpaChange = (val: number) => {
    setMinCgpaValue(val);
    syncParamsToUrl(val, selectedSkills, hasInternshipChecked, fresherChecked);
  };

  const handleAddSkill = async (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;
    const exists = selectedSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      const updated = [...selectedSkills, trimmed];
      setSelectedSkills(updated);
      syncParamsToUrl(minCgpaValue, updated, hasInternshipChecked, fresherChecked);

      // Save new skill to database in background
      try {
        await api.post('/skills', { name: trimmed });
      } catch {
        // Silently continue
      }
    }
    setSkillInputText('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = selectedSkills.filter(
      (s) => s.toLowerCase() !== skillToRemove.toLowerCase()
    );
    setSelectedSkills(updated);
    syncParamsToUrl(minCgpaValue, updated, hasInternshipChecked, fresherChecked);
  };

  const handleClearAllSkills = () => {
    setSelectedSkills([]);
    setSkillInputText('');
    syncParamsToUrl(minCgpaValue, [], hasInternshipChecked, fresherChecked);
  };

  const handleToggleHasInternship = (checked: boolean) => {
    setHasInternshipChecked(checked);
    syncParamsToUrl(minCgpaValue, selectedSkills, checked, fresherChecked);
  };

  const handleToggleFresher = (checked: boolean) => {
    setFresherChecked(checked);
    syncParamsToUrl(minCgpaValue, selectedSkills, hasInternshipChecked, checked);
  };

  const handleResetAll = () => {
    setMinCgpaValue(1.0);
    setSelectedSkills([]);
    setSkillInputText('');
    setHasInternshipChecked(false);
    setFresherChecked(false);
    setSearchInput('');
    setSearchParams({});
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      next.set('search', searchInput.trim());
    } else {
      next.delete('search');
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleOpenInvite = async (student: IStudentProfile) => {
    if (!user || user.role !== 'company') {
      toast.error('Only registered companies can send project invitations');
      return;
    }

    setTargetStudentForInvite(student);
    try {
      const res = await api.get('/projects/company/my');
      if (res.data.success && res.data.data.length > 0) {
        setCompanyProjects(res.data.data);
        setSelectedProjectId(res.data.data[0]._id);
        setInviteModalOpen(true);
      } else {
        toast.error('You need to post at least one active project before sending invitations');
      }
    } catch {
      toast.error('Failed to load your company projects');
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStudentForInvite || !selectedProjectId) return;

    setInviting(true);
    try {
      const res = await api.post('/invitations/company', {
        projectId: selectedProjectId,
        targetType: 'student',
        targetId: targetStudentForInvite.userId,
        message: inviteMessage,
      });

      if (res.data.success) {
        toast.success(`Invitation dispatched to ${targetStudentForInvite.user?.name}!`);
        setInviteModalOpen(false);
        setInviteMessage('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error sending invitation');
    } finally {
      setInviting(false);
    }
  };

  useEffect(() => {
    async function fetchStudents() {
      setLoading(true);
      try {
        const query = searchParams.toString();
        const res = await api.get(`/students?${query}&limit=24`);
        if (res.data.success) {
          setStudents(res.data.data);
          setTotal(res.data.pagination.total);
          setTotalPages(res.data.pagination.totalPages);
        }
      } catch (err) {
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, [searchParams]);

  // Client-Side Robust Filtration with Case-Insensitive Matching
  const filteredStudents = React.useMemo(() => {
    return students.filter((student) => {
      // 1. Minimum CGPA filter
      // Rule: Default 1.0 (meaning All / No Minimum) ensures students with empty/null CGPA aren't hidden
      if (minCgpaValue > 1.0) {
        const val = parseFloat(String(student.cgpa));
        if (isNaN(val) || val < minCgpaValue) {
          return false;
        }
      }

      // 2. Technical Skills Matching (Case-Insensitive & Boundary Safe)
      if (selectedSkills.length > 0) {
        const studentSkills = student.skills || [];
        const matchesSkills = selectedSkills.every((filterSkill) => {
          return studentSkills.some((studentSkill) =>
            isSkillMatch(studentSkill, filterSkill)
          );
        });
        if (!matchesSkills) return false;
      }

      // 3. Internship Experience Check
      // Rule: Check Array.isArray(student.workExperience) && student.workExperience.length > 0
      const exps =
        (student as any).workExperience ||
        student.workExperienceList ||
        student.experience ||
        [];
      const hasExp = Array.isArray(exps) && exps.length > 0;

      if (hasInternshipChecked && !fresherChecked) {
        if (!hasExp) return false;
      } else if (fresherChecked && !hasInternshipChecked) {
        if (hasExp) return false;
      }

      return true;
    });
  }, [
    students,
    minCgpaValue,
    selectedSkills,
    hasInternshipChecked,
    fresherChecked,
  ]);

  const activeFilterCount =
    (minCgpaValue > 1.0 ? 1 : 0) +
    selectedSkills.length +
    (hasInternshipChecked ? 1 : 0) +
    (fresherChecked ? 1 : 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {!location.pathname.startsWith('/company') && <Navbar />}

      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Discover Student Developers
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Explore pre-screened engineering students by tech stack, academic standing, and GitHub repositories.
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, skills, college..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <Button type="submit" variant="default" size="sm" className="bg-slate-900 font-semibold shrink-0">
                Search
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4 flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((prev) => !prev)}
            className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer"
          >
            <Filter className="h-4 w-4 text-emerald-600" />
            <span>{mobileFiltersOpen ? 'Hide Filters' : 'Filter Candidates'}</span>
            {activeFilterCount > 0 && (
              <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleResetAll}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
            >
              Reset All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Filters Sidebar */}
          <div
            className={`bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6 ${
              mobileFiltersOpen ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="h-4 w-4 text-emerald-600" /> Filter Students
              </span>
              <button
                type="button"
                onClick={handleResetAll}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors cursor-pointer"
              >
                Reset All
              </button>
            </div>

            {/* 1. MINIMUM CGPA */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Minimum CGPA
                </label>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {minCgpaValue <= 1.0 ? '1.0+ (ALL)' : `${minCgpaValue.toFixed(1)}+`}
                </span>
              </div>

              {/* Range slider */}
              <div className="relative py-1">
                <input
                  type="range"
                  min="1.0"
                  max="10.0"
                  step="0.1"
                  value={minCgpaValue}
                  onChange={(e) => handleCgpaChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
                />
              </div>

              {/* Slider scale markers */}
              <div className="flex justify-between text-[11px] text-slate-400 font-medium px-0.5 pt-1">
                <span>1.0</span>
                <span>3.0</span>
                <span>5.0</span>
                <span>7.5</span>
                <span>10.0</span>
              </div>
            </div>

            {/* 2. TECHNICAL SKILLS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Technical Skills
                </label>
                <button
                  type="button"
                  onClick={handleClearAllSkills}
                  className={`text-xs font-bold transition-colors ${
                    selectedSkills.length === 0
                      ? 'text-slate-400 cursor-default'
                      : 'text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer'
                  }`}
                >
                  ALL
                </button>
              </div>

              {/* Search / Tag input & Dropdown Container */}
              <div className="relative" ref={skillDropdownRef}>
                <div
                  onClick={() => setShowSkillDropdown(true)}
                  className={`flex flex-wrap items-center gap-1.5 p-2 rounded-xl border bg-white transition-all cursor-text ${
                    showSkillDropdown
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {selectedSkills.map((sk) => (
                    <span
                      key={sk}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 animate-in fade-in"
                    >
                      {sk}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSkill(sk);
                        }}
                        className="hover:text-emerald-950 p-0.5 rounded-sm cursor-pointer"
                        title="Remove skill"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder={
                      selectedSkills.length === 0
                        ? 'Type or select skills (e.g. react, node)...'
                        : 'Add more...'
                    }
                    value={skillInputText}
                    onChange={(e) => {
                      setSkillInputText(e.target.value);
                      setShowSkillDropdown(true);
                    }}
                    onFocus={() => setShowSkillDropdown(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        if (skillInputText.trim()) {
                          handleAddSkill(skillInputText);
                        }
                      }
                    }}
                    className="flex-1 min-w-[130px] text-xs text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none"
                  />
                </div>

                {/* Dropdown list matching user screenshot */}
                {showSkillDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                      {filteredDropdownSkills.map((skillName) => (
                        <button
                          key={skillName}
                          type="button"
                          onClick={() => handleAddSkill(skillName)}
                          className="w-full text-left px-3.5 py-2.5 text-xs text-slate-800 hover:bg-emerald-50 hover:text-emerald-900 flex items-center justify-between transition-colors group cursor-pointer"
                        >
                          <span className="font-medium text-slate-800 group-hover:text-emerald-900">
                            {skillName}
                          </span>
                          <span className="text-xs font-semibold text-emerald-600 group-hover:text-emerald-700">
                            + Add
                          </span>
                        </button>
                      ))}

                      {filteredDropdownSkills.length === 0 && !skillInputText.trim() && (
                        <div className="px-3.5 py-3 text-xs text-slate-400 text-center">
                          All available skills selected
                        </div>
                      )}

                      {/* Custom typed skill option */}
                      {skillInputText.trim().length > 0 &&
                        !availableSkillsList.some(
                          (s) => s.toLowerCase() === skillInputText.toLowerCase().trim()
                        ) && (
                          <button
                            type="button"
                            onClick={() => handleAddSkill(skillInputText)}
                            className="w-full text-left px-3.5 py-2.5 text-xs text-emerald-700 font-bold hover:bg-emerald-50 flex items-center justify-between border-t border-slate-100 cursor-pointer"
                          >
                            <span>Add custom "{skillInputText.trim()}"</span>
                            <span className="text-xs font-bold text-emerald-700">+ Add</span>
                          </button>
                        )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. INTERNSHIP EXPERIENCE */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                Internship Experience
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                  <input
                    type="checkbox"
                    checked={hasInternshipChecked}
                    onChange={(e) => handleToggleHasInternship(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900">
                    Has Internship Experience
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                  <input
                    type="checkbox"
                    checked={fresherChecked}
                    onChange={(e) => handleToggleFresher(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900">
                    Fresher / No Internship Yet
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2">
              <span>Showing <strong className="text-slate-900">{filteredStudents.length}</strong> candidates</span>
            </div>

            {/* Loading */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="p-6 rounded-xl border border-slate-200 bg-white space-y-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredStudents.length === 0 && (
              <EmptyState
                icon={GraduationCap}
                title="No students found"
                description="Try adjusting your filters or search terms."
                actionText="Reset All Filters"
                onAction={handleResetAll}
              />
            )}

            {/* Student Cards Grid */}
            {!loading && filteredStudents.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredStudents.map((student) => (
                  <Card key={student._id} className="hover:border-emerald-300 transition-all flex flex-col justify-between">
                    <CardContent className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Avatar & Header */}
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar
                            src={student.user?.avatar}
                            alt={student.user?.name}
                            fallback={student.user?.name?.[0]}
                            size="md"
                          />
                          <div className="overflow-hidden">
                            <h3 className="text-sm font-bold text-slate-900 truncate">
                              {student.user?.name}
                            </h3>
                            <p className="text-xs text-slate-500 truncate">{student.college}</p>
                            <span className="text-[11px] font-semibold text-emerald-700">
                              CGPA: {student.cgpa} • Grad {student.graduationYear}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                          {student.bio}
                        </p>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {student.skills?.slice(0, 4).map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                            >
                              {s}
                            </span>
                          ))}
                          {(student.skills?.length || 0) > 4 && (
                            <span className="px-1 text-[10px] text-slate-400">
                              +{(student.skills?.length || 0) - 4}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="font-bold text-slate-700 hover:text-emerald-700 text-xs"
                        >
                          View Profile
                        </button>

                        {user?.role === 'company' && (
                          <Button
                            variant="default"
                            size="sm"
                            className="text-xs font-semibold bg-slate-900"
                            onClick={() => handleOpenInvite(student)}
                          >
                            <Send className="mr-1 h-3 w-3" /> Invite
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Student Profile Modal */}
      {selectedStudent && (
        <Dialog
          open={!!selectedStudent}
          onOpenChange={() => setSelectedStudent(null)}
          className="max-w-2xl sm:max-w-5xl p-0 overflow-hidden flex flex-col max-h-[86vh] shadow-2xl rounded-2xl border border-slate-200"
        >
          {/* 1. Fixed Header (Pinned at top - never scrolls away) */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 bg-white shrink-0 pr-12 sm:pr-14">
            <div className="flex items-center gap-3 sm:gap-3.5">
              <Avatar
                src={selectedStudent.user?.avatar}
                alt={selectedStudent.user?.name}
                size="lg"
                className="ring-2 ring-emerald-50 shrink-0"
              />
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                  {selectedStudent.user?.name}
                </h3>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {selectedStudent.degree} • {selectedStudent.college}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {selectedStudent.cgpa ? (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      CGPA: {selectedStudent.cgpa}
                    </span>
                  ) : null}
                  {selectedStudent.graduationYear ? (
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      Graduating {selectedStudent.graduationYear}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Single Scrollable Body (Only 1 clean scrollbar, smooth scrolling) */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4 text-xs text-slate-700 overscroll-contain">
            {/* Key Highlights & Strengths (AI synthesized directly from Resume) */}
            {getStudentHighlights(selectedStudent).length > 0 && (
              <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200/90 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-900">
                    <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                    <p className="text-[11px] font-bold uppercase tracking-wider">
                      Key Highlights & Core Strengths
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                    AI Insights
                  </span>
                </div>
                <ul className="space-y-2 pt-0.5 text-xs text-slate-700 leading-relaxed">
                  {getStudentHighlights(selectedStudent).map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-800 leading-snug">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* About */}
            {selectedStudent.bio && (
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  About
                </p>
                <p className="leading-relaxed text-slate-700 text-xs">{selectedStudent.bio}</p>
              </div>
            )}

            {/* Technical Skills */}
            {selectedStudent.skills && selectedStudent.skills.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Technical Skills ({selectedStudent.skills.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStudent.skills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/70"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Project Portfolio */}
            {((selectedStudent.projects && selectedStudent.projects.length > 0) ||
              (selectedStudent.projectList && selectedStudent.projectList.length > 0)) && (
              <div className="space-y-2.5">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Project Portfolio
                </p>
                <div className="space-y-2.5">
                  {(selectedStudent.projectList || selectedStudent.projects || []).map((p: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="font-bold text-slate-900 text-xs sm:text-sm">{p.title}</h5>
                        {p.link && (
                          <a
                            href={p.link.startsWith('http') ? p.link : `https://${p.link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline shrink-0"
                          >
                            <Globe className="h-3 w-3" /> Website <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                      {p.description && renderPointwise(p.description)}
                      {p.technologies && p.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {p.technologies.map((t: string) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Work Experience */}
            {((selectedStudent.workExperienceList && selectedStudent.workExperienceList.length > 0) ||
              (selectedStudent.experience && selectedStudent.experience.length > 0)) && (
              <div className="space-y-2.5">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Work Experience
                </p>
                <div className="space-y-2.5">
                  {(selectedStudent.workExperienceList || (selectedStudent.experience as any) || []).map(
                    (w: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                            {w.role || w.title}
                          </h5>
                          {w.duration && (
                            <span className="text-[10px] font-medium text-slate-400">
                              {w.duration}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-emerald-700">
                          {w.company || w.organization}
                        </p>
                        {w.description && renderPointwise(w.description)}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Social / Portfolio Links */}
            {(selectedStudent.githubUrl || selectedStudent.linkedinUrl || selectedStudent.portfolioUrl) && (
              <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-slate-100">
                {selectedStudent.githubUrl && (
                  <a
                    href={selectedStudent.githubUrl.startsWith('http') ? selectedStudent.githubUrl : `https://${selectedStudent.githubUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-black font-semibold text-xs transition-colors"
                  >
                    <Github className="h-3.5 w-3.5" /> GitHub
                  </a>
                )}
                {selectedStudent.linkedinUrl && (
                  <a
                    href={selectedStudent.linkedinUrl.startsWith('http') ? selectedStudent.linkedinUrl : `https://${selectedStudent.linkedinUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors"
                  >
                    <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                  </a>
                )}
                {selectedStudent.portfolioUrl && (
                  <a
                    href={selectedStudent.portfolioUrl.startsWith('http') ? selectedStudent.portfolioUrl : `https://${selectedStudent.portfolioUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5" /> Portfolio
                  </a>
                )}
              </div>
            )}
          </div>

          {/* 3. Fixed Footer (Pinned at bottom) */}
          <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/90 shrink-0 flex items-center justify-end gap-2.5 rounded-b-xl">
            {user?.role === 'company' && (
              <Button
                variant="emerald"
                size="sm"
                onClick={() => {
                  setSelectedStudent(null);
                  handleOpenInvite(selectedStudent);
                }}
                className="text-xs font-bold"
              >
                <Send className="mr-1.5 h-3.5 w-3.5" /> Invite to Project
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedStudent(null)}
              className="text-xs font-semibold"
            >
              Close
            </Button>
          </div>
        </Dialog>
      )}

      {/* Company Invitation Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogHeader>
          <DialogTitle>Invite Student to Project</DialogTitle>
          <DialogDescription>
            Send a direct invitation to {targetStudentForInvite?.user?.name} for one of your published software projects.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSendInvite} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Company Project *
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {companyProjects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title} ({p.preferredTeamSize} Devs • {p.workMode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Personal Note / Message
            </label>
            <textarea
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              placeholder="Explain why their profile caught your attention and how they can contribute..."
              className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="default" isLoading={inviting} className="bg-slate-900 font-semibold">
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {!location.pathname.startsWith('/company') && <Footer />}
    </div>
  );
}
