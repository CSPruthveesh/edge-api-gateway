import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface EnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  HOST: string;
  LOG_LEVEL: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
  REDIS_URL: string;
  MONGO_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  DEFAULT_RATE_LIMIT_WINDOW_MS: number;
  DEFAULT_RATE_LIMIT_MAX_REQUESTS: number;
  AUDIT_LOG_BATCH_SIZE: number;
  AUDIT_LOG_FLUSH_INTERVAL_MS: number;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`[FATAL] Missing required environment variable: ${key}`);
  }
  return value;
};

const getEnvNumber = (key: string, defaultValue?: number): number => {
  const rawValue = process.env[key];
  if (!rawValue) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`[FATAL] Missing required environment variable: ${key}`);
  }
  const parsed = parseInt(rawValue, 10);
  if (isNaN(parsed)) {
    throw new Error(`[FATAL] Environment variable ${key} must be a valid integer, received: "${rawValue}"`);
  }
  return parsed;
};

export const envConfig: EnvConfig = {
  NODE_ENV: (getEnvVar('NODE_ENV', 'development') as EnvConfig['NODE_ENV']),
  PORT: getEnvNumber('PORT', 3000),
  HOST: getEnvVar('HOST', '0.0.0.0'),
  LOG_LEVEL: (getEnvVar('LOG_LEVEL', 'info') as EnvConfig['LOG_LEVEL']),
  REDIS_URL: getEnvVar('REDIS_URL', 'redis://localhost:6379'),
  MONGO_URI: getEnvVar('MONGO_URI', 'mongodb://localhost:27017/edge_gateway_db'),
  JWT_SECRET: getEnvVar('JWT_SECRET', 'super_secret_edge_gateway_jwt_key_2026_production_ready'),
  JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '1h'),
  DEFAULT_RATE_LIMIT_WINDOW_MS: getEnvNumber('DEFAULT_RATE_LIMIT_WINDOW_MS', 60000),
  DEFAULT_RATE_LIMIT_MAX_REQUESTS: getEnvNumber('DEFAULT_RATE_LIMIT_MAX_REQUESTS', 1000),
  AUDIT_LOG_BATCH_SIZE: getEnvNumber('AUDIT_LOG_BATCH_SIZE', 100),
  AUDIT_LOG_FLUSH_INTERVAL_MS: getEnvNumber('AUDIT_LOG_FLUSH_INTERVAL_MS', 1000)
};

export default envConfig;
