#Build stage
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json .
COPY tsconfig.json .
COPY src src
RUN apk add --update nodejs npm
RUN npm install
RUN npx tsc

#Production stage
FROM node:22-alpine AS production
WORKDIR /app
COPY package*.json .
RUN npm ci --only=production
COPY --from=build /app/dist ./dist

CMD ["node", "dist/index.js"]