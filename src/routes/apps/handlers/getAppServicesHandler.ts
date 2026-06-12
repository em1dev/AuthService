import { decrypt } from '../../../encryption';
import { HandlerApiResult } from '../../../HandlerApiResult';
import { getAppServices } from '../../../repository/appRepository';
import { ExternalServiceType } from '../../../repository/types';

type GetAppServicesResult = Array<{
  id: number,
  clientId: string,
  clientSecret: string,
  type: ExternalServiceType
}>

export const getAppServicesHandler = async (appName: string):Promise<HandlerApiResult<GetAppServicesResult>> => {
  const servicesEncrypted = await getAppServices(appName);
  const decryptedServices = servicesEncrypted.map(service => ({
    ...service,
    clientId: decrypt(service.clientId),
    clientSecret: decrypt(service.clientSecret)
  }));

  const status = decryptedServices.length > 0 ? 200 : 404;
  return HandlerApiResult.Success(status, decryptedServices);
};
