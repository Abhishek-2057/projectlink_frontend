import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { formatDate } from '../../lib/utils';
import { toast } from 'sonner';
import {
  ShieldAlert,
  Users,
  Building2,
  Briefcase,
  CheckCircle2,
  XCircle,
  FileCheck,
  History,
  TrendingUp,
} from 'lucide-react';

export function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'verifications' | 'users' | 'logs'>('verifications');
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [anRes, userRes, vRes, logRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/users'),
        api.get('/admin/verifications'),
        api.get('/admin/logs'),
      ]);

      if (anRes.data.success) setAnalytics(anRes.data.data.stats);
      if (userRes.data.success) setUsers(userRes.data.data);
      if (vRes.data.success) setVerifications(resData(vRes));
      if (logRes.data.success) setLogs(logRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resData = (res: any) => res.data.data || [];

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleReviewVerification = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await api.patch(`/admin/verifications/${id}`, { status });
      if (res.data.success) {
        toast.success(`Verification ${status}`);
        fetchAdminData();
      }
    } catch {
      toast.error('Error reviewing verification');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await api.patch(`/admin/users/${userId}/status`, { status: nextStatus });
      if (res.data.success) {
        toast.success(`User status changed to ${nextStatus}`);
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, status: nextStatus } : u))
        );
      }
    } catch {
      toast.error('Error toggling user status');
    }
  };

  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold mb-2">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" /> Administrative Operations Control
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Platform Administration Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor platform metrics, verify corporate partners, audit user activity, and maintain quality assurance.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Students</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{analytics?.totalStudents || 0}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Companies</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{analytics?.verifiedCompanies || 0}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Projects</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{analytics?.activeProjects || 0}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Verifications</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{analytics?.pendingVerifications || 0}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Control */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2 text-sm font-semibold overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`pb-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'verifications'
              ? 'border-emerald-600 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Company Verification Requests ({verifications.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'users'
              ? 'border-emerald-600 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          User Account Moderation ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'logs'
              ? 'border-emerald-600 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Audit Activity Logs ({logs.length})
        </button>
      </div>

      {/* Tab 1: Verifications */}
      {activeTab === 'verifications' && (
        <div className="space-y-4">
          {verifications.length === 0 ? (
            <div className="p-8 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-400">
              No pending verification requests at this time.
            </div>
          ) : (
            verifications.map((v) => (
              <Card key={v._id} className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{v.companyName}</h3>
                    <p className="text-xs text-slate-500">Submitted: {formatDate(v.submittedAt)}</p>
                    <div className="flex items-center gap-2 pt-2 text-xs text-emerald-700">
                      <span>Documents: {v.documents?.join(', ')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {v.status === 'pending' ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs text-red-600 hover:bg-red-50"
                          onClick={() => handleReviewVerification(v._id, 'rejected')}
                        >
                          Reject
                        </Button>
                        <Button
                          variant="emerald"
                          size="sm"
                          className="text-xs font-semibold"
                          onClick={() => handleReviewVerification(v._id, 'approved')}
                        >
                          Approve Verification
                        </Button>
                      </>
                    ) : (
                      <Badge variant={v.status === 'approved' ? 'emerald' : 'destructive'}>
                        {v.status.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Users */}
      {activeTab === 'users' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Registered</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar src={u.avatar} alt={u.name} size="sm" />
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <Badge variant={u.role === 'admin' ? 'destructive' : u.role === 'company' ? 'default' : 'secondary'}>
                        {u.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3.5">
                      <Badge variant={u.status === 'active' ? 'emerald' : 'destructive'}>
                        {u.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-slate-400">{formatDate(u.createdAt)}</td>
                    <td className="p-3.5 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(u._id, u.status)}
                          className={`text-xs font-semibold hover:underline ${
                            u.status === 'active' ? 'text-red-600' : 'text-emerald-600'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Audit Logs */}
      {activeTab === 'logs' && (
        <Card className="p-6 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            System Event Audit Stream
          </h3>
          <div className="space-y-2 text-xs">
            {logs.map((log) => (
              <div key={log._id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">{log.actorName}</span>{' '}
                  <span className="text-slate-500">executed</span>{' '}
                  <Badge variant="outline" className="text-[10px]">{log.action}</Badge>{' '}
                  <span className="text-slate-500">on {log.targetType}</span>
                </div>
                <span className="text-[10px] text-slate-400">{formatDate(log.createdAt)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
