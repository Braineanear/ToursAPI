import express from 'express';

import { protect, restrictTo } from '../middlewares';

import { tourController } from '../controllers';

import reviewRouter from './review.route';

const {
  getAllTours,
  getTour,
  createTour,
  uploadTourImageCover,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances
} = tourController;

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

router.route('/').get(getAllTours);

router.route('/:id').get(getTour);

router.use(protect);
router.use(restrictTo('admin', 'lead-guid'));

router.route('/monthly-plan/:year').get(getMonthlyPlan);

router.route('/').post(createTour);

router.route('/:id').patch(updateTour).delete(deleteTour);

router.route('/:id/cover').patch(uploadTourImageCover);

export default router;
