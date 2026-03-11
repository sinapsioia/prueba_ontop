# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Skip Chromium download — puppeteer is only used locally for PDF generation
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Install dependencies first (layer cached if package.json unchanged)
COPY package*.json ./
RUN npm install --prefer-offline

# Copy source and build
COPY . .
RUN npm run build
# Output is in /app/dist

# ── Stage 2: Serve ──────────────────────────────────────────────
FROM nginx:alpine AS runner

# Copy built assets from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config (SPA routing: all paths → index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
