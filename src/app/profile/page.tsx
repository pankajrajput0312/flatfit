'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Member, DAYS_OF_WEEK } from '@/types';
import PageShell from '@/components/layout/PageShell';
import DarkPageHero, { StatGrid } from '@/components/layout/DarkPageHero';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import MonthlySummary from '@/components/profile/MonthlySummary';
import ProfileSkeleton from '@/components/ui/skeletons/ProfileSkeleton';
import Modal from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
}

export default function ProfilePage() {
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [editData, setEditData] = useState({
    gym_days: [] as number[],
    water_target_l: 2.0,
    protein_target_g: 120,
  });

  useEffect(() => {
    async function fetchMember() {
      try {
        const { getCurrentUserId } = await import('@/lib/auth');
        const userId = getCurrentUserId();

        if (!userId) {
          router.push('/login');
          return;
        }

        const supabase = createClient();
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          router.push('/onboarding');
          return;
        }

        setMember(data);
        setEditData({
          gym_days: data.gym_days,
          water_target_l: data.water_target_l,
          protein_target_g: data.protein_target_g,
        });
      } catch (error) {
        console.error('Error fetching member:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMember();
  }, [router]);

  const handleSave = async () => {
    if (!member) return;

    try {
      setLoading(true);
      const supabase = createClient();

      const { error } = await supabase
        .from('members')
        .update(editData)
        .eq('id', member.id);

      if (error) throw error;

      setMember({ ...member, ...editData });
      setEditing(false);
    } catch (error) {
      console.error('Error updating member:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { clearSession } = await import('@/lib/auth');
    clearSession();
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    if (!member) return;

    setDeleting(true);
    setDeleteError('');

    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: member.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      const { clearSession } = await import('@/lib/auth');
      clearSession();
      router.push('/login');
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete account');
      setDeleting(false);
    }
  };

  if (loading && !member) {
    return <ProfileSkeleton />;
  }

  if (!member) return null;

  const memberSince = new Date(member.created_at).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  const gymDaysLabel =
    member.gym_days.length === 0
      ? 'Rest every day'
      : member.gym_days.map((d) => DAYS_OF_WEEK[d].short).join(', ');

  return (
    <PageShell>
      <DarkPageHero title={member.name} subtitle={member.email} badge="Profile">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center font-display font-bold text-lg flex-shrink-0">
            {getInitials(member.name)}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-white/65 font-semibold">Member since</p>
            <p className="text-sm font-semibold text-white mt-0.5">{memberSince}</p>
          </div>
        </div>
        <StatGrid
          stats={[
            { label: 'Water', value: `${member.water_target_l.toFixed(1)}L` },
            { label: 'Protein', value: `${member.protein_target_g}g` },
            { label: 'Gym days', value: member.gym_days.length || 'Rest' },
          ]}
        />
      </DarkPageHero>

      <div className="px-5 py-5 space-y-4 overflow-hidden">
        <MonthlySummary member={member} />

        <Card>
          <div className="flex items-center justify-between mb-4">
            <p className="section-label">Daily Targets</p>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-xs font-semibold text-ink uppercase tracking-widest hover:opacity-70 transition-opacity"
              >
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <>
              <div className="mb-5">
                <label className="block text-sm font-semibold text-ink mb-3">Gym Days</label>
                <div className="grid grid-cols-4 gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = editData.gym_days.includes(day.index);
                    return (
                      <button
                        key={day.index}
                        onClick={() => {
                          setEditData({
                            ...editData,
                            gym_days: isSelected
                              ? editData.gym_days.filter((d) => d !== day.index)
                              : [...editData.gym_days, day.index].sort(),
                          });
                        }}
                        className={cn(
                          'py-2.5 rounded-xl font-semibold text-sm transition-all duration-200',
                          isSelected
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-surface-elevated text-ink-muted border border-border hover:border-ink-muted'
                        )}
                      >
                        {day.short}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-ink mb-3">
                  Water — {editData.water_target_l.toFixed(1)}L
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={editData.water_target_l}
                  onChange={(e) =>
                    setEditData({ ...editData, water_target_l: parseFloat(e.target.value) })
                  }
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-ink mb-3">
                  Protein — {editData.protein_target_g}g
                </label>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="5"
                  value={editData.protein_target_g}
                  onChange={(e) =>
                    setEditData({ ...editData, protein_target_g: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Button onClick={handleSave}>Save Changes</Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditing(false);
                    setEditData({
                      gym_days: member.gym_days,
                      water_target_l: member.water_target_l,
                      protein_target_g: member.protein_target_g,
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-0">
              <div className="flex justify-between items-start gap-4 py-3 border-b border-border min-w-0">
                <span className="text-sm text-ink-muted flex-shrink-0">Gym Days</span>
                <span className="text-sm font-semibold text-ink text-right truncate">
                  {gymDaysLabel}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-sm text-ink-muted">Water Target</span>
                <span className="text-sm font-semibold text-ink tabular-nums">
                  {member.water_target_l.toFixed(1)}L
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-ink-muted">Protein Target</span>
                <span className="text-sm font-semibold text-ink tabular-nums">
                  {member.protein_target_g}g
                </span>
              </div>
            </div>
          )}
        </Card>

        <Button variant="outline" onClick={handleSignOut}>
          Sign Out
        </Button>

        <Card className="border-red-900/40">
          <p className="section-label text-red-400 mb-2">Danger zone</p>
          <p className="text-sm text-ink-muted mb-4 leading-relaxed">
            Permanently delete your account, daily logs, and leaderboard history.
          </p>
          <Button
            variant="danger"
            onClick={() => {
              setDeleteError('');
              setShowDeleteModal(true);
            }}
          >
            Delete Account
          </Button>
        </Card>
      </div>

      <Modal
        open={showDeleteModal}
        onClose={() => {
          if (!deleting) setShowDeleteModal(false);
        }}
        title="Delete account?"
      >
        <p className="text-sm text-ink-muted leading-relaxed mb-5">
          This will permanently remove <span className="text-ink font-semibold">{member.name}</span>,
          all daily logs, and your place on the leaderboard. This action cannot be undone.
        </p>

        {deleteError && (
          <p className="text-sm text-red-400 mb-4" role="alert">
            {deleteError}
          </p>
        )}

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={deleting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="flex-1"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </Modal>

      <BottomNav />
    </PageShell>
  );
}
