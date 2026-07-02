import React, { useState } from 'react';
import { useAdminRequests } from '../hooks';
import { StatusBadge } from '../components/MeetingStatusBadge';
import { MeetingRequest } from '../type';

export const AdminDashboard: React.FC = () => {
  const { requests, loading, updateStatus } = useAdminRequests();

  if (loading) return <p>Loading global pipeline...</p>;

  return (
    <div>
      <h3>Admin Verification panel</h3>
      {requests.map(r => (
        <div key={r.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
          <span>{r.investor?.email} - {r.purpose}</span>
          <StatusBadge status={r.status} />
          {r.status === 'pending' && (
            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
              <button onClick={() => updateStatus(r.id, 'approved')}>Approve</button>
              <button onClick={() => updateStatus(r.id, 'rejected')}>Reject</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
