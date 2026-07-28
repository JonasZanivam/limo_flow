import './observability/tracing';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { validateEnvironment } from './common/config/env.validation';
import { applySecurity } from './common/security/security';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  validateEnvironment(app);
  applySecurity(app);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`LimoFlow API rodando em http://localhost:${port}`);
}
bootstrap();
