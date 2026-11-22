import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
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
  ChevronDown,
  Clock,
  AlertCircle,
} from 'lucide-react';

export function ExploreTeamsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
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
  const [sentInvitations, setSentInvitations] = useState<any[]>([]);
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
  const [skillQuery, setSkillQuery] = useState(skill);
  const [skillDropdownOpen, setSkillDropdownOpen] = useState(false);

  useEffect(() => {
    setSkillQuery(skill);
  }, [skill]);

  const domainAndSkillOptions = [
    'Full Stack Development',
    'Frontend Development',
    'Backend Development',
    'DevOps & Cloud Architecture',
    'Software Development',
    'Artificial Intelligence & ML',
    'Data Science & Analytics',
    'Mobile App Development',
    'Cyber Security',
    'Blockchain & Web3',
    'IoT & Embedded Systems',
    'Cloud Infrastructure',
    'UI/UX Design',
    'React',
    'Node.js',
    'Python',
    'Go',
    'Docker',
    'Kubernetes',
    'TypeScript',
    'PostgreSQL',
    'MongoDB',
    'Next.js',
    'Flutter',
    'PyTorch',
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
      const [projRes, invRes] = await Promise.all([
        api.get('/projects/company/my'),
        api.get('/invitations/company').catch(() => ({ data: { success: false, data: [] } })),
      ]);

      if (projRes.data.success && projRes.data.data.length > 0) {
        setCompanyProjects(projRes.data.data);
        setSelectedProjectId(projRes.data.data[0]._id);
        if (invRes.data?.success) {
          setSentInvitations(invRes.data.data || []);
        }
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
        // Refresh sent invitations list
        try {
          const invRes = await api.get('/invitations/company');
          if (invRes.data?.success) setSentInvitations(invRes.data.data || []);
        } catch {}
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
      {!location.pathname.startsWith('/company') && <Navbar />}

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

            {/* Domain & Combined Skills - Input with Integrated Dropdown */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Primary Domain / Skill
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Select domain or skill..."
                  value={skillQuery}
                  onFocus={() => setSkillDropdownOpen(true)}
                  onChange={(e) => {
                    setSkillQuery(e.target.value);
                    setSkillDropdownOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      updateParam('skill', skillQuery);
                      setSkillDropdownOpen(false);
                    }
                  }}
                  className="w-full pl-3 pr-8 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {skill && (
                    <button
                      type="button"
                      onClick={() => {
                        updateParam('skill', '');
                        setSkillQuery('');
                      }}
                      className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                      title="Clear domain/skill"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSkillDropdownOpen((prev) => !prev)}
                    className="text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${skillDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Dropdown Menu */}
              {skillDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setSkillDropdownOpen(false)}
                  />
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-52 overflow-y-auto py-1">
                    <button
                      type="button"
                      onClick={() => {
                        updateParam('skill', '');
                        setSkillQuery('');
                        setSkillDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-slate-50 flex items-center justify-between ${
                        !skill ? 'text-emerald-700 font-bold bg-emerald-50/60' : 'text-slate-700'
                      }`}
                    >
                      <span>All Domains & Skills</span>
                      {!skill && <span className="text-[10px] text-emerald-600 font-bold">Active</span>}
                    </button>
                    {domainAndSkillOptions
                      .filter((opt) => !skillQuery || opt.toLowerCase().includes(skillQuery.toLowerCase()))
                      .map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            updateParam('skill', opt);
                            setSkillQuery(opt);
                            setSkillDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-slate-50 flex items-center justify-between ${
                            skill.toLowerCase() === opt.toLowerCase()
                              ? 'text-emerald-700 font-bold bg-emerald-50/60'
                              : 'text-slate-700'
                          }`}
                        >
                          <span>{opt}</span>
                          {skill.toLowerCase() === opt.toLowerCase() && (
                            <span className="text-[10px] text-emerald-600 font-bold">Active</span>
                          )}
                        </button>
                      ))}
                    {domainAndSkillOptions.filter((opt) =>
                      !skillQuery || opt.toLowerCase().includes(skillQuery.toLowerCase())
                    ).length === 0 && (
                      <div className="px-3 py-2 text-xs text-slate-400">
                        Press Enter to filter by &quot;{skillQuery}&quot;
                      </div>
                    )}
                  </div>
                </>
              )}
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
                    type="button"
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

              {/* Exact Team Size Input */}
              <div className="mt-3 pt-2.5 border-t border-slate-100">
                <label className="block text-[11px] font-medium text-slate-500 mb-1.5">
                  Exact Team Size
                </label>
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <Users className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="number"
                      min="1"
                      max="25"
                      placeholder="e.g. 5"
                      value={teamSize !== 'all' ? teamSize : ''}
                      onChange={(e) => updateParam('teamSize', e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  {teamSize !== 'all' && (
                    <button
                      type="button"
                      onClick={() => updateParam('teamSize', 'all')}
                      className="text-xs text-slate-400 hover:text-slate-600 p-1.5 rounded hover:bg-slate-100"
                      title="Clear team size"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
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

                        {team.primaryDomain && (
                          <div className="mb-2.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200/70">
                              <Sparkles className="h-3 w-3 text-emerald-600" /> {team.primaryDomain}
                            </span>
                          </div>
                        )}

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

        {(() => {
          const activeInviteForTeam = sentInvitations.find(
            (inv) =>
              inv.projectId === selectedProjectId &&
              inv.teamId === targetTeamForInvite?._id
          );
          const isAlreadyAccepted = activeInviteForTeam?.status === 'accepted';
          const isAlreadyPending = activeInviteForTeam?.status === 'pending';
          const isPreviouslyRejected = activeInviteForTeam?.status === 'rejected';

          return (
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
                  {companyProjects.map((p) => {
                    const inv = sentInvitations.find(
                      (i) => i.projectId === p._id && i.teamId === targetTeamForInvite?._id
                    );
                    let labelSuffix = '';
                    if (inv?.status === 'accepted') labelSuffix = ' [Already Accepted]';
                    else if (inv?.status === 'pending') labelSuffix = ' [Invitation Pending]';
                    else if (inv?.status === 'rejected') labelSuffix = ' [Declined - Can Re-invite]';

                    return (
                      <option key={p._id} value={p._id}>
                        {p.title} ({p.preferredTeamSize} Devs • {p.workMode}){labelSuffix}
                      </option>
                    );
                  })}
                </select>
              </div>

              {isAlreadyAccepted && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    Team <strong>&quot;{targetTeamForInvite?.name}&quot;</strong> has already accepted the invitation for this project.
                  </span>
                </div>
              )}

              {isAlreadyPending && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
                  <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>
                    An active invitation for this project is currently pending for team <strong>&quot;{targetTeamForInvite?.name}&quot;</strong>. Duplicate invitations are prevented until a response is received.
                  </span>
                </div>
              )}

              {isPreviouslyRejected && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2.5">
                  <AlertCircle className="h-4 w-4 text-slate-500 shrink-0" />
                  <span>
                    The previous invitation was declined by the team. You can send a revised invitation proposal below.
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Invitation Note / Deliverable Context
                </label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="We reviewed your team's combined skills and would like you to build this project..."
                  disabled={isAlreadyAccepted || isAlreadyPending}
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50 disabled:opacity-60"
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setInviteModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="emerald"
                  isLoading={inviting}
                  disabled={isAlreadyAccepted || isAlreadyPending}
                >
                  {isAlreadyAccepted
                    ? 'Already Joined'
                    : isAlreadyPending
                    ? 'Invitation Already Pending'
                    : 'Send Team Invitation'}
                </Button>
              </DialogFooter>
            </form>
          );
        })()}
      </Dialog>

      {!location.pathname.startsWith('/company') && <Footer />}
    </div>
  );
}
