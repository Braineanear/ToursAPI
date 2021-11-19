import morgan from 'morgan';
import config from './config';
import logger from './logger';

morgan.token(
  'message',
  (request, response) => response.locals.errorMessage || ''
);

const getIpFormat = () =>
  config.env === 'production' ? ':remote-addr - ' : '';
const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`;
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`;

export const successHandle = morgan(successResponseFormat, {
  skip: (request, response) => response.statusCode >= 400,
  stream: { write: (message) => logger.info(message.trim()) }
});

export const errorHandle = morgan(errorResponseFormat, {
  skip: (request, response) => response.statusCode < 400,
  stream: { write: (message) => logger.error(message.trim()) }
});
