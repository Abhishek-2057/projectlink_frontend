import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { IStudentProfile, ITeam } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { Avatar, Skeleton } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog';
import { toast } from 'sonner';
import { Search, Filter, UserPlus, GraduationCap, Github, Linkedin, Award, X } from 'lucide-react';

export function FindTeammatesPage() {
  const { user } = useAuthStore();
  const [students, setStudents] = useState<IStudentProfile[]>([]);
  const [myTeams, setMyTeams] = useState<ITeam[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');
  const [minCgpa, setMinCgpa] = useState('');

  // Invite Modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [targetStudent, setTargetStudent] = useState<IStudentProfile | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviting, setInviting] = useState(false);

  const fetchStudentsAndTeams = async () => {
    setLoading(true);
    try {
      const [stdRes, teamRes] = await Promise.all([
        api.get(`/students?search=${search}&skill=${skill}&minCgpa=${minCgpa}&limit=18`),
        api.get('/teams/me'),
      ]);

      if (stdRes.data.success) {
        // Filter out current user
        const others = stdRes.data.data.filter((s: any) => s.userId !== user?._id);
        setStudents(others);
      }
      if (teamRes.data.success) {
        const ledTeams = teamRes.data.data.filter((t: any) => t.leaderId === user?._id || t.myRole === 'leader');
        setMyTeams(ledTeams);
        if (ledTeams.length > 0) setSelectedTeamId(ledTeams[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsAndTeams();
  }, [skill, minCgpa]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudentsAndTeams();
  };

  const openInviteModal = (student: IStudentProfile) => {
    if (myTeams.length === 0) {
      toast.error('You must lead a team to send invitations. Create a team first in Team Management.');
      return;
    }
    setTargetStudent(student);
    setInviteModalOpen(true);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStudent || !selectedTeamId) return;

    setInviting(true);
    try {
      const res = await api.post(`/teams/${selectedTeamId}/invitations`, {
        receiverId: targetStudent.userId,
        message: inviteMessage,
      });

      if (res.data.success) {
        toast.success(`Team invitation sent to ${targetStudent.user?.name}!`);
        setInviteModalOpen(false);
        setInviteMessage('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error sending invitation');
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Find Teammates</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Search fellow engineering students with complementary skills to build your project dream team.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-sm w-full">
          <Input
            placeholder="Search name, skills, college..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" variant="default" size="sm" className="bg-slate-900 font-semibold shrink-0">
            Search
          </Button>
        </form>
      </div>

      {/* Quick Skill Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">
          Filter Skill:
        </span>
        {['All', 'React', 'Node.js', 'Python', 'Go', 'Kubernetes', 'PyTorch', 'Three.js'].map((s) => {
          const val = s === 'All' ? '' : s;
          const isActive = skill === val;
          return (
            <button
              key={s}
              onClick={() => setSkill(val)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                isActive
                  ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-6 rounded-xl border border-slate-200 bg-white space-y-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && students.length === 0 && (
        <EmptyState
          icon={GraduationCap}
          title="No teammates found matching your query"
          description="Try broadening your search or resetting skill filters."
          actionText="Reset Search"
          onAction={() => {
            setSearch('');
            setSkill('');
            setMinCgpa('');
          }}
        />
      )}

      {/* Candidates Grid */}
      {!loading && students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {students.map((student) => (
            <Card key={student._id} className="hover:border-emerald-300 transition-all flex flex-col justify-between">
              <CardContent className="p-5 flex-1 flex flex-col justify-between">
                <div>
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

                  <div className="flex flex-wrap gap-1 mb-4">
                    {student.skills?.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    {student.githubUrl && <Github className="h-4 w-4" />}
                    {student.linkedinUrl && <Linkedin className="h-4 w-4" />}
                  </div>

                  <Button
                    variant="emerald"
                    size="sm"
                    className="text-xs font-semibold"
                    onClick={() => openInviteModal(student)}
                  >
                    <UserPlus className="mr-1 h-3.5 w-3.5" /> Invite to Team
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogHeader>
          <DialogTitle>Invite {targetStudent?.user?.name} to Join Your Team</DialogTitle>
          <DialogDescription>
            Select which student team you want to invite them to join.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSendInvite} className="space-y-4 text-left">
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
                  {t.name} ({t.memberCount} members)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Message / Pitch
            </label>
            <textarea
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              placeholder="Hey! We saw your profile and would love to have you join our team for our software project..."
              className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={3}
            />
          </div>

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
