'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { DailyLog } from '@/types';
import { getTodayString } from '@/lib/points';

const PERSIST_DEBOUNCE_MS = 400;

function mergeLog(
  current: DailyLog | null,
  updates: Partial<DailyLog>,
  memberId: string,
  date: string
): DailyLog {
  const now = new Date().toISOString();

  return {
    id: current?.id ?? '',
    member_id: memberId,
    log_date: date,
    gym_done: updates.gym_done ?? current?.gym_done ?? false,
    water_droplets: updates.water_droplets ?? current?.water_droplets ?? 0,
    protein_g: updates.protein_g ?? current?.protein_g ?? 0,
    created_at: current?.created_at ?? now,
    updated_at: now,
  };
}

export function useDailyLog(memberId: string | null, logDate?: string) {
  const date = logDate ?? getTodayString();
  const isToday = date === getTodayString();

  const [log, setLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const logRef = useRef<DailyLog | null>(null);
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revertRef = useRef<DailyLog | null>(null);

  useEffect(() => {
    logRef.current = log;
  }, [log]);

  useEffect(() => {
    return () => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
      }
    };
  }, []);

  const fetchLog = useCallback(async () => {
    if (!memberId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('member_id', memberId)
        .eq('log_date', date)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      setLog(data || null);
      logRef.current = data || null;
      revertRef.current = null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch log');
    } finally {
      setLoading(false);
    }
  }, [memberId, date]);

  useEffect(() => {
    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current);
      persistTimerRef.current = null;
    }
    fetchLog();
  }, [fetchLog]);

  const persistLog = useCallback(async () => {
    if (!memberId) return;

    const snapshot = logRef.current;
    if (!snapshot) return;

    const fallback = revertRef.current;

    try {
      setSaving(true);
      setError(null);

      const supabase = createClient();
      const { data, error: upsertError } = await supabase
        .from('daily_logs')
        .upsert(
          {
            member_id: memberId,
            log_date: date,
            gym_done: snapshot.gym_done,
            water_droplets: snapshot.water_droplets,
            protein_g: snapshot.protein_g,
          },
          { onConflict: 'member_id,log_date' }
        )
        .select()
        .single();

      if (upsertError) throw upsertError;

      setLog(data);
      logRef.current = data;
      revertRef.current = data;
    } catch (err) {
      setLog(fallback);
      logRef.current = fallback;
      setError(err instanceof Error ? err.message : 'Failed to save log');
    } finally {
      setSaving(false);
    }
  }, [memberId, date]);

  const updateLog = useCallback(
    (updates: Partial<DailyLog>) => {
      if (!memberId) return;

      const isNewBatch = !persistTimerRef.current;

      setLog((current) => {
        if (isNewBatch) {
          revertRef.current = current;
        }

        const merged = mergeLog(current, updates, memberId, date);
        logRef.current = merged;
        return merged;
      });

      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
      }

      persistTimerRef.current = setTimeout(() => {
        persistTimerRef.current = null;
        void persistLog();
      }, PERSIST_DEBOUNCE_MS);
    },
    [memberId, date, persistLog]
  );

  return {
    log,
    loading,
    error,
    saving,
    updateLog,
    refetch: fetchLog,
    isToday,
    logDate: date,
  };
}
