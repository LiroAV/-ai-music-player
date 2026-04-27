import { IsString, IsOptional, IsIn, IsArray } from 'class-validator'

export class CreatePlaylistDto {
  @IsString()
  name!: string

  @IsString()
  @IsOptional()
  description?: string

  @IsIn(['public', 'private'])
  @IsOptional()
  visibility?: 'public' | 'private'
}

export class AddTracksDto {
  @IsArray()
  @IsString({ each: true })
  trackIds!: string[]
}
