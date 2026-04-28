# AWS S3 Alerts → Slack

AWS Lambda function that sends a Slack notification whenever a file is uploaded to an S3 bucket.

## How it works

1. An S3 event triggers the Lambda on `ObjectCreated:*` events.
2. The function extracts the file name, size, bucket, and upload timestamp.
3. It posts a formatted message to your Slack channel via an incoming webhook.

## Setup

### 1. Deploy the Lambda

- Runtime: **Node.js 18.x** (or later)
- Handler: `index.handler`
- Install dependencies before deploying:

```bash
npm install moment-timezone request
```

### 2. Set your Slack webhook URL

Open `index.js` and replace the placeholder:

```js
const reqURL = `YOUR_SLACK_WEBHOOK_URL`;
```

Create a webhook at [api.slack.com/apps](https://api.slack.com/apps) → Incoming Webhooks.

### 3. Add the S3 trigger

In the Lambda console, add an S3 trigger:
- **Event type:** `PUT` (and optionally `POST`, `COPY`, `CompleteMultipartUpload`)
- **Bucket:** your target bucket

### 4. IAM permissions

The Lambda execution role needs at minimum:

```json
{
  "Effect": "Allow",
  "Action": ["s3:GetObject"],
  "Resource": "arn:aws:s3:::YOUR_BUCKET/*"
}
```

## Example Slack message

```
New upload to my-bucket
uploaded-file.zip uploaded successfully on 29/04/2026 14:32:10
File size: 4.2 MB
Link: https://s3.console.aws.amazon.com/s3/object/my-bucket?prefix=uploaded-file.zip
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `moment-timezone` | Timestamp formatting in Istanbul timezone |
| `request` | HTTP POST to Slack webhook |
