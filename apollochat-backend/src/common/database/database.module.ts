/**
 * Database module imports and dependencies
 */
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModelDefinition, MongooseModule } from '@nestjs/mongoose';
import { DbMigrationService } from './db-migration.service';

/**
 * DatabaseModule
 *
 * Core module that configures MongoDB connection and provides
 * database-related services. Automatically runs migrations on startup.
 */
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [DbMigrationService],
})
export class DatabaseModule {
  /**
   * Helper method to register MongoDB models in feature modules
   *
   * Provides a consistent way to register models across the application
   * while maintaining the proper dependency structure.
   *
   * @param models - Array of model definitions to register
   * @returns MongoDB feature module
   */
  static forFeature(models: ModelDefinition[]) {
    return MongooseModule.forFeature(models);
  }
}
