
var channel_name = process.env.SLACK_CHANNEL;
var channel_url = process.env.SLACK_WEBHOOK_URL;

exports.handler = (event, context, callback) => {
    callback(null, 'Hello from Lambda from Codeship' + channel_name);
};
