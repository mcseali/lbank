# Use Node.js 18 slim image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=development \
    PATH=/app/node_modules/.bin:$PATH

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Expose port
EXPOSE 3000

# Run the application
CMD ["npm", "start"] 