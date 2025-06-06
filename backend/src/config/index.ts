import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config();

interface Config {
  // Server
  NODE_ENV: string;
  PORT: number;
  API_PREFIX: string;

  // Database
  MONGODB_URI: string;
  MONGODB_TEST_URI: string;

  // Redis
  REDIS_URL: string;
  REDIS_PASSWORD?: string;

  // JWT
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;

  // Encryption
  BCRYPT_ROUNDS: number;

  // Email
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;
  EMAIL_FROM: string;

  // File Upload
  UPLOAD_DIR: string;
  MAX_FILE_SIZE: number;
  ALLOWED_FILE_TYPES: string[];

  // Cloudinary
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;

  // Security
  CORS_ORIGIN: string;
  COOKIE_SECRET: string;

  // External APIs
  PAYMENT_GATEWAY_URL?: string;
  PAYMENT_GATEWAY_KEY?: string;

  // Monitoring
  LOG_LEVEL: string;
  SENTRY_DSN?: string;

  // Development
  SEED_DATABASE: boolean;
  ENABLE_DOCS: boolean;
}

const requiredEnvVars = [
  'NODE_ENV',
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
  'EMAIL_FROM',
  'CORS_ORIGIN',
  'COOKIE_SECRET'
];

// Validar variables de entorno requeridas
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Environment variable ${envVar} is required but not defined`);
  }
}

const config: Config = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  API_PREFIX: process.env.API_PREFIX || '/api/v1',

  // Database
  MONGODB_URI: process.env.MONGODB_URI!,
  MONGODB_TEST_URI: process.env.MONGODB_TEST_URI || process.env.MONGODB_URI!,

  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  // Encryption
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),

  // Email
  SMTP_HOST: process.env.SMTP_HOST!,
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER!,
  SMTP_PASS: process.env.SMTP_PASS!,
  EMAIL_FROM: process.env.EMAIL_FROM!,

  // File Upload
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES?.split(',') || ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  // Security
  CORS_ORIGIN: process.env.CORS_ORIGIN!,
  COOKIE_SECRET: process.env.COOKIE_SECRET!,

  // External APIs
  PAYMENT_GATEWAY_URL: process.env.PAYMENT_GATEWAY_URL,
  PAYMENT_GATEWAY_KEY: process.env.PAYMENT_GATEWAY_KEY,

  // Monitoring
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  SENTRY_DSN: process.env.SENTRY_DSN,

  // Development
  SEED_DATABASE: process.env.SEED_DATABASE === 'true',
  ENABLE_DOCS: process.env.ENABLE_DOCS !== 'false' // true by default
};

// Validaciones adicionales
if (config.NODE_ENV === 'production') {
  const productionRequiredVars = ['CLOUDINARY_CLOUD_NAME', 'PAYMENT_GATEWAY_URL'];
  for (const envVar of productionRequiredVars) {
    if (!process.env[envVar]) {
      console.warn(`Warning: Production environment variable ${envVar} is not defined`);
    }
  }
}

export default config;

// Helper functions
export const isDevelopment = () => config.NODE_ENV === 'development';
export const isProduction = () => config.NODE_ENV === 'production';
export const isTest = () => config.NODE_ENV === 'test';

// Paths
export const paths = {
  uploads: path.resolve(config.UPLOAD_DIR),
  logs: path.resolve('logs'),
  temp: path.resolve('temp')
};
