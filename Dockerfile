# -------------------------
# 1️⃣ Build stage
# -------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all source code and build Next.js
COPY . .
RUN npm run build

# -------------------------
# 2️⃣ Runtime stage
# -------------------------
FROM node:20-alpine

WORKDIR /app

# Copy built output and essential files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

RUN npm install --omit=dev

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]
