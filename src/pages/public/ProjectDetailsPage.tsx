import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { IProject, ITeam } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog';
import { Textarea } from '../../components/ui/Textarea';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'sonner';
import {
  Briefcase,
  Users,
  Clock,
  Calendar,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Bookmark,
  Share2,
  ArrowRight,
  ExternalLink,
  Target,
  FileCheck2,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

export function ProjectDetailsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [project, setProject] = useState<IProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [similarProjects, setSimilarProjects] = useState<IProject[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // Application Modal States
  const [applyIndividualModalOpen, setApplyIndividualModalOpen] = useState(false);
  const [applyTeamModalOpen, setApplyTeamModalOpen] = useState(false);
  const [myTeams, setMyTeams] = useState<ITeam[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [proposal, setProposal] = useState('');
  const [weeklyHours, setWeeklyHours] = useState('25-30 hours/week');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadProject() {
      setLoading(true);
      try {
        const res = await api.get(`/projects/${projectId}`);
        if (res.data.success) {
          setProject(res.data.data);
          setIsBookmarked(res.data.data.isBookmarked || false);
          setHasApplied(res.data.data.hasApplied || false);
          setSimilarProjects(res.data.data.similarProjects || []);
        }
      } catch (err: any) {
        toast.error('Could not load project details');
      } finally {
        setLoading(false);
      }
    }

    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  // Load user's eligible teams if applying as team
  const openTeamApplicationModal = async () => {
    if (!user) {
      toast.error('Please log in as a student to apply');
      navigate('/login');
      return;
    }
    if (user.role !== 'student') {
      toast.error('Only student accounts can apply for projects');
      return;
    }

    try {
      const res = await api.get('/teams/me');
      if (res.data.success) {
        const leaderTeams = res.data.data.filter((t: any) => t.leaderId === user._id || t.myRole === 'leader');
        setMyTeams(leaderTeams);
        if (leaderTeams.length > 0) {
          setSelectedTeamId(leaderTeams[0]._id);
        }
        setApplyTeamModalOpen(true);
      }
    } catch {
      toast.error('Failed to load your teams');
    }
  };

  const handleApplyIndividual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverLetter.trim()) {
      toast.error('Please provide a cover letter');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/applications/project/${projectId}`, {
        applicantType: 'individual',
        coverLetter,
        answers: [{ question: 'Weekly Dedication', answer: weeklyHours }],
      });

      if (res.data.success) {
        toast.success('Individual application submitted successfully!');
        setHasApplied(true);
        setApplyIndividualModalOpen(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error submitting application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId) {
      toast.error('Please select an eligible team you lead');
      return;
    }
    if (!coverLetter.trim()) {
      toast.error('Please provide a team cover letter and proposal');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/applications/project/${projectId}`, {
        applicantType: 'team',
        teamId: selectedTeamId,
        coverLetter,
        proposal,
        answers: [{ question: 'Weekly Dedication', answer: weeklyHours }],
      });

      if (res.data.success) {
        toast.success('Team application submitted successfully!');
        setHasApplied(true);
        setApplyTeamModalOpen(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error submitting application');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleBookmark = async () => {
    if (!user) {
      toast.error('Please log in to bookmark projects');
      return;
    }
    try {
      const res = await api.post(`/projects/${projectId}/bookmark`);
      if (res.data.success) {
        setIsBookmarked(res.data.isBookmarked);
        toast.success(res.data.message);
      }
    } catch {
      toast.error('Bookmark error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent" />
          <p className="mt-4 text-sm text-slate-500">Loading project specification...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-xl font-bold text-slate-900">Project Not Found</h2>
          <p className="text-sm text-slate-500 mt-2">The requested project listing could not be found or has expired.</p>
          <Link to="/projects" className="mt-6 inline-block">
            <Button variant="default">Browse All Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Project Header Banner */}
      <div className="bg-white border-b border-slate-200/90 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {project.category}
                </span>
                <Badge variant={project.compensationType === 'paid' ? 'emerald' : 'secondary'}>
                  {project.compensationType.toUpperCase()}
                </Badge>
                <span className="text-xs text-slate-500 font-medium">
                  {project.workMode.toUpperCase()} • {project.location}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {project.title}
              </h1>

              {/* Company line */}
              <div className="flex items-center gap-3 pt-1">
                <Avatar
                  src={project.company?.logo}
                  alt={project.company?.companyName}
                  fallback={project.company?.companyName?.[0]}
                  size="md"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    {project.company?.companyName}
                    <ShieldCheck className="h-4 w-4 text-emerald-600 inline" />
                  </h3>
                  <p className="text-xs text-slate-500">
                    {project.company?.industry} • {project.company?.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Application CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={toggleBookmark}
                className={`p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center ${
                  isBookmarked ? 'text-emerald-600 fill-emerald-600' : 'text-slate-500'
                }`}
                title="Bookmark"
              >
                <Bookmark className="h-5 w-5" />
              </button>

              {hasApplied ? (
                <div className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Application Submitted
                </div>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="default"
                    className="font-bold border-slate-300 text-slate-800 hover:bg-slate-50"
                    onClick={() => {
                      if (!user) {
                        toast.error('Please log in as a student to apply');
                        navigate('/login');
                        return;
                      }
                      setApplyIndividualModalOpen(true);
                    }}
                  >
                    Apply as Individual
                  </Button>
                  <Button
                    variant="emerald"
                    size="default"
                    className="font-bold shadow-md"
                    onClick={openTeamApplicationModal}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Apply as Team
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Full Specifications */}
          <div className="lg:col-span-8 space-y-8">
            {/* Overview & Problem Statement */}
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Project Overview & Scope
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                {project.fullDescription || project.shortDescription}
              </p>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 mt-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-emerald-600" /> Problem Statement
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {project.problemStatement}
                </p>
              </div>
            </div>

            {/* Goals & Deliverables */}
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200/80 shadow-2xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3">Core Goals & Objectives</h3>
                <ul className="space-y-2">
                  {project.goals?.map((g, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-base font-bold text-slate-900 mb-3">Expected Deliverables</h3>
                <ul className="space-y-2">
                  {project.deliverables?.map((d, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <FileCheck2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Required Technologies */}
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">Required Technical Stack</h3>
              <div className="flex flex-wrap gap-2">
                {project.requiredSkills?.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-900 text-xs font-semibold border border-emerald-200"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {project.optionalSkills && project.optionalSkills.length > 0 && (
                <div className="pt-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Nice to have / Optional
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.optionalSkills.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Key Details Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs space-y-5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
                Collaboration Summary
              </h3>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-slate-400" /> Team Capacity
                  </span>
                  <span className="font-bold text-slate-900">{project.preferredTeamSize} Developers</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-slate-400" /> Duration
                  </span>
                  <span className="font-bold text-slate-900">{project.durationWeeks} Weeks</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-400" /> Application Deadline
                  </span>
                  <span className="font-bold text-slate-900">{project.deadline}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-slate-400" /> Compensation
                  </span>
                  <span className="font-bold text-emerald-700">{project.budgetOrStipend || 'Competitive Stipend'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-400" /> Mode & Location
                  </span>
                  <span className="font-bold text-slate-900">{project.workMode} ({project.location})</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                {hasApplied ? (
                  <Button variant="secondary" className="w-full font-bold" disabled>
                    Application Submitted
                  </Button>
                ) : (
                  <Button
                    variant="emerald"
                    className="w-full font-bold shadow-sm"
                    onClick={openTeamApplicationModal}
                  >
                    Apply with Your Team
                  </Button>
                )}
              </div>
            </div>

            {/* Company Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                About the Organization
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {project.company?.description || 'Technology enterprise partner collaborating on final-year engineering projects.'}
              </p>
              {project.company?.website && (
                <a
                  href={project.company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
                >
                  Visit Website <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Individual Application Modal */}
      <Dialog open={applyIndividualModalOpen} onOpenChange={setApplyIndividualModalOpen}>
        <DialogHeader>
          <DialogTitle>Apply as Individual Candidate</DialogTitle>
          <DialogDescription>
            Submit your personal application for &quot;{project.title}&quot;.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleApplyIndividual} className="space-y-4 text-left">
          <Textarea
            label="Cover Letter / Introduction *"
            placeholder="Introduce yourself, your academic background, and why your skills are a strong match for this project..."
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={4}
            required
          />

          <Input
            label="Weekly Hours Commitment"
            value={weeklyHours}
            onChange={(e) => setWeeklyHours(e.target.value)}
            placeholder="e.g. 25-30 hours per week"
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setApplyIndividualModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="default" isLoading={submitting}>
              Submit Application
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Team Application Modal */}
      <Dialog open={applyTeamModalOpen} onOpenChange={setApplyTeamModalOpen}>
        <DialogHeader>
          <DialogTitle>Apply as Student Team</DialogTitle>
          <DialogDescription>
            Submit an application on behalf of your development team for &quot;{project.title}&quot;.
          </DialogDescription>
        </DialogHeader>

        {myTeams.length === 0 ? (
          <div className="py-6 text-center space-y-4">
            <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">No Eligible Teams Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You must be the designated leader of an active student team to submit team applications.
            </p>
            <Link to="/student/teams">
              <Button variant="default" size="sm">
                Create a Student Team First
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleApplyTeam} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Your Team *
              </label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {myTeams.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.memberCount} members • {t.college})
                  </option>
                ))}
              </select>
            </div>

            <Textarea
              label="Team Proposal & Introduction *"
              placeholder="Outline your team's architecture proposal, division of responsibilities, and previous project experience..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={4}
              required
            />

            <Input
              label="Technical Architecture Highlights"
              placeholder="e.g. Microservices in Go, React + Vite, Postgres & Docker"
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setApplyTeamModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="emerald" isLoading={submitting}>
                Submit Team Application
              </Button>
            </DialogFooter>
          </form>
        )}
      </Dialog>

      <Footer />
    </div>
  );
}
