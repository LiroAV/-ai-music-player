import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bull'
import { GenerationController } from './generation.controller'
import { GenerationService } from './generation.service'
import { GenerationProcessor } from './generation.processor'
import { MockGenerationProvider } from './providers/mock.provider'
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
    {
      provide: 'GENERATION_PROVIDER',
      useClass: MockGenerationProvider,
    },
  ],
  exports: [GenerationService],
})
export class GenerationModule {}
