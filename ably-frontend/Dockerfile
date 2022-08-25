FROM node:alpine

WORKDIR /web

## package.json is separated from full copy
## so on rebuilds where package.json has not been updated
## both copy and run npm install will pull from cache instead
COPY package.json .
RUN npm install

COPY . .

EXPOSE 5173
ENV HOST=0.0.0.0
CMD ["npm", "run", "dev", "--", "--host", "--port", "5173"]