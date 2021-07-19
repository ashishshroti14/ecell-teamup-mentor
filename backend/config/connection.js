const AWS = require('aws-sdk');

const main_website = {
  url: ' ',
};

const ecellBuckets = {
  'startup-series':
    'startup-series-register-2e94d328-a197-4cc4-96c7-236a780923d9',
  'edd-portal': 'edd-portal-images',
  'team-up': 'team-up-student-cvs',
};

/**
 * Takes the event names as params and return the S3 instance and bucketName
 * @param {('startup-series' | 'edd-portal' | 'team-up')} event_name The event name for which the bucket was created.
 * @returns {{s3: AWS.S3, bucketName: String}} {s3, bucketName}
 */
const config_aws_s3 = (event_name) => {
  if (!ecellBuckets.hasOwnProperty(event_name)) {
    throw new Error(
      `No bucket found for event ${event_name}. Please check the ecellBuckets object in config/connection.js.`
    );
  } else {
    //The following credentials only control the AWS S3 bucket created in Abhijit's account for E-Cell
    const ecell_S3_bucket_credentials = new AWS.Credentials({
      secretAccessKey: 'RbxTc5ap2n2Qrlrmz2E2xzW9aTrMSIKepOzw6Q5O',
      accessKeyId: 'AKIA2NEDFFMLXG76OMFE',
    });

    AWS.config.update({
      credentials: ecell_S3_bucket_credentials,
      region: 'ap-south-1',
    });

    const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
    const bucketName = ecellBuckets[event_name];

    return { s3, bucketName };
  }
};

const configSendGrid = () => {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(
    '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'
  );
  return sgMail;
};

module.exports = {
  main_website,
  config_aws_s3,
  configSendGrid,
};
