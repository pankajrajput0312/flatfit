'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { OnboardingData, DAYS_OF_WEEK } from '@/types';
import AuthLayout from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    name: '',
    gym_days: [],
    water_target_l: 2.0,
    protein_target_g: 120,
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { getCurrentUserId, getSession, setSession } = await import('@/lib/auth');
      const userId = getCurrentUserId();

      if (!userId) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('members')
        .update({
          name: formData.name,
          gym_days: formData.gym_days,
          water_target_l: formData.water_target_l,
          protein_target_g: formData.protein_target_g,
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      const currentSession = getSession();
      if (currentSession) {
        setSession({ ...currentSession, name: formData.name });
      }

      router.push('/');
    } catch (error) {
      console.error('Onboarding error:', error);
      alert('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep1 = formData.name.trim().length > 0 && formData.name.length <= 20;

  return (
    <AuthLayout title="Welcome" subtitle="Set up your profile" step={`Step ${step} of 3`}>
      {step === 1 && (
        <Card className="overflow-hidden">
          <h2 className="font-display text-xl font-bold text-ink mb-1">What&apos;s your name?</h2>
          <p className="text-sm text-ink-muted mb-5">This is how you&apos;ll appear on the leaderboard</p>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter your name"
            maxLength={20}
            className="input-field text-lg mb-2"
          />
          <p className="text-xs text-ink-faint mb-5 text-right">{formData.name.length}/20</p>
          <Button onClick={() => setStep(2)} disabled={!canProceedStep1}>
            Continue
          </Button>
        </Card>
      )}

      {step === 2 && (
        <Card className="overflow-hidden">
          <h2 className="font-display text-xl font-bold text-ink mb-1">Gym Days</h2>
          <p className="text-sm text-ink-muted mb-5">Select which days you plan to go to the gym</p>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = formData.gym_days.includes(day.index);
              return (
                <button
                  key={day.index}
                  onClick={() => {
                    setFormData({
                      ...formData,
                      gym_days: isSelected
                        ? formData.gym_days.filter((d) => d !== day.index)
                        : [...formData.gym_days, day.index].sort(),
                    });
                  }}
                  className={cn(
                    'py-3 rounded-xl font-semibold text-sm transition-all duration-200',
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
          <p className="text-xs text-ink-faint mb-5 break-words">
            {formData.gym_days.length === 0
              ? 'No days selected — every day is a rest day (5 pts auto)'
              : `${formData.gym_days.length} gym day${formData.gym_days.length > 1 ? 's' : ''} selected`}
          </p>
          <div className="space-y-2">
            <Button onClick={() => setStep(3)}>Continue</Button>
            <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="overflow-hidden">
          <h2 className="font-display text-xl font-bold text-ink mb-1">Daily Targets</h2>
          <p className="text-sm text-ink-muted mb-6">Set your hydration and nutrition goals</p>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-ink mb-3">
              Water — {formData.water_target_l.toFixed(1)}L
            </label>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={formData.water_target_l}
              onChange={(e) =>
                setFormData({ ...formData, water_target_l: parseFloat(e.target.value) })
              }
            />
            <div className="flex justify-between text-xs text-ink-faint mt-2 uppercase tracking-widest">
              <span>1L</span>
              <span>5L</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-ink mb-3">
              Protein — {formData.protein_target_g}g
            </label>
            <input
              type="range"
              min="50"
              max="300"
              step="5"
              value={formData.protein_target_g}
              onChange={(e) =>
                setFormData({ ...formData, protein_target_g: parseInt(e.target.value) })
              }
            />
            <div className="flex justify-between text-xs text-ink-faint mt-2 uppercase tracking-widest">
              <span>50g</span>
              <span>300g</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating profile...' : 'Complete Setup'}
            </Button>
            <Button variant="secondary" onClick={() => setStep(2)} disabled={loading}>
              Back
            </Button>
          </div>
        </Card>
      )}

      <div className="flex justify-center gap-2 mt-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              'h-1 rounded-full transition-all duration-300',
                s === step ? 'w-8 bg-accent' : 'w-4 bg-white/20'
            )}
          />
        ))}
      </div>
    </AuthLayout>
  );
}
