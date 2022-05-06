const monent = require('moment-timezone');
const request = require('request');

const reqURL = `WEBHOOKURL`;

exports.handler = (event, context, callback) => {
    var timezone = "Asia/Istanbul";
    var objectType ="Upload";
    var objectKey = event.Records[0].s3.object.key;
    var objectSize = Number((event.Records[0].s3.object.size / 1024).toFixed(2));
    var objectUnit = "KB";
    
    if(objectSize > 1024) {
        objectSize = Number((objectSize / 1024).toFixed(2));
        objectUnit = "MB";
    }
    
    var eventTime = monent.tz(event.Records[0].eventTime, timezone).format("DD/MM/YYYY HH:mm:ss");
    var bucket = event.Records[0].s3.bucket.name;
    var attachmentTitle = `New upload :oguzhey:`;
    var messageTitle = `${objectType} to bucket - ${bucket}`;
    var messageLevel = "good";
    var filedValueContext = objectKey + " has been uploaded to bucket successfully on " + eventTime + "\n file size: " + objectSize + " " + objectUnit;
    
    var actions = event.Records[0].eventName;
    
    if(actions === 'ObjectCreated:Put' || actions === 'ObjectCreated:CompleteMultipartUpload' || actions === 'ObjectCreated:Post' || actions === 'ObjectCreated:Copy' )  {
        
        messageTitle = `${objectType} at bucket ${bucket}`;
        messageLevel = "good";
        filedValueContext = objectKey + " has been uploaded to bucket successfully on " + eventTime + "\n file size: " + objectSize + " " + objectUnit + "\n Link is here: " + `https://s3.console.aws.amazon.com/s3/object/4dpublic?region=us-west-2&prefix=${objectKey}`;
    }
    
    var attachments = {
       "attachments":[
          {
             "fallback": attachmentTitle,
             "pretext": attachmentTitle,
             "color": messageLevel,
             "fields":[
                {
                   "title": messageTitle,
                   "value": filedValueContext,
                   "short": false
                }
             ]
          }
       ]
    };



    var options = {
        uri: reqURL,
        method: 'POST',
        json: attachments
    };

    request.post(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log(body.id) 
          console.log("body: " + body);
          console.log("Post to slack error: " + error)
        }
    });
    
    console.log(event);
    console.log(event.Records[0]);
    
    callback(null, messageTitle + ' Object Key:' + objectKey);
};
