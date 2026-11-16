import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Github, Linkedin, Twitter, ShieldCheck, Mail, ArrowUpRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                PL
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Project<span className="text-emerald-500">Link</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              The premier marketplace connecting ambitious final-year college students and multi-disciplinary developer teams with companies building real-world software systems.
            </p>
            <div className="flex items-center gap-3 text-slate-400 pt-2">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 hover:text-white hover:bg-slate-700 transition-colors">
                <Github className="h-4 w-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 hover:text-white hover:bg-slate-700 transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 hover:text-white hover:bg-slate-700 transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* For Students */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">For Students</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/projects" className="hover:text-emerald-400 transition-colors">
                  Explore Projects
                </Link>
              </li>
              <li>
                <Link to="/teams" className="hover:text-emerald-400 transition-colors">
                  Student Teams
                </Link>
              </li>
              <li>
                <Link to="/register/student" className="hover:text-emerald-400 transition-colors">
                  Create Student Profile
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition-colors">
                  How Collaboration Works
                </Link>
              </li>
            </ul>
          </div>

          {/* For Companies */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">For Companies</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/students" className="hover:text-emerald-400 transition-colors">
                  Discover Talent
                </Link>
              </li>
              <li>
                <Link to="/teams" className="hover:text-emerald-400 transition-colors">
                  Hire Complete Teams
                </Link>
              </li>
              <li>
                <Link to="/register/company" className="hover:text-emerald-400 transition-colors">
                  Post Software Projects
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition-colors">
                  Verification Standards
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Trust */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition-colors">
                  About Us & Mission
                </Link>
              </li>
              <li className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Verified Partners</span>
              </li>
              <li>
                <a href="mailto:support@projectlink.dev" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  Contact Support <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ProjectLink. All rights reserved. Platform-issued participation and industry project completion framework.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Academic Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
