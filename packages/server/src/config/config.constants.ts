import { config } from 'dotenv';

config();

export default {
  PORT: parseInt(process.env.PORT) || 3001,
  ENVIRONMENT: process.env.ENVIRONMENT,
};
