import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';
import { KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setSent(true);
        toast.success(res.data.message);
      }
    } catch (err: any) {
      toast.error('Could not process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <div className="max-w-md mx-auto px-4 py-16 w-full">
        <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm text-left space-y-6">
          <div className="text-center space-y-1">
            <div className="h-12 w-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mx-auto mb-2">
              <KeyRound className="h-6 w-6 text-slate-700" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reset Password</h1>
            <p className="text-xs text-slate-500">
              Enter your email address to receive password recovery instructions.
            </p>
          </div>

          {sent ? (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
              <p className="text-xs text-emerald-900 font-semibold leading-relaxed">
                Password reset instructions have been dispatched to <strong>{email}</strong>.
              </p>
              <Link to="/reset-password">
                <Button variant="emerald" size="sm" className="mt-2 font-bold">
                  Enter New Password
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="default"
                className="w-full font-bold bg-slate-900 text-white"
                isLoading={loading}
              >
                Send Instructions
              </Button>
            </form>
          )}

          <div className="text-center pt-2 border-t border-slate-100">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { email, newPassword });
      if (res.data.success) {
        setCompleted(true);
        toast.success(res.data.message);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <div className="max-w-md mx-auto px-4 py-16 w-full">
        <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm text-left space-y-6">
          <div className="text-center space-y-1">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2">
              <KeyRound className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Set New Password</h1>
            <p className="text-xs text-slate-500">Choose a new secure password for your ProjectLink account.</p>
          </div>

          {completed ? (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
              <p className="text-xs text-emerald-900 font-semibold leading-relaxed">
                Your password has been reset successfully!
              </p>
              <Link to="/login">
                <Button variant="emerald" size="sm" className="mt-2 font-bold">
                  Sign In with New Password
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button type="submit" variant="default" className="w-full font-bold bg-slate-900" isLoading={loading}>
                Update Password
              </Button>
            </form>
          )}

          <div className="text-center pt-2 border-t border-slate-100">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
