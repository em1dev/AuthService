import { TwitchApi } from '../../../api/twitchApi';
import { decrypt, encrypt } from '../../../encryption';
import { HandlerApiResult } from '../../../HandlerApiResult';
import { logger } from '../../../logger';
import { getAppService } from '../../../repository/appRepository';
import { deleteUserConnection, getUserConnection, updateUserConnection } from '../../../repository/connectionRepository';
import { ConnectionType, ExternalServiceType } from '../../../repository/types';
import { getUser } from '../../../repository/userRepository';
import { TokenRefreshService } from '../../../tokenRefreshService';

export const revokeConnectionTokenHandler = async (
  userId: number, appId: string, connectionTypeId: ConnectionType
): Promise<HandlerApiResult<null>> =>
{
  const user = await getUser(userId, appId);
  if (!user)
    return HandlerApiResult.Error(404, `User ${userId} not found`);

  const connection = await getUserConnection(userId, connectionTypeId);
  if (!connection)
    return HandlerApiResult.Error(404, `Connection ${connectionTypeId} for user ${userId} not found`);

  if (connectionTypeId != ConnectionType.twitch)
    return HandlerApiResult.Error(400, 'Not implemented');

  const service = await getAppService(appId, ExternalServiceType.twitch);
  if (!service)
    return HandlerApiResult.Error(404, 'Service not found while revoking');

  service.clientId = decrypt(service.clientId);
  service.clientSecret = decrypt(service.clientSecret);

  const resp = await TwitchApi.revokeToken(connection.token, service.clientId);
  if (resp.error)
    logger.info(resp.error, 'Error revoking token');

  const refreshToken = decrypt(connection.refreshToken);
  const refreshResult = await TokenRefreshService.getRefreshToken(service, connectionTypeId, refreshToken);

  if (!refreshResult) {
    logger.error(`Failed refreshing token for user ${userId} with connection ${connection.type} for app ${appId}`);
    await deleteUserConnection(userId, connectionTypeId);
    return HandlerApiResult.Error(400, 'Token revoked but unable to refresh new token');
  }

  await updateUserConnection(
    connection.id,
    encrypt(refreshResult.token),
    encrypt(refreshResult.refreshToken),
    refreshResult.expiresAt
  );

  return HandlerApiResult.Success(200, null);
};
