import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { IApplication, IProject } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog';
import { Textarea } from '../../components/ui/Textarea';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../lib/utils';
import { toast } from 'sonner';
import {
  FileCheck2,
  Users,
  User,
  Star,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  Github,
  Award,
  ChevronDown,
  ChevronUp,
  Linkedin,
} from 'lucide-react';

export function CompanyApplicationsPage() {
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  // Application detail modal
  const [detailApp, setDetailApp] = useState<any>(null);
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

  // Assessment modal
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [targetAppForAssessment, setTargetAppForAssessment] = useState<IApplication | null>(null);
  const [assessmentTitle, setAssessmentTitle] = useState('Technical Architecture & Prototype Challenge');
  const [assessmentInstructions, setAssessmentInstructions] = useState('');
  const [assessmentDeadline, setAssessmentDeadline] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [dispatchingAssessment, setDispatchingAssessment] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const projRes = await api.get('/projects/company/my');
      if (projRes.data.success) {
        setProjects(projRes.data.data);
        const allApps: IApplication[] = [];
        for (const p of projRes.data.data) {
          const aRes = await api.get(`/applications/project/${p._id}`);
          if (aRes.data.success) {
            allApps.push(...aRes.data.data);
          }
        }
        setApplications(allApps);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (applicationId: string, status: string, reason?: string) => {
    try {
      const res = await api.patch(`/applications/${applicationId}/status`, { status, reason });
      if (res.data.success) {
        toast.success(`Application marked as ${status.replace('_', ' ')}`);
        fetchApplications();
        if (detailApp) setDetailApp(null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error updating application');
    }
  };

  const handleDispatchAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAppForAssessment) return;

    setDispatchingAssessment(true);
    try {
      const res = await api.post('/assessments', {
        applicationId: targetAppForAssessment._id,
        title: assessmentTitle,
        instructions: assessmentInstructions,
        deadline: assessmentDeadline,
      });

      if (res.data.success) {
        toast.success('Technical assessment assigned to candidate!');
        setAssessmentModalOpen(false);
        fetchApplications();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error assigning assessment');
    } finally {
      setDispatchingAssessment(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    const matchesProj = selectedProjectId === 'all' || app.projectId === selectedProjectId;
    const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus;
    return matchesProj && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <Badge variant="emerald" className="bg-emerald-100 text-emerald-800 font-bold border-emerald-300">
            ✓ ACCEPTED (COLLABORATION ACTIVE)
          </Badge>
        );
      case 'shortlisted':
        return <Badge variant="warning">SHORTLISTED</Badge>;
      case 'assessment_sent':
        return <Badge variant="info">ASSESSMENT DISPATCHED</Badge>;
      case 'assessment_submitted':
        return <Badge variant="info">ASSESSMENT SUBMITTED</Badge>;
      case 'under_review':
        return <Badge variant="secondary">UNDER REVIEW</Badge>;
      case 'rejected':
        return <Badge variant="destructive">REJECTED</Badge>;
      default:
        return <Badge variant="outline">{status.toUpperCase()}</Badge>;
    }
  };

  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Applications & Selection</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
          Review incoming student proposals, evaluate candidate team compositions, assign assessments, and accept teams.
        </p>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100 mt-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Filter by Project
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none"
            >
              <option value="all">All Projects ({projects.length})</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Filter by Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="assessment_sent">Assessment Sent</option>
              <option value="assessment_submitted">Assessment Submitted</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="py-12 text-center text-sm text-slate-500">Loading incoming applications...</div>
      )}

      {!loading && filteredApps.length === 0 && (
        <EmptyState
          icon={FileCheck2}
          title="No applications match the filters"
          description="Candidates will apply directly from the marketplace."
        />
      )}

      {!loading && filteredApps.length > 0 && (
        <div className="space-y-4">
          {filteredApps.map((app) => (
            <Card key={app._id} className="p-6 hover:border-slate-300 transition-all space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(app.status)}
                    <span className="text-xs text-slate-300">•</span>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      {app.applicantType === 'team' ? (
                        <>
                          <Users className="h-4 w-4 text-emerald-600" />
                          Student Team: {app.teamDetails?.name || app.team?.name || 'Development Team'}
                        </>
                      ) : (
                        <>
                          <User className="h-4 w-4 text-slate-500" />
                          Individual: {app.student?.name}
                        </>
                      )}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">
                      Applied {formatDate(app.appliedAt)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    For: {projects.find((p) => p._id === app.projectId)?.title || 'Software Project'}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    <strong>Proposal:</strong> {app.coverLetter}
                  </p>

                  {/* Skills preview */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(app.teamDetails?.skills || app.studentProfile?.skills || []).slice(0, 5).map((s: string) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200/60 text-[10px] font-semibold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Workflow Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs font-semibold"
                    onClick={() => setDetailApp(app)}
                  >
                    Review Dossier
                  </Button>

                  {app.status === 'pending' && (
                    <Button
                      variant="default"
                      size="sm"
                      className="text-xs font-semibold bg-slate-900"
                      onClick={() => handleUpdateStatus(app._id, 'shortlisted')}
                    >
                      <Star className="mr-1 h-3 w-3 text-amber-400" /> Shortlist
                    </Button>
                  )}

                  {['shortlisted', 'under_review'].includes(app.status) && (
                    <Button
                      variant="default"
                      size="sm"
                      className="text-xs font-semibold bg-slate-900 text-white"
                      onClick={() => {
                        setTargetAppForAssessment(app);
                        setAssessmentModalOpen(true);
                      }}
                    >
                      <Send className="mr-1 h-3 w-3" /> Send Assessment
                    </Button>
                  )}

                  {app.status !== 'accepted' && (
                    <Button
                      variant="emerald"
                      size="sm"
                      className="text-xs font-bold"
                      onClick={() => handleUpdateStatus(app._id, 'accepted')}
                    >
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Accept & Start
                    </Button>
                  )}

                  {app.status === 'accepted' && (
                    <Link to={`/workspace/${app.projectId}`}>
                      <Button variant="emerald" size="sm" className="font-bold text-xs">
                        Open Workspace <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  )}

                  {app.status !== 'rejected' && app.status !== 'accepted' && (
                    <button
                      onClick={() => handleUpdateStatus(app._id, 'rejected')}
                      className="text-xs text-red-600 hover:underline p-1 font-semibold"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dossier Modal */}
      {detailApp && (
        <Dialog open={!!detailApp} onOpenChange={() => { setDetailApp(null); setExpandedMemberId(null); }}>
          <DialogHeader>
            <DialogTitle>
              {detailApp.applicantType === 'team'
                ? detailApp.teamDetails?.name || detailApp.team?.name
                : detailApp.student?.name}
            </DialogTitle>
            <DialogDescription>
              {detailApp.applicantType === 'team' ? 'Complete Student Team Dossier' : 'Individual Student Dossier'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs text-slate-700 max-h-[65vh] overflow-y-auto pr-1">
            {/* Status notice if already accepted */}
            {detailApp.status === 'accepted' && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-emerald-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-xs">
                    Candidate Team Accepted • Active Project Collaboration
                  </span>
                </div>
                <Link to={`/workspace/${detailApp.projectId}`}>
                  <Button variant="emerald" size="sm" className="h-7 text-xs font-bold">
                    Workspace <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            )}

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cover Letter & Proposal</p>
              <p className="leading-relaxed whitespace-pre-line text-slate-800">{detailApp.coverLetter}</p>
              {detailApp.proposal && (
                <p className="mt-2 text-slate-800 font-medium">Architecture: {detailApp.proposal}</p>
              )}
            </div>

            {/* Individual Candidate Profile */}
            {detailApp.applicantType !== 'team' && detailApp.studentProfile && (
              <div className="space-y-3 p-3.5 rounded-xl border border-slate-200 bg-white">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Candidate Credentials</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">University</span>
                    <span className="font-semibold text-slate-800 text-[11px]">{detailApp.studentProfile.college || detailApp.studentProfile.university || 'Campus'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Degree</span>
                    <span className="font-semibold text-slate-800 text-[11px]">{detailApp.studentProfile.degree || 'Engineering'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Academic Score</span>
                    <span className="font-bold text-emerald-700 text-[11px]">{detailApp.studentProfile.cgpa ? `${detailApp.studentProfile.cgpa} / 10.0 CGPA` : 'Good Standing'}</span>
                  </div>
                </div>

                {detailApp.studentProfile.skills && detailApp.studentProfile.skills.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Technical Skills ({detailApp.studentProfile.skills.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {detailApp.studentProfile.skills.map((sk: string) => (
                        <span key={sk} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200/70 text-[10px] font-medium">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Team Members List with Click-to-Expand Profile Details */}
            {detailApp.applicantType === 'team' && detailApp.teamDetails?.members && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Team Members ({detailApp.teamDetails.members.length})
                  </p>
                  <span className="text-[11px] text-emerald-700 font-semibold">Click a member to view full profile</span>
                </div>

                <div className="space-y-2.5">
                  {detailApp.teamDetails.members.map((m: any) => {
                    const memberId = m._id || m.userId;
                    const isExpanded = expandedMemberId === memberId;
                    const profile = m.profile || {};
                    const memberName = m.name || m.user?.name || 'Developer';
                    const memberRole = m.role === 'leader' ? 'Team Lead' : 'Developer';
                    const studentIdNum = profile.studentIdNumber || m.user?.studentIdNumber;
                    const skills: string[] = profile.skills || [];

                    return (
                      <div
                        key={memberId}
                        className={`rounded-xl border transition-all overflow-hidden ${
                          isExpanded
                            ? 'border-emerald-400 bg-emerald-50/20 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div
                          onClick={() => setExpandedMemberId(isExpanded ? null : memberId)}
                          className="p-3 flex items-center justify-between cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar src={m.avatar || m.user?.avatar} alt={memberName} size="sm" />
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h5 className="font-bold text-slate-900 text-xs sm:text-sm">{memberName}</h5>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                    m.role === 'leader'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                                  }`}
                                >
                                  {memberRole}
                                </span>
                                {studentIdNum && (
                                  <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-semibold">
                                    ID: {studentIdNum}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {profile.degree || 'B.Tech / Engineering'} • {profile.college || profile.university || 'Undergraduate'}
                                {profile.cgpa && <span className="font-semibold text-slate-700"> • CGPA: {profile.cgpa}</span>}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-slate-400">
                            <span className="text-[11px] font-medium text-emerald-700 hidden sm:inline">
                              {isExpanded ? 'Hide Details' : 'View Full Profile'}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </div>

                        {/* Expanded Full Profile Details */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3 bg-white text-xs text-slate-700 animate-in fade-in duration-150">
                            {/* Academic Credentials */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Institute / College</span>
                                <span className="font-semibold text-slate-800 text-[11px]">{profile.college || profile.university || 'Verified Campus'}</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Degree / Major</span>
                                <span className="font-semibold text-slate-800 text-[11px]">{profile.degree || 'Computer Science / Engineering'}</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Academic Standing</span>
                                <span className="font-bold text-emerald-700 text-[11px]">{profile.cgpa ? `${profile.cgpa} / 10.0 CGPA` : 'Good Standing'}</span>
                              </div>
                            </div>

                            {/* Bio / Overview */}
                            {profile.bio && (
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Candidate Profile</span>
                                <p className="leading-relaxed text-slate-600 text-[11px] bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">{profile.bio}</p>
                              </div>
                            )}

                            {/* Technical Skills */}
                            {skills.length > 0 && (
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                  Technical Skills ({skills.length})
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {skills.map((sk: string) => (
                                    <span
                                      key={sk}
                                      className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200/70 text-[10px] font-medium"
                                    >
                                      {sk}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Member Cover Letter & Statement */}
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Proposal & Cover Letter</span>
                              <p className="leading-relaxed text-slate-700 text-[11px] bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/80">
                                {profile.coverLetter || detailApp.coverLetter || 'Committed to project milestones and deliverables.'}
                              </p>
                            </div>

                            {/* Links & Portfolio */}
                            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                              {profile.githubUrl && (
                                <a
                                  href={profile.githubUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900 hover:underline"
                                >
                                  <Github className="h-3.5 w-3.5" /> GitHub
                                </a>
                              )}
                              {profile.linkedinUrl && (
                                <a
                                  href={profile.linkedinUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:underline"
                                >
                                  <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                                </a>
                              )}
                              {profile.portfolioUrl && (
                                <a
                                  href={profile.portfolioUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" /> Portfolio
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            {detailApp.status !== 'accepted' ? (
              <Button
                variant="emerald"
                size="sm"
                onClick={() => handleUpdateStatus(detailApp._id, 'accepted')}
              >
                Accept Candidate Team
              </Button>
            ) : (
              <Link to={`/workspace/${detailApp.projectId}`}>
                <Button variant="emerald" size="sm" className="font-bold">
                  Open Project Workspace <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
            <Button variant="outline" size="sm" onClick={() => { setDetailApp(null); setExpandedMemberId(null); }}>
              Close
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* Technical Assessment Modal */}
      <Dialog open={assessmentModalOpen} onOpenChange={setAssessmentModalOpen}>
        <DialogHeader>
          <DialogTitle>Assign Technical Assessment</DialogTitle>
          <DialogDescription>
            Send a coding or design assignment before making the final selection decision.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleDispatchAssessment} className="space-y-4 text-left">
          <Input
            label="Assessment Title *"
            value={assessmentTitle}
            onChange={(e) => setAssessmentTitle(e.target.value)}
            required
          />

          <Textarea
            label="Detailed Assignment Instructions & Criteria *"
            placeholder="e.g. Build a standalone microservice with Dockerfile and provide test coverage..."
            value={assessmentInstructions}
            onChange={(e) => setAssessmentInstructions(e.target.value)}
            rows={4}
            required
          />

          <Input
            label="Submission Deadline *"
            type="date"
            value={assessmentDeadline}
            onChange={(e) => setAssessmentDeadline(e.target.value)}
            required
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAssessmentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="default" className="bg-slate-900 font-semibold" isLoading={dispatchingAssessment}>
              Dispatch Assessment
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
