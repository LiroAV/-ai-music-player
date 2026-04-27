import { Injectable } from '@nestjs/common'
import type { GenerationRequest, StructuredPrompt } from '@music-gem2/types'

const BLOCKED_ARTIST_PATTERNS = [
  /drake|kendrick|taylor swift|beyonc|eminem|kanye|adele|ed sheeran|billie eilish/i,
  /hans zimmer|john williams|ennio morricone/i,
  /beethoven|mozart|bach|chopin/i,
]

@Injectable()
export class PromptBuilderService {
  build(req: GenerationRequest): StructuredPrompt {
    const genre = req.genre ?? 'ambient'
    const moods = req.mood ?? ['calm']
    const energy = req.energy ?? 0.4
    const vocals = req.vocals ?? false
    const duration = req.durationSeconds ?? 120

    return {
      primaryGenre: genre,
      subgenres: this.inferSubgenres(genre),
      moods,
      tempo: this.energyToTempo(energy),
      bpmRange: this.energyToBpmRange(energy),
      instruments: this.inferInstruments(genre, vocals),
      vocals,
      energy,
      complexity: 0.5,
      durationSeconds: duration,
      avoid: ['harsh distortion', 'aggressive drums', 'explicit lyrics'],
    }
  }

  toTextPrompt(s: StructuredPrompt): string {
    const vocalsText = s.vocals ? 'with smooth vocals' : 'no vocals, purely instrumental'
    const instrumentList = s.instruments.slice(0, 4).join(', ')
    const moodText = s.moods.join(', ')
    const avoid = s.avoid.join(', ')

    return (
      `Create a ${moodText} ${s.primaryGenre} track. ` +
      `Instruments: ${instrumentList}. ` +
      `${vocalsText}. ` +
      `Tempo: ${s.tempo}, ${s.bpmRange[0]}–${s.bpmRange[1]} BPM. ` +
      `Energy level: ${Math.round(s.energy * 10)}/10. ` +
      `Duration approximately ${Math.round(s.durationSeconds / 60)} minutes. ` +
      `Avoid: ${avoid}.`
    )
  }

  sanitizePrompt(prompt: string): string {
    let sanitized = prompt
    for (const pattern of BLOCKED_ARTIST_PATTERNS) {
      sanitized = sanitized.replace(pattern, '[style descriptor]')
    }
    return sanitized
  }

  private inferSubgenres(genre: string): string[] {
    const map: Record<string, string[]> = {
      jazz: ['cool jazz', 'modern jazz'],
      lofi: ['chillhop', 'lo-fi hip hop'],
      ambient: ['atmospheric ambient'],
      cinematic: ['epic orchestral', 'trailer music'],
      synthwave: ['retrowave', 'darksynth'],
      classical: ['modern classical', 'neoclassical'],
    }
    return map[genre] ?? []
  }

  private inferInstruments(genre: string, vocals: boolean): string[] {
    const base: Record<string, string[]> = {
      jazz: ['upright bass', 'brush drums', 'soft piano', 'muted trumpet'],
      lofi: ['sampled piano', 'lo-fi drums', 'vinyl crackle', 'bass guitar'],
      ambient: ['synthesizer pads', 'soft piano', 'reverb guitar'],
      cinematic: ['full orchestra', 'strings', 'brass', 'percussion'],
      synthwave: ['analog synths', 'drum machine', 'bass synth'],
      funk: ['slap bass', 'funk guitar', 'keys', 'horns', 'drums'],
      piano: ['grand piano'],
      classical: ['strings', 'piano', 'woodwinds'],
    }
    const instruments = base[genre] ?? ['piano', 'bass', 'drums']
    if (vocals) instruments.push('vocals')
    return instruments
  }

  private energyToTempo(energy: number): string {
    if (energy < 0.25) return 'slow'
    if (energy < 0.45) return 'medium-slow'
    if (energy < 0.65) return 'medium'
    if (energy < 0.80) return 'medium-fast'
    return 'fast'
  }

  private energyToBpmRange(energy: number): [number, number] {
    const base = 60 + energy * 100
    return [Math.round(base - 10), Math.round(base + 10)]
  }
}
