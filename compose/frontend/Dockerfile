# Dockerfile for frontend with multi-stage build
# Usage:
#   Local: docker build --target development -f dockerfile.frontend -t frontend:dev .
#   Prod:  docker build --target production -f dockerfile.frontend -t frontend:prod .

FROM node:22.12-alpine AS base

# Create non-root user
RUN addgroup -g 1001 app && \
    adduser -u 1001 -G app -h /home/app -D app

WORKDIR /home/app/client

# Set ownership of the working directory
RUN chown -R app:app /home/app/client

# Copy package files
COPY --chown=app:app frontend/package*.json ./

# Development stage
FROM base AS development

USER app

# Install all dependencies
RUN npm ci

EXPOSE 3000

# Use Vite in dev mode with hot reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Builder stage - builds the production bundle
FROM base AS builder

USER app

# Install dependencies
RUN npm ci

# Copy source code
COPY --chown=app:app frontend/ ./

# Build the application
RUN npm run build

# Production stage - serve with nginx
FROM nginx:1.27-alpine AS production

# Copy custom nginx config if needed
# COPY compose/nginx/conf.d/frontend.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /home/app/client/dist /usr/share/nginx/html

# Add labels
LABEL maintainer="Loc Nguyen"
LABEL description="Frontend production image"

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
