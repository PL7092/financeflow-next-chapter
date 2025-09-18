# Multi-stage build for production deployment
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the React application
RUN npm run build


# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install serve globally (if you only want to serve static React build)
RUN npm install -g serve

# Create runtime directories (these will be overridden by volumes at runtime)
RUN mkdir -p /app/uploads /app/config

# Copy build output
COPY --from=builder /app/dist ./dist

# Copy server files
COPY server ./server

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 -G nodejs && \
    chown -R appuser:nodejs /app

USER appuser

EXPOSE 3000

# Health check
#HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
#  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the Node server (serves API + React app from ./dist)
CMD ["node", "server/index.js"]
