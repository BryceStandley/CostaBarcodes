# pull official base image
FROM node:18-alpine

# set working directory
WORKDIR /app

COPY . .

RUN npm ci

RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000

# start app
CMD ["npx", "serve", "build"]
