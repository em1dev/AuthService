import { z } from 'zod';
import { app } from '../..';
import { createOrUpdateAppHandler } from './handlers/createOrUpdateAppHandler';
import { getAppServicesHandler } from './handlers/getAppServicesHandler';
import { getApps } from './handlers/getAppsHandler';
import { ExternalServiceType } from '../../repository/types';

/**
 * Get apps
 */
app.get('/app', async (_, res) => {
  const result = await getApps();
  return result.sendResult(res);
});

/**
 * Get app
 */
app.get('/app/:nameId', async (req, res) => {
  const name = z
    .string({ error: 'invalid app id'})
    .min(3)
    .max(200).parse(req.params.nameId);

  const result = await getAppServicesHandler(name);
  return result.sendResult(res);
});

/**
 * Create or update a app
 */
app.post('/app/:nameId', async (req, res) => {
  const name = z.string().min(3).max(200).parse(req.params.nameId);
  const requestSchema = z.array(z.object({
    type: z.enum(ExternalServiceType),
    clientSecret: z.string(),
    clientId: z.string()
  }));
  const externalService = requestSchema.parse(req.body);

  const result = await createOrUpdateAppHandler(name, externalService);
  return result.sendResult(res);
});
