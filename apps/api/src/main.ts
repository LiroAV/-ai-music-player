import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import { AppModule } from './app.module'

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create(AppModule)

  app.use(helmet())

  const allowedOrigins = [
    process.env['FRONTEND_URL'] ?? 'http://localhost:3000',
    'https://ai-music-player-web.vercel.app',
  ]

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
        callback(null, true)
      } else {
        callback(null, false)
      }
    },
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  app.setGlobalPrefix('api')

  // Health check (used by Railway)
  const httpAdapter = app.getHttpAdapter()
  httpAdapter.get('/api/health', (_req: unknown, res: { json: (body: object) => void }) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  const config = new DocumentBuilder()
    .setTitle('Music Gem API')
    .setDescription('Music discovery platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  const port = process.env['PORT'] ?? 3001
  await app.listen(port)
  logger.log(`API running on http://localhost:${port}`)
  logger.log(`Swagger docs at http://localhost:${port}/api/docs`)
}

bootstrap()
