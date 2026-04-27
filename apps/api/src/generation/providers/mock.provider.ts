import { Injectable } from '@nestjs/common'
import type { StructuredPrompt } from '@ai-music-player/types'

export interface IGenerationProvider {
  generate(prompt: StructuredPrompt, textPrompt: string): Promise<GenerationResult>
  getName(): string
  estimateCost(durationSeconds: number): number
}

export interface GenerationResult {
  audioUrl: string
  durationSeconds: number
  model: string
}

@Injectable()
export class MockGenerationProvider implements IGenerationProvider {
  // Mock provider uses royalty-free SoundHelix tracks for local development
  private readonly SAMPLE_URLS = [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  ]

  getName(): string {
    return 'mock'
  }

  estimateCost(durationSeconds: number): number {
    return 0
  }

  async generate(_prompt: StructuredPrompt, _textPrompt: string): Promise<GenerationResult> {
    await new Promise(r => setTimeout(r, 2000))  // simulate API latency
    const url = this.SAMPLE_URLS[Math.floor(Math.random() * this.SAMPLE_URLS.length)]!
    return { audioUrl: url, durationSeconds: 180, model: 'mock-v1' }
  }
}
