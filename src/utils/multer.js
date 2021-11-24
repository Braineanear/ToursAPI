import multer from 'multer';

import AppError from './appError';

const storage = multer.memoryStorage();

/**
 * Upload single image
 * @param {String} name
 */
export const singleImage = (name) => (req, res, next) => {
  const upload = multer({ storage }).single(name);

  upload(req, res, (err) => {
    if (
      err instanceof multer.MulterError &&
      err.code === 'LIMIT_UNEXPECTED_FILE'
    ) {
      return next(new AppError(`Cannot Upload More Than 1 Image`, 500));
    }

    if (err) return next(new AppError(err, 500));
    next();
  });
};

/**
 * Upload any number of images with any name
 */
export const multipleFiles = () => (req, res, next) => {
  const upload = multer({ storage }).any();

  upload(req, res, (err) => {
    if (err) return next(new AppError(err, 500));
    next();
  });
};
