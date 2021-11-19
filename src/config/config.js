import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config({ path: '.env' });

const environmentVariablesSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid('production', 'development', 'test')
      .required(),
    PORT: Joi.number().required().default(3000),
    DATABASE_CONNECTION: Joi.string().required(),
    DATABASE_PASSWORD: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).required(),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).required(),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number().default(10).required(),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number().default(10).required(),
    CLIENT_EMAIL: Joi.string().required(),
    CLIENT_ID: Joi.string().required(),
    CLIENT_SECRET: Joi.string().required(),
    REDIRECT_URI: Joi.string().required(),
    REFRESH_TOKEN: Joi.string().required(),
    STRIPE_SECRET_KEY: Joi.string().required(),
    AWS_ACCESS_KEY_ID: Joi.string().required(),
    AWS_SECRET_ACCESS_KEY: Joi.string(),
    AWS_BUCKET_NAME: Joi.string().required(),
    AWS_REGION: Joi.string().required()
  })
  .unknown();
const { value: environmentVariables, error } = environmentVariablesSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: environmentVariables.NODE_ENV,
  server: {
    port: environmentVariables.PORT
  },
  db: {
    url: environmentVariables.DATABASE_CONNECTION,
    password: environmentVariables.DATABASE_PASSWORD
  },
  jwt: {
    secret: environmentVariables.JWT_SECRET,
    accessToken: {
      expire: environmentVariables.JWT_ACCESS_EXPIRATION_MINUTES
    },
    refreshToken: {
      expire: environmentVariables.JWT_REFRESH_EXPIRATION_DAYS
    },
    resetPasswordToken: {
      expire: environmentVariables.JWT_RESET_PASSWORD_EXPIRATION_MINUTES
    },
    verifyEmailToken: {
      expire: environmentVariables.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES
    }
  },
  email: {
    from: environmentVariables.CLIENT_EMAIL,
    client: {
      id: environmentVariables.CLIENT_ID,
      secret: environmentVariables.CLIENT_SECRET
    },
    RedirectUri: environmentVariables.REDIRECT_URI,
    RefreshToken: environmentVariables.REFRESH_TOKEN
  },
  stripe: {
    secret_key: environmentVariables.STRIPE_SECRET_KEY
  },
  aws: {
    accessKey: {
      id: environmentVariables.AWS_ACCESS_KEY_ID,
      secret: environmentVariables.AWS_SECRET_ACCESS_KEY
    },
    bucketName: environmentVariables.AWS_BUCKET_NAME,
    region: environmentVariables.AWS_REGION
  }
};

export default config;
