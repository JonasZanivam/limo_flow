import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const REQUIRED_VARS = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'] as const;

export function validateEnvironment(app: INestApplication): void {
  const configService = app.get(ConfigService);
  const missing = REQUIRED_VARS.filter((key) => !configService.get(key));

  if (missing.length > 0) {
    throw new Error(
      `Variáveis de ambiente obrigatórias ausentes: ${missing.join(', ')}`,
    );
  }

  if (process.env.NODE_ENV === 'production') {
    for (const key of ['JWT_SECRET', 'JWT_REFRESH_SECRET'] as const) {
      const value = configService.get<string>(key) ?? '';
      if (value.length < 32 || value.includes('change-me')) {
        throw new Error(
          `${key} deve ser uma string aleatória com pelo menos 32 caracteres em produção`,
        );
      }
    }
  }
}
