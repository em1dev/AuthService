import { HandlerApiResult } from '../../../HandlerApiResult';
import { deleteUserConnection } from '../../../repository/connectionRepository';
import { ConnectionType } from '../../../repository/types';
import { getUser } from '../../../repository/userRepository';

export const deleteUserConnectionHandler = async (
  userId: number, appId: string, connectionTypeId: ConnectionType
) : Promise<HandlerApiResult<null>> => {

  const user = await getUser(userId, appId);
  if (!user)
    return HandlerApiResult.Error(404, `User ${userId} not found`);

  // TODO - remove connection using external api
  await deleteUserConnection(userId, connectionTypeId);
  return HandlerApiResult.Success(200, null);
};
