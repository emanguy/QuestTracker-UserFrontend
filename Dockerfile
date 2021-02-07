### Build Container ###
FROM node:12 AS build-container
RUN mkdir /yarn-build/
WORKDIR /yarn-build/
ENV NODE_ENV development
COPY ./src/ ./src/
COPY ./public/ ./public/
COPY ./tests/ ./tests/
COPY ./types/ ./types/
COPY [ ".browserslistrc", ".env", "package.json", "tsconfig.json", "yarn.lock", "vite.config.ts", "index.html", "./"]
RUN yarn install && \
    yarn build

### Production Container ###
FROM nginx:1.15-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build-container /yarn-build/dist/ /srv/
CMD nginx -g 'daemon off;'
