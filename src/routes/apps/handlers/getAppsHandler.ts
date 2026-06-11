import { getAppIds } from '../../../repository/appRepository';

export const getApps = async () => {
  return await getAppIds();
};
