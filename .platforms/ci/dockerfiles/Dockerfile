FROM outillage/node:22 AS builder
ARG TARGET_ENV
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:${TARGET_ENV}

FROM nginx:alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/minds-rgpd-front-ng/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]