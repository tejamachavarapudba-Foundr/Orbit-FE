import React, { useState } from 'react';
import { useInvestorRequests } from '../hooks';
import { StatusBadge } from '../components/MeetingStatusBadge';
import { RequestDetailModal } from '../components/MeetingRequestModal';
import { MeetingRequest } from '../type';

export const InvestorDashboard: React.FC = () => {
  const { requests, loading } = useInvestorRequests();
  const [active, setActive] = useState<MeetingRequest | null>(null);

  if (loading) return <p>Loading sent pipeline...</p>;

  return (
    <div>
      <h3>Sent Requests</h3>
      {requests.map(r => (
        <div key={r.id} style={{ display: 'flex', gap: '12px', padding: '8px 0', borderBottom: '1px solid #eee' }}>
          <span>{r.purpose}</span>
          <StatusBadge status={r.status} />
          <button onClick={() => setActive(r)}>View</button>
        </div>
      ))}
      <RequestDetailModal request={active} onClose={() => setActive(null)} />
    </div>
  );
};
