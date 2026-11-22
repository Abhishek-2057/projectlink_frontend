import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import {
  GraduationCap,
  Building2,
  Users,
  ShieldCheck,
  Target,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Code2,
  HelpCircle,
} from 'lucide-react';

export function AboutPage() {
  const faqs = [
    {
      q: 'How is ProjectLink different from Internshala or job boards?',
      a: 'Internshala focuses on internships and summer jobs. ProjectLink specifically focuses on academic software development projects, capstones, and multi-developer student team collaborations with real companies.',
    },
    {
      q: 'Can students apply as a complete pre-formed team?',
      a: 'Yes! This is our core differentiator. Students can form teams, combine their technical skillsets, and team leaders can submit unified proposals for company projects.',
    },
    {
      q: 'Are projects paid or academic collaborations?',
      a: 'We support Paid projects (with verified stipends), Sponsored projects (hardware/cloud credit coverage), and Academic Collaborations with formal completion certificates.',
    },
    {
      q: 'Does ProjectLink issue certificates?',
      a: 'ProjectLink provides platform-verified project completion certificates and verifiable supervisor reviews based on deliverables submitted and approved in the workspace.',
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Hero Banner */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-slate-50 via-white to-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Bridging Academia & Industry Software Engineering</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Turning Student Degree Projects into Production Industry Systems
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Every year, hundreds of thousands of engineering students build generic academic projects that are disconnected from real industry needs. Meanwhile, startups and tech firms have internal tools and prototypes they need built. ProjectLink connects both worlds.
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Target className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Our Mission</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                To eliminate superficial academic projects by empowering every student developer to collaborate with verified tech companies on production-grade software architectures, gaining verifiable experience before graduation.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="h-10 w-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
                <Sparkles className="h-5 w-5 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Our Vision</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                A transparent global marketplace where companies discover not just individual applicants, but cohesive, pre-vetted student engineering teams ready to tackle distributed systems, AI pipelines, and web applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Differentiation Grid */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Why ProjectLink is Unique
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Built from first principles for capstone software collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <Users className="h-8 w-8 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">Team-First Discovery</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Unlike standard freelance platforms where individual bidding dominates, ProjectLink allows student peers to register as a unified squad with combined skills.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <ShieldCheck className="h-8 w-8 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">Verified Companies</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every organization submitting software requirements undergoes business verification to ensure genuine mentorship and real problem statements.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <Code2 className="h-8 w-8 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">Integrated Workspaces</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                From milestone trackers and Kanban boards to real-time chat and deliverable reviews, ProjectLink provides a dedicated workspace for each active project.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {faqs.map((f, i) => (
              <div key={i} className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  {f.q}
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed pl-6">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Have Questions or Want to Partner?</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            We work closely with university engineering placement cells and technology companies across India and worldwide.
          </p>
          <div className="pt-2">
            <a
              href="mailto:partners@projectlink.dev"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-md"
            >
              Contact University Partnership Team <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
