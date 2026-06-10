-- Connection requests with intro notes (LinkedIn-style)

CREATE TABLE IF NOT EXISTS public.connection_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  note text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (requester_id, recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_connection_requests_recipient_status
  ON public.connection_requests(recipient_id, status);

CREATE INDEX IF NOT EXISTS idx_connection_requests_requester_status
  ON public.connection_requests(requester_id, status);

ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users view own connection requests"
  ON public.connection_requests FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY IF NOT EXISTS "Users send connection requests"
  ON public.connection_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY IF NOT EXISTS "Users update received requests"
  ON public.connection_requests FOR UPDATE
  USING (auth.uid() = recipient_id OR auth.uid() = requester_id);

-- Reuse existing connections table for accepted pairs
-- On accept: INSERT INTO connections (follower_id, following_id) for both directions
