// Packages
import express from 'express';

// Routes
import authRoute from './auth.route';
import userRoute from './user.route';
import tourRoute from './tour.route';
import reviewRoute from './review.route';
import profileRoute from './profile.route';

const router = express.Router();

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/profile', profileRoute);
router.use('/tours', tourRoute);
router.use('/reviews', reviewRoute);

export default router;
