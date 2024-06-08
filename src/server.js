/* eslint-disable no-console */
import express from 'express';
import exitHook from 'async-exit-hook';
import { env } from '~/config/environment';
import { CLOSE_DB, CONNECT_DB } from '~/config/mongodb';

const START_SEVER = () => {
  const app = express();

  app.get('/', async (req, res) => {
    res.end('<h1>Hello World!</h1><hr>');
  });

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(`Server is running successfully at Host: http://${env.APP_HOST}:${env.APP_PORT}/`);
  });

  // Cleanup before close server
  exitHook(() => {
    CLOSE_DB();
  });
};

// Immediately Invoked Function Expression (IIFE) / Anonymous Async Function
(async () => {
  try {
    console.log('Connecting to MongoDB Cloud Atlas...');
    await CONNECT_DB;
    console.log('Connected to MongoDB Cloud Atlas');
    START_SEVER();
  } catch (error) {
    console.error(error);
    process.exit(0);
  }
})();

// CONNECT_DB()
//   .then(() => console.log('Connected to MongoDB Cloud Atlas!'))
//   .then(() => START_SEVER())
//   .catch((err) => {
//     console.error(err);
//     process.exit(0);
//   });
