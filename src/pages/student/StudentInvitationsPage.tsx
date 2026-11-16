import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../lib/utils';
import { toast } from 'sonner';
import { MailCheck, Users, Check, X, Building2, ExternalLink } from 'lucide-react';

export function StudentInvitationsPage() {
  const [teamInvitations, setTeamInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/invitations/me');
      if (res.data.success) {
        setTeamInvitations(res.data.data.teamInvitations || []);
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
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Invitations & Offers</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review incoming invitations to join student teams and industry project collaborations.
        </p>
      </div>

      {loading && (
        <div className="py-12 text-center text-sm text-slate-500">Loading invitations...</div>
      )}

      {!loading && teamInvitations.length === 0 && (
        <EmptyState
          icon={MailCheck}
          title="No pending invitations"
          description="When fellow student team leaders or partner companies invite you to join, they will appear here."
        />
      )}

      {!loading && teamInvitations.length > 0 && (
        <div className="space-y-4">
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
    </div>
  );
}
