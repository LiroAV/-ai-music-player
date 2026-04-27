'use client'

import { useEffect, useRef } from 'react'
import { usePlayerStore } from '@/store/player'

// Invisible component that owns the <audio> element and syncs with Zustand
export function AudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { currentTrack, status, volume, positionSeconds, setPosition, setStatus, skipNext, sessionId } =
    usePlayerStore()

  // Init audio element once
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.preload = 'auto'
    }
    const audio = audioRef.current

    const onTimeUpdate = () => setPosition(audio.currentTime)
    const onEnded = () => skipNext()
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

  // Sync src when track changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return
    if (audio.src !== currentTrack.audioUrl) {
      audio.src = currentTrack.audioUrl
      audio.load()
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

  return null  // invisible
}
