'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, Library, PlusCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/discover', icon: Compass, label: 'Discover' },
  { href: '/library', icon: Library, label: 'Library' },
  { href: '/create', icon: PlusCircle, label: 'Create' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur border-t border-border z-30">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors',
                active ? 'text-accent' : 'text-text-muted hover:text-text-secondary',
              )}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
