import React, { useState } from 'react';
import { useMeetingRequestStore } from '../store';

export const InvestorBookingForm: React.FC<{ startupId: string; onComplete: () => void }> = ({ startupId, onComplete }) => {
  const { createRequest, loading, error } = useMeetingRequestStore();
  const [form, setForm] = useState({ purpose: 'investment_discussion', preferredDate1: '', preferredTime1: '', preferredDate2: '', preferredTime2: '', message: '' });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await createRequest({ ...form, startupId })) onComplete();
  };

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '400px' }}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input type="date" required onChange={e => setForm({ ...form, preferredDate1: e.target.value })} />
      <input type="text" placeholder="Time 1 (e.g. 10:00)" required onChange={e => setForm({ ...form, preferredTime1: e.target.value })} />
      <input type="date" required onChange={e => setForm({ ...form, preferredDate2: e.target.value })} />
      <input type="text" placeholder="Time 2 (e.g. 14:00)" required onChange={e => setForm({ ...form, preferredTime2: e.target.value })} />
      <textarea placeholder="Message" required onChange={e => setForm({ ...form, message: e.target.value })} />
      <button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Request Meeting'}</button>
    </form>
  );
};
