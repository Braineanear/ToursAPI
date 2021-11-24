import { Review } from '../models';
import APIFeatures from '../utils/apiFeatures';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';

export const setTourUserIds = (req, res, next) => {
  //Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// @desc      Get All Reviews Controller
// @route     GET /reviews
// @access    Private/User
export const getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await APIFeatures(req, Review);

  if (reviews.length === 0) {
    return next(new AppError('No reviews data found.', 404));
  }

  return res.status(200).json({
    status: 'success',
    message: 'Found reviews data successfully.',
    reviews
  });
});

// @desc      Get Review Using it's ID Controller
// @route     GET /reviews/:id
// @access    Private/User
export const getReview = catchAsync(async (req, res, next) => {
  const { id: reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review) {
    return next(new AppError('No review data found', 404));
  }

  return res.status(200).json({
    status: 'success',
    message: 'Found review data successfully',
    review
  });
});

// @desc      Create New Review Controller
// @route     POST /reviews
// @access    Private/User
export const createReview = catchAsync(async (req, res, next) => {
  const { id: userId } = req.user;
  const { text, rating, tour } = req.body;

  if (!text || !rating || !tour) {
    return next(new AppError('All fields are required'), 400);
  }

  const review = await Review.create({ ...req.body, user: userId });

  return res.status(200).json({
    status: 'success',
    message: 'Review created successfully.',
    review
  });
});

// @desc      Update Review Controller
// @route     PATCH /reviews/:id
// @access    Private/Admin/User
export const updateReview = catchAsync(async (req, res, next) => {
  const { id: userId } = req.user;
  const { id: reviewId } = req.params;

  let review = await Review.findById(reviewId);

  if (!review) {
    return next(new AppError('No review found', 404));
  }

  if (review.user.toString() !== userId.toString()) {
    return next(
      new AppError('You are not authorized to perform this action.', 400)
    );
  }

  review = await Review.findByIdAndUpdate(reviewId, req.body, {
    new: true,
    runValidators: true
  });

  return res.status(200).json({
    status: 'success',
    message: 'Review updated successfully.',
    review
  });
});

// @desc      Delete Review Controller
// @route     DELETE /reviews/:id
// @access    Private/Admin/User
export const deleteReview = catchAsync(async (req, res, next) => {
  const { id: userId } = req.user;
  const { id: reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review) {
    return next(new AppError('No review found'), 404);
  }

  if (review.user.toString() !== userId.toString()) {
    return next(
      new AppError('You are not authorized to perform this action.'),
      400
    );
  }

  await Review.findByIdAndDelete(reviewId);

  return res.status(200).json({
    status: 'success'
  });
});
