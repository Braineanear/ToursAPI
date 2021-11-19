import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configs
import config from './config';
import logger from './logger';

// Models
import { Tour, Review, User } from '../models';

dotenv.config({ path: '.env' });

const __dirname = dirname(fileURLToPath(import.meta.url));

const DB = config.db.url.replace('<PASSWORD>', config.db.password);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => logger.info('Database connection successful!'));

// READ JSON FILE
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours.json`, 'utf-8')
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/users.json`, 'utf-8')
);
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/reviews.json`, 'utf-8')
);

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    logger.info('Data successfully loaded!');
  } catch (error) {
    logger.error(error);
  }
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    logger.info('Data successfully deleted!');
  } catch (error) {
    logger.error(error);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
