# AWS S3 Alerts → Slack

An AWS Lambda function that sends a Slack notification whenever a file is uploaded to an S3 bucket.

## How It Works

1. An S3 event triggers the Lambda on `ObjectCreated:*` events (PUT, POST, COPY, multipart upload)
2. Extracts filename, size, and timestamp
3. Posts a formatted message to your Slack channel via an incoming webhook

## Setup

### 1. Set Environment Variable

| Variable | Value |
|---|---|
| `SLACK_WEBHOOK_URL` | Your full Slack incoming webhook URL |

Create a Slack incoming webhook at [api.slack.com/apps](https://api.slack.com/apps).

### 2. Deploy

- Runtime: **Node.js 18.x**
- Handler: `index.handler`

```bash
npm install
zip -r function.zip index.js node_modules package.json
aws lambda update-function-code --function-name YOUR_FUNCTION_NAME --zip-file fileb://function.zip
```

### 3. Add S3 Trigger

In the Lambda console, add an S3 trigger for **ObjectCreated** events on your target bucket.

### 4. IAM Permissions

The Lambda execution role needs `s3:GetObject` on the target bucket (for reading object metadata if needed).

## Dependencies

- [axios](https://github.com/axios/axios) — HTTP client for Slack webhook
- [moment-timezone](https://momentjs.com/timezone/) — Timestamp formatting (Asia/Istanbul)

## Slack Message Format

```
New upload to bucket my-s3-bucket
my-folder/video.mp4 uploaded successfully on 29/04/2026 14:32:00
File size: 512.3 MB
Link: https://s3.console.aws.amazon.com/s3/object/my-s3-bucket?prefix=my-folder/video.mp4
```
