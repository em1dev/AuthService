import { z } from 'zod';
import { app } from '../..';
import { authenticationHandler } from './handlers/authenticationHandler';
import { verifyToken } from '../../jwtService';
import { createAuthenticationUrlHandler } from './handlers/createAuthenticationUrlHandler';
import { ExternalServiceType, LoginProviderType } from '../../repository/types';

/**
 * Authenticate an user with a login provider
 */
app.post('/:appId/authenticate/:providerId', async (req, res) => {
  const { code, redirectUrl, shouldUpsertConnection } = z.object({
    code: z.string(),
    redirectUrl: z.string(),
    shouldUpsertConnection: z.boolean().optional()
  }).parse(req.body);

  const appId = req.params.appId.toLowerCase();
  const providerId = z.enum(LoginProviderType).parse(req.params.providerId.toLowerCase());
  const result = await authenticationHandler(code, appId, providerId, redirectUrl, shouldUpsertConnection);

  result.sendResult(res);
});

/**
 * Get a authentication url for login or connection
 */
app.post('/:appId/authenticate/:providerId/authUrl', async (req, res) => {
  const appId = req.params.appId.toLowerCase();
  const providerId = z.enum(ExternalServiceType).parse(req.params.providerId.toLowerCase());

  const { redirectUrl, scopes } = z.object({
    redirectUrl: z.string(),
    scopes: z.array(z.string())
  }).parse(req.body);

  const result = await createAuthenticationUrlHandler(appId, redirectUrl, scopes, providerId);
  result.sendResult(res);
});

app.post('/token/verify', async (req, res) => {
  const { token } = z
    .object({ token: z.string() })
    .parse(req.body);

  const result = await verifyToken(token);

  if (!result) {
    return res.status(403).send();
  }
  return res.status(200).send();
});
