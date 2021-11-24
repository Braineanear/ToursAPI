import app from './app';
import config from './config/config';
import connectDB from './config/database';
import logger from './config/logger';

// Connect to MongoDB
connectDB();

const serverPort = config.server.port;

const server = app.listen(serverPort, () => {
  logger.info(`
      ################################################
      🚀 Server listening on port: ${serverPort} 🚀
      ################################################
  `);
});

const unexpectedErrorHandler = (error) => {
  logger.error(error);
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
