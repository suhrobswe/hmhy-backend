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
}

export const config: ConfigType = {
  DB_URL: String(process.env.DB_URL),
  PORT: String(process.env.PORT),
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
};
