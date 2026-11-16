import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { IApplication } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog';
import { Textarea } from '../../components/ui/Textarea';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../lib/utils';
import { toast } from 'sonner';
import {
  FileCheck2,
  Clock,
  ArrowRight,
  ExternalLink,
  Users,
  Building2,
  AlertTriangle,
  Upload,
  CheckCircle2,
} from 'lucide-react';

export function MyApplicationsPage() {
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Assessment submission modal state
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [activeAssessment, setActiveAssessment] = useState<any>(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [submittingAssessment, setSubmittingAssessment] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/applications/me');
      if (res.data.success) {
        setApplications(res.data.data);
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

  const handleWithdraw = async (applicationId: string) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    try {
      const res = await api.post(`/applications/${applicationId}/withdraw`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchApplications();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error withdrawing application');
    }
  };

  const handleOpenAssessmentModal = async (appId: string) => {
    try {
      const res = await api.get(`/assessments/application/${appId}`);
      if (res.data.success) {
        setActiveAssessment(res.data.data);
        setAssessmentModalOpen(true);
      }
    } catch {
      toast.error('Could not load assessment details');
    }
  };

  const handleSubmitAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssessment) return;

    setSubmittingAssessment(true);
    try {
      const formData = new FormData();
      formData.append('answers', assessmentAnswers);
      if (attachmentFile) {
        formData.append('attachment', attachmentFile);
      }

      const res = await api.post(`/assessments/${activeAssessment._id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        toast.success('Assessment submitted successfully!');
        setAssessmentModalOpen(false);
        fetchApplications();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error submitting assessment');
    } finally {
      setSubmittingAssessment(false);
    }
  };

  const tabs = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Under Review', value: 'under_review' },
    { label: 'Shortlisted', value: 'shortlisted' },
    { label: 'Assessment Sent', value: 'assessment_sent' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Withdrawn', value: 'withdrawn' },
  ];

  const filteredApps =
    activeTab === 'all'
      ? applications
      : applications.filter((a) => a.status === activeTab);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge variant="emerald">ACCEPTED</Badge>;
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
      case 'withdrawn':
        return <Badge variant="outline">WITHDRAWN</Badge>;
      default:
        return <Badge variant="secondary">PENDING REVIEW</Badge>;
    }
  };

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Project Applications</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
          Track the complete lifecycle of your individual and team project submissions.
        </p>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-1.5 pt-6 border-t border-slate-100 mt-6">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === tab.value
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="py-12 text-center text-sm text-slate-500">Loading applications...</div>
      )}

      {!loading && filteredApps.length === 0 && (
        <EmptyState
          icon={FileCheck2}
          title="No applications in this category"
          description="Explore available company project requirements and submit an individual or team proposal."
          actionText="Browse Projects"
          onAction={() => (window.location.href = '/projects')}
        />
      )}

      {!loading && filteredApps.length > 0 && (
        <div className="space-y-5">
          {filteredApps.map((app) => (
            <Card key={app._id} className="p-6 hover:border-slate-300 transition-all space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(app.status)}
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                      {app.applicantType === 'team' ? (
                        <>
                          <Users className="h-3.5 w-3.5 text-emerald-600" />
                          Team: {app.team?.name || 'Your Team'}
                        </>
                      ) : (
                        'Individual Application'
                      )}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">
                      Applied on {formatDate(app.appliedAt)}
                    </span>
                  </div>

                  <Link to={`/projects/${app.projectId}`} className="block group">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {app.project?.title || 'Software Development Project'}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    <strong>Cover Letter:</strong> {app.coverLetter}
                  </p>
                </div>

                {/* Status action buttons */}
                <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                  {app.status === 'accepted' && (
                    <Link to={`/workspace/${app.projectId}`}>
                      <Button variant="emerald" size="sm" className="font-bold shadow-sm">
                        Open Project Workspace <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  )}

                  {app.status === 'assessment_sent' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleOpenAssessmentModal(app._id)}
                      className="font-bold bg-slate-900 text-white"
                    >
                      Complete Assessment
                    </Button>
                  )}

                  {['pending', 'under_review', 'shortlisted'].includes(app.status) && (
                    <button
                      onClick={() => handleWithdraw(app._id)}
                      className="text-xs text-red-600 hover:underline font-semibold"
                    >
                      Withdraw Application
                    </button>
                  )}
                </div>
              </div>

              {/* Status Timeline History */}
              {app.statusHistory && app.statusHistory.length > 0 && (
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
                  <span className="font-bold uppercase tracking-wider text-slate-400">Timeline:</span>
                  {app.statusHistory.map((h, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      <strong>{h.status.replace('_', ' ')}</strong> ({formatDate(h.timestamp)})
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Assessment Modal */}
      <Dialog open={assessmentModalOpen} onOpenChange={setAssessmentModalOpen}>
        <DialogHeader>
          <DialogTitle>Technical Assessment Submission</DialogTitle>
          <DialogDescription>{activeAssessment?.title}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmitAssessment} className="space-y-4 text-left">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Instructions
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {activeAssessment?.instructions}
            </p>
          </div>

          <Textarea
            label="Your Solution / Implementation Notes *"
            placeholder="Paste your code explanation, repository links, or architectural summary..."
            value={assessmentAnswers}
            onChange={(e) => setAssessmentAnswers(e.target.value)}
            rows={5}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Attach Solution File / Document (Optional)
            </label>
            <input
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setAttachmentFile(e.target.files[0]);
                }
              }}
              className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAssessmentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="emerald" isLoading={submittingAssessment}>
              Submit Assessment
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
