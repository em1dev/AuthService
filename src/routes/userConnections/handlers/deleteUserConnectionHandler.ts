import { googleApi } from '../../../api/googleApi';
import { TwitchApi } from '../../../api/twitchApi';
import { decrypt } from '../../../encryption';
import { HandlerApiResult } from '../../../HandlerApiResult';
import { logger } from '../../../logger';
import { getAppService } from '../../../repository/appRepository';
import { deleteUserConnection, getUserConnection } from '../../../repository/connectionRepository';
import { ConnectionType, ExternalServiceType } from '../../../repository/types';
import { getUser } from '../../../repository/userRepository';

export const deleteUserConnectionHandler = async (
  userId: number, appId: string, connectionTypeId: ConnectionType
) : Promise<HandlerApiResult<null>> => {

  const user = await getUser(userId, appId);
  if (!user)
    return HandlerApiResult.Error(404, `User ${userId} not found`);

  const connection = await getUserConnection(userId, connectionTypeId);
  if (!connection)
  {
    return HandlerApiResult.Success(200, null);
  }

  const service = await getAppService(appId, ExternalServiceType[connectionTypeId]);
  if (!service)
    throw new Error('Missing connection on app when deleting connection');

  const clientId = decrypt(service.clientId);
  const token = decrypt(connection.token);

  switch (connectionTypeId){
  case ConnectionType.twitch:
    await TwitchApi.revokeToken(token, clientId);
    break;
  case ConnectionType.youtube:
    await googleApi.revokeToken(token);
    break;
  case ConnectionType.tiktok:
    logger.info('No revoke api for tiktok');
  }

  await deleteUserConnection(userId, connectionTypeId);
  return HandlerApiResult.Success(200, null);
};
