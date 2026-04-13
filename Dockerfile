# ================================
# Stage 1: Build Frontend
# ================================
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy package files and install dependencies
COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps

# Copy frontend source code
COPY frontend/ ./

# Build arguments for environment variables
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the frontend application
RUN npm run build

# ================================
# Stage 2: Build Backend
# ================================
FROM node:22-alpine AS backend-builder
WORKDIR /app/backend

# Copy package files and install dependencies
COPY backend/package*.json ./
RUN npm ci

# Copy backend source code
COPY backend/ ./

# Build the backend application
RUN npm run build

# ================================
# Stage 3: Production Runner
# ================================
FROM node:22-alpine AS runner
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy backend package and install only production dependencies
COPY --from=backend-builder /app/backend/package*.json ./
RUN npm ci --omit=dev

# Copy built backend files
COPY --from=backend-builder /app/backend/dist ./dist

# Copy backend uploads if needed (create dir to suppress errors)
RUN mkdir -p uploads

# Copy built frontend files to the public directory so NestJS can serve them
COPY --from=frontend-builder /app/frontend/dist ./public

# Expose the Cloud Run default port
EXPOSE 8080

# Cloud Run injects PORT natively. Let's start the server!
CMD ["node", "dist/main.js"]
