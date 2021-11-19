import {
  register,
  login,
  logout,
  generateTokens,
  forgotPassword,
  resetPassword,
  verifyEmail
} from './auth.controller';

import {
  createUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser
} from './user.controller';

import {
  getMyData,
  updateMyData,
  changeMyPassword,
  updateMyProfileImage,
  deleteMyAccount
} from './profile.controller';

import {
  getAllReviews,
  setTourUserIds,
  createReview,
  getReview,
  updateReview,
  deleteReview
} from './review.controller';
import {
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
} from './tour.controller';

const authController = {
  register,
  login,
  logout,
  generateTokens,
  forgotPassword,
  resetPassword,
  verifyEmail
};

const userController = {
  createUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser
};

const profileController = {
  getMyData,
  updateMyData,
  changeMyPassword,
  updateMyProfileImage,
  deleteMyAccount
};

const reviewController = {
  getAllReviews,
  setTourUserIds,
  createReview,
  getReview,
  updateReview,
  deleteReview
};

const tourController = {
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
};

export {
  authController,
  userController,
  profileController,
  reviewController,
  tourController
};
