import * as dotenv from 'dotenv';

dotenv.config();

interface ConfigType {
  DB_URL: string;
  PORT: string;
  NODE_ENV: string;

  TOKEN: {
    ACCESS_TOKEN_KEY: string;
    ACCESS_TOKEN_TIME: number;
    REFRESH_TOKEN_KEY: string;
    REFRESH_TOKEN_TIME: number;
    JWT_SECRET_KEY: string;
  };

  SUPERADMIN: {
    SUPERADMIN_USERNAME: string;
    SUPERADMIN_PASSWORD: string;
    SUPER_ADMIN_PHONE_NUMBER: string;
  };

  GOOGLE_AUTH: {
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GOOGLE_CALLBACK_URL: string;
  };

  FRONTEND_URL: string;
  SWAGGER_URL: string;

  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;

  TELEGRAM_BOT_TOKEN: string;

  BACKEND_URL: string;

  MAIL: {
    MAIL_PASS: string;
    MAIL_HOST: string;
    MAIL_PORT: number;
    MAIL_SECURE: boolean;
    MAIL_USER: string;
  };
}

const isProd = process.env.NODE_ENV === 'prod';

export const config: ConfigType = {
  DB_URL: String(process.env.DB_URL),
  PORT: String(process.env.PORT || '5000'),
  NODE_ENV: String(process.env.NODE_ENV),

  TOKEN: {
    ACCESS_TOKEN_KEY: String(process.env.ACCESS_TOKEN_KEY),
    ACCESS_TOKEN_TIME: Number(process.env.ACCESS_TOKEN_TIME),
    REFRESH_TOKEN_KEY: String(process.env.REFRESH_TOKEN_KEY),
    REFRESH_TOKEN_TIME: Number(process.env.REFRESH_TOKEN_TIME),
    JWT_SECRET_KEY: String(process.env.JWT_SECRET_KEY),
  },

  SUPERADMIN: {
    SUPERADMIN_USERNAME: String(process.env.SUPERADMIN_USERNAME),
    SUPERADMIN_PASSWORD: String(process.env.SUPERADMIN_PASSWORD),
    SUPER_ADMIN_PHONE_NUMBER: String(process.env.SUPER_ADMIN_PHONE_NUMBER),
  },

  GOOGLE_AUTH: {
    GOOGLE_CALLBACK_URL: isProd
      ? String(process.env.GOOGLE_CALLBACK_URL_SERVER)
      : String(process.env.GOOGLE_CALLBACK_URL_LOCAL),
    GOOGLE_CLIENT_ID: String(process.env.GOOGLE_CLIENT_ID),
    GOOGLE_CLIENT_SECRET: String(process.env.GOOGLE_CLIENT_SECRET),
  },

  FRONTEND_URL: isProd
    ? String(process.env.FRONTEND_URL_SERVER)
    : String(process.env.FRONTEND_URL_LOCAL),

  SWAGGER_URL: isProd
    ? String(process.env.SWAGGER_URL_SERVER)
    : String(process.env.SWAGGER_URL_LOCAL),

  REDIS_HOST: String(process.env.REDIS_HOST),
  REDIS_PORT: Number(process.env.REDIS_PORT),
  REDIS_PASSWORD: String(process.env.REDIS_PASSWORD),

  BACKEND_URL: isProd
    ? String(process.env.BACKEND_URL_SERVER)
    : String(process.env.BACKEND_URL_LOCAL),

  MAIL: {
    MAIL_HOST: String(process.env.MAIL_HOST),
    MAIL_PASS: String(process.env.MAIL_PASS),
    MAIL_PORT: Number(process.env.MAIL_PORT),
    MAIL_SECURE: process.env.MAIL_PORT === '465',
    MAIL_USER: String(process.env.MAIL_USER),
  },

  TELEGRAM_BOT_TOKEN: String(process.env.TELEGRAM_BOT_TOKEN),
};
