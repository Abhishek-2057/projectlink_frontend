import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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

  // Filter params
  const search = searchParams.get('search') || '';
  const skill = searchParams.get('skill') || '';
  const college = searchParams.get('college') || '';
  const minCgpa = searchParams.get('minCgpa') || '';
  const page = Number(searchParams.get('page') || '1');

  const [searchInput, setSearchInput] = useState(search);

  const skillsList = [
    'React',
    'Node.js',
    'Python',
    'Go',
    'Kubernetes',
    'PyTorch',
    'TypeScript',
    'Docker',
    'FastAPI',
    'Three.js',
  ];

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', searchInput);
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams({});
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
        const res = await api.get(`/students?${query}&limit=12`);
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Discover Final-Year Student Developers
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Explore pre-screened final-year engineering students by tech stack, academic standing, and GitHub repositories.
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Filters Sidebar */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-emerald-600" /> Filter Students
              </span>
              {(search || skill || minCgpa) && (
                <button onClick={clearFilters} className="text-xs text-red-600 hover:underline flex items-center gap-0.5">
                  <X className="h-3 w-3" /> Reset
                </button>
              )}
            </div>

            {/* Technical Skills */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Technical Skill
              </label>
              <div className="flex flex-wrap gap-1.5">
                {skillsList.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateParam('skill', skill === s ? '' : s)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                      skill === s
                        ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Minimum CGPA */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Minimum CGPA
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                {['', '8.0', '9.0'].map((val) => (
                  <button
                    key={val}
                    onClick={() => updateParam('minCgpa', val)}
                    className={`py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      minCgpa === val
                        ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {val === '' ? 'Any' : `${val}+`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2">
              <span>Showing <strong className="text-slate-900">{students.length}</strong> candidates</span>
            </div>

            {/* Loading */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
            {!loading && students.length === 0 && (
              <EmptyState
                icon={GraduationCap}
                title="No students found"
                description="Try adjusting your filters or search terms."
                actionText="Reset Filters"
                onAction={clearFilters}
              />
            )}

            {/* Student Cards Grid */}
            {!loading && students.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {students.map((student) => (
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
          <div className="px-6 py-4.5 sm:py-5 border-b border-slate-100 bg-white shrink-0 pr-14">
            <div className="flex items-center gap-3.5">
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
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-xs text-slate-700 overscroll-contain">
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

      <Footer />
    </div>
  );
}
