import { createWriteStream, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { Writable } from 'node:stream';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import type { IncomingMessage } from 'node:http';
import { getRequestId } from './tracing';

function createTeeStream(): Writable {
  const logsDir = join(process.cwd(), 'logs');
  mkdirSync(logsDir, { recursive: true });
  const fileStream = createWriteStream(join(logsDir, 'app.log'), {
    flags: 'a',
  });

  return new Writable({
    write(chunk, encoding, callback) {
      process.stdout.write(chunk, encoding);
      fileStream.write(chunk, encoding, callback);
    },
  });
}

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const logToFile = configService.get<string>('LOG_TO_FILE') === 'true';
        const isDev = configService.get<string>('NODE_ENV') !== 'production';

        return {
          pinoHttp: {
            level: configService.get<string>('LOG_LEVEL') ?? 'info',
            redact: {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'req.body.password',
                'req.body.refreshToken',
                'res.headers["set-cookie"]',
              ],
              remove: true,
            },
            genReqId: (req: IncomingMessage) =>
              getRequestId(req.headers['x-request-id']),
            customProps: (req: IncomingMessage & { id?: string }) => ({
              requestId: req.id,
              service:
                configService.get<string>('OTEL_SERVICE_NAME') ??
                'limoflow-api',
            }),
            stream: logToFile ? createTeeStream() : undefined,
            transport:
              !logToFile && isDev
                ? {
                    target: 'pino-pretty',
                    options: {
                      colorize: true,
                      singleLine: true,
                      translateTime: 'SYS:standard',
                    },
                  }
                : undefined,
            autoLogging: {
              ignore: (req: IncomingMessage) => req.url === '/health',
            },
          },
        };
      },
    }),
  ],
})
export class ObservabilityModule {}
