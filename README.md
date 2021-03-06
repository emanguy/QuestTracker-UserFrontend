# Quest Tracker User Frontend [![CircleCI](https://circleci.com/gh/emanguy/QuestTracker-UserFrontend.svg?style=svg)](https://circleci.com/gh/emanguy/QuestTracker-UserFrontend)

This is the frontend vue app for the quest tracker. To get started, create a `.env` and `.env.development` file
so you can fill in the settings for the backend connector.

## "Environment" variables

* `VITE_APP_SCHEME` - The website scheme, i.e. "http" or "https"
* `VITE_APP_BACKEND_HOSTNAME_AND_PORT` - This should be the base URL for the [Frontend API](https://github.com/emanguy/QuestTracker-FrontendApi)
* `VITE_APP_BACKEND_UPDATE_HOSTNAME_AND_PORT` - This should be the base URL for the [Notification Service](https://github.com/emanguy/QuestTracker-NotificationService)
* `VITE_APP_BACKEND_API_ROOT_PATH` - This should be the base path for the frontend API. I did this so that the static content,
frontend API, and notification service could all be hosted on the same Kubernetes ingress, just with different paths. On development
mode, it should just be left blank but in production it should be something like `/api/v1`
* `VITE_APP_BACKEND_UPDATE_ROOT_PATH` - This is the base path for the backend notification service.

## Local development

Run the frontend API and the notification service on your machine by using the instructions on the [Frontend API Readme](https://github.com/emanguy/QuestTracker-FrontendApi/blob/master/README.md)
and the [Notification Service Readme](https://github.com/emanguy/QuestTracker-NotificationService/blob/master/README.md),
then just run `yarn serve`.

