import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { IProjectWorkspace, IMilestone, ITask, IDeliverable } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Card, CardContent } from '../../components/ui/Card';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { formatDate } from '../../lib/utils';
import { toast } from 'sonner';
import {
  CheckCircle2,
  Clock,
  PlusCircle,
  MessageSquare,
  Github,
  Globe,
  Upload,
  ExternalLink,
  Users,
  Target,
  FileCheck,
  Star,
  Send,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export function ProjectWorkspacePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuthStore();

  const [workspace, setWorkspace] = useState<IProjectWorkspace | null>(null);
  const [milestones, setMilestones] = useState<IMilestone[]>([]);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [deliverables, setDeliverables] = useState<IDeliverable[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'tasks' | 'milestones' | 'deliverables'>('tasks');

  // Modals state
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');

  // Deliverable Submission Modal
  const [deliverableModalOpen, setDeliverableModalOpen] = useState(false);
  const [delTitle, setDelTitle] = useState('');
  const [delDescription, setDelDescription] = useState('');
  const [delGithubUrl, setDelGithubUrl] = useState('');
  const [delLiveDemoUrl, setDelLiveDemoUrl] = useState('');

  // Complete Project Modal (Company only)
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [finalRating, setFinalRating] = useState('5');
  const [finalFeedback, setFinalFeedback] = useState('Exceptional engineering execution and communication throughout!');

  const fetchWorkspace = async () => {
    try {
      const res = await api.get(`/workspaces/project/${projectId}`);
      if (res.data.success) {
        setWorkspace(res.data.data.workspace);
        setMilestones(res.data.data.milestones || []);
        setTasks(res.data.data.tasks || []);
        setDeliverables(res.data.data.deliverables || []);
        setCollaborators(res.data.data.collaborators || []);
      }
    } catch (err: any) {
      toast.error('Error loading project workspace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, [projectId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace) return;
    try {
      const res = await api.post('/workspaces/tasks', {
        workspaceId: workspace._id,
        title: taskTitle,
        description: taskDescription,
        priority: taskPriority,
        dueDate: taskDueDate,
      });

      if (res.data.success) {
        toast.success('Task created successfully');
        setCreateTaskModalOpen(false);
        setTaskTitle('');
        setTaskDescription('');
        fetchWorkspace();
      }
    } catch (err: any) {
      toast.error('Error creating task');
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      const res = await api.patch(`/workspaces/tasks/${taskId}`, { status });
      if (res.data.success) {
        setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status: status as any } : t)));
      }
    } catch {
      toast.error('Error updating task');
    }
  };

  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace) return;
    try {
      const res = await api.post('/workspaces/deliverables', {
        workspaceId: workspace._id,
        title: delTitle,
        description: delDescription,
        githubUrl: delGithubUrl,
        liveDemoUrl: delLiveDemoUrl,
      });

      if (res.data.success) {
        toast.success('Deliverable submitted for company review!');
        setDeliverableModalOpen(false);
        setDelTitle('');
        setDelDescription('');
        fetchWorkspace();
      }
    } catch (err: any) {
      toast.error('Error submitting deliverable');
    }
  };

  const handleReviewDeliverable = async (deliverableId: string, status: 'approved' | 'revision_requested') => {
    try {
      const res = await api.patch(`/workspaces/deliverables/${deliverableId}/review`, { status });
      if (res.data.success) {
        toast.success(`Deliverable marked as ${status}`);
        fetchWorkspace();
      }
    } catch {
      toast.error('Error reviewing deliverable');
    }
  };

  const handleCompleteProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace) return;
    try {
      const res = await api.post(`/workspaces/${workspace._id}/complete`, {
        rating: Number(finalRating),
        feedback: finalFeedback,
      });

      if (res.data.success) {
        toast.success('Project officially marked as COMPLETED! Verified review recorded.');
        setCompleteModalOpen(false);
        fetchWorkspace();
      }
    } catch {
      toast.error('Error completing project');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="py-20 text-center text-sm text-slate-500">
          Loading Project Workspace...
        </div>
      </div>
    );
  }

  const isCompany = user?.role === 'company' || user?.role === 'admin';

  // Task columns
  const taskColumns = [
    { key: 'todo', label: 'To Do', color: 'bg-slate-100 text-slate-700' },
    { key: 'in_progress', label: 'In Progress', color: 'bg-blue-50 text-blue-800' },
    { key: 'in_review', label: 'In Review', color: 'bg-amber-50 text-amber-800' },
    { key: 'completed', label: 'Completed', color: 'bg-emerald-50 text-emerald-800' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-left">
      <Navbar />

      {/* Top Workspace Header */}
      <div className="bg-white border-b border-slate-200/90 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Active Collaboration Workspace
                </span>
                <Badge variant={workspace?.status === 'completed' ? 'default' : 'emerald'} className="text-[10px]">
                  {workspace?.status?.toUpperCase()}
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {workspace?.project?.title || 'Project Workspace'}
              </h1>

              {/* Collaborators row */}
              <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                <span className="font-semibold text-slate-700">Team Collaborators:</span>
                <div className="flex items-center -space-x-1.5">
                  {collaborators.map((c) => (
                    <Avatar key={c._id} src={c.avatar} alt={c.name} size="sm" className="border-2 border-white" />
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/messages">
                <Button variant="outline" size="sm" className="font-semibold">
                  <MessageSquare className="mr-1.5 h-4 w-4 text-emerald-600" /> Project Chat Channel
                </Button>
              </Link>

              {user?.role === 'student' && (
                <Button
                  variant="emerald"
                  size="sm"
                  onClick={() => setDeliverableModalOpen(true)}
                  className="font-bold shadow-sm"
                >
                  <Upload className="mr-1.5 h-4 w-4" /> Submit Deliverables
                </Button>
              )}

              {isCompany && workspace?.status !== 'completed' && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setCompleteModalOpen(true)}
                  className="bg-slate-900 font-bold text-white shadow-sm"
                >
                  <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-400" /> Complete & Rate Team
                </Button>
              )}
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-4 sm:gap-6 mt-6 pt-4 border-t border-slate-100 text-sm font-semibold overflow-x-auto whitespace-nowrap pb-1">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`pb-2 border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'tasks'
                  ? 'border-emerald-600 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Kanban Task Board ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('milestones')}
              className={`pb-2 border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'milestones'
                  ? 'border-emerald-600 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Milestones Roadmap ({milestones.length})
            </button>
            <button
              onClick={() => setActiveTab('deliverables')}
              className={`pb-2 border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'deliverables'
                  ? 'border-emerald-600 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Deliverables & Reviews ({deliverables.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* TAB 1: KANBAN TASKS */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Drag or update statuses as your student team develops features and executes sprints.
              </p>
              <Button
                variant="default"
                size="sm"
                className="bg-slate-900 font-semibold shrink-0"
                onClick={() => setCreateTaskModalOpen(true)}
              >
                <PlusCircle className="mr-1.5 h-3.5 w-3.5 text-emerald-400" /> Add Task
              </Button>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
              {taskColumns.map((col) => {
                const colTasks = tasks.filter((t) => t.status === col.key);
                return (
                  <div key={col.key} className="bg-slate-100/70 p-4 rounded-xl border border-slate-200 space-y-3 min-h-[300px]">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        {col.label}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-slate-700">
                        {colTasks.length}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {colTasks.map((task) => (
                        <div
                          key={task._id}
                          className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <Badge
                              variant={
                                task.priority === 'high'
                                  ? 'destructive'
                                  : task.priority === 'medium'
                                  ? 'warning'
                                  : 'secondary'
                              }
                              className="text-[9px] px-1.5 py-0"
                            >
                              {task.priority.toUpperCase()}
                            </Badge>
                            {task.dueDate && (
                              <span className="text-[10px] text-slate-400">Due {task.dueDate}</span>
                            )}
                          </div>

                          <h4 className="font-bold text-slate-900">{task.title}</h4>
                          {task.description && (
                            <p className="text-slate-500 line-clamp-2 leading-relaxed">{task.description}</p>
                          )}

                          {/* Quick change status dropdown */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">Move:</span>
                            <select
                              value={task.status}
                              onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                              className="text-[11px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5"
                            >
                              <option value="todo">To Do</option>
                              <option value="in_progress">In Progress</option>
                              <option value="in_review">In Review</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: MILESTONES ROADMAP */}
        {activeTab === 'milestones' && (
          <div className="space-y-6 max-w-4xl">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Project Milestones Roadmap
            </h2>

            <div className="space-y-4">
              {milestones.map((m, idx) => (
                <div key={m._id} className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        m.status === 'completed' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {idx + 1}
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{m.title}</h3>
                    </div>
                    <Badge variant={m.status === 'completed' ? 'emerald' : m.status === 'in_progress' ? 'warning' : 'secondary'}>
                      {m.status.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 pl-11 leading-relaxed">
                    {m.description}
                  </p>

                  <div className="pl-11 pt-2 flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Target Date: {m.deadline}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DELIVERABLES */}
        {activeTab === 'deliverables' && (
          <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Submitted Project Deliverables
              </h2>
              {user?.role === 'student' && (
                <Button variant="emerald" size="sm" onClick={() => setDeliverableModalOpen(true)}>
                  <Upload className="mr-1.5 h-3.5 w-3.5" /> Submit New Deliverable
                </Button>
              )}
            </div>

            {deliverables.length === 0 ? (
              <div className="p-8 bg-white rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                No deliverables submitted yet. The student team can upload code links and architecture decks here.
              </div>
            ) : (
              <div className="space-y-4">
                {deliverables.map((del) => (
                  <div key={del._id} className="p-6 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900">{del.title}</h3>
                      <Badge variant={del.status === 'approved' ? 'emerald' : 'warning'}>
                        {del.status.toUpperCase()}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{del.description}</p>

                    <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
                      {del.githubUrl && (
                        <a
                          href={del.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-slate-800 hover:text-black font-semibold"
                        >
                          <Github className="h-4 w-4" /> Pull Request / Code
                        </a>
                      )}
                      {del.liveDemoUrl && (
                        <a
                          href={del.liveDemoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-emerald-700 hover:underline font-semibold"
                        >
                          <Globe className="h-4 w-4" /> Live Demo URL
                        </a>
                      )}
                      <span className="text-slate-400">
                        Submitted by <strong>{del.submittedByName}</strong> on {formatDate(del.submittedAt)}
                      </span>
                    </div>

                    {del.feedback && (
                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 mt-2">
                        <strong>Supervisor Feedback:</strong> {del.feedback}
                      </div>
                    )}

                    {isCompany && del.status !== 'approved' && (
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleReviewDeliverable(del._id, 'revision_requested')}
                        >
                          Request Revisions
                        </Button>
                        <Button
                          variant="emerald"
                          size="sm"
                          className="text-xs font-semibold"
                          onClick={() => handleReviewDeliverable(del._id, 'approved')}
                        >
                          Approve Deliverable
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <Dialog open={createTaskModalOpen} onOpenChange={setCreateTaskModalOpen}>
        <DialogHeader>
          <DialogTitle>Add Workspace Task</DialogTitle>
          <DialogDescription>Create a collaborative task for the Kanban board.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateTask} className="space-y-4 text-left">
          <Input
            label="Task Title *"
            placeholder="e.g. Implement JWT authentication middleware"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            required
          />

          <Textarea
            label="Task Description"
            placeholder="Details, technical acceptance criteria, or reference links..."
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            rows={3}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as any)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <Input
              label="Due Date"
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="default" className="bg-slate-900">
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Deliverable Submission Modal */}
      <Dialog open={deliverableModalOpen} onOpenChange={setDeliverableModalOpen}>
        <DialogHeader>
          <DialogTitle>Submit Project Deliverable</DialogTitle>
          <DialogDescription>
            Provide your code repository links or documentation for company supervisor review.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmitDeliverable} className="space-y-4 text-left">
          <Input
            label="Deliverable Title *"
            placeholder="e.g. Milestone 2: Microservices Ingestion & Unit Tests"
            value={delTitle}
            onChange={(e) => setDelTitle(e.target.value)}
            required
          />

          <Textarea
            label="Deliverable Description & Release Notes *"
            placeholder="Outline what was built, passing tests, and how to run the services..."
            value={delDescription}
            onChange={(e) => setDelDescription(e.target.value)}
            rows={3}
            required
          />

          <Input
            label="GitHub Repository / Pull Request Link"
            placeholder="https://github.com/..."
            value={delGithubUrl}
            onChange={(e) => setDelGithubUrl(e.target.value)}
          />

          <Input
            label="Live Staging / Demo URL"
            placeholder="https://staging.yourdomain.com"
            value={delLiveDemoUrl}
            onChange={(e) => setDelLiveDemoUrl(e.target.value)}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeliverableModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="emerald">
              Submit Deliverable
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Complete Project Modal */}
      <Dialog open={completeModalOpen} onOpenChange={setCompleteModalOpen}>
        <DialogHeader>
          <DialogTitle>Mark Project as Completed</DialogTitle>
          <DialogDescription>
            Certify that the student team has successfully fulfilled project deliverables and record a verified rating.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCompleteProject} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Performance Rating
            </label>
            <select
              value={finalRating}
              onChange={(e) => setFinalRating(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="5">⭐⭐⭐⭐⭐ 5.0 (Exceptional)</option>
              <option value="4">⭐⭐⭐⭐ 4.0 (Very Good)</option>
              <option value="3">⭐⭐⭐ 3.0 (Satisfactory)</option>
            </select>
          </div>

          <Textarea
            label="Formal Evaluation & Recommendation Notes"
            value={finalFeedback}
            onChange={(e) => setFinalFeedback(e.target.value)}
            rows={4}
            required
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCompleteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="emerald">
              Complete & Sign Off
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
