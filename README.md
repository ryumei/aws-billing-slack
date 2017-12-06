AWS daily billing to Slack
==========================

for a my first study with Codeship



### On AWS

#### IAM

Create an IAM Policy

Create an IAM user for codeship-deployment

Create an IAM role *billing-slack* with CloudWatchReadOnlyAccess

#### Lambda

Create a Lambda function named *billing-slack*

Configure environmental varibles
``SLACK_CHANNEL`` and ``SLACK_WEBHOOK_URL``.

Create an alias named ``PROD`` as `$LATEST`

Trigger: CloudWatch Events - Schedule

Script: sample code
Handler: leave index.handler (exports.handler)
Role: *billing-slack*

### On Github

* Create a repository for Lambda function

### On Codeship

* Create a project
* Connect with Github repository
* Set environmental variables
