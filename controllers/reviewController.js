const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
  //Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// @desc      Get all reviews
// @route     GET /api/v1/reviews
// @access    Private/User
exports.getAllReviews = factory.getAll(Review);

// @desc      Get review
// @route     GET /api/v1/reviews/:id
// @access    Private/User
exports.getReview = factory.getOne(Review);

// @desc      Create new review
// @route     POST /api/v1/reviews
// @access    Private/User
exports.createReview = factory.createOne(Review);

// @desc      Delete review
// @route     DELETE /api/v1/reviews/:id
// @access    Private/Admin/User
exports.deleteReview = factory.deleteOne(Review);

// @desc      Update review
// @route     PATCH /api/v1/reviews/:id
// @access    Private/Admin/User
exports.updateReview = factory.updateOne(Review);
