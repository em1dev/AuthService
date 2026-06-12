import { decrypt, encrypt } from '../../../encryption';
import { HandlerApiResult } from '../../../HandlerApiResult';
import { createOrUpdateApp, CreateOrUpdateStatus, getAppServices } from '../../../repository/appRepository';
import { ExternalServiceType } from '../../../repository/types';

type CreateOrUpdateHandlerResult = Array<{
  id: number,
  clientId: string,
  clientSecret: string,
  type: ExternalServiceType
}>

export const createOrUpdateAppHandler = async (
  appName: string,
  externalServices: Array<{
    type: ExternalServiceType,
    clientSecret: string,
    clientId: string
  }>): Promise<HandlerApiResult<CreateOrUpdateHandlerResult>> => {

  const newExternalServicesEncrypted = externalServices.map(service => ({
    ...service,
    clientSecret: encrypt(service.clientSecret),
    clientId: encrypt(service.clientId)
  }));

  const createStatus = await createOrUpdateApp(appName, newExternalServicesEncrypted);
  if (createStatus == CreateOrUpdateStatus.Failed) {
    return HandlerApiResult.Error(500, 'Unable to create service');
  }

  const statusCode = createStatus == CreateOrUpdateStatus.Created ? 201 : 200;

  const servicesEncrypted = await getAppServices(appName);
  const servicesDecrypted = servicesEncrypted.map(service => ({
    ...service,
    clientSecret: decrypt(service.clientSecret),
    clientId: decrypt(service.clientId)
  }));

  return HandlerApiResult.Success(statusCode, servicesDecrypted);
};
