import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { toast } from 'sonner';
import { PlusCircle, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';

export function PostProjectPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Cloud & Infrastructure');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [goalsText, setGoalsText] = useState('');
  const [deliverablesText, setDeliverablesText] = useState('');
  const [requiredSkillsText, setRequiredSkillsText] = useState('');
  const [optionalSkillsText, setOptionalSkillsText] = useState('');
  const [preferredTeamSize, setPreferredTeamSize] = useState('3');
  const [durationWeeks, setDurationWeeks] = useState('12');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [workMode, setWorkMode] = useState<'remote' | 'hybrid' | 'onsite'>('remote');
  const [location, setLocation] = useState('Bengaluru (Remote)');
  const [compensationType, setCompensationType] = useState<'paid' | 'sponsored' | 'academic' | 'unpaid'>('paid');
  const [budgetOrStipend, setBudgetOrStipend] = useState('₹25,000 / month stipend + Certificate');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (publishStatus: 'published' | 'draft') => {
    if (!title.trim() || !shortDescription.trim() || !requiredSkillsText.trim()) {
      toast.error('Please fill in all mandatory fields');
      return;
    }

    setSubmitting(true);
    try {
      const goals = goalsText
        .split('\n')
        .map((g) => g.trim())
        .filter(Boolean);
      const deliverables = deliverablesText
        .split('\n')
        .map((d) => d.trim())
        .filter(Boolean);
      const requiredSkills = requiredSkillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const optionalSkills = optionalSkillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await api.post('/projects', {
        title,
        category,
        shortDescription,
        fullDescription: fullDescription || shortDescription,
        problemStatement: problemStatement || shortDescription,
        goals: goals.length > 0 ? goals : ['Build and deploy working prototype'],
        deliverables: deliverables.length > 0 ? deliverables : ['Clean code repository and documentation'],
        requiredSkills,
        optionalSkills,
        preferredTeamSize: Number(preferredTeamSize),
        durationWeeks: Number(durationWeeks),
        startDate,
        deadline,
        workMode,
        location,
        compensationType,
        budgetOrStipend,
        status: publishStatus,
      });

      if (res.data.success) {
        toast.success(
          publishStatus === 'published'
            ? 'Project published to marketplace successfully!'
            : 'Project saved as draft.'
        );
        navigate('/company/projects');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error publishing project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={() => navigate('/company/projects')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Project Listings
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Post New Software Project</h1>
        </div>
      </div>

      <div className="space-y-6">
        {/* Core Project Details */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            Project Overview
          </h2>

          <Input
            label="Project Title *"
            placeholder="e.g. Distributed Anomaly Detection Engine with Apache Kafka"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
                <option value="AI & Healthcare">AI & Healthcare</option>
                <option value="FinTech & Payments">FinTech & Payments</option>
                <option value="CleanTech & IoT">CleanTech & IoT</option>
                <option value="Robotics & AI">Robotics & AI</option>
                <option value="EdTech & 3D Web">EdTech & 3D Web</option>
                <option value="Cybersecurity & DevOps">Cybersecurity & DevOps</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Compensation Type *
              </label>
              <select
                value={compensationType}
                onChange={(e) => setCompensationType(e.target.value as any)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="paid">Paid (Stipend / Grant)</option>
                <option value="sponsored">Sponsored (Hardware / Cloud Credits)</option>
                <option value="academic">Academic Collaboration (Certificate)</option>
                <option value="unpaid">Unpaid Open Source</option>
              </select>
            </div>
          </div>

          <Textarea
            label="Short Summary (Marketplace Card Preview) *"
            placeholder="A compelling 1-2 sentence description of what the student team will build..."
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            rows={2}
            required
          />

          <Textarea
            label="Problem Statement *"
            placeholder="What exact real-world engineering or business problem does this project solve?"
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
            rows={3}
            required
          />

          <Textarea
            label="Detailed Scope & Architecture Specification"
            placeholder="Detailed background, architectural expectations, and constraints..."
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            rows={4}
          />
        </div>

        {/* Deliverables & Goals */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            Objectives & Expected Deliverables
          </h2>

          <Textarea
            label="Key Objectives (One per line)"
            placeholder="Custom K8s CRD Controller&#10;Prometheus Metric Scraping Loop&#10;Load Testing with k6"
            value={goalsText}
            onChange={(e) => setGoalsText(e.target.value)}
            rows={3}
          />

          <Textarea
            label="Final Deliverables (One per line)"
            placeholder="Production Docker image and Helm chart&#10;Clean documented GitHub Repository&#10;Final Year Thesis Defense Deck"
            value={deliverablesText}
            onChange={(e) => setDeliverablesText(e.target.value)}
            rows={3}
          />
        </div>

        {/* Technical Requirements & Team Size */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            Tech Stack & Team Structure
          </h2>

          <Input
            label="Required Skills (Comma-separated) *"
            placeholder="e.g. Go, Kubernetes, Prometheus, Docker"
            value={requiredSkillsText}
            onChange={(e) => setRequiredSkillsText(e.target.value)}
            required
          />

          <Input
            label="Optional / Good to have Skills"
            placeholder="e.g. Terraform, React, Python"
            value={optionalSkillsText}
            onChange={(e) => setOptionalSkillsText(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Preferred Team Size (Developers) *"
              type="number"
              min="1"
              max="6"
              value={preferredTeamSize}
              onChange={(e) => setPreferredTeamSize(e.target.value)}
              required
            />
            <Input
              label="Duration (Weeks) *"
              type="number"
              min="4"
              max="24"
              value={durationWeeks}
              onChange={(e) => setDurationWeeks(e.target.value)}
              required
            />
            <Input
              label="Application Deadline *"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Work Mode
              </label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as any)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>

            <Input
              label="Location / Office Hub"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <Input
            label="Stipend / Compensation Details"
            value={budgetOrStipend}
            onChange={(e) => setBudgetOrStipend(e.target.value)}
            placeholder="e.g. ₹25,000 / month + Pre-Placement Offer"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSubmit('draft')}
            isLoading={submitting}
          >
            Save as Draft
          </Button>
          <Button
            type="button"
            variant="emerald"
            className="font-bold shadow-sm"
            onClick={() => handleSubmit('published')}
            isLoading={submitting}
          >
            <PlusCircle className="mr-1.5 h-4 w-4" /> Publish to Marketplace
          </Button>
        </div>
      </div>
    </div>
  );
}
