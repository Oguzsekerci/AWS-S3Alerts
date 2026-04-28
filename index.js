const moment = require('moment-timezone');
const request = require('request');

// Set your Slack incoming webhook URL here
const reqURL = `YOUR_SLACK_WEBHOOK_URL`;

exports.handler = (event, context, callback) => {
  const timezone = 'Asia/Istanbul';
  const objectType = 'Upload';

  const objectKey = event.Records[0].s3.object.key;
  const bucket = event.Records[0].s3.bucket.name;
  const eventTime = moment.tz(event.Records[0].eventTime, timezone).format('DD/MM/YYYY HH:mm:ss');

  let objectSize = Number((event.Records[0].s3.object.size / 1024).toFixed(2));
  let objectUnit = 'KB';

  if (objectSize > 1024) {
    objectSize = Number((objectSize / 1024).toFixed(2));
    objectUnit = 'MB';
  }

  const actions = event.Records[0].eventName;
  const supportedActions = [
    'ObjectCreated:Put',
    'ObjectCreated:CompleteMultipartUpload',
    'ObjectCreated:Post',
    'ObjectCreated:Copy',
  ];

  if (!supportedActions.includes(actions)) {
    callback(null, `Skipped event: ${actions}`);
    return;
  }

  const consoleLink = `https://s3.console.aws.amazon.com/s3/object/${bucket}?prefix=${objectKey}`;
  const messageTitle = `${objectType} at bucket ${bucket}`;
  const fieldValue =
    `${objectKey} uploaded successfully on ${eventTime}\n` +
    `File size: ${objectSize} ${objectUnit}\n` +
    `Link: ${consoleLink}`;

  const attachments = {
    attachments: [
      {
        fallback: `New upload to ${bucket}`,
        pretext: `New upload to ${bucket}`,
        color: 'good',
        fields: [
          {
            title: messageTitle,
            value: fieldValue,
            short: false,
          },
        ],
      },
    ],
  };

  const options = {
    uri: reqURL,
    method: 'POST',
    json: attachments,
  };

  request.post(options, (error, response, body) => {
    if (error) {
      console.error('Slack request failed:', error);
      callback(error);
      return;
    }
    if (response.statusCode !== 200) {
      console.error('Slack returned non-200:', response.statusCode, body);
      callback(new Error(`Slack error: ${response.statusCode}`));
      return;
    }
    console.log('Slack notification sent:', body);
    callback(null, `${messageTitle} | Object: ${objectKey}`);
  });
};
