import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { GraduationCap, Building2, ArrowRight, CheckCircle2 } from 'lucide-react';

export function RoleSelectionPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 w-full">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Join ProjectLink
          </h1>
          <p className="text-sm text-slate-500">
            Select your account type to begin exploring verified software collaborations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Student Role Card */}
          <Card className="hover:border-emerald-500 hover:shadow-md transition-all p-8 flex flex-col justify-between text-left group">
            <div className="space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/80 group-hover:scale-105 transition-transform">
                <GraduationCap className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Student Developer</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect with tech companies, form multi-disciplinary teams with classmates, and build real-world production projects with industry mentorship.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Apply individually or as a team
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Earn project stipends & PPOs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Dedicated collaboration workspace
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Link to="/register/student" className="block w-full">
                <Button variant="default" className="w-full font-bold bg-slate-900 hover:bg-slate-800">
                  Register as Student <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>

          {/* Company Role Card */}
          <Card className="hover:border-emerald-500 hover:shadow-md transition-all p-8 flex flex-col justify-between text-left group">
            <div className="space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200 group-hover:scale-105 transition-transform">
                <Building2 className="h-7 w-7 text-slate-700" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Company / Startup</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Publish software project requirements, discover top engineering students and full teams, conduct assessments, and accelerate your prototypes and internal tools.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Post real software requirements
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Hire complete student teams
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Track milestone progress & code
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Link to="/register/company" className="block w-full">
                <Button variant="emerald" className="w-full font-bold">
                  Register as Company <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        <div className="text-center mt-10 text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-emerald-700 hover:underline">
            Sign In here
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
