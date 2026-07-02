import React, { useState } from 'react';
import { useFounderRequests } from '../hooks';
import { StatusBadge } from '../components/MeetingStatusBadge';
import { RequestDetailModal } from '../components/MeetingRequestModal';
import { MeetingRequest } from '../type';

export const FounderDashboard: React.FC<{ startupId: string }> = ({ startupId }) => {
  const { requests, loading } = useFounderRequests(startupId);
  const [active, setActive] = useState<MeetingRequest | null>(null);

  if (loading) return <p>Loading verified incoming requests...</p>;

  return (
    <div>
      <h3>Approved Meeting Invitations</h3>
      {requests.length === 0 ? <p>No visible meetings approved by admin yet.</p> : requests.map(r => (
        <div key={r.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
          <span>From: {r.investor?.email}</span>
          <StatusBadge status={r.status} />
          <button onClick={() => setActive(r)} style={{ marginLeft: '8px' }}>Open Invitation</button>
        </div>
      ))}
      <RequestDetailModal request={active} onClose={() => setActive(null)} />
    </div>
  );
};
