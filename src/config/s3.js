import aws from 'aws-sdk';
import config from './config';

aws.config.setPromisesDependency();
aws.config.update({
  accessKeyId: config.aws.accessKey.id,
  secretAccessKey: config.aws.accessKey.secret,
  region: config.aws.region
});

const s3 = new aws.S3();

export default s3;
