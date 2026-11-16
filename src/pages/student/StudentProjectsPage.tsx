import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { IProject } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { Avatar, Skeleton } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { toast } from 'sonner';
import {
  Briefcase,
  Sparkles,
  Users,
  Clock,
  MapPin,
  Bookmark,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export function StudentProjectsPage() {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecommended = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects/recommended');
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
    fetchRecommended();
  }, []);

  const toggleBookmark = async (projectId: string, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const res = await api.post(`/projects/${projectId}/bookmark`);
      if (res.data.success) {
        setProjects((prev) =>
          prev.map((p) => (p._id === projectId ? { ...p, isBookmarked: res.data.isBookmarked } : p))
        );
        toast.success(res.data.message);
      }
    } catch {
      toast.error('Bookmark error');
    }
  };

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Transparent Matching Algorithm
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Recommended Projects For You & Your Teams
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
          Ranked by rule-based compatibility: Skill match (50%), Team capacity (20%), Experience (15%), and Academic eligibility (15%).
        </p>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-white rounded-xl border border-slate-200 space-y-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-32" />
            </div>
          ))}
        </div>
      )}

      {!loading && projects.length === 0 && (
        <EmptyState
          icon={Briefcase}
          title="No recommendations found right now"
          description="Update your profile skills or browse all available marketplace projects."
          actionText="Explore All Projects"
          onAction={() => (window.location.href = '/projects')}
        />
      )}

      {!loading && projects.length > 0 && (
        <div className="space-y-5">
          {projects.map((project) => (
            <Card key={project._id} className="p-6 hover:border-emerald-300 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="space-y-3 flex-1">
                  {/* Category, Compensation, Match Score */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">{project.category}</span>
                    <span className="text-slate-300">•</span>
                    <Badge variant={project.compensationType === 'paid' ? 'emerald' : 'secondary'}>
                      {project.compensationType.toUpperCase()}
                    </Badge>
                    {project.matchScore && (
                      <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        {project.matchScore}% Match
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <Link to={`/projects/${project._id}`} className="group block">
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {project.title}
                    </h2>
                  </Link>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {project.shortDescription}
                  </p>

                  {/* Match Reasons Explanation Badges */}
                  {project.matchReasons && project.matchReasons.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {project.matchReasons.map((r, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200/60 px-2 py-0.5 rounded-md flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          {r}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {project.requiredSkills?.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Column Action */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0">
                  <button
                    onClick={(e) => toggleBookmark(project._id, e)}
                    className={`p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors ${
                      project.isBookmarked ? 'text-emerald-600 fill-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    <Bookmark className="h-4 w-4" />
                  </button>

                  <Link to={`/projects/${project._id}`}>
                    <Button variant="default" size="sm" className="font-semibold bg-slate-900 text-white">
                      View & Apply <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
