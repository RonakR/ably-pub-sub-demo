FROM node:alpine

WORKDIR /app

## package.json is separated from full copy
## so on rebuilds where package.json has not been updated
## both copy and run npm install will pull from cache instead
COPY package.json .
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "run", "publish"]