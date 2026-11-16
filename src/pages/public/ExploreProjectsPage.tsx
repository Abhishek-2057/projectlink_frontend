import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { IProject } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Skeleton } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  Bookmark,
  Users,
  Clock,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Briefcase,
  X,
} from 'lucide-react';

export function ExploreProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();

  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters state from URL query params
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'all';
  const type = searchParams.get('type') || 'all';
  const workMode = searchParams.get('workMode') || 'all';
  const teamSize = searchParams.get('teamSize') || 'all';
  const sort = searchParams.get('sort') || 'latest';
  const page = Number(searchParams.get('page') || '1');

  const [searchInput, setSearchInput] = useState(search);

  const categories = [
    'all',
    'Cloud & Infrastructure',
    'AI & Healthcare',
    'FinTech & Payments',
    'IoT & CleanTech',
    'Robotics & AI',
    'EdTech & 3D Web',
    'Cybersecurity & DevOps',
  ];

  const projectTypes = [
    { label: 'All Types', value: 'all' },
    { label: 'Paid', value: 'paid' },
    { label: 'Sponsored', value: 'sponsored' },
    { label: 'Academic Collab', value: 'academic' },
  ];

  const workModes = [
    { label: 'All Modes', value: 'all' },
    { label: 'Remote', value: 'remote' },
    { label: 'Hybrid', value: 'hybrid' },
    { label: 'Onsite', value: 'onsite' },
  ];

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'all' || !value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    next.set('page', '1'); // reset page on filter change
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

  const handleToggleBookmark = async (projectId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please log in to bookmark projects');
      return;
    }

    try {
      const res = await api.post(`/projects/${projectId}/bookmark`);
      if (res.data.success) {
        setProjects((prev) =>
          prev.map((p) =>
            p._id === projectId ? { ...p, isBookmarked: res.data.isBookmarked } : p
          )
        );
        toast.success(res.data.message);
      }
    } catch {
      toast.error('Failed to toggle bookmark');
    }
  };

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      try {
        const query = searchParams.toString();
        const res = await api.get(`/projects?${query}&limit=9`);
        if (res.data.success) {
          setProjects(res.data.data);
          setTotal(res.data.pagination.total);
          setTotalPages(res.data.pagination.totalPages);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
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
                Explore Software Projects
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Discover real final-year software requirements posted by verified technology companies.
              </p>
            </div>

            {/* Quick search form */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search title, tech, company..."
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
                <Filter className="h-3.5 w-3.5 text-emerald-600" /> Filter Projects
              </span>
              {(search || category !== 'all' || type !== 'all' || workMode !== 'all' || teamSize !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-red-600 hover:underline flex items-center gap-0.5"
                >
                  <X className="h-3 w-3" /> Reset
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Project Category
              </label>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateParam('category', c)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                      category === c
                        ? 'bg-emerald-50 text-emerald-800 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {c === 'all' ? 'All Categories' : c}
                  </button>
                ))}
              </div>
            </div>

            {/* Compensation Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Compensation Model
              </label>
              <div className="space-y-1">
                {projectTypes.map((pt) => (
                  <button
                    key={pt.value}
                    onClick={() => updateParam('type', pt.value)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                      type === pt.value
                        ? 'bg-emerald-50 text-emerald-800 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {pt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Work Mode */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Work Mode
              </label>
              <div className="space-y-1">
                {workModes.map((wm) => (
                  <button
                    key={wm.value}
                    onClick={() => updateParam('workMode', wm.value)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                      workMode === wm.value
                        ? 'bg-emerald-50 text-emerald-800 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {wm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Team Size */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Preferred Team Size
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

          {/* Results Grid Column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Top Bar Sort and Count */}
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2">
              <span>Showing <strong className="text-slate-900">{projects.length}</strong> of {total} available projects</span>
              <div className="flex items-center gap-2">
                <span>Sort by:</span>
                <select
                  value={sort}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 focus:outline-none"
                >
                  <option value="latest">Latest Projects</option>
                  <option value="popular">Most Applied</option>
                </select>
              </div>
            </div>

            {/* Loading skeletons */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="p-6 rounded-xl border border-slate-200 bg-white space-y-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && projects.length === 0 && (
              <EmptyState
                icon={Briefcase}
                title="No projects match your criteria"
                description="Try clearing some of your search terms or filters to see more available projects."
                actionText="Reset All Filters"
                onAction={clearFilters}
              />
            )}

            {/* Project Cards Grid */}
            {!loading && projects.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {projects.map((project) => (
                  <Card key={project._id} className="flex flex-col justify-between hover:border-emerald-300 transition-all">
                    <CardContent className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Company Header */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              src={project.company?.logo}
                              alt={project.company?.companyName}
                              fallback={project.company?.companyName?.[0]}
                              size="sm"
                            />
                            <div className="overflow-hidden">
                              <h4 className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                                {project.company?.companyName || 'Verified Partner'}
                              </h4>
                              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3 text-emerald-600 inline" /> Verified
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => handleToggleBookmark(project._id, e)}
                              className={`p-1.5 rounded-md hover:bg-slate-100 transition-colors ${
                                project.isBookmarked ? 'text-emerald-600 fill-emerald-600' : 'text-slate-400'
                              }`}
                              title={project.isBookmarked ? 'Bookmarked' : 'Bookmark'}
                            >
                              <Bookmark className="h-4 w-4" />
                            </button>
                            <Badge variant={project.compensationType === 'paid' ? 'emerald' : 'secondary'} className="text-[10px]">
                              {project.compensationType.toUpperCase()}
                            </Badge>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <Link to={`/projects/${project._id}`} className="group block mb-2">
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                            {project.title}
                          </h3>
                        </Link>
                        <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                          {project.shortDescription}
                        </p>

                        {/* Required Skills */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {project.requiredSkills?.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {(project.requiredSkills?.length || 0) > 3 && (
                            <span className="px-1 text-[10px] text-slate-400">
                              +{(project.requiredSkills?.length || 0) - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Info Bar */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-2.5 text-[11px]">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-slate-400" />
                            {project.preferredTeamSize}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            {project.workMode}
                          </span>
                        </div>

                        <Link to={`/projects/${project._id}`}>
                          <span className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-0.5">
                            View <ArrowRight className="h-3 w-3" />
                          </span>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => updateParam('page', String(page - 1))}
                >
                  Previous
                </Button>
                <span className="text-xs font-medium text-slate-600 px-3">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => updateParam('page', String(page + 1))}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
