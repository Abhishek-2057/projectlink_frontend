import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { IProject } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../lib/utils';
import { toast } from 'sonner';
import {
  Briefcase,
  PlusCircle,
  Users,
  Eye,
  FileCheck2,
  Clock,
  MoreVertical,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export function ManageProjectsPage() {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects/company/my');
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      const res = await api.patch(`/projects/${projectId}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Project status updated to ${newStatus}`);
        fetchProjects();
      }
    } catch (err: any) {
      toast.error('Error updating status');
    }
  };

  const filtered =
    filterStatus === 'all'
      ? projects
      : projects.filter((p) => p.status === filterStatus);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="emerald">ACTIVE LISTING</Badge>;
      case 'in_progress':
        return <Badge variant="info">IN COLLABORATION</Badge>;
      case 'completed':
        return <Badge variant="default">COMPLETED</Badge>;
      case 'paused':
        return <Badge variant="warning">PAUSED</Badge>;
      case 'draft':
        return <Badge variant="secondary">DRAFT</Badge>;
      default:
        return <Badge variant="outline">{status.toUpperCase()}</Badge>;
    }
  };

  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Project Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review your project listings, application counts, and collaboration workspace statuses.
          </p>
        </div>

        <Link to="/company/projects/new">
          <Button variant="emerald" size="sm" className="font-bold shadow-sm">
            <PlusCircle className="mr-1.5 h-4 w-4" /> Post New Project
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        {['all', 'published', 'in_progress', 'completed', 'draft', 'paused'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterStatus === st
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {st === 'all' ? 'All Projects' : st.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {loading && (
        <div className="py-12 text-center text-sm text-slate-500">Loading your projects...</div>
      )}

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={Briefcase}
          title="No projects found"
          description="Create and publish your first software development project for student teams."
          actionText="Post Project"
          onAction={() => (window.location.href = '/company/projects/new')}
        />
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((project) => (
            <Card key={project._id} className="p-6 hover:border-slate-300 transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(project.status)}
                    <span className="text-xs text-slate-300">•</span>
                    <span className="text-xs font-semibold text-slate-600">{project.category}</span>
                    <span className="text-xs text-slate-300">•</span>
                    <span className="text-xs text-slate-500">
                      Created on {formatDate(project.createdAt)}
                    </span>
                  </div>

                  <Link to={`/projects/${project._id}`} className="block group">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {project.title}
                    </h3>
                  </Link>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      Team: {project.preferredTeamSize} Devs
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {project.durationWeeks} Weeks
                    </span>
                    <span className="font-semibold text-emerald-800">
                      {project.budgetOrStipend}
                    </span>
                  </div>
                </div>

                {/* Right Column: Actions */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <Link to="/company/applications">
                    <Button variant="default" size="sm" className="font-semibold bg-slate-900 text-white">
                      <FileCheck2 className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                      Review Applicants ({project.applicantCount || 0})
                    </Button>
                  </Link>

                  {project.status === 'in_progress' && (
                    <Link to={`/workspace/${project._id}`}>
                      <Button variant="emerald" size="sm" className="font-bold">
                        Workspace
                      </Button>
                    </Link>
                  )}

                  <select
                    value={project.status}
                    onChange={(e) => handleStatusChange(project._id, e.target.value)}
                    className="text-xs border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="published">Active Listing</option>
                    <option value="paused">Pause Listing</option>
                    <option value="closed">Close Applications</option>
                    <option value="completed">Mark Completed</option>
                  </select>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
