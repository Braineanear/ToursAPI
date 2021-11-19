import s3 from '../config/s3';
import config from '../config/config';

import catchAsync from './catchAsync';
import AppError from './appError';

export const createBucket = (bucketName) => {
  const bucketParams = {
    Bucket: bucketName
  };

  s3.createBucket(bucketParams, (err, data) => {
    if (err) {
      throw new AppError(err, 500);
    } else {
      return data;
    }
  });
};

export const listBuckets = () => {
  s3.listBuckets((err, data) => {
    if (err) {
      throw new AppError(err, 500);
    } else {
      return data.Buckets;
    }
  });
};

export const listObjectsInBucket = (bucketName) => {
  const bucketParams = {
    Bucket: bucketName
  };

  s3.listObjects(bucketParams, (err, data) => {
    if (err) {
      throw new AppError(err, 500);
    } else {
      return data;
    }
  });
};

export const deleteBucket = (bucketName) => {
  const bucketParams = {
    Bucket: bucketName
  };

  // Call S3 to delete the bucket
  s3.deleteBucket(bucketParams, (err, data) => {
    if (err) {
      throw new AppError(err, 500);
    } else {
      return data;
    }
  });
};

export const uploadObject = catchAsync(async (Key, buffer) => {
  const uploadParams = {
    ACL: 'public-read',
    Bucket: config.aws.bucketName,
    Body: buffer,
    Key
  };

  return await s3.upload(uploadParams).promise();
});

export const deleteObject = catchAsync(async (objectKey) => {
  s3.deleteObject(
    {
      Bucket: config.aws.bucketName,
      Key: objectKey
    },
    (err) => {
      if (err) {
        throw new AppError(err, 500);
      }
    }
  );
});

export const deleteDirectory = catchAsync(async (directory) => {
  const listParams = {
    Bucket: config.aws.bucketName,
    Prefix: directory
  };

  const listedObjects = await s3.listObjectsV2(listParams).promise();

  if (listedObjects.Contents.length === 0) return;

  const deleteParams = {
    Bucket: config.aws.bucketName,
    Delete: { Objects: [] }
  };

  listedObjects.Contents.forEach(({ Key }) => {
    deleteParams.Delete.Objects.push({ Key });
  });

  await s3.deleteObjects(deleteParams).promise();

  if (listedObjects.IsTruncated) await deleteDirectory(directory);
});
