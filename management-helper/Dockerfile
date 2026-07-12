FROM node:24-alpine
WORKDIR /app
RUN apk add --no-cache docker-cli
COPY management-helper/server.mjs ./server.mjs
ENV NODE_ENV=production PORT=3000
EXPOSE 3000
CMD ["node", "server.mjs"]
