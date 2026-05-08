import path from 'node:path';

import FastifyEnv, { type FastifyEnvOptions } from '@fastify/env';
import { Type } from '@sinclair/typebox';

declare module 'fastify' {
  interface FastifyInstance {
    config: {
      POSTGRES_HOST: string;
      POSTGRES_USER: string;
      POSTGRES_PASSWORD: string;
      POSTGRES_DB: string;
      POSTGRES_PORT: number;
      LOG_LEVEL: (typeof LogLevel)[keyof typeof LogLevel];
      HOST: string;
      PORT: number;
      NODE_ENV: (typeof NodeEnv)[keyof typeof NodeEnv];
      ALLOWED_ORIGINS: string;
      JWT_SECRET: string;
      MAILERSEND_API_TOKEN: string;
      TWILIO_ACCOUNT_SID: string;
      TWILIO_AUTH_TOKEN: string;
      TWILIO_PHONE_NUMBER: string;
      DB_AUTO_RESET: boolean;
    };
  }
}

export const LogLevel = {
  trace: 'trace',
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error'
} as const;

const NodeEnv = {
  production: 'production',
  test: 'test',
  development: 'development'
} as const;

const schema = Type.Object({
  POSTGRES_HOST: Type.String(),
  POSTGRES_USER: Type.String(),
  POSTGRES_PASSWORD: Type.String(),
  POSTGRES_DB: Type.String(),
  POSTGRES_PORT: Type.Number({ default: 5432 }),
  LOG_LEVEL: Type.Enum(LogLevel),
  HOST: Type.String({ default: 'localhost' }),
  PORT: Type.Number({ default: 3000 }),
  NODE_ENV: Type.Enum(NodeEnv, { default: NodeEnv.development }),
  JWT_SECRET: Type.String(),
  ALLOWED_ORIGINS: Type.String({ default: 'http://localhost:5173' }),
  MAILERSEND_API_TOKEN: Type.String(),
  TWILIO_ACCOUNT_SID: Type.String(),
  TWILIO_AUTH_TOKEN: Type.String(),
  TWILIO_PHONE_NUMBER: Type.String(),
  DB_AUTO_RESET: Type.Boolean({ default: false }),
});

export const autoConfig: FastifyEnvOptions = {
  schema,
  dotenv: {
    path: path.join(import.meta.dirname, '../../../.env')
  }
};

export default FastifyEnv;
