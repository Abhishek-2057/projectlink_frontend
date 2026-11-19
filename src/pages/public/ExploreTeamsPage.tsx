import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { ITeam, IProject } from '../../types';
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
  Users,
  Search,
  Filter,
  Star,
  Send,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Award,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';

export function ExploreTeamsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();

  const [teams, setTeams] = useState<ITeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Selected Team for View details modal
  const [selectedTeam, setSelectedTeam] = useState<any>(null);

  // Invitation state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [targetTeamForInvite, setTargetTeamForInvite] = useState<ITeam | null>(null);
  const [companyProjects, setCompanyProjects] = useState<IProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviting, setInviting] = useState(false);

  // Filter params
  const search = searchParams.get('search') || '';
  const skill = searchParams.get('skill') || '';
  const college = searchParams.get('college') || '';
  const teamSize = searchParams.get('teamSize') || 'all';

  const [searchInput, setSearchInput] = useState(search);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const skillsList = [
    'Kubernetes',
    'PyTorch',
    'React',
    'Node.js',
    'Go',
    'Three.js',
    'Flutter',
    'Docker',
    'Kafka',
  ];

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
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

  const handleOpenTeamModal = async (teamId: string) => {
    try {
      const res = await api.get(`/teams/${teamId}`);
      if (res.data.success) {
        setSelectedTeam(res.data.data);
      }
    } catch {
      toast.error('Could not load team details');
    }
  };

  const handleOpenInvite = async (team: ITeam) => {
    if (!user || user.role !== 'company') {
      toast.error('Only registered companies can invite student teams');
      return;
    }

    setTargetTeamForInvite(team);
    try {
      const res = await api.get('/projects/company/my');
      if (res.data.success && res.data.data.length > 0) {
        setCompanyProjects(res.data.data);
        setSelectedProjectId(res.data.data[0]._id);
        setInviteModalOpen(true);
      } else {
        toast.error('You need at least one published project before inviting teams');
      }
    } catch {
      toast.error('Failed to load company projects');
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTeamForInvite || !selectedProjectId) return;

    setInviting(true);
    try {
      const res = await api.post('/invitations/company', {
        projectId: selectedProjectId,
        targetType: 'team',
        targetId: targetTeamForInvite._id,
        message: inviteMessage,
      });

      if (res.data.success) {
        toast.success(`Project invitation dispatched to ${targetTeamForInvite.name}!`);
        setInviteModalOpen(false);
        setInviteMessage('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error inviting team');
    } finally {
      setInviting(false);
    }
  };

  useEffect(() => {
    async function fetchTeams() {
      setLoading(true);
      try {
        const query = searchParams.toString();
        const res = await api.get(`/teams?${query}&limit=12`);
        if (res.data.success) {
          setTeams(res.data.data);
          setTotal(res.data.pagination.total);
        }
      } catch (err) {
        console.error('Error fetching teams:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTeams();
  }, [searchParams]);

  const activeFilterCount =
    (search ? 1 : 0) +
    (skill ? 1 : 0) +
    (teamSize !== 'all' ? 1 : 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                <Sparkles className="h-3.5 w-3.5" /> Core Marketplace Differentiator
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Explore Student Developer Teams
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Discover pre-formed student teams with combined engineering stacks, joint GitHub portfolios, and vetted academic credentials.
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search team name, skill, college..."
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
            <span>{mobileFiltersOpen ? 'Hide Filters' : 'Filter Teams'}</span>
            {activeFilterCount > 0 && (
              <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
            >
              Reset All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Filters Sidebar */}
          <div
            className={`bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-6 ${
              mobileFiltersOpen ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-emerald-600" /> Filter Teams
              </span>
              {(search || skill || teamSize !== 'all') && (
                <button onClick={clearFilters} className="text-xs text-red-600 hover:underline flex items-center gap-0.5">
                  <X className="h-3 w-3" /> Reset
                </button>
              )}
            </div>

            {/* Combined Skills */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Combined Team Skill
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

            {/* Team Size */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Team Size
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-center">
                {['all', '2', '3', '4'].map((size) => (
                  <button
                    key={size}
                    onClick={() => updateParam('teamSize', size)}
                    className={`py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      teamSize === size
                        ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {size === 'all' ? 'All' : `${size}p`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Teams Grid Column */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2">
              <span>Showing <strong className="text-slate-900">{teams.length}</strong> active teams</span>
            </div>

            {/* Loading */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="p-6 rounded-xl border border-slate-200 bg-white space-y-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && teams.length === 0 && (
              <EmptyState
                icon={Users}
                title="No student teams match your query"
                description="Try clearing your filters or searching for different technical skillsets."
                actionText="Reset Filters"
                onAction={clearFilters}
              />
            )}

            {/* Team Cards Grid */}
            {!loading && teams.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {teams.map((team) => (
                  <Card key={team._id} className="hover:border-emerald-300 transition-all flex flex-col justify-between">
                    <CardContent className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Avatar & Title */}
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar src={team.avatar} alt={team.name} fallback={team.name[0]} size="md" />
                          <div className="overflow-hidden">
                            <h3 className="text-sm font-bold text-slate-900 truncate">{team.name}</h3>
                            <p className="text-xs text-slate-500 truncate">{team.college}</p>
                            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                              <Star className="h-3 w-3 fill-emerald-600 text-emerald-600 inline" />
                              {team.rating || 5.0} • {team.completedProjectsCount} projects completed
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                          {team.description}
                        </p>

                        {/* Combined skills */}
                        <div className="mb-4">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                            Combined Skills
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {team.skills?.slice(0, 4).map((s) => (
                              <span
                                key={s}
                                className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200/60"
                              >
                                {s}
                              </span>
                            ))}
                            {(team.skills?.length || 0) > 4 && (
                              <span className="px-1 text-[10px] text-slate-400">
                                +{(team.skills?.length || 0) - 4}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Members & Actions */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center -space-x-1.5 overflow-hidden">
                          {team.members?.slice(0, 4).map((m, idx) => (
                            <Avatar key={idx} src={m.avatar} alt={m.name} size="sm" className="border-2 border-white" />
                          ))}
                          <span className="text-[11px] font-medium text-slate-500 pl-2">
                            {team.memberCount} Devs
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenTeamModal(team._id)}
                            className="text-xs font-bold text-slate-800 hover:text-emerald-700"
                          >
                            Details
                          </button>

                          {user?.role === 'company' && (
                            <Button
                              variant="default"
                              size="sm"
                              className="text-xs font-semibold bg-slate-900"
                              onClick={() => handleOpenInvite(team)}
                            >
                              <Send className="mr-1 h-3 w-3" /> Invite
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Team Profile Modal */}
      {selectedTeam && (
        <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <Avatar src={selectedTeam.avatar} alt={selectedTeam.name} size="lg" />
              <div>
                <DialogTitle>{selectedTeam.name}</DialogTitle>
                <DialogDescription>{selectedTeam.college}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 text-xs text-slate-700 max-h-[60vh] overflow-y-auto pr-1">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Overview</p>
              <p className="leading-relaxed">{selectedTeam.description}</p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Combined Skillset</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedTeam.skills?.map((s: string) => (
                  <Badge key={s} variant="emerald">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Team Members ({selectedTeam.members?.length})</p>
              <div className="space-y-2">
                {selectedTeam.members?.map((m: any) => (
                  <div key={m._id} className="p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar src={m.avatar} alt={m.name} size="sm" />
                      <div>
                        <h5 className="font-bold text-slate-900">{m.name}</h5>
                        <p className="text-[10px] text-slate-500">{m.degree || 'Computer Science'}</p>
                      </div>
                    </div>
                    <Badge variant={m.role === 'leader' ? 'default' : 'secondary'} className="text-[10px]">
                      {m.role === 'leader' ? 'Team Lead' : 'Developer'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            {user?.role === 'company' && (
              <Button
                variant="emerald"
                size="sm"
                onClick={() => {
                  const t = selectedTeam;
                  setSelectedTeam(null);
                  handleOpenInvite(t);
                }}
              >
                <Send className="mr-1.5 h-3.5 w-3.5" /> Invite Team to Project
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setSelectedTeam(null)}>
              Close
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* Company Invite Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogHeader>
          <DialogTitle>Invite Team to Project</DialogTitle>
          <DialogDescription>
            Send an invitation to team &quot;{targetTeamForInvite?.name}&quot; for your published project.
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
              Invitation Note / Deliverable Context
            </label>
            <textarea
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              placeholder="We reviewed your team's combined skills and would like you to build this project..."
              className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="emerald" isLoading={inviting}>
              Send Team Invitation
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      <Footer />
    </div>
  );
}
