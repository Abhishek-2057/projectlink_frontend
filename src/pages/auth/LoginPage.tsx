import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';
import { Lock, ArrowRight, UserCheck, Shield, Sparkles } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.token, res.data.user, res.data.profile);
        toast.success(`Welcome back, ${res.data.user.name}!`);

        // Redirect based on role
        if (res.data.user.role === 'student') {
          navigate('/student/dashboard');
        } else if (res.data.user.role === 'company') {
          navigate('/company/dashboard');
        } else if (res.data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-Click Demo Login Helper for Evaluators
  const handleQuickDemoLogin = (role: 'student' | 'company' | 'admin') => {
    if (role === 'student') {
      setEmail('student@projectlink.dev');
      setPassword('password123');
    } else if (role === 'company') {
      setEmail('company@projectlink.dev');
      setPassword('password123');
    } else if (role === 'admin') {
      setEmail('admin@projectlink.dev');
      setPassword('admin123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <div className="max-w-md mx-auto px-4 py-12 sm:py-16 w-full">
        <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm text-left space-y-6">
          <div className="text-center space-y-1">
            <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-2">
              <Lock className="h-6 w-6 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In to ProjectLink</h1>
            <p className="text-xs text-slate-500">
              Access your student dashboard, company workspace, or admin console.
            </p>
          </div>

          {/* Quick Demo Credentials Bar */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>Instant Evaluator Demo Accounts:</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('student')}
                className="px-2 py-1 bg-white hover:bg-emerald-100/60 rounded text-[11px] font-semibold text-slate-800 border border-slate-200 text-center transition-colors cursor-pointer"
              >
                Student Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('company')}
                className="px-2 py-1 bg-white hover:bg-emerald-100/60 rounded text-[11px] font-semibold text-slate-800 border border-slate-200 text-center transition-colors cursor-pointer"
              >
                Company Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="px-2 py-1 bg-white hover:bg-emerald-100/60 rounded text-[11px] font-semibold text-slate-800 border border-slate-200 text-center transition-colors cursor-pointer"
              >
                Admin Demo
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-emerald-700 hover:underline font-medium">
                  Forgot Password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              variant="default"
              className="w-full font-bold bg-slate-900 text-white hover:bg-slate-800 mt-2"
              isLoading={loading}
            >
              Sign In <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Don&apos;t have an account yet?{' '}
            <Link to="/register" className="font-bold text-emerald-700 hover:underline">
              Create an Account
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
