FROM node:24-slim AS builder

WORKDIR /app

RUN apt-get update && \
    apt-get install -y python3 make g++ && \
    ln -s /usr/bin/python3 /usr/bin/python && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN yarn install --frozen-lockfile --network-timeout=300000

COPY . .

RUN yarn build

# === Production Stage ===
FROM node:24-slim AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next .next
COPY --from=builder /app/next.config.js .
COPY --from=builder /app/yarn.lock .
COPY --from=builder /app/tsconfig.json .

EXPOSE 3000

ENV NODE_ENV=production

CMD ["yarn", "start"]
