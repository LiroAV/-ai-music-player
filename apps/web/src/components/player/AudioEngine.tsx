'use client'

import { useEffect, useRef } from 'react'
import { usePlayerStore } from '@/store/player'
import { api } from '@/lib/api'

export function AudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playStartRef = useRef<number>(0)
  const lastTrackIdRef = useRef<string | null>(null)

  const { currentTrack, status, volume, setPosition, setStatus, skipNext, sessionId } =
    usePlayerStore()

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.preload = 'auto'
    }
    const audio = audioRef.current

    const onTimeUpdate = () => setPosition(audio.currentTime)
    const onEnded = () => {
      sendEvent('complete', audio.duration)
      skipNext()
    }
    const onError = () => setStatus('error')
    const onCanPlay = () => { if (status === 'loading') setStatus('playing') }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)
    audio.addEventListener('canplay', onCanPlay)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
      audio.removeEventListener('canplay', onCanPlay)
    }
  }, [setPosition, setStatus, skipNext, status])

  // Track changes — send play event for new track
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    if (currentTrack.id !== lastTrackIdRef.current) {
      // Send skip for the previous track if it had started
      if (lastTrackIdRef.current && audio.currentTime > 0) {
        sendEvent('skip', audio.currentTime, lastTrackIdRef.current)
      }
      lastTrackIdRef.current = currentTrack.id
      playStartRef.current = Date.now()

      if (audio.src !== currentTrack.audioUrl) {
        audio.src = currentTrack.audioUrl
        audio.load()
      }

      sendEvent('play', 0)
    }
  }, [currentTrack])

  // Sync play/pause
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (status === 'playing') {
      audio.play().catch(() => setStatus('error'))
    } else if (status === 'paused') {
      audio.pause()
    }
  }, [status, setStatus])

  // Sync volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  return null
}

function sendEvent(
  eventType: string,
  positionSeconds: number,
  overrideTrackId?: string,
) {
  const { currentTrack, sessionId } = usePlayerStore.getState()
  const trackId = overrideTrackId ?? currentTrack?.id
  if (!trackId) return

  api.post(`/tracks/${trackId}/play-event`, {
    eventType,
    positionSeconds: Math.round(positionSeconds),
    sessionId,
  }).catch(() => {}) // fire-and-forget, don't surface errors to user
}
