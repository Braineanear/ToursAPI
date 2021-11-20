import express from 'express';

import { protect, validate } from '../middlewares';

import { profileSchema } from '../validators';

import { profileController } from '../controllers';

const { updateProfileDataSchema, changeProfilePasswordSchema } = profileSchema;

const {
  getMyData,
  updateMyData,
  changeMyPassword,
  updateMyProfileImage,
  deleteMyAccount
} = profileController;

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getMyData)
  .patch(validate(updateProfileDataSchema), updateMyData)
  .delete(deleteMyAccount);
router
  .route('/change-password')
  .patch(validate(changeProfilePasswordSchema), changeMyPassword);
router.route('/image').patch(updateMyProfileImage);

export default router;
