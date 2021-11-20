import express from 'express';

import { userController } from '../controllers';

import { protect, restrictTo } from '../middlewares';

const { getUser, getAllUsers, createUser, updateUser, deleteUser } =
  userController;

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));

router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default router;
