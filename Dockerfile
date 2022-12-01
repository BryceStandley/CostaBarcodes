# pull official base image
FROM node:18-alpine

# set working directory
WORKDIR /app

COPY . .

RUN npm ci

RUN npm run build

ENV NODE_ENV=Production

EXPOSE 9900

# start app
CMD ["node", "./build/server.js"]
