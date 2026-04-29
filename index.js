const axios = require('axios');
const moment = require('moment-timezone');

const reqURL = process.env.SLACK_WEBHOOK_URL;

const SUPPORTED_ACTIONS = [
  'ObjectCreated:Put',
  'ObjectCreated:CompleteMultipartUpload',
  'ObjectCreated:Post',
  'ObjectCreated:Copy',
];

exports.handler = async (event, context) => {
  const timezone = 'Asia/Istanbul';

  const record = event.Records[0];
  const objectKey = record.s3.object.key;
  const bucket = record.s3.bucket.name;
  const eventTime = moment.tz(record.eventTime, timezone).format('DD/MM/YYYY HH:mm:ss');
  const action = record.eventName;

  if (!SUPPORTED_ACTIONS.includes(action)) {
    return `Skipped event: ${action}`;
  }

  let objectSize = Number((record.s3.object.size / 1024).toFixed(2));
  let objectUnit = 'KB';

  if (objectSize > 1024) {
    objectSize = Number((objectSize / 1024).toFixed(2));
    objectUnit = 'MB';
  }

  const consoleLink = `https://s3.console.aws.amazon.com/s3/object/${bucket}?prefix=${objectKey}`;
  const messageTitle = `Upload at bucket ${bucket}`;
  const fieldValue =
    `${objectKey} uploaded successfully on ${eventTime}\n` +
    `File size: ${objectSize} ${objectUnit}\n` +
    `Link: ${consoleLink}`;

  const payload = {
    attachments: [
      {
        fallback: `New upload to ${bucket}`,
        pretext: `New upload to ${bucket}`,
        color: 'good',
        fields: [{ title: messageTitle, value: fieldValue, short: false }],
      },
    ],
  };

  await axios.post(reqURL, payload);
  return `${messageTitle} | Object: ${objectKey}`;
};
