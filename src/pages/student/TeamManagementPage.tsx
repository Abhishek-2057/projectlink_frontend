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
  const [candidateSearch, setCandidateSearch] = useState('');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviting, setInviting] = useState(false);

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

  const handleOpenInvite = async (team: any) => {
    setActiveTeamForInvite(team);
    setInviteModalOpen(true);
    // Fetch students list for autocomplete
    try {
      const res = await api.get('/students?limit=20');
      if (res.data.success) {
        // Exclude current user and existing members
        const currentMemberIds = new Set(team.members?.map((m: any) => m._id || m.userId));
        currentMemberIds.add(user?._id);
        const eligible = res.data.data.filter((s: any) => !currentMemberIds.has(s.userId));
        setCandidates(eligible);
        if (eligible.length > 0) setSelectedCandidateId(eligible[0].userId);
      }
    } catch {
      // Ignore
    }
  };

  const handleSendTeamInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTeamForInvite || !selectedCandidateId) return;

    setInviting(true);
    try {
      const res = await api.post(`/teams/${activeTeamForInvite._id}/invitations`, {
        receiverId: selectedCandidateId,
        message: inviteMessage,
      });

      if (res.data.success) {
        toast.success('Invitation sent to candidate!');
        setInviteModalOpen(false);
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
        <EmptyState
          icon={Users}
          title="You are not part of any team yet"
          description="Form a final-year development team with your classmates or discover other student profiles to invite."
          actionText="Create Your First Team"
          onAction={() => setCreateModalOpen(true)}
        />
      )}

      {/* Teams List */}
      {!loading && teams.length > 0 && (
        <div className="space-y-8">
          {teams.map((team) => {
            const isLeader = team.leaderId === user?._id || team.myRole === 'leader';
            return (
              <Card key={team._id} className="p-6 sm:p-8 space-y-6">
                {/* Team Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <Avatar src={team.avatar} alt={team.name} size="lg" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900">{team.name}</h2>
                        <Badge variant={isLeader ? 'default' : 'secondary'} className="text-[10px]">
                          {isLeader ? 'You are Team Leader' : 'Active Member'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{team.college}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {isLeader && (
                      <Button
                        variant="emerald"
                        size="sm"
                        onClick={() => handleOpenInvite(team)}
                        className="font-semibold text-xs"
                      >
                        <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Invite Teammate
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLeaveTeam(team._id)}
                      className="text-xs text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="mr-1 h-3.5 w-3.5" /> Leave Team
                    </Button>
                  </div>
                </div>

                {/* Team Description & Combined Skills */}
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {team.description}
                  </p>

                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Aggregated Combined Skillset ({team.skills?.length || 0})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {team.skills?.map((s: string) => (
                        <Badge key={s} variant="emerald" className="text-xs font-semibold">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Members Roster */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Team Members ({team.members?.length || 0})
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {team.members?.map((m: any) => (
                      <div
                        key={m._id || m.userId}
                        className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <Avatar src={m.avatar} alt={m.name} size="sm" />
                          <div className="overflow-hidden">
                            <h5 className="text-xs font-bold text-slate-900 truncate">{m.name}</h5>
                            <span className="text-[10px] text-slate-500">
                              {m.role === 'leader' ? '⭐ Team Lead' : 'Developer'}
                            </span>
                          </div>
                        </div>

                        {isLeader && m._id !== user?._id && m.userId !== user?._id && (
                          <button
                            onClick={() => handleRemoveMember(team._id, m._id || m.userId)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded"
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
          <DialogTitle>Create Student Team</DialogTitle>
          <DialogDescription>
            You will become the team leader and can invite fellow student developers.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateTeam} className="space-y-4 text-left">
          <Input
            label="Team Name *"
            placeholder="e.g. Distributed Cloud Pioneers"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
          />

          <Textarea
            label="Team Focus & Description *"
            placeholder="Describe your team's specialties and what project domains you want to build..."
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

      {/* Invite Member Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogHeader>
          <DialogTitle>Invite Student to {activeTeamForInvite?.name}</DialogTitle>
          <DialogDescription>
            Select a candidate from the marketplace or enter their student ID.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSendTeamInvite} className="space-y-4 text-left">
          {candidates.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Candidate
              </label>
              <select
                value={selectedCandidateId}
                onChange={(e) => setSelectedCandidateId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {candidates.map((c) => (
                  <option key={c.userId} value={c.userId}>
                    {c.user?.name} ({c.degree} • {c.college})
                  </option>
                ))}
              </select>
            </div>
          )}

          <Input
            label="Or Enter Student ID directly"
            placeholder="e.g. std_usr_002"
            value={selectedCandidateId}
            onChange={(e) => setSelectedCandidateId(e.target.value)}
            required
          />

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
            <Button type="submit" variant="emerald" isLoading={inviting}>
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
