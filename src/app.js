import compression from 'compression';
import cors from 'cors';
import express from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import hpp from 'hpp';
import xss from 'xss-clean';

import config from './config/config';
import { errorHandle, successHandle } from './config/morgan';
import { rateLimiter } from './middlewares';
import routes from './routes';
import AppError from './utils/appError';
import errorHandler from './utils/errorHandler';

const app = express();

app.enable('trust proxy');

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(successHandle);
app.use(errorHandle);

app.use(cors());

app.options('*', cors());

app.use(helmet());

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
  app.use('/', rateLimiter);
}

app.use('/', routes);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

export default app;
