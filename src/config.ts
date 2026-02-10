import * as dotenv from 'dotenv';

dotenv.config();
console.log('Environment variables loaded on config.ts');


export default {
    PORT: process.env.PORT ?? 5001,
    POSTGRES_HOST: process.env.POSTGRES_HOST ?? '',
    POSTGRES_PORT: process.env.POSTGRES_PORT ?? '',
    POSTGRES_USERNAME: process.env.POSTGRES_USERNAME ?? '',
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD ?? '',
    POSTGRES_DATABASE: process.env.POSTGRES_DATABASE ?? '',
}