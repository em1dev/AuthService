import { HandlerApiResult } from '../../../HandlerApiResult';
import { getAppIds } from '../../../repository/appRepository';

type GetAppsResult = Array<{ id: string }>;

export const getApps = async (): Promise<HandlerApiResult<GetAppsResult>> => {
  const appIds = await getAppIds();
  return HandlerApiResult.Success<GetAppsResult>(200, appIds);
};
