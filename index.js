var aws   = require('aws-sdk');
var url   = require('url');
var https = require('https');
var cw    = new aws.CloudWatch({region: 'ap-northeast-1', endpoint: 'https://monitoring.ap-northeast-1.amazonaws.com'});

var channel_name = process.env.SLACK_CHANNEL;
var channel_url = process.env.SLACK_WEBHOOK_URL;
var serviceNames = ['AmazonEC2', 'AmazonRDS', 'AmazonRoute53', 'AmazonS3', 'AmazonSNS', 'AWSDataTransfer', 'AWSLambda', 'AWSQueueService', 'AWSConfig'];

var floatFormat = function(number, n) {
    var _pow = Math.pow(10 , n) ;
    return Math.round(number * _pow)  / _pow;
}

var postBillingToSlack = function(billings, context) {
    var fields = [];
    for (var serviceName in billings) {
        fields.push({
            title: serviceName,
            value: floatFormat(billings[serviceName], 2) + " USD",
            short: true
        });
    }
    var message = {
        channel: channel_name,
        attachments: [{
            fallback: '今月の AWS の利用費は、' + floatFormat(billings['Total'], 2) + ' USDです。',
            pretext: '今月の AWS の利用費は…',
            color: 'good',
            fields: fields
        }]
    };
    var body = JSON.stringify(message);
    var options = url.parse(channel_url);
    options.method = 'POST';
    options.header = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
    };
    var statusCode;
    var postReq = https.request(options, function(res) {
        var chunks = [];
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            return chunks.push(chunk);
        });
        res.on('end', function() {
            var body = chunks.join('');
            statusCode = res.statusCode;
        });
        return res;
    });
    postReq.write(body);
    postReq.end();
    if (statusCode < 400) {
      context.succeed();
    }
}

var getBilling = function(context) {
    var now = new Date();
    var startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1,  0,  0,  0);
    var endTime   = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);

    var billings = {};

    var total_params = {
        MetricName: 'EstimatedCharges',
        Namespace: 'AWS/Billing',
        Period: 86400,
        StartTime: startTime,
        EndTime: endTime,
        Statistics: ['Average'],
        Dimensions: [
            {
                Name: 'Currency',
                Value: 'USD'
            }
        ]
    };

    cw.getMetricStatistics(total_params, function(err, data) {
        if (err) {
            console.error(err, err.stack);
        } else {
            var datapoints = data['Datapoints'];
            if (datapoints.length < 1) {
                billings['Total'] = 0;
            } else {
                billings['Total'] = datapoints[datapoints.length - 1]['Average']
            }
            if (serviceNames.length > 0) {
                serviceName = serviceNames.shift();
                getEachServiceBilling(serviceName);
            }
        }
    });

    var getEachServiceBilling = function(serviceName) {
        var params = {
            MetricName: 'EstimatedCharges',
            Namespace: 'AWS/Billing',
            Period: 86400,
            StartTime: startTime,
            EndTime: endTime,
            Statistics: ['Average'],
            Dimensions: [
                {
                    Name: 'Currency',
                    Value: 'USD'
                },
                {
                    Name: 'ServiceName',
                    Value: serviceName
                }
            ]
        };
        cw.getMetricStatistics(params, function(err, data) {
            if (err) {
                console.error(err, err.stack);
            } else {
                var datapoints = data['Datapoints'];
                if (datapoints.length < 1) {
                    billings[serviceName] = 0;
                } else {
                    billings[serviceName] = datapoints[datapoints.length - 1]['Average']
                }
                if (serviceNames.length > 0) {
                    serviceName = serviceNames.shift();
                    getEachServiceBilling(serviceName);
                } else {
                    postBillingToSlack(billings, context)
                }
            }
        });
    }
}

exports.handler = function(event, context, callback) {
    getBilling(context);
}
