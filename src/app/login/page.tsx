'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setSession } from '@/lib/auth';
import AuthLayout from '@/components/layout/AuthLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setSession(data.member);

      if (isSignUp || data.member.needsOnboarding) {
        router.push('/onboarding');
      } else {
        router.push('/');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="FlatFit"
      subtitle="Fitness for flatmates"
    >
      <Card className="overflow-hidden">
        <h2 className="font-display text-xl font-bold text-ink mb-1">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-sm text-ink-muted mb-6">
          {isSignUp ? "Join your flat's fitness tracker" : 'Sign in to continue'}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="min-w-0">
            <label className="block text-xs font-semibold uppercase tracking-widest text-ink-muted mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="input-field"
            />
          </div>

          <div className="min-w-0">
            <label className="block text-xs font-semibold uppercase tracking-widest text-ink-muted mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="input-field"
            />
            <p className="text-xs text-ink-muted mt-1.5">Minimum 6 characters</p>
          </div>

          {message && (
              <div className="p-3.5 rounded-xl text-sm bg-surface-elevated text-ink border border-border-strong/30 break-words" role="alert">
              {message}
            </div>
          )}

          <Button type="submit" disabled={loading || !email || !password} className="mt-2">
            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage('');
            }}
            className="text-sm text-ink-muted font-medium hover:text-ink transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </Card>
    </AuthLayout>
  );
}
