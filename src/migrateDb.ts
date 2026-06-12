import { logger } from './logger';
import { db } from './repository/db';
import { MigrationRunner } from './repository/db/migrations';

(async () => {
  const migrationRunner = new MigrationRunner(db);
  logger.info('Migration started...');
  await migrationRunner.run();
  logger.info('Completed');
})();
