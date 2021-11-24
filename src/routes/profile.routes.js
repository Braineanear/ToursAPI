import express from 'express';

import { profileController } from '../controllers';
import { protect, validate } from '../middlewares';
import { singleImage } from '../utils/multer';
import { profileSchema } from '../validators';

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
router.route('/image').patch(singleImage('image'), updateMyProfileImage);

export default router;
