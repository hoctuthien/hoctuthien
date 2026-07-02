export default () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  logLevel: process.env.LOG_LEVEL || 'info',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  database: {
    url: process.env.DATABASE_URL,
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
  },
  redis: {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  },
  openinary: {
    url: process.env.OPENINARY_URL,
    apiKey: process.env.OPENINARY_API_KEY,
  },
  mail: {
    enabled: process.env.MAIL_ENABLED === 'true',
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    secure: process.env.MAIL_SECURE === 'true',
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    fromName: process.env.MAIL_FROM_NAME || 'HocTuThien',
    fromEmail: process.env.MAIL_FROM_EMAIL,
    replyTo: process.env.MAIL_REPLY_TO,
    frontendBaseUrl: process.env.FRONTEND_BASE_URL,
    publicAssetBaseUrl:
      process.env.PUBLIC_ASSET_BASE_URL || process.env.FRONTEND_BASE_URL,
  },
});
