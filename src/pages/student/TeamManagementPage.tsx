import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { ITeam } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { EmptyState } from '../../components/ui/EmptyState';
import { toast } from 'sonner';
import {
  Users,
  PlusCircle,
  UserPlus,
  Shield,
  Trash2,
  LogOut,
  ArrowRight,
  Sparkles,
  Star,
  CheckCircle2,
  Search,
  Eye,
  ExternalLink,
  GraduationCap,
  Briefcase,
  Award,
  FolderGit2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export function TeamManagementPage() {
  const { user } = useAuthStore();
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Team Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [college, setCollege] = useState('');
  const [skillsText, setSkillsText] = useState('React, Node.js, TypeScript');
  const [creating, setCreating] = useState(false);

  // Invite Member Modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [activeTeamForInvite, setActiveTeamForInvite] = useState<any>(null);
  const [studentIdInput, setStudentIdInput] = useState('');
  const [lookedUpStudent, setLookedUpStudent] = useState<any>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviting, setInviting] = useState(false);

  // View Profile Modal
  const [profileDetailModalOpen, setProfileDetailModalOpen] = useState(false);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teams/me');
      if (res.data.success) {
        setTeams(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !teamDescription.trim()) {
      toast.error('Team name and description are required');
      return;
    }

    setCreating(true);
    try {
      const skills = skillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await api.post('/teams', {
        name: teamName,
        description: teamDescription,
        college: college || 'Engineering Institute',
        skills,
      });

      if (res.data.success) {
        toast.success(`Team "${teamName}" created successfully!`);
        setCreateModalOpen(false);
        setTeamName('');
        setTeamDescription('');
        fetchTeams();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error creating team');
    } finally {
      setCreating(false);
    }
  };

  const handleOpenInvite = (team: any) => {
    setActiveTeamForInvite(team);
    setStudentIdInput('');
    setLookedUpStudent(null);
    setLookupError('');
    setInviteMessage(`Join ${team.name} for final-year project collaboration!`);
    setInviteModalOpen(true);
  };

  // Perform lookup by Student ID (e.g. 849201AB)
  const performLookup = async (idToSearch: string) => {
    const clean = idToSearch.trim();
    if (!clean) {
      setLookedUpStudent(null);
      setLookupError('');
      return;
    }

    setLookupLoading(true);
    setLookupError('');
    try {
      const res = await api.get(`/students/lookup/${encodeURIComponent(clean)}`);
      if (res.data.success && res.data.data) {
        setLookedUpStudent(res.data.data);
        setLookupError('');
      } else {
        setLookedUpStudent(null);
        setLookupError('No student found with this ID');
      }
    } catch (err: any) {
      setLookedUpStudent(null);
      setLookupError(err.response?.data?.message || `No student found with ID "${clean}"`);
    } finally {
      setLookupLoading(false);
    }
  };

  // Debounced auto-search when user enters student ID
  useEffect(() => {
    const clean = studentIdInput.trim();
    if (!clean || clean.length < 3) {
      setLookedUpStudent(null);
      setLookupError('');
      return;
    }

    const timer = setTimeout(() => {
      performLookup(clean);
    }, 450);

    return () => clearTimeout(timer);
  }, [studentIdInput]);

  const handleSendTeamInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTeamForInvite || !lookedUpStudent) return;

    setInviting(true);
    try {
      const res = await api.post(`/teams/${activeTeamForInvite._id}/invitations`, {
        receiverId: lookedUpStudent.userId || lookedUpStudent._id,
        message: inviteMessage,
      });

      if (res.data.success) {
        toast.success(`Invitation sent to ${lookedUpStudent.user?.name || 'candidate'}!`);
        setInviteModalOpen(false);
        setStudentIdInput('');
        setLookedUpStudent(null);
        setInviteMessage('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleLeaveTeam = async (teamId: string) => {
    if (!window.confirm('Are you sure you want to leave this team?')) return;
    try {
      const res = await api.post(`/teams/${teamId}/leave`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchTeams();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error leaving team');
    }
  };

  const handleRemoveMember = async (teamId: string, memberId: string) => {
    if (!window.confirm('Remove this member from the team?')) return;
    try {
      const res = await api.delete(`/teams/${teamId}/members/${memberId}`);
      if (res.data.success) {
        toast.success('Member removed');
        fetchTeams();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error removing member');
    }
  };

  // Check if looked up student is already in active team
  const isAlreadyMember = lookedUpStudent && activeTeamForInvite?.members?.some(
    (m: any) => (m.userId === lookedUpStudent.userId || m._id === lookedUpStudent.userId)
  );

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Core Differentiator
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Team Hub</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Create teams with your classmates, combine technical skillsets, and submit unified applications for industry software projects.
          </p>
        </div>

        <Button
          variant="default"
          onClick={() => setCreateModalOpen(true)}
          className="font-bold bg-slate-900 text-white hover:bg-slate-800 shrink-0"
        >
          <PlusCircle className="mr-1.5 h-4 w-4 text-emerald-400" /> Create New Team
        </Button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-12 text-center text-sm text-slate-500">Loading your teams...</div>
      )}

      {/* Empty State */}
      {!loading && teams.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-2xs text-center">
          <EmptyState
            icon={Users}
            title="You are not part of any team yet"
            description="Create a team to collaborate with peers, combine technical stacks, and apply for group industry projects."
            actionText="Create a Team"
            onAction={() => setCreateModalOpen(true)}
          />
        </div>
      )}

      {/* Team Cards Grid */}
      {!loading && teams.length > 0 && (
        <div className="space-y-6">
          {teams.map((team) => {
            const isLeader = team.leaderId === user?._id;
            return (
              <Card key={team._id} className="p-6 border-slate-200/90 hover:border-slate-300 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Avatar src={team.avatar} alt={team.name} size="lg" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900">{team.name}</h2>
                        {isLeader ? (
                          <Badge variant="emerald" className="text-[10px]">Team Leader</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">Member</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {team.college} • {team.membersCount || team.members?.length || 1} Members
                      </p>
                      <p className="text-sm text-slate-600 pt-1 leading-relaxed max-w-2xl">
                        {team.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isLeader && (
                      <Button
                        variant="emerald"
                        size="sm"
                        onClick={() => handleOpenInvite(team)}
                        className="text-xs font-bold"
                      >
                        <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Invite Member
                      </Button>
                    )}
                    {!isLeader && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLeaveTeam(team._id)}
                        className="text-xs text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="mr-1.5 h-3.5 w-3.5" /> Leave Team
                      </Button>
                    )}
                  </div>
                </div>

                {/* Combined Skillset */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Combined Team Technical Stack
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(team.combinedSkills || team.skills || []).map((skill: string) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Members List */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Team Members ({team.members?.length || 0})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {team.members?.map((m: any) => (
                      <div
                        key={m.userId || m._id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar src={m.user?.avatar} alt={m.user?.name} size="sm" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {m.user?.name || 'Member'}
                            </p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                              {m.role || 'Member'}
                            </p>
                          </div>
                        </div>

                        {isLeader && m.userId !== user?._id && (
                          <button
                            onClick={() => handleRemoveMember(team._id, m.userId)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Remove member"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Team Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogHeader>
          <DialogTitle>Create a New Student Team</DialogTitle>
          <DialogDescription>
            Form a collaborative unit with classmates to pool complementary skillsets.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateTeam} className="space-y-4 text-left">
          <Input
            label="Team Name"
            placeholder="e.g. AlgoWarriors / CloudMatrix"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
          />

          <Textarea
            label="Team Mission & Project Interests"
            placeholder="Describe what kind of projects your team aims to build..."
            value={teamDescription}
            onChange={(e) => setTeamDescription(e.target.value)}
            rows={3}
            required
          />

          <Input
            label="College / Institute"
            placeholder="e.g. IIT BHU / BITS Pilani"
            value={college}
            onChange={(e) => setCollege(e.target.value)}
          />

          <Input
            label="Initial Technical Stack (Comma-separated)"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="default" className="bg-slate-900" isLoading={creating}>
              Create Team
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Invite Member Modal - BY STUDENT ID */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogHeader>
          <DialogTitle>Invite Student to {activeTeamForInvite?.name}</DialogTitle>
          <DialogDescription>
            Enter the student&apos;s unique Student ID (6 digits + 2 alphabets) to send an invitation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSendTeamInvite} className="space-y-4 text-left">
          {/* Student ID Input with Search */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Enter Student ID
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="e.g. 849201AB"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value.toUpperCase())}
                  className="font-mono uppercase tracking-wider"
                  required
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => performLookup(studentIdInput)}
                disabled={lookupLoading || !studentIdInput.trim()}
                className="shrink-0"
              >
                {lookupLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                ) : (
                  <>
                    <Search className="h-3.5 w-3.5 mr-1 text-slate-500" /> Find
                  </>
                )}
              </Button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Ask your candidate for their 8-character Student ID (e.g. <span className="font-mono font-semibold">849201AB</span>).
            </p>
          </div>

          {/* Loading Indicator */}
          {lookupLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
              Searching student database...
            </div>
          )}

          {/* Error / Not Found */}
          {!lookupLoading && lookupError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{lookupError}</span>
            </div>
          )}

          {/* Student Found Preview Card */}
          {!lookupLoading && lookedUpStudent && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={lookedUpStudent.user?.avatar}
                    alt={lookedUpStudent.user?.name}
                    size="md"
                    className="border border-emerald-300"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {lookedUpStudent.user?.name || 'Student Candidate'}
                    </h4>
                    <p className="text-xs text-slate-600">
                      {lookedUpStudent.degree} • {lookedUpStudent.college}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>CGPA: <strong className="text-slate-800">{lookedUpStudent.cgpa || 'N/A'}</strong></span>
                      <span>•</span>
                      <span>Grad: <strong className="text-slate-800">{lookedUpStudent.graduationYear}</strong></span>
                      {lookedUpStudent.studentIdNumber && (
                        <>
                          <span>•</span>
                          <span className="font-mono font-bold text-emerald-800">
                            ID: {lookedUpStudent.studentIdNumber}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* View Profile Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setProfileDetailModalOpen(true)}
                  className="bg-white hover:bg-slate-50 border-emerald-300 text-emerald-800 text-xs font-bold shrink-0"
                >
                  <Eye className="mr-1.5 h-3.5 w-3.5 text-emerald-600" /> View Profile
                </Button>
              </div>

              {/* Skills Preview */}
              {lookedUpStudent.skills && lookedUpStudent.skills.length > 0 && (
                <div className="pt-2 border-t border-emerald-100 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 mr-1">
                    Skills:
                  </span>
                  {lookedUpStudent.skills.slice(0, 5).map((sk: string) => (
                    <Badge key={sk} variant="emerald" className="text-[10px] px-2 py-0">
                      {sk}
                    </Badge>
                  ))}
                  {lookedUpStudent.skills.length > 5 && (
                    <span className="text-[10px] text-slate-500 font-medium">
                      +{lookedUpStudent.skills.length - 5} more
                    </span>
                  )}
                </div>
              )}

              {/* Already Member Warning */}
              {isAlreadyMember && (
                <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  This student is already a member of &quot;{activeTeamForInvite?.name}&quot;.
                </div>
              )}
            </div>
          )}

          {/* Invitation Message */}
          <Textarea
            label="Invitation Message"
            placeholder="Join our team to collaborate on final-year industry projects..."
            value={inviteMessage}
            onChange={(e) => setInviteMessage(e.target.value)}
            rows={3}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="emerald"
              isLoading={inviting}
              disabled={!lookedUpStudent || isAlreadyMember || inviting}
            >
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Candidate Full Profile Detail Modal */}
      <Dialog open={profileDetailModalOpen} onOpenChange={setProfileDetailModalOpen}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Candidate Profile Details</DialogTitle>
              <DialogDescription>
                Full academic history, skills, and project experience.
              </DialogDescription>
            </div>
            {lookedUpStudent?.userId && (
              <a
                href={`/students/${lookedUpStudent.userId}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 mr-4"
              >
                Open in tab <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </DialogHeader>

        {lookedUpStudent && (
          <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1 text-left">
            {/* Header info */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/90">
              <Avatar
                src={lookedUpStudent.user?.avatar}
                alt={lookedUpStudent.user?.name}
                size="lg"
                className="border-2 border-white shadow-2xs"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {lookedUpStudent.user?.name}
                  </h3>
                  {lookedUpStudent.studentIdNumber && (
                    <Badge variant="emerald" className="font-mono text-xs">
                      ID: {lookedUpStudent.studentIdNumber}
                    </Badge>
                  )}
                </div>
                <p className="text-xs font-semibold text-emerald-700">
                  {lookedUpStudent.degree} • {lookedUpStudent.college}
                </p>
                <p className="text-xs text-slate-500">
                  CGPA: <strong>{lookedUpStudent.cgpa || 'N/A'}</strong> • Class of {lookedUpStudent.graduationYear}
                </p>
              </div>
            </div>

            {/* Bio */}
            {lookedUpStudent.bio && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">About</h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                  {lookedUpStudent.bio}
                </p>
              </div>
            )}

            {/* Skills */}
            {lookedUpStudent.skills && lookedUpStudent.skills.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Technical Competencies ({lookedUpStudent.skills.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {lookedUpStudent.skills.map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Work Experience / Internships */}
            {(lookedUpStudent.workExperience || lookedUpStudent.experience) && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400" /> Experience & Internships
                </h4>
                <div className="space-y-2">
                  {(lookedUpStudent.workExperience || lookedUpStudent.experience || []).map((exp: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <p className="font-bold text-slate-900">{exp.role || exp.title} - <span className="font-normal text-slate-600">{exp.company}</span></p>
                      {exp.duration && <p className="text-[11px] text-slate-500">{exp.duration}</p>}
                      {exp.description && <p className="text-slate-600 text-[11px] leading-relaxed">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {lookedUpStudent.projects && lookedUpStudent.projects.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FolderGit2 className="h-3.5 w-3.5 text-slate-400" /> Projects
                </h4>
                <div className="space-y-2">
                  {lookedUpStudent.projects.map((proj: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900">{proj.title}</p>
                        {proj.liveUrl && (
                          <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline inline-flex items-center gap-1 text-[11px]">
                            Live Demo <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      {proj.description && <p className="text-slate-600 text-[11px] leading-relaxed">{proj.description}</p>}
                      {proj.technologies && (
                        <p className="text-[10px] text-slate-400 font-mono">
                          Tech: {Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="default" onClick={() => setProfileDetailModalOpen(false)} className="bg-slate-900 text-white">
            Close Profile
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
