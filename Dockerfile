FROM node:20-alpine

WORKDIR /app

# Listening port
ARG PORT=3000
EXPOSE ${PORT}

# Strapi URL 
ARG STRAPI_API_URL
ARG STRAPI_GRAPHQL_URL
ARG NEXT_PUBLIC_ASSETS_BASE_URL

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV SOURCE_DIR=/app

COPY . .

RUN NODE_ENV=development yarn install
RUN yarn build

CMD ["yarn", "start"]
