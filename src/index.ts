import express, { ErrorRequestHandler } from 'express';
import { httpLogger, logger } from './logger';
import { Config } from './config';
import { ZodError }  from 'zod';
import { db } from './repository/db';
import z from 'zod';

export const app = express();
app.use(express.json());

app.get('/health', (_, res) => {
  const status = db.hasLoaded ? 200 : 500;
  res.status(status).send();
});

app.use(httpLogger);

import './routes/apps/routes';
import './routes/userConnections/routes';
import './routes/userAuthentication/routes';

// must be 4 params so that its registered as an error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler:ErrorRequestHandler = (err:unknown, req, res, next) => {
  if (err instanceof ZodError) {
    const issues = z.treeifyError(err);
    req.log.info(z.prettifyError(err));
    res.status(400).send(issues);
    return;
  }

  req.log.error(err);
  res.status(500).send('Internal error');
};

app.use(errorHandler);

app.use((_, res) => {
  res.status(404).send();
});

const server = app.listen(Config.PORT, () => {
  logger.info(`Server started at http://localhost:${Config.PORT}`);
});

process.on('SIGTERM', () => {
  logger.info('Server is shutting down..');
  server.close((err) => {
    db.close();
    if (err) {
      logger.error(err, 'Failed to gracefully close server');
      return;
    }
    logger.info('Server has closed');
  });
});

import './scheduler';
