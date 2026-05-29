'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUserId } from '@/lib/auth';
import { useMembers } from '@/hooks/useMembers';

export function useActiveMember(requireAuth = true) {
  const router = useRouter();
  const { members, loading, error } = useMembers();
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!requireAuth) {
      setAuthChecked(true);
      return;
    }

    const userId = getCurrentUserId();
    if (!userId) {
      router.push('/login');
      return;
    }

    setAuthChecked(true);
  }, [requireAuth, router]);

  useEffect(() => {
    if (members.length === 0 || activeMemberId) return;

    const sessionId = getCurrentUserId();
    const sessionMember = sessionId
      ? members.find((member) => member.id === sessionId)
      : null;

    setActiveMemberId(sessionMember?.id ?? null);
  }, [members, activeMemberId]);

  const activeMember = members.find((member) => member.id === activeMemberId) ?? null;

  return {
    members,
    activeMember,
    activeMemberId,
    setActiveMemberId,
    loading: loading || !authChecked,
    error,
  };
}
