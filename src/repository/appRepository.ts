import { db } from './db';
import { ExternalServiceType, Tables } from './types';

export interface ExternalServiceDto {
  id: number,
  type: ExternalServiceType,
  clientSecret: string,
  clientId: string
}

const getAppServices = async (appId: string) => (
  await db.all<ExternalServiceDto>(`
    SELECT id, type, client_secret as clientSecret, client_id as clientId
    FROM ${Tables.externalService}
    WHERE fk_app_id = $appId
  `, { $appId: appId })
);

const getAppService = async (appId: string, serviceType: ExternalServiceType) => (
  await db.get<ExternalServiceDto>(`
      SELECT id, type, client_secret as clientSecret, client_id as clientId
      FROM ${Tables.externalService}
      WHERE type = $type AND fk_app_id = $appId
    `, { $type: serviceType, $appId: appId })
);

const getApp = async (appId: string) => {
  const app = await db.get<{
      id: string,
    }>(`
      SELECT *
      FROM ${Tables.app}
      WHERE id = $appId
    `, { $appId: appId });

  return app;
};

const getAppIds = async () => (
  await db.all<{
      id: string,
    }>(`
      SELECT *
      FROM ${Tables.app}
    `)
);

export enum CreateOrUpdateStatus
{
  Created,
  Updated,
  Failed
}

const createOrUpdateApp = async (nameId: string, externalService: Array<{
    type: ExternalServiceType,
    clientSecret: string,
    clientId: string,
  }>): Promise<CreateOrUpdateStatus> => {
  try {
    db.run('BEGIN TRANSACTION');
    let resultStatus = CreateOrUpdateStatus.Updated;

    const existingApp = await getApp(nameId);
    if (!existingApp){
      await db.run(`
          INSERT INTO ${Tables.app} (id)
          VALUES ($appId);
        `, { $appId: nameId});
      resultStatus = CreateOrUpdateStatus.Created;
    }

    for (const service of externalService) {
      const existingService = await getAppService(nameId, service.type);
      if (existingService) {
        // if exists update
        await db.run(`
            UPDATE ${Tables.externalService}
            SET client_secret = $clientSecret, client_id = $clientId
            WHERE fk_app_id = $appId AND type = $type
          `, {
          $type: service.type, $clientSecret: service.clientSecret, $clientId: service.clientId, $appId: nameId
        });
      } else {
        // if not, create
        await db.run(`
            INSERT INTO ${Tables.externalService} (type, client_secret, client_id, fk_app_id)
            VALUES ($type, $clientSecret, $clientId, $appId)
          `, {
          $type: service.type, $clientSecret: service.clientSecret, $clientId: service.clientId, $appId: nameId
        });
        resultStatus = CreateOrUpdateStatus.Created;
      }
    }

    db.run('COMMIT TRANSACTION');
    return resultStatus;

  } catch(exception) {
    db.run('ROLLBACK TRANSACTION');
    console.error('Failed to create or update app:', exception);
    return CreateOrUpdateStatus.Failed;
  }
};

export {
  createOrUpdateApp,
  getApp,
  getAppIds,
  getAppService,
  getAppServices
};
