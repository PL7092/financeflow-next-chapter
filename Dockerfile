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

# Install only production dependencies and server packages
#COPY package*.json ./
#RUN npm ci --only=production

# Instala serve globalmente para servir o build
RUN npm install -g serve

# Copia os arquivos buildados
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/uploads ./uploads
COPY --from=builder /app/config ./config

# Install additional server dependencies
#RUN npm install express cors dotenv

# Copy built React application
#COPY --from=builder /app/dist ./dist

# Copy server files
COPY server ./server

# Create uploads directory for file storage
RUN mkdir -p /app/uploads

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 -G nodejs

# Change ownership of app directory
RUN chown -R appuser:nodejs /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the server (serves both API and React app)
CMD ["node", "server/index.js"]
