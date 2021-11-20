// Packages
import express from 'express';

// Routes
import authRoute from './auth.routes';
import userRoute from './user.routes';
import tourRoute from './tour.routes';
import reviewRoute from './review.routes';
import profileRoute from './profile.routes';

const router = express.Router();

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/profile', profileRoute);
router.use('/tours', tourRoute);
router.use('/reviews', reviewRoute);

export default router;
