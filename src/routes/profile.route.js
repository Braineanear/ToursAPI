import express from 'express';

import { protect } from '../middlewares';

import { profileController } from '../controllers';

const {
  getMyData,
  updateMyData,
  changeMyPassword,
  updateMyProfileImage,
  deleteMyAccount
} = profileController;

const router = express.Router();

router.use(protect);

router.route('/').get(getMyData).patch(updateMyData).delete(deleteMyAccount);
router.route('/change-password').patch(changeMyPassword);
router.route('/image').patch(updateMyProfileImage);

export default router;
