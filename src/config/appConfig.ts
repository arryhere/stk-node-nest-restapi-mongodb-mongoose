import env from 'env-var';

export const appConfig = {
  app: {
    APP_ENV: env.get('APP_ENV').required().asString(),
    APP_HOST: env.get('APP_HOST').required().asString(),
    APP_PORT: env.get('APP_PORT').required().asPortNumber(),
  },

  mongodb: {
    MONGO_INITDB_ROOT_USERNAME: env.get('MONGO_INITDB_ROOT_USERNAME').required().asString(),
    MONGO_INITDB_ROOT_PASSWORD: env.get('MONGO_INITDB_ROOT_PASSWORD').required().asString(),
    MONGODB_URI: env.get('MONGODB_URI').required().asString(),
  },

  jwt: {
    JWT_ACCESS_TOKEN_SECRET: env.get('JWT_ACCESS_TOKEN_SECRET').required().asString(),
    JWT_REFRESH_TOKEN_SECRET: env.get('JWT_REFRESH_TOKEN_SECRET').required().asString(),
    JWT_VERIFY_TOKEN_SECRET: env.get('JWT_VERIFY_TOKEN_SECRET').required().asString(),
    JWT_FORGOT_PASSWORD_TOKEN_SECRET: env.get('JWT_FORGOT_PASSWORD_TOKEN_SECRET').required().asString(),
  },

  tokenExpiration: {
    ACCESS_TOKEN_EXPIRATION: env.get('ACCESS_TOKEN_EXPIRATION').required().asIntPositive(),
    REFRESH_TOKEN_EXPIRATION: env.get('REFRESH_TOKEN_EXPIRATION').required().asIntPositive(),
    VERIFY_TOKEN_EXPIRATION: env.get('VERIFY_TOKEN_EXPIRATION').required().asIntPositive(),
    FORGOT_PASSWORD_TOKEN_EXPIRATION: env.get('FORGOT_PASSWORD_TOKEN_EXPIRATION').required().asIntPositive(),
    TWO_FA_TOKEN_EXPIRATION: env.get('TWO_FA_TOKEN_EXPIRATION').required().asIntPositive(),
  },

  smtp: {
    SMTP_HOST: env.get('SMTP_HOST').required().asString(),
    SMTP_PORT: env.get('SMTP_PORT').required().asPortNumber(),
    SMTP_USER: env.get('SMTP_USER').required().asString(),
    SMTP_PASSWORD: env.get('SMTP_PASSWORD').required().asString(),
  },

  email: {
    EMAIL_FROM: env.get('EMAIL_FROM').required().asString(),
  },
};
