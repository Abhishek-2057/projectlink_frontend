import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../lib/utils';
import { toast } from 'sonner';
import { MailCheck, Check, X, Clock, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';

export function StudentInvitationsPage() {
  const [teamInvitations, setTeamInvitations] = useState<any[]>([]);
  const [historyInvitations, setHistoryInvitations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [loading, setLoading] = useState(true);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/invitations/me');
      if (res.data.success) {
        setTeamInvitations(res.data.data.teamInvitations || []);
        setHistoryInvitations(res.data.data.history || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleRespond = async (invitationId: string, action: 'accept' | 'reject') => {
    try {
      const res = await api.post(`/teams/invitations/${invitationId}/respond`, { action });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchInvitations();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error responding to invitation');
    }
  };

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Invitations & Offers</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Review incoming invitations to join student teams and industry project collaborations.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'pending'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Pending ({teamInvitations.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'history'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Clock className="h-3.5 w-3.5" /> History ({historyInvitations.length})
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="py-12 text-center text-sm text-slate-500">Loading invitations...</div>
      )}

      {/* PENDING TAB */}
      {!loading && activeTab === 'pending' && (
        <>
          {teamInvitations.length === 0 ? (
            <div className="relative bg-white rounded-2xl border border-slate-200/90 p-8 shadow-2xs text-center">
              <div className="absolute top-4 right-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('history')}
                  className="text-xs font-bold text-slate-700 hover:bg-slate-50 border-slate-300"
                >
                  <Clock className="mr-1.5 h-3.5 w-3.5 text-slate-500" /> History
                </Button>
              </div>
              <EmptyState
                icon={MailCheck}
                title="No pending invitations"
                description="When fellow student team leaders or partner companies invite you to join, they will appear here."
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Pending Invitations ({teamInvitations.length})
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('history')}
                  className="text-xs text-slate-600 hover:text-slate-900"
                >
                  <Clock className="mr-1 h-3.5 w-3.5" /> View History
                </Button>
              </div>

              {teamInvitations.map((inv) => (
                <Card key={inv._id} className="p-6 hover:border-slate-300 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <Avatar src={inv.team?.avatar} alt={inv.team?.name} size="md" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">
                            Join &quot;{inv.team?.name}&quot;
                          </h3>
                          <Badge variant="emerald" className="text-[10px]">Team Invitation</Badge>
                        </div>
                        <p className="text-xs text-slate-500">
                          Invited by <strong>{inv.sender?.name}</strong> • {formatDate(inv.sentAt)}
                        </p>
                        <p className="text-xs text-slate-600 pt-1 leading-relaxed">
                          &quot;{inv.message || 'We would like you to join our project team!'}&quot;
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRespond(inv._id, 'reject')}
                        className="text-xs text-red-600 hover:bg-red-50"
                      >
                        <X className="mr-1 h-3.5 w-3.5" /> Decline
                      </Button>
                      <Button
                        variant="emerald"
                        size="sm"
                        onClick={() => handleRespond(inv._id, 'accept')}
                        className="text-xs font-semibold"
                      >
                        <Check className="mr-1 h-3.5 w-3.5" /> Accept & Join
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* HISTORY TAB */}
      {!loading && activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Invitation History</h2>
              <Badge variant="secondary" className="text-xs">{historyInvitations.length} records</Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('pending')}
              className="text-xs font-semibold"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Pending
            </Button>
          </div>

          {historyInvitations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-2xs text-center">
              <EmptyState
                icon={Clock}
                title="No invitation history yet"
                description="Once you accept or decline invitations, your past activity will be archived here."
              />
            </div>
          ) : (
            <div className="space-y-3">
              {historyInvitations.map((inv) => {
                const isAccepted = inv.status === 'accepted';
                return (
                  <Card key={inv._id} className="p-5 hover:border-slate-300 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <Avatar src={inv.team?.avatar} alt={inv.team?.name} size="md" />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900">
                              {inv.team?.name || 'Project Team'}
                            </h3>
                            {isAccepted ? (
                              <Badge variant="emerald" className="inline-flex items-center gap-1 text-[11px] font-bold">
                                <CheckCircle2 className="h-3 w-3" /> Accepted
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="inline-flex items-center gap-1 text-[11px] font-bold">
                                <XCircle className="h-3 w-3" /> Declined
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">
                            Invited by <strong>{inv.sender?.name || 'Team Leader'}</strong> • Received: {formatDate(inv.sentAt)}
                            {inv.respondedAt && (
                              <span className="ml-1 text-slate-400">
                                • Responded: {formatDate(inv.respondedAt)}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-600 pt-1 leading-relaxed italic">
                            &quot;{inv.message || 'Invitation to join team'}&quot;
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                          isAccepted
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {isAccepted ? 'Joined Team' : 'Declined'}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
