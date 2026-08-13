'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState('busy');
    setTimeout(() => setState('done'), 600);
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm gap-2">
      <Input
        type="email"
        required
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={state === 'done'}
        className="h-10 rounded-xl bg-white/10 border-white/15 text-white placeholder:text-zinc-500 focus:border-emerald-500 dark:bg-white/10"
      />
      <Button
        type="submit"
        disabled={state === 'busy' || state === 'done'}
        className="h-10 shrink-0 rounded-xl bg-emerald-600 px-4 text-white hover:bg-emerald-500"
      >
        {state === 'busy' ? (
          <Loader2 className="size-4 animate-spin" />
        ) : state === 'done' ? (
          <CheckCircle2 className="size-4" />
        ) : (
          <>
            <Send className="size-3.5" />
            Join
          </>
        )}
      </Button>
    </form>
  );
}