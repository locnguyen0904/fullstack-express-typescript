FROM node:22.12-alpine

# Set working directory
WORKDIR /home/app/client

# Create non-root user and set permissions
RUN addgroup -g 1001 app && \
    adduser -u 1001 -G app -h /home/app -D app && \
    chown -R app:app /home/app

# Switch to non-root user
USER app

# Copy package files
COPY --chown=app:app frontend/package.json frontend/yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Command to run the development server
CMD ["yarn", "dev"]