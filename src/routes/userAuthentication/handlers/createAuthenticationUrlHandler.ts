import { decrypt } from '../../../encryption';
import { HandlerApiResult } from '../../../HandlerApiResult';
import { getApp, getAppService } from '../../../repository/appRepository';
import { ExternalServiceType } from '../../../repository/types';
import { urlGenerator } from '../../../urlGenerator';


export const createAuthenticationUrlHandler = async (
  appId: string, redirectUrl: string, scopes: string[], providerId: ExternalServiceType
):Promise<HandlerApiResult<{ authUrl: string }>> => {

  const app = getApp(appId);
  if (!app)
    return HandlerApiResult.Error(404, 'App not found');

  const service = await getAppService(appId, providerId);
  if (!service)
    return HandlerApiResult.Error(400, 'App does not support this service');

  const clientId = decrypt(service.clientId);
  const url = urlGenerator.generateUrl(clientId, redirectUrl, scopes, providerId);

  if (!url)
    return HandlerApiResult.Error(400, 'Not implemented');

  return HandlerApiResult.Success(200, { authUrl: url });
};
