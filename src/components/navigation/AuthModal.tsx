'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Modal } from '@/components/ui/Modal';
import { X, AlertCircle, Cloud } from 'lucide-react';
import { soundFx } from '@/lib/sound';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        if (error.message.includes('not enabled')) {
          throw new Error('Google sign-in is not turned on in your Supabase dashboard yet. Use Email & Password below, or enable Google in Supabase -> Authentication -> Providers.');
        }
        throw error;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in error');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      setLoading(true);
      setError(null);
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          soundFx.playChime();
          onSuccess();
          onClose();
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          soundFx.playChime();
          onSuccess();
          onClose();
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      ariaLabel="Authentication Dialog"
      className="p-5 sm:p-6 space-y-4"
    >
      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-5 p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full transition-colors cursor-pointer"
        title="Close (Esc)"
        aria-label="Close dialog"
      >
        <X size={18} />
      </button>

      <div className="flex items-start gap-3.5">
        <Image
          src="/drag2placeLogo.png"
          alt="Drag2Place Logo"
          width={40}
          height={40}
          className="rounded-xl object-contain shadow-xs shrink-0 mt-0.5"
        />
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-medium bg-amber-100/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 mb-1.5">
            <Cloud size={12} /> Cloud Backup & Sync
          </div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
            {isSignUp ? (
              <span className="font-serif">Create your Account</span>
            ) : (
              <span>
                Sign In to <span className="font-oregon font-bold">Drag2Place</span>
              </span>
            )}
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
            Back up your tasks, moodboards, and ideas securely in the cloud and access them from any device.
          </p>
        </div>
      </div>

      {!isSupabaseConfigured && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold">
            <AlertCircle size={14} className="shrink-0" /> Currently in Offline Mode
          </div>
          <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
            Your boards are currently saved on this computer only. To enable cloud backup across devices, add your database keys to <code>.env.local</code>.
          </p>
        </div>
      )}

      {error && (
        <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs rounded-xl leading-relaxed">
          {error}
        </div>
      )}

      {/* Google One-Click */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={!isSupabaseConfigured || loading}
        className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white dark:bg-[#25221E] hover:bg-stone-50 dark:hover:bg-[#2C2824] border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      <div className="flex items-center gap-2 my-1">
        <div className="flex-1 h-[1px] bg-stone-200 dark:bg-stone-800" />
        <span className="text-[10px] font-mono text-stone-400 uppercase">or with email</span>
        <div className="flex-1 h-[1px] bg-stone-200 dark:bg-stone-800" />
      </div>

      {/* Email / Password Form */}
      <form onSubmit={handleEmailAuth} className="space-y-3">
        <div>
          <label className="block text-[11px] font-medium text-stone-600 dark:text-stone-400 mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            className="w-full text-xs p-2.5 bg-white dark:bg-[#25221E] border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 rounded-xl outline-none focus:border-stone-400 dark:focus:border-stone-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-stone-600 dark:text-stone-400 mb-1">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full text-xs p-2.5 bg-white dark:bg-[#25221E] border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 rounded-xl outline-none focus:border-stone-400 dark:focus:border-stone-500"
          />
        </div>

        <button
          type="submit"
          disabled={!isSupabaseConfigured || loading}
          className="w-full py-2.5 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-stone-100 dark:text-stone-900 rounded-xl text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Connecting...' : isSignUp ? 'Sign Up (Free Cloud Backup)' : 'Sign In'}
        </button>
      </form>

      <div className="text-center pt-1">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 underline underline-offset-2 cursor-pointer"
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up free"}
        </button>
      </div>
    </Modal>
  );
};
