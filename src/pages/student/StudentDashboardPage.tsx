import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { IProject, ITeam, IApplication, INotification, IStudentProfile } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { AiResumeParserModal } from '../../components/student/AiResumeParserModal';
import { toast } from 'sonner';
import {
  Briefcase,
  Users,
  FileCheck2,
  MailCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Star,
  Clock,
  Layers,
  ChevronRight,
  Upload,
  Copy,
} from 'lucide-react';

export function StudentDashboardPage() {
  const { user, profile, updateProfile } = useAuthStore();
  const studentProf = profile as IStudentProfile | null;

  const [recommendedProjects, setRecommendedProjects] = useState<IProject[]>([]);
  const [myApplications, setMyApplications] = useState<IApplication[]>([]);
  const [myTeams, setMyTeams] = useState<ITeam[]>([]);
  const [invitationsCount, setInvitationsCount] = useState(0);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [recRes, appRes, teamRes, invRes] = await Promise.all([
          api.get('/projects/recommended'),
          api.get('/applications/me'),
          api.get('/teams/me'),
          api.get('/invitations/me'),
        ]);

        if (recRes.data.success) setRecommendedProjects(recRes.data.data);
        if (appRes.data.success) setMyApplications(appRes.data.data);
        if (teamRes.data.success) setMyTeams(teamRes.data.data);
        if (invRes.data.success) {
          setInvitationsCount(invRes.data.data.teamInvitations?.length || 0);
        }
      } catch (err) {
        console.error('Error loading student dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  // Prompt student to upload resume with Gemini AI if profile is incomplete
  useEffect(() => {
    const hasPrompted = sessionStorage.getItem('ai_resume_prompted');
    if (!hasPrompted) {
      sessionStorage.setItem('ai_resume_prompted', 'true');
      const needsResume = !studentProf?.resumeUrl || !studentProf?.skills || studentProf.skills.length === 0;
      if (needsResume) {
        const timer = setTimeout(() => {
          setIsAiModalOpen(true);
        }, 900);
        return () => clearTimeout(timer);
      }
    }
  }, [studentProf]);

  const totalApplications = myApplications.length;
  const shortlistedCount = myApplications.filter((a) =>
    ['shortlisted', 'assessment_sent', 'assessment_submitted', 'interview_scheduled'].includes(a.status)
  ).length;
  const acceptedCount = myApplications.filter((a) => a.status === 'accepted').length;

  return (
    <div className="space-y-8 text-left">
      {/* Resume Auto-Fill Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 p-6 sm:p-7 rounded-2xl text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden border border-emerald-900/40">
        <div className="space-y-1.5 z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> Resume Auto-Fill
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Auto-Fill Your Profile From Your Resume
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Upload your resume (PDF or DOCX) to automatically populate your coursework, CGPA, technical competencies, projects, and work experience.
          </p>
        </div>
        <div className="flex items-center gap-3 z-10 shrink-0 w-full sm:w-auto">
          <Button
            onClick={() => setIsAiModalOpen(true)}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 px-5 flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto"
          >
            <Upload className="h-4 w-4" /> Import Resume
          </Button>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Final-Year Candidate Portal
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            {studentProf?.studentIdNumber && (
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(studentProf.studentIdNumber || '');
                  toast.success(`Copied Student ID: ${studentProf.studentIdNumber}`);
                }}
                title="Click to copy your unique Student ID to share with team leaders"
                className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 border border-slate-200 text-xs font-mono font-bold transition-all shadow-2xs"
              >
                <span>ID: {studentProf.studentIdNumber}</span>
                <Copy className="h-3 w-3 text-slate-400" />
              </button>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Track your team collaborations, applications to industry projects, and upcoming project milestones.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link to="/student/teams" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto font-semibold">
              <Users className="mr-1.5 h-4 w-4" /> Manage Teams ({myTeams.length})
            </Button>
          </Link>
          <Link to="/student/projects" className="w-full sm:w-auto">
            <Button variant="default" size="sm" className="w-full sm:w-auto font-semibold bg-slate-900 text-white">
              Browse Projects
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Applications</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{totalApplications}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Shortlisted</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{shortlistedCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Accepted Projects</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{acceptedCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <MailCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Invites</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{invitationsCount}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Recommended Projects & Active Collaboration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Recommended Projects with Rule-Based Match Scores */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recommended for You & Your Team</h2>
              <p className="text-xs text-slate-500">
                Ranked by skill overlap (50%), team size (20%), and academic requirements (30%).
              </p>
            </div>
            <Link to="/student/projects" className="text-xs font-bold text-emerald-700 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {recommendedProjects.slice(0, 4).map((proj) => (
              <Card key={proj._id} className="p-5 hover:border-emerald-300 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">{proj.category}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-semibold text-emerald-700">{proj.compensationType.toUpperCase()}</span>
                      {proj.matchScore && (
                        <Badge variant="emerald" className="text-[10px]">
                          {proj.matchScore}% Match
                        </Badge>
                      )}
                    </div>

                    <Link to={`/projects/${proj._id}`} className="block group">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {proj.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {proj.shortDescription}
                    </p>

                    {/* Match reason pills */}
                    {proj.matchReasons && proj.matchReasons.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {proj.matchReasons.map((r, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-medium bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md"
                          >
                            ✓ {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="sm:text-right shrink-0">
                    <Link to={`/projects/${proj._id}`}>
                      <Button variant="default" size="sm" className="font-semibold bg-slate-900 text-white">
                        Review & Apply
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: Active Applications & Quick Roster */}
        <div className="space-y-6">
          {/* Applications Status Summary */}
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Recent Applications
              </h3>
              <Link to="/student/applications" className="text-xs text-emerald-700 font-bold hover:underline">
                View All
              </Link>
            </div>

            {myApplications.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                You haven&apos;t applied to any projects yet.
              </p>
            ) : (
              <div className="space-y-3">
                {myApplications.slice(0, 3).map((app) => (
                  <div key={app._id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700">
                        {app.applicantType === 'team' ? 'Team App' : 'Individual'}
                      </span>
                      <Badge
                        variant={
                          app.status === 'accepted'
                            ? 'emerald'
                            : app.status === 'shortlisted'
                            ? 'warning'
                            : 'secondary'
                        }
                        className="text-[10px]"
                      >
                        {app.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {app.project?.title || 'Project Application'}
                    </h4>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Team Summary */}
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                My Teams
              </h3>
              <Link to="/student/teams" className="text-xs text-emerald-700 font-bold hover:underline">
                Manage
              </Link>
            </div>

            {myTeams.length === 0 ? (
              <div className="text-center py-4 space-y-3">
                <p className="text-xs text-slate-500">
                  Form a team to unlock combined skills and group applications!
                </p>
                <Link to="/student/teams">
                  <Button variant="default" size="sm" className="font-semibold bg-slate-900">
                    Create Team
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myTeams.map((team) => (
                  <div key={team._id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar src={team.avatar} alt={team.name} size="sm" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{team.name}</h4>
                        <p className="text-[10px] text-slate-500">{team.memberCount} members</p>
                      </div>
                    </div>
                    <Link to="/student/teams">
                      <span className="text-xs text-emerald-700 font-bold hover:underline">View</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Resume Parser Dialog */}
      <AiResumeParserModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onSuccess={() => {
          // Re-fetch profile & dashboard metrics
          api.get('/students/me').then((res) => {
            if (res.data.success) {
              updateProfile(res.data.data);
            }
          });
        }}
      />
    </div>
  );
}
