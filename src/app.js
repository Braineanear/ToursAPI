import express from 'express';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import compression from 'compression';
import cors from 'cors';

import { successHandle, errorHandle } from './config/morgan';
import config from './config/config';

import limiter from './middlewares/rateLimiter';

import AppError from './utils/appError';
import errorHandler from './utils/errorHandler';

import routes from './routes';

const app = express();

app.enable('trust proxy');

app.use(successHandle);
app.use(errorHandle);

app.use(cors());

app.options('*', cors());

app.use(helmet());

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(mongoSanitize());

app.use(xss());

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

app.use(compression());

app.disable('x-powered-by');

// Limit Repeated Failed Requests to Auth Endpoints
if (config.env === 'production') {
  app.use('/', limiter);
}

app.use('/', routes);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

export default app;
