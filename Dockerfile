# Use official Node image
FROM node:18-alpine

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "run", "start"]