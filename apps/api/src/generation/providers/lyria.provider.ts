import { Injectable, Logger } from '@nestjs/common'
import { createClient } from '@supabase/supabase-js'
import type { StructuredPrompt } from '@ai-music-player/types'
import type { IGenerationProvider, GenerationResult } from './mock.provider'

const LYRIA_MODEL = 'lyria-3-clip-preview'
const BUCKET = 'audio'

@Injectable()
export class LyriaGenerationProvider implements IGenerationProvider {
  private readonly logger = new Logger(LyriaGenerationProvider.name)
  private readonly apiKey = process.env['GEMINI_API_KEY']!
  private readonly supabase = createClient(
    process.env['SUPABASE_URL']!,
    process.env['SUPABASE_SERVICE_ROLE_KEY']!,
  )

  getName(): string { return 'lyria' }

  estimateCost(_durationSeconds: number): number {
    return 0.02
  }

  async generate(prompt: StructuredPrompt, textPrompt: string): Promise<GenerationResult> {
    this.logger.log(`Lyria generating: "${textPrompt}"`)

    await this.ensureBucket()

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${LYRIA_MODEL}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: this.buildMusicPrompt(prompt, textPrompt) }] }],
        }),
      },
    )

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Lyria API ${res.status}: ${err}`)
    }

    const data = await res.json() as {
      candidates?: Array<{ content: { parts: Array<{ inlineData?: { data: string; mimeType: string } }> } }>
    }

    const part = data?.candidates?.[0]?.content?.parts?.[0]
    if (!part?.inlineData?.data) {
      throw new Error(`No audio in Lyria response: ${JSON.stringify(data).slice(0, 300)}`)
    }

    const audioBuffer = Buffer.from(part.inlineData.data, 'base64')
    const ext = part.inlineData.mimeType.includes('mp3') ? 'mp3' : 'wav'
    const filename = `generated/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    const { error: uploadError } = await this.supabase.storage
      .from(BUCKET)
      .upload(filename, audioBuffer, { contentType: part.inlineData.mimeType, upsert: false })

    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)

    const { data: { publicUrl } } = this.supabase.storage.from(BUCKET).getPublicUrl(filename)

    // WAV: ~176400 bytes/sec (44.1kHz, 16-bit, stereo); MP3: ~16000 bytes/sec at 128kbps
    const bytesPerSec = ext === 'mp3' ? 16000 : 176400
    const durationSeconds = Math.max(10, Math.round(audioBuffer.length / bytesPerSec))

    this.logger.log(`Generated ${durationSeconds}s clip → ${publicUrl}`)
    return { audioUrl: publicUrl, durationSeconds, model: LYRIA_MODEL }
  }

  private buildMusicPrompt(prompt: StructuredPrompt, textPrompt: string): string {
    const parts: string[] = []

    if (textPrompt) parts.push(textPrompt)

    if (prompt.primaryGenre) parts.push(`Genre: ${prompt.primaryGenre}`)
    if (prompt.moods.length) parts.push(`Mood: ${prompt.moods.join(', ')}`)
    if (!prompt.vocals) parts.push('No vocals, instrumental only')
    if (prompt.tempo) parts.push(`Tempo: ${prompt.tempo}`)
    if (prompt.instruments.length) parts.push(`Instruments: ${prompt.instruments.join(', ')}`)

    return parts.join('. ') + '. High quality, professional recording.'
  }

  private async ensureBucket() {
    const { data: buckets } = await this.supabase.storage.listBuckets()
    if (!buckets?.some(b => b.name === BUCKET)) {
      await this.supabase.storage.createBucket(BUCKET, { public: true })
      this.logger.log(`Created storage bucket: ${BUCKET}`)
    }
  }
}
