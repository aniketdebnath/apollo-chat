/**
 * Database migration service
 *
 * Handles automatic database schema migrations during application startup
 * using the migrate-mongo library.
 */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { config, database, up } from 'migrate-mongo';

/**
 * DbMigrationService
 *
 * Service that configures and runs database migrations on application startup.
 * Implements OnModuleInit to ensure migrations run before the application starts
 * accepting requests.
 */
@Injectable()
export class DbMigrationService implements OnModuleInit {
  /**
   * Configuration for migrate-mongo
   */
  private readonly dbMigrationConfig: Partial<config.Config>;

  constructor(private readonly configService: ConfigService) {
    this.dbMigrationConfig = {
      mongodb: {
        databaseName: this.configService.getOrThrow('DB_NAME'),
        url: this.configService.getOrThrow('MONGO_URI'),
      },
      migrationsDir: `${__dirname}/../../migrations`,
      changelogCollectionName: 'changelog',
      migrationFileExtension: '.js',
    };
  }

  /**
   * Runs pending database migrations when the application starts
   *
   * This method is automatically called by NestJS when the module is initialized.
   * It applies any pending migrations that haven't been run yet.
   */
  async onModuleInit() {
    config.set(this.dbMigrationConfig);
    const { db, client } = await database.connect();
    await up(db, client);
  }
}
