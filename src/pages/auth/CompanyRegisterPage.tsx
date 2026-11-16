import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { toast } from 'sonner';
import { Building2, ArrowRight } from 'lucide-react';

export function CompanyRegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [companyName, setCompanyName] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [password, setPassword] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('Technology & Cloud');
  const [companySize, setCompanySize] = useState('11-50');
  const [contactPerson, setContactPerson] = useState('');
  const [location, setLocation] = useState('Bengaluru, Karnataka');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register/company', {
        companyName,
        officialEmail,
        password,
        website,
        industry,
        companySize,
        contactPerson,
        location,
        description,
      });

      if (res.data.success) {
        login(res.data.token, res.data.user);
        toast.success('Company registered successfully!');
        navigate('/company/dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 py-12 sm:py-16 w-full">
        <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm text-left space-y-6">
          <div className="text-center space-y-1">
            <div className="h-12 w-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mx-auto mb-2 border border-slate-200">
              <Building2 className="h-6 w-6 text-slate-700" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Register Your Organization</h1>
            <p className="text-xs text-slate-500">
              Publish software project requirements and recruit capable student teams.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Company Name *"
              placeholder="e.g. Nexora Cloud Technologies"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Official Work Email *"
                type="email"
                placeholder="careers@company.com"
                value={officialEmail}
                onChange={(e) => setOfficialEmail(e.target.value)}
                required
              />
              <Input
                label="Password *"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Company Website *"
                placeholder="https://company.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                required
              />
              <Input
                label="Contact Person & Title *"
                placeholder="e.g. Arun Varma (VP Eng)"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Industry Vertical
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Cloud Computing & DevOps">Cloud Computing & DevOps</option>
                  <option value="Healthcare Technology">Healthcare Technology</option>
                  <option value="FinTech & Payments">FinTech & Payments</option>
                  <option value="CleanTech & IoT">CleanTech & IoT</option>
                  <option value="AI & Robotics">AI & Robotics</option>
                  <option value="EdTech & WebGL">EdTech & WebGL</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Company Size
                </label>
                <select
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="1-10">1-10 employees (Early Startup)</option>
                  <option value="11-50">11-50 employees (Growth)</option>
                  <option value="51-200">51-200 employees (Mid-Size)</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="500+">500+ employees (Enterprise)</option>
                </select>
              </div>
            </div>

            <Input
              label="Location / Headquarters"
              placeholder="e.g. Bengaluru, Karnataka (or Remote)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <Textarea
              label="Brief Company Description"
              placeholder="Tell candidates what your company builds..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />

            <Button
              type="submit"
              variant="emerald"
              className="w-full font-bold shadow-md mt-2"
              isLoading={loading}
            >
              Register & Post Projects <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-emerald-700 hover:underline">
              Sign In here
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
