import express from 'express';

import { reviewController } from '../controllers';
import { protect, restrictTo } from '../middlewares';

const {
  getAllReviews,
  setTourUserIds,
  createReview,
  getReview,
  updateReview,
  deleteReview
} = reviewController;

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), setTourUserIds, createReview);

router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('user', 'admin'), deleteReview);

export default router;
