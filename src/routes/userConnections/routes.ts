import { z } from 'zod';
import { app } from '../..';
import { connectAccountHandler } from './handlers/connectAccountHandler';
import { deleteUserConnectionHandler } from './handlers/deleteUserConnectionHandler';
import { userConnectionsHandler } from './handlers/userConnectionsHandler';
import { revokeConnectionTokenHandler } from './handlers/revokeConnectionTokenHandler';
import { ConnectionType } from '../../repository/types';

/**
 * Add a connection to a user
 */
app.post('/:appId/user/:userId/connection/:connectionTypeId', async (req, res) => {
  const { code, redirectUrl } = z.object({
    code: z.string(),
    redirectUrl: z.string()
  }).parse(req.body);

  const appId = req.params.appId.toLowerCase();
  const connectionType = z.enum(ConnectionType).parse(req.params.connectionTypeId.toLowerCase());
  const userId = Number.parseInt(req.params.userId);

  if (isNaN(userId))
    return res.status(400).send('User id is not valid');

  const result = await connectAccountHandler(code, appId, userId, connectionType, redirectUrl);
  result.sendResult(res);
});

/**
 * Delete a connection from a user
 */
app.delete('/:appId/user/:userId/connection/:connectionTypeId', async (req, res) => {
  const appId = req.params.appId.toLowerCase();
  const connectionType = z.enum(ConnectionType).parse(req.params.connectionTypeId.toLowerCase());
  const userId = Number.parseInt(req.params.userId);

  if (isNaN(userId))
    return res.status(400).send('User id is not valid');

  const result = await deleteUserConnectionHandler(userId, appId, connectionType);
  result.sendResult(res);
});

/**
 * Revoke access token from a connection
 */
app.delete('/:appId/user/:userId/connection/:connectionTypeId/revoke', async (req, res) => {
  const appId = req.params.appId.toLowerCase();
  const connectionType = z.enum(ConnectionType).parse(req.params.connectionTypeId.toLowerCase());
  const userId = Number.parseInt(req.params.userId);

  if (isNaN(userId))
    return res.status(400).send('User id is not valid');

  const result = await revokeConnectionTokenHandler(userId, appId, connectionType);
  result.sendResult(res);
});


/**
 * Get a connection from a user
 */
app.get('/:appId/user/:userId/connections', async (req, res) => {
  const appId = req.params.appId.toLowerCase();
  const userId = Number.parseInt(req.params.userId);

  if (isNaN(userId))
    return res.status(400).send('invalid user id');

  const result = await userConnectionsHandler(appId, userId);
  result.sendResult(res);
});
