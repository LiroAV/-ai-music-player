import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bull'
import { GenerationController } from './generation.controller'
import { GenerationService } from './generation.service'
import { GenerationProcessor } from './generation.processor'
import { MockGenerationProvider } from './providers/mock.provider'
import { LyriaGenerationProvider } from './providers/lyria.provider'
import { PromptBuilderService } from './prompt-builder.service'

@Module({
  imports: [
    BullModule.registerQueue({ name: 'generation' }),
  ],
  controllers: [GenerationController],
  providers: [
    GenerationService,
    GenerationProcessor,
    PromptBuilderService,
    MockGenerationProvider,
    LyriaGenerationProvider,
    {
      provide: 'GENERATION_PROVIDER',
      useFactory: (mock: MockGenerationProvider, lyria: LyriaGenerationProvider) => {
        const provider = process.env['GENERATION_PROVIDER'] ?? 'mock'
        return provider === 'lyria' ? lyria : mock
      },
      inject: [MockGenerationProvider, LyriaGenerationProvider],
    },
  ],
  exports: [GenerationService],
})
export class GenerationModule {}
