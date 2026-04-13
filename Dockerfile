# ================================
# Stage 1: Dependencies
# ================================
FROM node:22-alpine AS deps

WORKDIR /app

# The build context is frontend/ — paths are relative to it
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# ================================
# Stage 2: Builder
# ================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code and config files
COPY . .

# Build arguments for environment variables
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=https://arg-academy-be-dev-591566273209.europe-west1.run.app
RUN echo "VITE_API_BASE_URL is set to: $VITE_API_BASE_URL"

# Build the application
RUN npm run build

# ================================
# Stage 3: Production with Nginx
# ================================
FROM nginx:1.25-alpine AS runner

RUN apk add --no-cache curl
RUN rm /etc/nginx/conf.d/default.conf

# nginx.conf is expected in the build context root (frontend/)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
