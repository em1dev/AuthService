import express, { ErrorRequestHandler } from 'express';
import { Config } from './config';
import { HttpErrorBase } from './errors';
import { ZodError }  from 'zod';
import { db } from './repository/db';

export const app = express();
app.use(express.json());

app.use('/', (req, _, next) => {
  console.log(`[${req.method}] - ${req.path}`);
  next();
});

import './routes/apps/routes';
import './routes/userConnections/routes';
import './routes/userAuthentication/routes';

// must be 4 params so that its registered as an error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler:ErrorRequestHandler = (err:unknown, req, res, next) => {
  console.log(err);
  if (err instanceof ZodError) {
    res.status(400).send(err.message);
    return;
  }

  if (err instanceof HttpErrorBase) {
    res.status(err.statusCode).send(err.message);
    return;
  }

  res.status(500).send('Internal error');
};

app.use(errorHandler);

app.use((_, res) => {
  res.status(404).send();
});

const server = app.listen(Config.PORT, () => {
  console.log(`Server started at http://localhost:${Config.PORT}`);
});

process.on('SIGTERM', () => {
  console.log('Server is shutting down..');
  server.close((err) => {
    db.close();
    if (err) {
      console.error('Failed to gracefully close server', err);
      return;
    }
    console.log('Server has closed');
  });
});

import './scheduler';
