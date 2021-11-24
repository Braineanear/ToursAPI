import {
  forgotPassword,
  generateTokens,
  login,
  logout,
  register,
  resetPassword,
  verifyEmail
} from './auth.controller';
import {
  changeMyPassword,
  deleteMyAccount,
  getMyData,
  updateMyData,
  updateMyProfileImage
} from './profile.controller';
import {
  createReview,
  deleteReview,
  getAllReviews,
  getReview,
  setTourUserIds,
  updateReview
} from './review.controller';
import {
  addImageTourImages,
  aliasTopTours,
  createTour,
  deleteImageFromTourImages,
  deleteTour,
  getAllTours,
  getDistances,
  getMonthlyPlan,
  getTour,
  getTourStats,
  getToursWithin,
  updateTour,
  updateTourImageCover,
  uploadTourImageCover,
  uploadTourImages
} from './tour.controller';
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser
} from './user.controller';

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
};

export {
  authController,
  profileController,
  reviewController,
  tourController,
  userController
};
