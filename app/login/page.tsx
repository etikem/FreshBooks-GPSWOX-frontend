'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, AlertTriangle } from 'lucide-react';
import { api, setToken } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const { token } = await api<{ token: string }>('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(token);
      router.replace('/dashboard');
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white flex items-center justify-center p-6">
      <CircuitDecorations />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-[#0d0d0f]/90 backdrop-blur-sm shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] px-8 py-9">
          <div className="flex justify-center">
            <Logo />
          </div>

          <h1 className="mt-5 text-center text-2xl font-semibold tracking-tight">
            Welcome Back
          </h1>
          <p className="mt-2 text-center text-xs text-white/60">
            Sign in with your admin credentials.
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-3">
            <InputField
              icon={<Mail className="size-4" />}
              type="email"
              placeholder="email address"
              value={email}
              onChange={(v) => setEmail(v)}
              autoComplete="username"
            />
            <InputField
              icon={<Lock className="size-4" />}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(v) => setPassword(v)}
              autoComplete="current-password"
            />

            {err && (
              <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                <AlertTriangle className="size-4 mt-0.5 shrink-0" />
                <span>{err}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full h-11 rounded-lg bg-[#1f8bff] hover:bg-[#1a7ce8] active:bg-[#176fcf] text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_4px_16px_-4px_rgba(31,139,255,0.5)]"
            >
              {busy ? 'Signing in…' : 'Login'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-[11px] text-white/40">
          Protected by JWT · session expires in 12h
        </p>
      </div>
    </div>
  );
}

function InputField({
  icon,
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
}: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
        {icon}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        className="w-full h-11 pl-10 pr-3 rounded-lg bg-[#161618] border border-white/10 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#1f8bff]/60 focus:ring-2 focus:ring-[#1f8bff]/20 transition-colors"
      />
    </div>
  );
}

function Logo() {
  return (
    <div className="size-11 rounded-xl bg-[#161618] border border-white/10 flex items-center justify-center">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 3a9 9 0 1 0 9 9"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="20.5" cy="5" r="1.6" fill="white" />
      </svg>
    </div>
  );
}

function CircuitDecorations() {
  return (
    <>
      <CircuitCorner className="top-8 left-8" rotate={0} />
      <CircuitCorner className="top-8 right-8" rotate={90} />
      <CircuitCorner className="bottom-8 left-8" rotate={270} />
      <CircuitCorner className="bottom-8 right-8" rotate={180} />
    </>
  );
}

function CircuitCorner({
  className,
  rotate,
}: {
  className?: string;
  rotate: number;
}) {
  return (
    <div
      className={`absolute pointer-events-none ${className ?? ''}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <svg
        width="280"
        height="170"
        viewBox="0 0 280 170"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 24 L70 24 L100 54 L210 54 L240 84 L280 84"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
          fill="none"
        />
        <circle cx="280" cy="84" r="2" fill="rgba(255,255,255,0.35)" />
        <circle cx="100" cy="54" r="1.5" fill="rgba(255,255,255,0.25)" />
        <circle cx="210" cy="54" r="1.5" fill="rgba(255,255,255,0.25)" />
        <rect
          x="0"
          y="8"
          width="56"
          height="32"
          rx="3"
          fill="#0d0d0f"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1"
        />
        <g fill="rgba(255,255,255,0.4)">
          <rect x="6" y="14" width="3" height="3" rx="0.5" />
          <rect x="12" y="14" width="3" height="3" rx="0.5" />
          <rect x="18" y="14" width="3" height="3" rx="0.5" />
          <rect x="6" y="20" width="3" height="3" rx="0.5" />
          <rect x="12" y="20" width="3" height="3" rx="0.5" />
          <rect x="18" y="20" width="3" height="3" rx="0.5" />
          <rect x="6" y="26" width="3" height="3" rx="0.5" />
          <rect x="12" y="26" width="3" height="3" rx="0.5" />
          <rect x="18" y="26" width="3" height="3" rx="0.5" />
        </g>
        <rect
          x="40"
          y="22"
          width="16"
          height="4"
          fill="rgba(255,255,255,0.15)"
        />
      </svg>
    </div>
  );
}
