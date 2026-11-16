import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { ICompanyProfile } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { toast } from 'sonner';
import {
  Building2,
  ShieldCheck,
  Save,
  Upload,
  Globe,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';

export function CompanyProfilePage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<ICompanyProfile | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [logo, setLogo] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('11-50');
  const [location, setLocation] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [submittingDoc, setSubmittingDoc] = useState(false);
  const [verificationDocFile, setVerificationDocFile] = useState<File | null>(null);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/companies/me');
      if (res.data.success) {
        const c = res.data.data;
        setProfile(c);
        setCompanyName(c.companyName || user?.name || '');
        setLogo(c.logo || user?.avatar || '');
        setWebsite(c.website || '');
        setIndustry(c.industry || 'Technology');
        setCompanySize(c.companySize || '11-50');
        setLocation(c.location || '');
        setContactPerson(c.contactPerson || '');
        setDescription(c.description || '');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/companies/me', {
        companyName,
        logo,
        website,
        industry,
        companySize,
        location,
        contactPerson,
        description,
      });

      if (res.data.success) {
        toast.success('Company profile updated successfully!');
        fetchProfile();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingDoc(true);
    try {
      const formData = new FormData();
      if (verificationDocFile) {
        formData.append('document', verificationDocFile);
      }
      const res = await api.post('/companies/me/verification', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        toast.success('Verification request submitted for admin review!');
        fetchProfile();
      }
    } catch (err: any) {
      toast.error('Error submitting verification');
    } finally {
      setSubmittingDoc(false);
    }
  };

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <Avatar src={logo || user?.avatar} alt={companyName} size="xl" />
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-slate-900">{companyName || 'Company Profile'}</h1>
            <p className="text-xs text-slate-500">{industry} • {location}</p>
            <div className="pt-1">
              {profile?.verificationStatus === 'verified' && (
                <Badge variant="emerald" className="gap-1 text-[11px]">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified Enterprise Partner
                </Badge>
              )}
              {profile?.verificationStatus === 'pending' && (
                <Badge variant="warning" className="gap-1 text-[11px]">
                  <Clock className="h-3.5 w-3.5" /> Verification Pending Admin Review
                </Badge>
              )}
              {profile?.verificationStatus === 'unverified' && (
                <Badge variant="secondary" className="gap-1 text-[11px]">
                  Unverified Account
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            Company Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Legal Name *"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
            <Input
              label="Company Logo URL"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Website URL *"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              required
            />
            <Input
              label="Contact Person & Title *"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Industry Vertical"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
            <Input
              label="Headquarters / Office Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <Textarea
            label="Company Description & Tech Stack Overview"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="default" className="bg-slate-900 font-semibold text-white" isLoading={saving}>
              <Save className="mr-1.5 h-4 w-4" /> Save Profile
            </Button>
          </div>
        </div>
      </form>

      {/* Verification Submission Form */}
      {profile?.verificationStatus !== 'verified' && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            Submit Company Verification Details
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Verified companies receive a trust badge on all published project listings and gain higher visibility in student recommendations.
          </p>

          <form onSubmit={handleVerificationSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Upload Certificate of Incorporation / GST / Business Proof (PDF)
              </label>
              <input
                type="file"
                accept=".pdf,.png,.jpg"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setVerificationDocFile(e.target.files[0]);
                  }
                }}
                className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white"
              />
            </div>

            <Button type="submit" variant="emerald" size="sm" isLoading={submittingDoc}>
              <ShieldCheck className="mr-1.5 h-4 w-4" /> Submit for Admin Verification
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
