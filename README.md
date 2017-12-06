AWS daily billing to Slack
==========================

for a my first study with Codeship

## Description

## Requirement

Acounts / subscription

* AWS
* Slack
* Github (optional)
* Codeship (optional)

## Usage / How to deploy

### On AWS

#### IAM

Create an IAM Policy

Create an IAM role *billing-slack* with CloudWatchReadOnlyAccess

Create an IAM user for codeship-deployment (optional)

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

### On Codeship (optional)

* Create a project
* Connect with Github repository
* Set environmental variables

## License

[Apache License Version 2.0](https://www.apache.org/licenses/LICENSE-2.0)

## Author

NAKAJIMA Takaaki
