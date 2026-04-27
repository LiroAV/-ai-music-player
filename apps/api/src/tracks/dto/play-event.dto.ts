import { IsString, IsNumber, IsOptional, IsIn, IsObject, Min, Max } from 'class-validator'

const EVENT_TYPES = [
  'play', 'pause', 'skip', 'complete', 'replay',
  'like', 'dislike', 'save', 'unsave', 'rate',
  'add_to_playlist', 'remove_from_playlist', 'share', 'report',
] as const

export class EventContextDto {
  @IsString()
  source!: string

  @IsString()
  @IsOptional()
  playlistId?: string

  @IsString()
  @IsOptional()
  styleId?: string
}

export class PlayEventDto {
  @IsIn(EVENT_TYPES)
  eventType!: string

  @IsNumber()
  @IsOptional()
  positionSeconds?: number

  @IsString()
  sessionId!: string

  @IsObject()
  context!: EventContextDto

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number

  @IsString()
  @IsOptional()
  dislikeReason?: string
}

export class RateTrackDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number
}
