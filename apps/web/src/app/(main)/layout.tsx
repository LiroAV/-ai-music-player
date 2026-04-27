import { BottomNav } from '@/components/nav/BottomNav'
import { MiniPlayer } from '@/components/player/MiniPlayer'
import { ExpandedPlayer } from '@/components/player/ExpandedPlayer'
import { AudioEngine } from '@/components/player/AudioEngine'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AudioEngine />
      <main className="min-h-screen pb-32">{children}</main>
      <MiniPlayer />
      <ExpandedPlayer />
      <BottomNav />
    </>
  )
}
