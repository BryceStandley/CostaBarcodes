# pull official base image
FROM node:18-alpine

# set working directory
WORKDIR /app
ENV NODE_ENV=production

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH



# install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install --production

# add app
COPY . ./

# start app
CMD ["npm", "start"]
