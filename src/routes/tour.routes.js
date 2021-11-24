import express from 'express';

import { tourController } from '../controllers';
import { protect, restrictTo, validate } from '../middlewares';
import { multipleFiles, singleImage } from '../utils/multer';
import { tourSchema } from '../validators';
import reviewRouter from './review.routes';

const {
  getAllTours,
  getTour,
  createTour,
  uploadTourImageCover,
  updateTourImageCover,
  uploadTourImages,
  addImageTourImages,
  deleteImageFromTourImages,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances
} = tourController;

const { getAllToursSchema, createTourSchema } = tourSchema;

const router = express.Router();

// POST /tour/32434fs35/reviews
// GET /tour/32434fs35/reviews
// GET /tour/32434fs35/reviews/97987dssad8

router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getTourStats);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(getDistances);

router.route('/').get(validate(getAllToursSchema), getAllTours);

router.route('/:id').get(getTour);

router.use(protect);
router.use(restrictTo('admin', 'lead-guide'));

router.route('/monthly-plan/:year').get(getMonthlyPlan);

router.route('/').post(validate(createTourSchema), createTour);

router.route('/:id').patch(updateTour).delete(deleteTour);

router
  .route('/:id/image-cover')
  .post(singleImage('coverImage'), uploadTourImageCover)
  .patch(singleImage('coverImage'), updateTourImageCover);

router
  .route('/:id/images')
  .post(multipleFiles(), uploadTourImages)
  .patch(multipleFiles(), addImageTourImages)
  .delete(deleteImageFromTourImages);

export default router;
