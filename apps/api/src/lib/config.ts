import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  redisUrl: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtAccessExpiresIn: string;
  jwtRefreshExpiresIn: string;
  encryptionKey: string;
  logLevel: string;
  corsOrigin: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] ?? defaultValue;
}

function loadConfig(): Config {
  const errors: string[] = [];

  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'ENCRYPTION_KEY',
  ];

  for (const name of required) {
    if (!process.env[name]) {
      errors.push(`Missing required environment variable: ${name}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`);
  }

  return {
    port: parseInt(optionalEnv('PORT', '3001'), 10),
    nodeEnv: optionalEnv('NODE_ENV', 'development'),
    databaseUrl: requireEnv('DATABASE_URL'),
    redisUrl: optionalEnv('REDIS_URL', 'redis://localhost:6379'),
    jwtSecret: requireEnv('JWT_SECRET'),
    jwtRefreshSecret: requireEnv('JWT_REFRESH_SECRET'),
    jwtAccessExpiresIn: optionalEnv('JWT_ACCESS_EXPIRES_IN', '15m'),
    jwtRefreshExpiresIn: optionalEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
    encryptionKey: requireEnv('ENCRYPTION_KEY'),
    logLevel: optionalEnv('LOG_LEVEL', 'info'),
    corsOrigin: optionalEnv('CORS_ORIGIN', '*'),
  };
}

export const config = loadConfig();
