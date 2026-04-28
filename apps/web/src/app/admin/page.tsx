'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

const TABS = ['Metrics', 'Tracks', 'Jobs'] as const
type Tab = typeof TABS[number]

interface Metrics {
  users: number
  tracks: number
  generationJobs: number
  totalPlays: number
  totalLikes: number
  totalGenerationCost: number
  avgCostPerJob: number
  jobsByStatus: Array<{ status: string; _count: number }>
}

interface AdminTrack {
  id: string
  title: string
  artistName: string
  primaryGenre: string
  status: string
  moderationStatus: string
  qualityScore: number
  createdAt: string
  _count: { likes: number; listeningEvents: number }
}

interface Job {
  id: string
  status: string
  provider: string
  inputPrompt: string
  actualCost: number | null
  createdAt: string
  user: { email: string; username: string }
  resultTrack: { title: string } | null
}

function MetricCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="p-4 rounded-2xl bg-card border border-border">
      <p className="text-text-muted text-xs mb-1">{label}</p>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      {sub && <p className="text-text-muted text-xs mt-0.5">{sub}</p>}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ready_public: 'text-green-400 bg-green-400/10',
    approved: 'text-green-400 bg-green-400/10',
    completed: 'text-green-400 bg-green-400/10',
    pending: 'text-yellow-400 bg-yellow-400/10',
    processing: 'text-blue-400 bg-blue-400/10',
    queued: 'text-blue-400 bg-blue-400/10',
    rejected: 'text-red-400 bg-red-400/10',
    failed: 'text-red-400 bg-red-400/10',
    archived: 'text-text-muted bg-border/40',
  }
  return (
    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', colors[status] ?? 'text-text-muted bg-border/40')}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Metrics')
  const queryClient = useQueryClient()

  const { data: metrics } = useQuery<Metrics>({
    queryKey: ['admin-metrics'],
    queryFn: () => api.get<Metrics>('/admin/metrics'),
    enabled: activeTab === 'Metrics',
    refetchInterval: 30000,
  })

  const { data: tracks } = useQuery<AdminTrack[]>({
    queryKey: ['admin-tracks'],
    queryFn: () => api.get<AdminTrack[]>('/admin/tracks'),
    enabled: activeTab === 'Tracks',
  })

  const { data: jobs } = useQuery<Job[]>({
    queryKey: ['admin-jobs'],
    queryFn: () => api.get<Job[]>('/admin/jobs'),
    enabled: activeTab === 'Jobs',
  })

  const moderate = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'reject' | 'archive' }) =>
      api.post(`/admin/tracks/${id}/moderate`, { action }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-tracks'] }),
  })

  return (
    <div className="min-h-screen bg-background px-6 pt-12 pb-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Admin</h1>
          <p className="text-text-muted text-sm mt-0.5">Platform overview</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              activeTab === tab
                ? 'bg-accent/20 text-accent border border-accent/40'
                : 'bg-card border border-border text-text-secondary hover:border-muted',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Metrics */}
      {activeTab === 'Metrics' && metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <MetricCard label="Users" value={metrics.users} />
            <MetricCard label="Public tracks" value={metrics.tracks} />
            <MetricCard label="Total plays" value={metrics.totalPlays.toLocaleString()} />
            <MetricCard label="Total likes" value={metrics.totalLikes.toLocaleString()} />
            <MetricCard label="Generation jobs" value={metrics.generationJobs} />
            <MetricCard
              label="Generation cost"
              value={`$${metrics.totalGenerationCost.toFixed(2)}`}
              sub={`avg $${metrics.avgCostPerJob.toFixed(3)}/job`}
            />
          </div>

          {metrics.jobsByStatus.length > 0 && (
            <div className="p-4 rounded-2xl bg-card border border-border">
              <h2 className="text-sm font-semibold text-text-primary mb-3">Jobs by status</h2>
              <div className="flex flex-wrap gap-2">
                {metrics.jobsByStatus.map(s => (
                  <div key={s.status} className="flex items-center gap-2">
                    <StatusBadge status={s.status} />
                    <span className="text-text-muted text-xs">{s._count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tracks */}
      {activeTab === 'Tracks' && (
        <div className="flex flex-col gap-2">
          {tracks?.map(track => (
            <div key={track.id} className="p-4 rounded-2xl bg-card border border-border">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">{track.title}</p>
                  <p className="text-xs text-text-secondary">{track.artistName} · <span className="capitalize">{track.primaryGenre}</span></p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={track.moderationStatus} />
                  <StatusBadge status={track.status} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-3 text-xs text-text-muted">
                  <span>♥ {track._count.likes}</span>
                  <span>▶ {track._count.listeningEvents}</span>
                  <span>Q: {track.qualityScore.toFixed(2)}</span>
                </div>
                {track.moderationStatus !== 'approved' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => moderate.mutate({ id: track.id, action: 'approve' })}
                      className="text-xs px-3 py-1 rounded-full bg-green-400/10 text-green-400 hover:bg-green-400/20 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => moderate.mutate({ id: track.id, action: 'reject' })}
                      className="text-xs px-3 py-1 rounded-full bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
                {track.moderationStatus === 'approved' && (
                  <button
                    onClick={() => moderate.mutate({ id: track.id, action: 'archive' })}
                    className="text-xs px-3 py-1 rounded-full bg-border/40 text-text-muted hover:bg-border transition-colors"
                  >
                    Archive
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Jobs */}
      {activeTab === 'Jobs' && (
        <div className="flex flex-col gap-2">
          {jobs?.map(job => (
            <div key={job.id} className="p-4 rounded-2xl bg-card border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <StatusBadge status={job.status} />
                  <span className="text-xs text-text-muted capitalize">{job.provider}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  {job.actualCost !== null && <span>${job.actualCost.toFixed(3)}</span>}
                  <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <p className="text-sm text-text-secondary truncate mb-1">"{job.inputPrompt}"</p>
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>{job.user.email}</span>
                {job.resultTrack && <span className="text-green-400">→ {job.resultTrack.title}</span>}
              </div>
            </div>
          ))}
          {jobs?.length === 0 && (
            <p className="text-center py-16 text-text-muted">No generation jobs yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
