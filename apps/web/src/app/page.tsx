'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'

export default function LandingPage() {
  const router = useRouter()
  const session = useAuthStore(s => s.session)

  useEffect(() => {
    if (session) router.replace('/home')
  }, [session, router])

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      {/* Logo */}
      <div className="mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent mb-6">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="8" stroke="white" strokeWidth="2.5" />
            <circle cx="16" cy="16" r="3" fill="white" />
            <path d="M16 8V4" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M24 16H28" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-gradient">Music Gem</h1>
      </div>

      <h2 className="text-4xl md:text-5xl font-bold text-text-primary max-w-xl leading-tight mb-4">
        Find your sound.
      </h2>
      <p className="text-lg text-text-secondary max-w-md mb-12">
        Listen, like, skip, and discover music that adapts to your taste.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/auth/signup"
          className="px-8 py-4 rounded-2xl bg-accent text-white font-semibold text-lg hover:bg-accent/90 transition-colors"
        >
          Start discovering
        </Link>
        <Link
          href="/auth/login"
          className="px-8 py-4 rounded-2xl bg-card border border-border text-text-primary font-semibold text-lg hover:bg-surface transition-colors"
        >
          Sign in
        </Link>
      </div>

      <div className="mt-20 grid grid-cols-3 gap-8 max-w-xl text-center">
        {[
          { icon: '♪', label: 'Personalized feed' },
          { icon: '◎', label: 'Taste learning' },
          { icon: '⊕', label: 'Style discovery' },
        ].map(f => (
          <div key={f.label} className="flex flex-col items-center gap-2">
            <span className="text-2xl">{f.icon}</span>
            <span className="text-sm text-text-muted">{f.label}</span>
          </div>
        ))}
      </div>
    </main>
  )
}
