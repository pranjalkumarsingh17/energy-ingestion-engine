import { Module, OnModuleInit, OnModuleDestroy, Logger, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import config from '../config';

@Module({
  providers: [
    {
      provide: 'PG',
      useFactory: async () => {
        const pool = new Pool({
          host: config.POSTGRES_HOST,
          port: parseInt(config.POSTGRES_PORT, 10),
          user: config.POSTGRES_USERNAME,
          password: config.POSTGRES_PASSWORD,
          database: config.POSTGRES_DATABASE,
          // ssl: { rejectUnauthorized: false },
        });

        await pool.query('SELECT 1');

        return pool;
      },
    },
  ],
  exports: ['PG'],
})
export class DatabaseModule
  implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(@Inject('PG') private readonly pool: Pool) { }

  onModuleInit() {
    this.logger.log('✅ PostgreSQL connected successfully');
  }

  async onModuleDestroy() {
    await this.pool.end();
    this.logger.log('🛑 PostgreSQL pool closed');
  }
}
