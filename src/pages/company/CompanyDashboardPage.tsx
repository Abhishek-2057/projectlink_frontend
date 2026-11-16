import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { IProject, IApplication } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { formatDate } from '../../lib/utils';
import {
  Briefcase,
  Users,
  FileCheck2,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export function CompanyDashboardPage() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<IProject[]>([]);
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const projRes = await api.get('/projects/company/my');
        if (projRes.data.success) {
          setProjects(projRes.data.data);
          // For each project, fetch its applications count
          const appsList: IApplication[] = [];
          for (const p of projRes.data.data) {
            const aRes = await api.get(`/applications/project/${p._id}`);
            if (aRes.data.success) {
              appsList.push(...aRes.data.data);
            }
          }
          setApplications(appsList);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => ['published', 'in_progress'].includes(p.status)).length;
  const totalApplications = applications.length;
  const shortlistedCount = applications.filter((a) =>
    ['shortlisted', 'assessment_sent', 'assessment_submitted', 'interview_scheduled'].includes(a.status)
  ).length;
  const acceptedTeams = applications.filter((a) => a.status === 'accepted' && a.applicantType === 'team').length;

  // Chart data
  const chartData = [
    { name: 'Total Apps', count: totalApplications },
    { name: 'Shortlisted', count: shortlistedCount },
    { name: 'Assessed', count: applications.filter((a) => a.status.includes('assessment')).length },
    { name: 'Accepted', count: applications.filter((a) => a.status === 'accepted').length },
  ];

  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Enterprise Recruitment & Project Ops
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Company Command Center
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Manage your published software requirements, review incoming team applications, and assign technical milestones.
          </p>
        </div>

        <Link to="/company/projects/new">
          <Button variant="emerald" size="default" className="font-bold shadow-sm">
            <PlusCircle className="mr-1.5 h-4 w-4" /> Publish New Project
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Posted Projects</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{totalProjects}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Listings</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{activeProjects}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
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
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Teams Selected</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{acceptedTeams}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart & Recent Applicants */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Funnel Chart */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Candidate Pipeline Activity
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#15803D" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Applications Roster */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Recent Applications
            </h2>
            <Link to="/company/applications" className="text-xs text-emerald-700 font-bold hover:underline">
              View All Pipeline →
            </Link>
          </div>

          {applications.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">
              No applications received yet. Your projects are publicly discoverable on the marketplace!
            </p>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 4).map((app) => (
                <div key={app._id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="overflow-hidden space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {app.applicantType === 'team' ? app.team?.name : app.student?.name}
                      </h4>
                      <Badge variant="secondary" className="text-[9px]">
                        {app.applicantType.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      Applied on {formatDate(app.appliedAt)}
                    </p>
                  </div>

                  <Link to="/company/applications">
                    <span className="text-xs font-bold text-emerald-700 hover:underline">Review</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
