import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { IProject, ITeam } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import {
  Users,
  Briefcase,
  Building2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Code2,
  Laptop,
  GraduationCap,
  Layers,
  Clock,
  Compass,
} from 'lucide-react';

export function HomePage() {
  const [featuredProjects, setFeaturedProjects] = useState<IProject[]>([]);
  const [featuredTeams, setFeaturedTeams] = useState<ITeam[]>([]);
  const [stats, setStats] = useState({
    projectsCount: 15,
    studentsCount: 120,
    teamsCount: 28,
    companiesCount: 18,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [projRes, teamRes] = await Promise.all([
          api.get('/projects?limit=6'),
          api.get('/teams?limit=4'),
        ]);

        if (projRes.data.success) {
          setFeaturedProjects(projRes.data.data);
          if (projRes.data.pagination?.total) {
            setStats((prev) => ({ ...prev, projectsCount: projRes.data.pagination.total }));
          }
        }
        if (teamRes.data.success) {
          setFeaturedTeams(teamRes.data.data);
          if (teamRes.data.pagination?.total) {
            setStats((prev) => ({ ...prev, teamsCount: teamRes.data.pagination.total }));
          }
        }
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-100 bg-gradient-to-b from-slate-50/70 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>The Dedicated Final-Year Project Collaboration Marketplace</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                Real Projects. <br />
                <span className="text-emerald-700">Student Teams.</span> <br />
                Industry Collaboration.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Connect with forward-thinking companies, assemble talented student teams, and work on production-quality software projects that turn academic learning into verifiable industry experience.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link to="/register/student">
                  <Button variant="default" size="lg" className="w-full sm:w-auto font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-md">
                    <GraduationCap className="mr-2 h-5 w-5 text-emerald-400" />
                    Join as Student
                  </Button>
                </Link>
                <Link to="/register/company">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto font-bold border-slate-300 text-slate-800 hover:bg-slate-50">
                    <Building2 className="mr-2 h-5 w-5 text-slate-600" />
                    Join as Company
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Real Company Problem Statements</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Full Team & Individual Applications</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Verified Industry Mentorship</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Collaboration Hero Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-2 shadow-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80"
                    alt="Students collaborating on real-world engineering project"
                    className="rounded-xl w-full h-[360px] object-cover"
                  />
                  {/* Floating SaaS Card */}
                  <div className="p-4 bg-white/95 backdrop-blur-md rounded-xl mt-2 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <Code2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Vortex Distributed Systems</h4>
                        <p className="text-[11px] text-slate-500">4 Final-Year Developers • IIT BHU</p>
                      </div>
                    </div>
                    <Badge variant="emerald" className="text-[10px]">
                      Selected by Nexora
                    </Badge>
                  </div>
                </div>

                {/* Decorative floating stats card */}
                <div className="absolute -top-4 -left-4 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 shadow-lg hidden sm:flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Collaboration Model</p>
                    <p className="text-xs font-bold text-slate-900">Industry-Accredited Capstone</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Statistics Section */}
      <section className="bg-slate-900 text-white py-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800">
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight">
                {stats.projectsCount}+
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Real Software Projects</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800">
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight">
                {stats.teamsCount}+
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Formed Student Teams</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800">
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight">
                {stats.companiesCount}+
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Verified Partner Companies</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800">
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight">100%</p>
              <p className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Final-Year Curriculum Focus</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Marketplace Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                <Briefcase className="h-4 w-4" />
                Industry Opportunities
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Featured Software Projects
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Explore real company requirements with verified deliverables, mentorship, and stipends.
              </p>
            </div>
            <Link to="/projects">
              <Button variant="outline" size="sm" className="font-semibold gap-1.5 text-slate-800">
                <span>View All Projects</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.slice(0, 6).map((project) => (
              <Card key={project._id} className="flex flex-col justify-between hover:border-emerald-300 transition-all">
                <CardContent className="p-6">
                  {/* Top metadata */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        src={project.company?.logo}
                        alt={project.company?.companyName}
                        fallback={project.company?.companyName?.[0]}
                        size="sm"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">
                          {project.company?.companyName || 'Verified Partner'}
                        </h4>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3 text-emerald-600 inline" /> Verified Company
                        </span>
                      </div>
                    </div>
                    <Badge variant={project.compensationType === 'paid' ? 'emerald' : 'secondary'}>
                      {project.compensationType.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Title & Description */}
                  <Link to={`/projects/${project._id}`} className="group block mb-3">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                      {project.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                    {project.shortDescription}
                  </p>

                  {/* Required skills */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {project.requiredSkills?.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {(project.requiredSkills?.length || 0) > 4 && (
                      <span className="px-1.5 py-0.5 text-[11px] text-slate-400">
                        +{(project.requiredSkills?.length || 0) - 4} more
                      </span>
                    )}
                  </div>

                  {/* Bottom Stats & CTA */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        {project.preferredTeamSize} Devs
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {project.durationWeeks} wks
                      </span>
                    </div>

                    <Link to={`/projects/${project._id}`}>
                      <span className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-0.5">
                        Details <ArrowRight className="h-3 w-3" />
                      </span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Student Teams Section — The Differentiator */}
      <section className="py-20 bg-slate-50/70 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                <Users className="h-4 w-4" />
                Formed & Cohesive Units
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Discover Ready Student Teams
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Companies can hire or invite pre-assembled engineering teams with combined multi-stack skillsets.
              </p>
            </div>
            <Link to="/teams">
              <Button variant="outline" size="sm" className="font-semibold gap-1.5 text-slate-800">
                <span>Explore All Teams</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTeams.slice(0, 4).map((team) => (
              <Card key={team._id} className="hover:border-emerald-300 transition-all flex flex-col justify-between">
                <CardContent className="p-6">
                  {/* Team Logo / Avatar */}
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar src={team.avatar} alt={team.name} fallback={team.name[0]} size="md" />
                    <div className="overflow-hidden">
                      <h3 className="text-sm font-bold text-slate-900 truncate">{team.name}</h3>
                      <p className="text-xs text-slate-500 truncate">{team.college}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {team.description}
                  </p>

                  {/* Combined Skills */}
                  <div className="mb-5">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                      Combined Skillset
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

                  {/* Team Members Avatar Bar */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center -space-x-2 overflow-hidden">
                      {team.members?.slice(0, 4).map((m, idx) => (
                        <Avatar
                          key={idx}
                          src={m.avatar}
                          alt={m.name}
                          size="sm"
                          className="border-2 border-white"
                        />
                      ))}
                    </div>

                    <Link to={`/teams`}>
                      <span className="text-xs font-bold text-emerald-700 hover:underline">
                        View Team →
                      </span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              How ProjectLink Works
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              A structured, transparent pathway from team formation to enterprise project delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="relative p-6 rounded-xl border border-slate-200 bg-white shadow-2xs text-left">
              <div className="h-10 w-10 rounded-lg bg-slate-900 text-white font-bold text-sm flex items-center justify-center mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Build Profile & Teams</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Students showcase academic records, GitHub repos, and create multi-disciplinary teams with combined technical skills.
              </p>
            </div>

            <div className="relative p-6 rounded-xl border border-slate-200 bg-white shadow-2xs text-left">
              <div className="h-10 w-10 rounded-lg bg-emerald-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Publish & Discover</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Companies publish verified software requirements. Students browse projects with rule-based compatibility scores.
              </p>
            </div>

            <div className="relative p-6 rounded-xl border border-slate-200 bg-white shadow-2xs text-left">
              <div className="h-10 w-10 rounded-lg bg-slate-900 text-white font-bold text-sm flex items-center justify-center mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Apply & Assess</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apply individually, submit as a complete team, or receive direct company invitations with structured assessments.
              </p>
            </div>

            <div className="relative p-6 rounded-xl border border-slate-200 bg-white shadow-2xs text-left">
              <div className="h-10 w-10 rounded-lg bg-emerald-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                04
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Collaborate in Workspace</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track milestones, manage Kanban tasks, chat in real-time, submit deliverables, and earn verified project credentials.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Dual Section */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* For Students */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold">
                <GraduationCap className="h-4 w-4" /> For Final-Year Students
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                Transform academic thesis into production software
              </h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Work on real problems submitted by active tech companies, not textbook clones.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Form teams with complementary peers to tackle complex full-stack architectures.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Receive industry code reviews, stipend compensation, and pre-placement offers.</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link to="/register/student">
                  <Button variant="default" size="sm" className="font-semibold bg-slate-900 text-white">
                    Create Student Account →
                  </Button>
                </Link>
              </div>
            </div>

            {/* For Companies */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
                <Building2 className="h-4 w-4" /> For Startups & Companies
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                Tap into motivated engineering teams for prototypes & tooling
              </h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Discover ready student teams vetted by skills, college background, and GitHub code.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Accelerate your internal developer tools, POCs, and open source modules.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Evaluate engineering talent in action before hiring full-time developers.</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link to="/register/company">
                  <Button variant="emerald" size="sm" className="font-semibold">
                    Post Project Requirements →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Build Meaningful Software?
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
            Join hundreds of final-year engineering students and tech companies already collaborating on ProjectLink.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/register/student">
              <Button variant="emerald" size="lg" className="w-full sm:w-auto font-bold">
                Get Started as Student
              </Button>
            </Link>
            <Link to="/register/company">
              <Button variant="outline" size="lg" className="w-full sm:w-auto font-bold border-slate-700 text-white hover:bg-slate-800">
                Publish Company Project
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
